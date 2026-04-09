import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestList from './pages/TestList';
import TakeTest from './pages/TakeTest';
import TestResults from './pages/TestResults';
import AdminDashboard from './pages/AdminDashboard';
import CreateTest from './pages/CreateTest';
import EditTest from './pages/EditTest';
import ManageStudents from './pages/ManageStudents';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Student routes */}
      <Route
        path="/tests"
        element={
          <ProtectedRoute>
            <TestList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/:id"
        element={
          <ProtectedRoute>
            <TakeTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:attemptId"
        element={
          <ProtectedRoute>
            <TestResults />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tests/create"
        element={
          <ProtectedRoute adminOnly>
            <CreateTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tests/:id/edit"
        element={
          <ProtectedRoute adminOnly>
            <EditTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute adminOnly>
            <ManageStudents />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
