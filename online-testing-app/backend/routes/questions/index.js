const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Get questions for a test (with answers hidden for students)
router.get('/test/:testId', authenticateToken, async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Check if student is assigned to this test
    if (req.user.role === 'student') {
      const assignment = await pool.query(
        'SELECT * FROM test_assignments WHERE test_id = $1 AND student_id = $2',
        [testId, req.user.id]
      );
      
      if (assignment.rows.length === 0) {
        return res.status(403).json({ error: 'Test not assigned to you' });
      }
    }
    
    // Get questions without correct answers for students
    if (req.user.role === 'student') {
      const result = await pool.query(
        `SELECT id, test_id, question_text, question_type, points, options, order_index
         FROM questions
         WHERE test_id = $1
         ORDER BY order_index ASC`,
        [testId]
      );
      res.json(result.rows);
    } else {
      // Admin gets full questions with correct answers
      const result = await pool.query(
        'SELECT * FROM questions WHERE test_id = $1 ORDER BY order_index ASC',
        [testId]
      );
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create question (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), [
  body('test_id').isInt(),
  body('question_text').notEmpty().trim(),
  body('question_type').isIn(['multiple_choice', 'true_false', 'text']),
  body('points').isInt({ min: 1 }).optional(),
  body('options').optional().isArray(),
  body('correct_answer').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { test_id, question_text, question_type, points, options, correct_answer, order_index } = req.body;

    const result = await pool.query(
      `INSERT INTO questions 
       (test_id, question_text, question_type, points, options, correct_answer, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [test_id, question_text, question_type, points || 1, options || null, correct_answer, order_index || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question (admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), [
  body('question_text').optional().trim(),
  body('question_type').isIn(['multiple_choice', 'true_false', 'text']).optional(),
  body('points').isInt({ min: 1 }).optional(),
  body('options').optional().isArray(),
  body('correct_answer').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { question_text, question_type, points, options, correct_answer, order_index } = req.body;

    const result = await pool.query(
      `UPDATE questions 
       SET question_text = COALESCE($1, question_text),
           question_type = COALESCE($2, question_type),
           points = COALESCE($3, points),
           options = COALESCE($4, options),
           correct_answer = COALESCE($5, correct_answer),
           order_index = COALESCE($6, order_index)
       WHERE id = $7
       RETURNING *`,
      [question_text, question_type, points, options, correct_answer, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question (admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM questions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
