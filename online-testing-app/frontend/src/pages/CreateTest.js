import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { testService } from '../services';

const CreateTest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit_minutes: '',
    passing_score: 60
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const testData = {
        ...formData,
        time_limit_minutes: formData.time_limit_minutes ? parseInt(formData.time_limit_minutes) : null
      };

      await testService.create(testData);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create test');
    } finally {
      setLoading(false);
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
        <div className="card">
          <h2>Create New Test</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
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
                placeholder="Leave empty for no time limit"
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

            <div style={{ marginTop: '2rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Test'}
              </button>
              <Link to="/admin" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Next Steps</h3>
          <p>After creating the test, you'll need to:</p>
          <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Add questions to the test</li>
            <li>Assign the test to students</li>
          </ol>
        </div>
      </main>
    </div>
  );
};

export default CreateTest;
