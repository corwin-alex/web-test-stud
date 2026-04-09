import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { testService, userService, questionService } from '../services';

const EditTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit_minutes: '',
    passing_score: 60
  });
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    options: '',
    correct_answer: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Load test data
  React.useEffect(() => {
    loadTestData();
    loadStudents();
    loadQuestions();
  }, [id]);

  const loadTestData = async () => {
    try {
      const data = await testService.getById(id);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        time_limit_minutes: data.time_limit_minutes || '',
        passing_score: data.passing_score || 60
      });
    } catch (err) {
      setError('Failed to load test data');
    }
  };

  const loadStudents = async () => {
    try {
      const data = await userService.getStudents();
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students');
    }
  };

  const loadQuestions = async () => {
    try {
      const data = await questionService.getByTestId(id);
      setQuestions(data || []);
    } catch (err) {
      console.error('Failed to load questions');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const testData = {
        ...formData,
        time_limit_minutes: formData.time_limit_minutes ? parseInt(formData.time_limit_minutes) : null
      };

      await testService.update(parseInt(id), testData);
      setSuccess('Test updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update test');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    try {
      await testService.assignToStudent(
        parseInt(id),
        parseInt(selectedStudent),
        dueDate || null
      );
      setSuccess('Test assigned to student!');
      setSelectedStudent('');
      setDueDate('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign test');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text || !newQuestion.correct_answer) {
      setError('Question text and correct answer are required');
      return;
    }

    try {
      const questionData = {
        test_id: parseInt(id),
        ...newQuestion,
        options: newQuestion.options ? newQuestion.options.split('\n').filter(o => o.trim()) : null
      };

      await questionService.create(questionData);
      setSuccess('Question added!');
      setNewQuestion({
        question_text: '',
        question_type: 'multiple_choice',
        points: 1,
        options: '',
        correct_answer: ''
      });
      loadQuestions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add question');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">Admin Panel</div>
        <nav className="nav-links">
          <Link to="/admin">Back to Admin</Link>
        </nav>
      </header>

      <main className="main-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          <h2>Edit Test</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="title">Test Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="time_limit_minutes">Time Limit (minutes)</label>
              <input
                type="number"
                id="time_limit_minutes"
                name="time_limit_minutes"
                value={formData.time_limit_minutes}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="passing_score">Passing Score (%)</label>
              <input
                type="number"
                id="passing_score"
                name="passing_score"
                value={formData.passing_score}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Test'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Assign to Student</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} ({student.email})
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button onClick={handleAssignStudent} className="btn btn-success">
              Assign
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Add Question</h3>
          <div className="form-group">
            <label>Question Text</label>
            <textarea
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Question Type</label>
            <select
              value={newQuestion.question_type}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="text">Text Answer</option>
            </select>
          </div>

          {newQuestion.question_type === 'multiple_choice' && (
            <>
              <div className="form-group">
                <label>Options (one per line)</label>
                <textarea
                  value={newQuestion.options}
                  onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                  rows={4}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
              <div className="form-group">
                <label>Correct Answer (exact match with option)</label>
                <input
                  type="text"
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                />
              </div>
            </>
          )}

          {newQuestion.question_type === 'true_false' && (
            <div className="form-group">
              <label>Correct Answer</label>
              <select
                value={newQuestion.correct_answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          )}

          {newQuestion.question_type === 'text' && (
            <div className="form-group">
              <label>Correct Answer</label>
              <input
                type="text"
                value={newQuestion.correct_answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label>Points</label>
            <input
              type="number"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
              min="1"
              style={{ width: '100px' }}
            />
          </div>

          <button onClick={handleAddQuestion} className="btn btn-primary">
            Add Question
          </button>
        </div>

        <div className="card">
          <h3>Questions ({questions.length})</h3>
          {questions.length === 0 ? (
            <p>No questions added yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => (
                  <tr key={q.id}>
                    <td>{i + 1}</td>
                    <td>{q.question_text}</td>
                    <td>{q.question_type}</td>
                    <td>{q.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditTest;
