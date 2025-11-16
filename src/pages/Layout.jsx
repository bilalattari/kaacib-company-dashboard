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
  User2,
  X,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../redux/slices/companySlice';

const AppLayout = () => {
  const location = useLocation();
  const { name } = useSelector(selectCompanyInfo) || {};

  const breadcrumbMap = {
    '/dashboard': { label: 'Dashboard', icon: <PieChart size={18} /> },
    '/tickets': { label: 'Tickets', icon: <TicketsIcon size={18} /> },
    '/services': { label: 'Services', icon: <Wrench size={18} /> },
    '/workers': { label: 'Workers', icon: <Wrench size={18} /> },
    '/branches': { label: 'Branches', icon: <GitForkIcon size={18} /> },
    '/assets': { label: 'Assets', icon: <Package size={18} /> },
    '/users': { label: 'Users', icon: <Users size={18} /> },
    '/profile': { label: 'Profile', icon: <User2 size={18} /> },
  };

  // Generate breadcrumb items dynamically
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [
      {
        title: (
          <div className="theme-text flex items-center gap-2">
            <Home size={18} />
            <span>Home</span>
          </div>
        ),
        href: '/dashboard',
      },
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Check if it's a dynamic route (e.g., ticket ID)
      const isDynamicSegment = !breadcrumbMap[currentPath];

      if (isDynamicSegment && index > 0) {
        // For dynamic segments like /tickets/:id
        const parentPath = `/${pathSegments.slice(0, index).join('/')}`;
        const parentBreadcrumb = breadcrumbMap[parentPath];

        items.push({
          title: (
            <span className="theme-text flex items-center gap-2">
              {parentBreadcrumb?.icon}
              {`${parentBreadcrumb?.label || segment} Details`}
            </span>
          ),
        });
      } else if (breadcrumbMap[currentPath]) {
        // For static routes
        const breadcrumb = breadcrumbMap[currentPath];
        items.push({
          title: (
            <span className="theme-text flex items-center gap-2">
              {breadcrumb.icon}
              {breadcrumb.label}
            </span>
          ),
          href: index === pathSegments.length - 1 ? undefined : currentPath,
        });
      }
    });

    return items;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <div className="flex w-screen h-screen">
      <div className="max-w-[12%]">
        <ThemedSidebar />
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-scroll py-3">
        <div className="w-full h-20 flex items-center justify-between px-6 pt-4">
          <Breadcrumb
            items={breadcrumbItems}
            separator={<ChevronRight size={22} className="text-gray-400!" />}
            className="theme-text!"
          />
          {name && (
            <div className="text-primary text-md lg:text-lg font-semibold flex gap-1">
              <span>Kaacib</span>
              <X className="text-lg lg:text-xl" />
              <p>{name}</p>
            </div>
          )}
        </div>
        <div className="px-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
