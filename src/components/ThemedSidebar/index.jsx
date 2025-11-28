import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '@/redux/slices/authSlice';
import { Menu } from 'antd';
import {
  ChevronLeft,
  GitForkIcon,
  Package,
  PieChart,
  TicketsIcon,
  Users,
  ArrowRightCircle,
  User2,
  Wrench,
} from 'lucide-react';
import ThemedButton from '../ThemedButton';
import { selectUser } from '../../redux/slices/authSlice';
import { selectCompanyInfo } from '../../redux/slices/companySlice';

const ThemedSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { permissions } = useSelector(selectUser) || {};
  const { logo } = useSelector(selectCompanyInfo) || {};

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  const items = [
    {
      permission: true,
      icon: <PieChart className="size-5" />,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      permission: permissions?.can_book_services,
      icon: <TicketsIcon className="size-5" />,
      label: 'Corrective Tickets',
      path: '/tickets',
    },
    {
      permission: permissions?.can_book_services,
      icon: <Wrench className="size-5" />,
      label: 'Service Cycles',
      path: '/services',
    },
    {
      permission: permissions?.can_manage_branches,
      icon: <GitForkIcon className="size-5" />,
      label: 'Branches',
      path: '/branches',
    },
    {
      permission: permissions?.can_manage_assets,
      icon: <Package className="size-5" />,
      label: 'Assets',
      path: '/assets',
    },
    {
      permission: permissions?.can_manage_users,
      icon: <Users className="size-5" />,
      label: 'Users',
      path: '/users',
    },
    {
      permission: true,
      icon: <User2 className="size-5" />,
      label: 'Profile',
      path: '/profile',
    },
  ];

  return (
    <div className="theme-bg flex-content-center flex-col w-full h-full py-4 gap-16 px-2">
      <div
        onClick={toggleCollapsed}
        className={`${
          collapsed
            ? ' flex-content-center w-15 rounded-full'
            : 'flex items-center justify-around w-full rounded-xl'
        } h-20 bg-white shadow-md cursor-pointer transition-all duration-500`}
      >
        {collapsed ? (
          <img
            src={logo ? logo : '/logo.png'}
            alt="Logo"
            className="w-full h-full object-fill"
          />
        ) : (
          <>
            <p className="font-semibold text-md">KAACIB</p>
            <ChevronLeft className="size-6" />
          </>
        )}
      </div>

      <Menu
        className="theme-bg w-full h-full"
        inlineCollapsed={collapsed}
        selectedKeys={[location.pathname]}
        mode="inline"
      >
        {items.map((item) => {
          return (
            item?.permission && (
              <Menu.Item
                key={item.path}
                icon={item.icon}
                onClick={() => navigate(item.path)}
                label={item.label}
                title={collapsed && item.label}
                className={`w-full! flex! items-center justify-between text-white! mb-2! hover:bg-white/90! hover:text-black! hover:shadow-md! [&.ant-menu-item-selected]:bg-white/90! [&.ant-menu-item-selected]:text-black! [&.ant-menu-item-selected]:shadow-md! [&.ant-menu-item-selected]:translate-y-1! transition-all duration-300 m-0! ${
                  collapsed ? 'pl-1! pr-0! justify-center!' : 'px-4!'
                }`}
              >
                <span className={`text-md ${collapsed && 'hidden'}`}>
                  {item.label}
                </span>
              </Menu.Item>
            )
          );
        })}
      </Menu>

      <ThemedButton
        text="Logout"
        icon={<ArrowRightCircle />}
        onClick={handleLogout}
        className="w-full flex items-center justify-between text-white! mb-2! hover:bg-white/90! hover:text-black! hover:shadow-md! hover:translate-y-1 [&.ant-menu-item-selected]:bg-white/90! [&.ant-menu-item-selected]:text-black! [&.ant-menu-item-selected]:shadow-md! [&.ant-menu-item-selected]:translate-y-1! transition-all duration-300"
      />
    </div>
  );
};

export default ThemedSidebar;
