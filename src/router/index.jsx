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
import Profile from '../pages/Profile';

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

  const { permissions } = user || {};

  const routeMap = [
    {
      permission: permissions?.can_book_services,
      path: '/tickets',
      element: <Tickets />,
    },
    {
      permission: permissions?.can_manage_branches,
      path: '/branches',
      element: <Branches />,
    },
    {
      permission: permissions?.can_manage_assets,
      path: '/assets',
      element: <Assets />,
    },
    {
      permission: permissions?.can_manage_users,
      path: '/users',
      element: <Users />,
    },
  ];

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
        {routeMap.map(({ permission, path, element }) =>
          permission ? (
            <Route key={path} path={path} element={element} />
          ) : null,
        )}
        <Route path="/profile" element={<Profile />} />
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
