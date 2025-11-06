import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logOut, selectUser } from '@/redux/slices/authSlice';
import { getUserData } from '@/helpers';
import ProtectRoute from './ProtectedRoute';
import AppLayout from '@/pages/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Tickets from '../pages/Tickets';
import Users from '../pages/Users';
import Assets from '../pages/Assets';
import Branches from '../pages/Branches';
import Bookings from '../pages/Bookings';

const AppRouter = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    const userData = getUserData();

    if (!user && userData) {
      dispatch(login(userData));
    } else if (!userData) {
      dispatch(logOut());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectRoute user={user}>
            <AppLayout />
          </ProtectRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/users" element={<Users />} />
        <Route path="/bookings" element={<Bookings />} />
      </Route>

      {/* Fallback Route */}
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export default AppRouter;
