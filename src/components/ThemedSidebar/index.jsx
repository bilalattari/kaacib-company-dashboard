import { useState } from 'react';
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';

const items = [
  { key: '1', icon: <PieChartOutlined />, label: 'Option 1' },
  { key: '2', icon: <DesktopOutlined />, label: 'Option 2' },
  { key: '3', icon: <ContainerOutlined />, label: 'Option 3' },
  {
    key: 'sub1',
    label: 'Navigation One',
    icon: <MailOutlined />,
  },
  {
    key: 'sub2',
    label: 'Navigation Two',
    icon: <AppstoreOutlined />,
  },
];

const ThemedSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="w-full h-full flex flex-col border-2 border-red-600">
      <div className="flex-content-center bg-white rounded-full w-4 h-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-full h-full bg-transparent"
        />
      </div>

      <Menu className="theme-bg w-full h-full" items={items} />
    </div>
  );
};

export default ThemedSidebar;
