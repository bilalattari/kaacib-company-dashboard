import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function PrivateRoute({ children }) {
  const token = Cookies.get('company-auth-token');
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}


