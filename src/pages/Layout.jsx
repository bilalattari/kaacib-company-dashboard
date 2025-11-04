import { Outlet, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import ThemedSidebar from '../components/ThemedSidebar';
import {
  PieChart,
  TicketsIcon,
  Wrench,
  GitForkIcon,
  Package,
  Users,
  Home,
  ChevronRight,
  Calendar,
} from 'lucide-react';

const AppLayout = () => {
  const location = useLocation();

  const breadcrumbMap = {
    '/dashboard': { label: 'Dashboard', icon: <PieChart size={18} /> },
    '/tickets': { label: 'Tickets', icon: <TicketsIcon size={18} /> },
    '/workers': { label: 'Workers', icon: <Wrench size={18} /> },
    '/branches': { label: 'Branches', icon: <GitForkIcon size={18} /> },
    '/assets': { label: 'Assets', icon: <Package size={18} /> },
    '/users': { label: 'Users', icon: <Users size={18} /> },
    '/bookings': { label: 'Bookings', icon: <Calendar size={18} /> },
  };

  const current = breadcrumbMap[location.pathname] || {
    label: 'Home',
    icon: null,
  };

  const breadcrumbItems = [
    {
      title: (
        <div className="theme-text flex items-center gap-2">
          <Home size={18} />
          <span>Home</span>
        </div>
      ),
      href: '/dashboard',
    },
    {
      title: (
        <span className="theme-text flex items-center gap-2">
          {current.icon}
          {current.label}
        </span>
      ),
    },
  ];

  return (
    <div className="flex w-screen h-screen">
      <div className="max-w-[10%]">
        <ThemedSidebar />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="w-full h-20 flex items-center px-6">
          <Breadcrumb
            items={breadcrumbItems}
            separator={<ChevronRight size={22} className="text-gray-400!" />}
            className="theme-text!"
          />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
