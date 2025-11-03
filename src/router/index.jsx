import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logOut, selectUser } from '@/redux/slices/authSlice';
import { getAuthToken } from '@/helpers';
import ProtectRoute from './ProtectedRoute';
import AppLayout from '@/pages/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

const AppRouter = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    const userToken = getAuthToken();

    if (!user && userToken) {
      dispatch(login(JSON.parse(userToken)));
    } else {
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
