const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../db');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');
const router = express.Router();

// Get all tests (admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tests ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// Get assigned tests for student
router.get('/assigned', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, ta.assigned_at, ta.due_date
       FROM tests t
       INNER JOIN test_assignments ta ON t.id = ta.test_id
       WHERE ta.student_id = $1 AND ta.completed = false
       ORDER BY ta.due_date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assigned tests:', error);
    res.status(500).json({ error: 'Failed to fetch assigned tests' });
  }
});

// Get single test by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student is assigned to this test
    if (req.user.role === 'student') {
      const assignment = await pool.query(
        'SELECT * FROM test_assignments WHERE test_id = $1 AND student_id = $2',
        [id, req.user.id]
      );
      
      if (assignment.rows.length === 0) {
        return res.status(403).json({ error: 'Test not assigned to you' });
      }
    }
    
    const result = await pool.query('SELECT * FROM tests WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

// Create new test (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), [
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('time_limit_minutes').isInt({ min: 1 }).optional(),
  body('passing_score').isInt({ min: 0, max: 100 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, time_limit_minutes, passing_score } = req.body;

    const result = await pool.query(
      `INSERT INTO tests (title, description, time_limit_minutes, passing_score, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description || null, time_limit_minutes || null, passing_score || 60, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// Update test (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), [
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('time_limit_minutes').isInt({ min: 1 }).optional(),
  body('passing_score').isInt({ min: 0, max: 100 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, time_limit_minutes, passing_score } = req.body;

    const result = await pool.query(
      `UPDATE tests 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           time_limit_minutes = COALESCE($3, time_limit_minutes),
           passing_score = COALESCE($4, passing_score)
       WHERE id = $5
       RETURNING *`,
      [title, description, time_limit_minutes, passing_score, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// Delete test (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM tests WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

module.exports = router;
