import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { questionService, attemptService } from '../services';

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestData();
  }, [id]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const data = await questionService.getByTestId(id);
      setQuestions(data || []);
      
      // Initialize answers
      const initialAnswers = {};
      (data || []).forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError('Failed to load test questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer
      }));

      const result = await attemptService.submit(parseInt(id), formattedAnswers);
      
      // Navigate to results page
      navigate(`/results/${result.attempt.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit test');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading test...</div>;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">Online Testing</div>
        <nav className="nav-links">
          <Link to="/tests">Back to Tests</Link>
        </nav>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>Take Test</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <div style={{ marginBottom: '2rem' }}>
            <p><strong>Instructions:</strong> Answer all questions and click Submit when done.</p>
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="test-question">
              <div className="question-text">
                {index + 1}. {question.question_text}
                {question.points && (
                  <span style={{ float: 'right', color: '#666', fontSize: '0.9rem' }}>
                    ({question.points} points)
                  </span>
                )}
              </div>

              {question.question_type === 'multiple_choice' && question.options && (
                <ul className="options">
                  {question.options.map((option, optIndex) => (
                    <li key={optIndex}>
                      <label>
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        />
                        {option}
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {question.question_type === 'true_false' && (
                <ul className="options">
                  <li>
                    <label>
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value="true"
                        checked={answers[question.id] === 'true'}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      />
                      True
                    </label>
                  </li>
                  <li>
                    <label>
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value="false"
                        checked={answers[question.id] === 'false'}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      />
                      False
                    </label>
                  </li>
                </ul>
              )}

              {question.question_type === 'text' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                />
              )}
            </div>
          ))}

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={handleSubmit}
              className="btn btn-success"
              disabled={submitting}
              style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TakeTest;
