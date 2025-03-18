import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDashboard from './pages/CampaignDashboard';
import AccountSettings from './pages/AccountSettings';
import AdminPanel from './pages/AdminPanel';

// Protected route component that requires authentication
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

// Admin-only route component
const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return currentUser && isAdmin ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-campaign" element={
        <PrivateRoute>
          <CreateCampaign />
        </PrivateRoute>
      } />
      <Route path="/campaign/:id" element={
        <PrivateRoute>
          <CampaignDashboard />
        </PrivateRoute>
      } />
      <Route path="/account" element={
        <PrivateRoute>
          <AccountSettings />
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <AdminPanel />
        </AdminRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;