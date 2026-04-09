import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testService } from '../services';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isStudent } = useAuth();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      let data;
      
      if (isStudent) {
        data = await testService.getAssigned();
      } else {
        data = await testService.getAll();
      }
      
      setTests(data || []);
      setError('');
    } catch (err) {
      setError('Failed to load tests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading tests...</div>;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">Online Testing</div>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>{isStudent ? 'My Assigned Tests' : 'All Tests'}</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          {tests.length === 0 ? (
            <p>No tests available.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  {isStudent && <th>Due Date</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.title}</td>
                    <td>{test.description || '-'}</td>
                    {isStudent && (
                      <td>
                        {test.due_date 
                          ? new Date(test.due_date).toLocaleDateString()
                          : 'No deadline'}
                      </td>
                    )}
                    <td>
                      <Link 
                        to={`/test/${test.id}`}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        {isStudent ? 'Take Test' : 'View'}
                      </Link>
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

export default TestList;
