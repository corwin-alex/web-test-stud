import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attemptService } from '../services';

const TestResults = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await attemptService.getAttemptDetails(attemptId);
      setResult(data);
      setError('');
    } catch (err) {
      setError('Failed to load results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (!result || !result.attempt) {
    return (
      <div className="app-container">
        <main className="main-content">
          <div className="card">
            <h2>Results Not Found</h2>
            <p>Unable to load test results.</p>
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { attempt, answers } = result;
  const percentage = attempt.percentage_score || 0;
  const passed = percentage >= 60;

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">Online Testing</div>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/tests">My Tests</Link>
        </nav>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>Test Results</h2>
          
          <div className="score-display">
            <div className="score-circle" style={{ 
              background: passed ? '#27ae60' : '#e74c3c' 
            }}>
              <span className="score-value">{percentage}%</span>
              <span className="score-label">
                {passed ? 'Passed' : 'Needs Improvement'}
              </span>
            </div>
            
            <h3>{attempt.test_title}</h3>
            <p>Completed: {new Date(attempt.completed_at).toLocaleString()}</p>
            
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Score:</strong> {attempt.score} / {attempt.max_score} points</p>
              <p><strong>Percentage:</strong> {percentage}%</p>
              {passed ? (
                <p className="alert alert-success" style={{ display: 'inline-block', marginTop: '1rem' }}>
                  Congratulations! You passed the test.
                </p>
              ) : (
                <p className="alert alert-error" style={{ display: 'inline-block', marginTop: '1rem' }}>
                  You need at least 60% to pass. Keep studying!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Detailed Answers</h3>
          {answers && answers.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Your Answer</th>
                  <th>Result</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {answers.map((answer, index) => (
                  <tr key={answer.id}>
                    <td>
                      {index + 1}. {answer.question_text}
                    </td>
                    <td>
                      {typeof answer.user_answer === 'string' 
                        ? answer.user_answer 
                        : JSON.stringify(answer.user_answer)}
                    </td>
                    <td>
                      <span style={{ 
                        color: answer.is_correct ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </td>
                    <td>
                      {answer.points_earned} / {answer.points_earned > 0 ? answer.points_earned : '?'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No detailed answers available.</p>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/tests" className="btn btn-primary">
            Back to Tests
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TestResults;
