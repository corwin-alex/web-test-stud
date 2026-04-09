import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../services';

const AdminDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await testService.getAll();
      setTests(data || []);
      setError('');
    } catch (err) {
      setError('Failed to load tests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this test?')) {
      return;
    }

    try {
      await testService.delete(id);
      setTests(tests.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete test');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">Admin Panel</div>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/admin/students">Manage Students</Link>
        </nav>
      </header>

      <main className="main-content">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Test Management</h2>
            <Link to="/admin/tests/create" className="btn btn-primary">
              Create New Test
            </Link>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {tests.length === 0 ? (
            <p>No tests created yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Passing Score</th>
                  <th>Time Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.title}</td>
                    <td>{test.description || '-'}</td>
                    <td>{test.passing_score}%</td>
                    <td>
                      {test.time_limit_minutes 
                        ? `${test.time_limit_minutes} min` 
                        : 'No limit'}
                    </td>
                    <td>
                      <Link 
                        to={`/admin/tests/${test.id}/edit`}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', marginRight: '0.5rem', fontSize: '0.9rem' }}
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(test.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Delete
                      </button>
                    </td>
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

export default AdminDashboard;
