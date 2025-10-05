import React from 'react';
import { Layout, Menu, theme as antdTheme, Avatar, Dropdown, Button, Typography, Space, Badge } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Cuboid, Boxes, CalendarClock, LogOut, User, Settings, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  console.log(user);
  const {
    token: { colorBgContainer, colorPrimary }
  } = antdTheme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="h-screen overflow-hidden bg-gray-50">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        className="bg-kaacib-primary shadow-lg"
      >
         <div className="text-center p-5 border-b border-white/10">
           <div className={`${collapsed ? 'text-lg' : 'text-2xl'} font-bold text-[#FF3605]`} >
             {collapsed ? 'K' : 'KAACIB'}
           </div>
          {!collapsed && (
            <div className="text-white/80 text-xs mt-1">
              Company Portal
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          className="bg-transparent border-none mt-5"
          items={[
            {
              key: '/',
              icon: <Building2 size={18} />,
              label: <Link to="/" className="text-white">Dashboard</Link>,
              className: "mb-2"
            },
            {
              key: '/branches',
              icon: <Cuboid size={18} />,
              label: <Link to="/branches" className="text-white">Branches</Link>,
              className: "mb-2"
            },
            {
              key: '/bookings',
              icon: <CalendarClock size={18} />,
              label: <Link to="/bookings" className="text-white">Bookings</Link>,
              className: "mb-2"
            },
            {
              key: '/assets',
              icon: <Boxes size={18} />,
              label: <Link to="/assets" className="text-white">Assets</Link>,
              className: "mb-2"
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-6 shadow-sm flex items-center justify-between">
          <div>
            <Typography.Title level={4} className="m-0 text-white">
              Welcome back, {user?.first_name || 'User'}!
            </Typography.Title>
          </div>

          <Space size="middle">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<Bell size={18} />}
                className="text-gray-600"
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Button type="text" className="px-2 py-1 h-auto">
                <Space>
                  <Avatar
                    size="small"
                    className="bg-kaacib-primary text-white"
                  >
                    {user?.first_name?.[0] || 'U'}
                  </Avatar>
                  {!collapsed && (
                    <div className="text-left">
                      <div className="text-sm font-medium">
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {user?.email}
                      </div>
                    </div>
                  )}
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content className="bg-transparent overflow-auto">
          <div className="bg-white rounded-xl shadow-kaacib min-h-[calc(100vh-120px)] overflow-auto">
            <Outlet />
          </div>
        </Content>
    </Layout>
    </Layout >
  );
}


