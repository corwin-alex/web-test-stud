import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">Online Testing</div>
        <nav className="nav-links">
          {isStudent && <Link to="/tests">My Tests</Link>}
          {isAdmin && <Link to="/admin">Admin Panel</Link>}
          <span>Welcome, {user?.firstName || user?.email}</span>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>Dashboard</h2>
          <p>Welcome to the Online Testing System!</p>
          
          {isStudent && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Student Area</h3>
              <p>You can view and take your assigned tests.</p>
              <Link to="/tests" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                View My Tests
              </Link>
            </div>
          )}

          {isAdmin && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Admin Area</h3>
              <p>Manage tests, questions, and students.</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <Link to="/admin" className="btn btn-primary">
                  Manage Tests
                </Link>
                <Link to="/admin/students" className="btn btn-secondary">
                  Manage Students
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Your Profile</h3>
          <table className="table">
            <tbody>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{user?.email}</td>
              </tr>
              <tr>
                <td><strong>Role:</strong></td>
                <td>{user?.role}</td>
              </tr>
              {user?.firstName && (
                <tr>
                  <td><strong>Name:</strong></td>
                  <td>{user?.firstName} {user?.lastName}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
