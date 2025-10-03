import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function PublicRoute({ children }) {
  const token = Cookies.get('company-auth-token');
  if (token) return <Navigate to="/" replace />;
  return children;
}


