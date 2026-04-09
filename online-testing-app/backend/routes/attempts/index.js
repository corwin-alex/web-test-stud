const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../../db');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');
const router = express.Router();

// Submit test attempt
router.post('/submit', authenticateToken, authorizeRole('student'), [
  body('test_id').isInt(),
  body('answers').isArray()
], async (req, res) => {
  const client = await pool.connect();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { test_id, answers } = req.body;
    const student_id = req.user.id;

    // Check if test is assigned to student
    const assignment = await client.query(
      'SELECT * FROM test_assignments WHERE test_id = $1 AND student_id = $2 AND completed = false',
      [test_id, student_id]
    );

    if (assignment.rows.length === 0) {
      return res.status(403).json({ error: 'Test not assigned or already completed' });
    }

    // Start transaction
    await client.query('BEGIN');

    // Create attempt record
    const attemptResult = await client.query(
      `INSERT INTO test_attempts (test_id, student_id, started_at, completed_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING *`,
      [test_id, student_id]
    );

    const attempt = attemptResult.rows[0];

    // Get questions and correct answers
    const questionsResult = await client.query(
      'SELECT id, correct_answer, points FROM questions WHERE test_id = $1',
      [test_id]
    );

    const questions = questionsResult.rows;
    let totalScore = 0;
    let maxScore = 0;

    // Grade each answer
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.question_id);
      
      if (question) {
        maxScore += question.points || 1;
        
        // Compare answer with correct answer
        let isCorrect = false;
        
        if (typeof question.correct_answer === 'string') {
          isCorrect = String(answer.answer).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase();
        } else if (Array.isArray(question.correct_answer)) {
          const userAnswer = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
          isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correct_answer.sort());
        }
        
        if (isCorrect) {
          totalScore += question.points || 1;
        }

        // Save answer
        await client.query(
          `INSERT INTO attempt_answers (attempt_id, question_id, user_answer, is_correct, points_earned)
           VALUES ($1, $2, $3, $4, $5)`,
          [attempt.id, answer.question_id, JSON.stringify(answer.answer), isCorrect, isCorrect ? (question.points || 1) : 0]
        );
      }
    }

    // Calculate percentage score (0-100)
    const percentageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Update attempt with score
    await client.query(
      `UPDATE test_attempts 
       SET score = $1, max_score = $2, percentage_score = $3
       WHERE id = $4`,
      [totalScore, maxScore, percentageScore, attempt.id]
    );

    // Mark assignment as completed
    await client.query(
      `UPDATE test_assignments 
       SET completed = true, completed_at = NOW()
       WHERE test_id = $1 AND student_id = $2`,
      [test_id, student_id]
    );

    await client.query('COMMIT');

    // Get full attempt details
    const fullAttempt = await client.query(
      `SELECT ta.*, t.title as test_title
       FROM test_attempts ta
       JOIN tests t ON t.id = ta.test_id
       WHERE ta.id = $1`,
      [attempt.id]
    );

    res.json({
      message: 'Test submitted successfully',
      attempt: fullAttempt.rows[0],
      score: {
        earned: totalScore,
        max: maxScore,
        percentage: percentageScore
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  } finally {
    client.release();
  }
});

// Get student's attempts for a test
router.get('/my-attempts/:testId', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { testId } = req.params;
    
    const result = await pool.query(
      `SELECT ta.*, t.title as test_title
       FROM test_attempts ta
       JOIN tests t ON t.id = ta.test_id
       WHERE ta.student_id = $1 AND ta.test_id = $2
       ORDER BY ta.completed_at DESC`,
      [req.user.id, testId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// Get all attempts for a test (admin only)
router.get('/test/:testId', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { testId } = req.params;
    
    const result = await pool.query(
      `SELECT ta.*, u.email as student_email, u.first_name, u.last_name, t.title as test_title
       FROM test_attempts ta
       JOIN users u ON u.id = ta.student_id
       JOIN tests t ON t.id = ta.test_id
       WHERE ta.test_id = $1
       ORDER BY ta.completed_at DESC`,
      [testId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// Get attempt details with answers
router.get('/attempt/:attemptId', authenticateToken, async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    // Check permissions
    const attempt = await pool.query(
      'SELECT * FROM test_attempts WHERE id = $1',
      [attemptId]
    );

    if (attempt.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attemptData = attempt.rows[0];

    // Students can only see their own attempts
    if (req.user.role === 'student' && attemptData.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get answers
    const answersResult = await pool.query(
      `SELECT aa.*, q.question_text, q.question_type
       FROM attempt_answers aa
       JOIN questions q ON q.id = aa.question_id
       WHERE aa.attempt_id = $1`,
      [attemptId]
    );

    res.json({
      attempt: attemptData,
      answers: answersResult.rows
    });
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    res.status(500).json({ error: 'Failed to fetch attempt details' });
  }
});

module.exports = router;
