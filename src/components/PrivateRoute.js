// components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { user } = useContext(AuthContext);

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If role is restricted
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and allowed
  return children;
}
