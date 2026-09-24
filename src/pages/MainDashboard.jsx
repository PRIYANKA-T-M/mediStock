import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const MainDashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'PHARMACIST') {
    return <Navigate to="/pharmacist" replace />;
  }

  if (user?.role === 'STAFF') {
    return <Navigate to="/staff" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default MainDashboard;
