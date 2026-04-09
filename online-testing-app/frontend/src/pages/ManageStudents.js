import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, testService } from '../services';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, testsData] = await Promise.all([
        userService.getStudents(),
        testService.getAll()
      ]);
      setStudents(studentsData || []);
      setTests(testsData || []);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedTest) {
      setError('Please select a test');
      return;
    }

    try {
      let assignedCount = 0;
      for (const student of students) {
        try {
          await testService.assignToStudent(parseInt(selectedTest), student.id);
          assignedCount++;
        } catch (err) {
          // Skip if already assigned
          console.log(`Student ${student.id} may already be assigned`);
        }
      }
      setSuccess(`Test assigned to ${assignedCount} students!`);
      setSelectedTest('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign test');
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
          <Link to="/admin">Manage Tests</Link>
        </nav>
      </header>

      <main className="main-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card">
          <h2>Manage Students</h2>
          
          <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
            <h3>Bulk Assign Test</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Select Test</option>
                {tests.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
              <button onClick={handleBulkAssign} className="btn btn-primary">
                Assign to All Students
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <p>No students registered yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>
                      {student.first_name} {student.last_name || '-'}
                    </td>
                    <td>{student.email}</td>
                    <td>
                      {new Date(student.created_at).toLocaleDateString()}
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

export default ManageStudents;
