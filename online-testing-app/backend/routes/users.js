const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Get all students (admin only)
router.get('/students', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['student']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Assign test to student (admin only)
router.post('/assign-test', authenticateToken, authorizeRole('admin'), [
  body('test_id').isInt(),
  body('student_id').isInt(),
  body('due_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { test_id, student_id, due_date } = req.body;

    // Check if test exists
    const test = await pool.query('SELECT id FROM tests WHERE id = $1', [test_id]);
    if (test.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check if student exists
    const student = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [student_id, 'student']);
    if (student.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create assignment
    const result = await pool.query(
      `INSERT INTO test_assignments (test_id, student_id, due_date, assigned_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (test_id, student_id) DO UPDATE SET due_date = $3
       RETURNING *`,
      [test_id, student_id, due_date || null, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error assigning test:', error);
    res.status(500).json({ error: 'Failed to assign test' });
  }
});

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
