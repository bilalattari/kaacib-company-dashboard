import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logOut } from '@/redux/slices/authSlice';
import { Menu } from 'antd';
import {
  ChevronLeft,
  GitForkIcon,
  Package,
  PieChart,
  TicketsIcon,
  Users,
  Calendar,
  ArrowRightCircle,
} from 'lucide-react';
import ThemedButton from '../ThemedButton';

const items = [
  {
    icon: <PieChart className="size-5" />,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: <TicketsIcon className="size-5" />,
    label: 'Tickets',
    path: '/tickets',
  },
  {
    icon: <GitForkIcon className="size-5" />,
    label: 'Branches',
    path: '/branches',
  },
  {
    icon: <Package className="size-5" />,
    label: 'Assets',
    path: '/assets',
  },
  {
    icon: <Users className="size-5" />,
    label: 'Users',
    path: '/users',
  },
  {
    icon: <Calendar className="size-5" />,
    label: 'Bookings',
    path: '/bookings',
  },
];

const ThemedSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  return (
    <div className="theme-bg flex-content-center flex-col w-full h-full py-4 gap-16 px-2">
      <div
        onClick={toggleCollapsed}
        className={`${
          collapsed
            ? ' flex-content-center w-12 rounded-full'
            : 'flex items-center justify-around w-full rounded-xl'
        } h-12 bg-white shadow-md cursor-pointer transition-all duration-500`}
      >
        {collapsed ? (
          <img src="/logo.png" alt="Logo" className="w-2/3 h-2/3 object-fill" />
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
        {items.map((item, i) => (
          <Menu.Item
            key={item.path}
            icon={item.icon}
            onClick={() => navigate(item.path)}
            className="flex items-center justify-between text-white! mb-2! hover:bg-white/90! hover:text-black! hover:shadow-md! hover:translate-y-1 [&.ant-menu-item-selected]:bg-white/90! [&.ant-menu-item-selected]:text-black! [&.ant-menu-item-selected]:shadow-md! [&.ant-menu-item-selected]:translate-y-1! transition-all duration-300"
          >
            <span className="text-md">{item.label}</span>
          </Menu.Item>
        ))}
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
