import { lazy, useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logOut, selectUser } from '@/redux/slices/authSlice';
import { getUserData } from '@/helpers';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '@/pages/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Tickets from '../pages/Tickets';
import TicketDetail from '../pages/TicketDetail';
import Services from '../pages/Services';
import Users from '../pages/Users';
import Assets from '../pages/Assets';
import Branches from '../pages/Branches';
import Profile from '../pages/Profile';
import { getCompanyInfo } from '../apis';
import { message } from 'antd';
import {
  selectCompanyInfo,
  setCompanyInfo,
} from '../redux/slices/companySlice';

const AppRouter = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const companyInfo = useSelector(selectCompanyInfo);

  useEffect(() => {
    const userData = getUserData();

    if (!user && userData) {
      dispatch(login(userData));
      fetchCompanyInfo();
    } else if (!userData) {
      dispatch(logOut());
    }
  }, [dispatch]);

  useEffect(() => {
    if (companyInfo && companyInfo.theme_color) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', companyInfo.theme_color);
    }
  }, [companyInfo]);

  const fetchCompanyInfo = async () => {
    try {
      const { data } = await getCompanyInfo();
      dispatch(setCompanyInfo(data.data));
    } catch (err) {
      message.error(
        err?.response?.data?.message || 'Failed to fetch company info.',
      );
    }
  };

  const { permissions } = user || {};

  const routeMap = [
    {
      permission: permissions?.can_book_services,
      path: '/tickets',
      element: <Tickets />,
    },
    {
      permission: permissions?.can_book_services,
      path: '/tickets/:id',
      element: <TicketDetail />,
    },
    {
      permission: permissions?.can_book_services,
      path: '/services',
      element: <Services />,
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
        path="/"
        element={
          <ProtectedRoute user={user}>
            <AppLayout />
          </ProtectedRoute>
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

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Fallback Route */}
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export default AppRouter;
