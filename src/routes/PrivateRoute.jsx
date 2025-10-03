import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function PrivateRoute({ children }) {
  const token = Cookies.get('company-auth-token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}


