import React from 'react';
import { Layout, Menu, theme as antdTheme } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Building2, Cuboid, Boxes, CalendarClock } from 'lucide-react';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const {
    token: { colorBgContainer }
  } = antdTheme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={240}>
        <div className="text-white text-center py-4 font-bold tracking-wide">KAACIB</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            { key: '/', icon: <Building2 size={16} />, label: <Link to="/">Dashboard</Link> },
            { key: '/branches', icon: <Cuboid size={16} />, label: <Link to="/branches">Branches</Link> },
            { key: '/bookings', icon: <CalendarClock size={16} />, label: <Link to="/bookings">Bookings</Link> },
            { key: '/assets', icon: <Boxes size={16} />, label: <Link to="/assets">Assets</Link> },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, padding: '0 16px' }} />
        <Content style={{ margin: '16px' }}>
          <div className="bg-white p-4 rounded-md shadow-sm min-h-[60vh]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}


