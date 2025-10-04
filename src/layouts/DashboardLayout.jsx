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
    <Layout
      style={{
        height: '100vh',          // ✅ Fix to full viewport height
        overflow: 'hidden',       // ✅ Disable scrolling on body layout
        background: '#f5f5f5'
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        style={{
          background: 'linear-gradient(180deg, #002140 0%, #002140 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          textAlign: 'center',
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            color: 'white',
            fontSize: collapsed ? '18px' : '24px',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            {collapsed ? 'K' : 'KAACIB'}
          </div>
          {!collapsed && (
            <div style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '12px',
              marginTop: '4px'
            }}>
              Company Portal
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: '20px'
          }}
          items={[
            {
              key: '/',
              icon: <Building2 size={18} />,
              label: <Link to="/" style={{ color: 'white' }}>Dashboard</Link>,
              style: { marginBottom: '8px' }
            },
            {
              key: '/branches',
              icon: <Cuboid size={18} />,
              label: <Link to="/branches" style={{ color: 'white' }}>Branches</Link>,
              style: { marginBottom: '8px' }
            },
            {
              key: '/bookings',
              icon: <CalendarClock size={18} />,
              label: <Link to="/bookings" style={{ color: 'white' }}>Bookings</Link>,
              style: { marginBottom: '8px' }
            },
            {
              key: '/assets',
              icon: <Boxes size={18} />,
              label: <Link to="/assets" style={{ color: 'white' }}>Assets</Link>,
              style: { marginBottom: '8px' }
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: 'white',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              Welcome back, {user?.first_name || 'User'}!
            </Typography.Title>
          </div>

          <Space size="middle">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<Bell size={18} />}
                style={{ color: '#666' }}
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Button type="text" style={{ padding: '4px 8px', height: 'auto' }}>
                <Space>
                  <Avatar
                    size="small"
                    style={{
                      background: colorPrimary,
                      color: 'white'
                    }}
                  >
                    {user?.first_name?.[0] || 'U'}
                  </Avatar>
                  {!collapsed && (
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {user?.email}
                      </div>
                    </div>
                  )}
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            // margin: '24px',
            background: 'transparent',
            overflow: 'auto',        // ✅ Enable scrolling inside content only
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            minHeight: 'calc(100vh - 120px)', // optional
            overflow: 'auto' // ✅ Only scroll internal area if too long
          }}>
            <Outlet />
          </div>
      </Content>
    </Layout>
    </Layout >
  );
}


