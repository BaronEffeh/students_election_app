// components/routes/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function PrivateRoute({ allowedRoles }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    // User not logged in — redirect to login
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized
  return <Outlet />;
}
