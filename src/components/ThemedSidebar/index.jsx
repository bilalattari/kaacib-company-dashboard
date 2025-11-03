import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import {
  ChevronLeft,
  GitForkIcon,
  Package,
  PieChart,
  TicketsIcon,
  Users,
  Wrench,
} from 'lucide-react';
import './index.css';

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
    icon: <Wrench className="size-5" />,
    label: 'Workers',
    path: '/workers',
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
];

const ThemedSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="theme-bg flex-content-center flex-col w-full h-full pt-4 gap-4 border-2 border-red-600 px-1">
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

      <div onClick={toggleCollapsed} className=" h-12 bg-white"></div>

      <Menu className="theme-bg w-full h-full" inlineCollapsed={collapsed}>
        {items.map((item, i) => (
          <Menu.Item
            key={i}
            icon={item.icon}
            onClick={() => navigate(item.path)}
            className="flex items-center justify-between text-white! mb-2! hover:bg-white/90! hover:text-black! hover:shadow-md! hover:translate-y-1  transition-all duration-300"
          >
            <span className="text-md">{item.label}</span>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default ThemedSidebar;
