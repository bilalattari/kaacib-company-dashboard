import React from 'react';
import { Card, Typography, Space, Button, Tag, Divider } from 'antd';
import { useAuth } from '../contexts/AuthContext';

export default function AuthDemo() {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    error,
    hasRole,
    hasPermission,
    getCompanyId,
    logout,
    clearError
  } = useAuth();

  // Log user to console as requested
  console.log('AuthContext User:', user);
  console.log('AuthContext Token:', token);
  console.log('AuthContext isAuthenticated:', isAuthenticated);

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view this component</div>;
  }

  return (
    <Card title="Authentication Context Demo" style={{ margin: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* User Information */}
        <div>
          <Typography.Title level={4}>User Information</Typography.Title>
          <Space direction="vertical" size="small">
            <div><strong>Name:</strong> {user?.name || user?.first_name} {user?.last_name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Role:</strong> <Tag color="blue">{user?.role}</Tag></div>
            <div><strong>Company ID:</strong> {getCompanyId()}</div>
            <div><strong>User ID:</strong> {user?.sub || user?.id}</div>
            {user?.permissions && (
              <div><strong>Permissions:</strong> {user.permissions.join(', ')}</div>
            )}
          </Space>
        </div>

        <Divider />

        {/* Token Information */}
        <div>
          <Typography.Title level={4}>Token Information</Typography.Title>
          <Space direction="vertical" size="small">
            <div><strong>Token Present:</strong> <Tag color={token ? 'green' : 'red'}>{token ? 'Yes' : 'No'}</Tag></div>
            <div><strong>Token Length:</strong> {token ? token.length : 0} characters</div>
            <div><strong>Token Expiry:</strong> {user?.exp ? new Date(user.exp * 1000).toLocaleString() : 'N/A'}</div>
          </Space>
        </div>

        <Divider />

        {/* Authentication Status */}
        <div>
          <Typography.Title level={4}>Authentication Status</Typography.Title>
          <Space direction="vertical" size="small">
            <div><strong>Is Authenticated:</strong> <Tag color={isAuthenticated ? 'green' : 'red'}>{isAuthenticated ? 'Yes' : 'No'}</Tag></div>
            <div><strong>Is Loading:</strong> <Tag color={isLoading ? 'orange' : 'default'}>{isLoading ? 'Yes' : 'No'}</Tag></div>
            {error && (
              <div><strong>Error:</strong> <Tag color="red">{error}</Tag></div>
            )}
          </Space>
        </div>

        <Divider />

        {/* Role & Permission Checks */}
        <div>
          <Typography.Title level={4}>Role & Permission Checks</Typography.Title>
          <Space direction="vertical" size="small">
            <div><strong>Has Admin Role:</strong> <Tag color={hasRole('admin') ? 'green' : 'red'}>{hasRole('admin') ? 'Yes' : 'No'}</Tag></div>
            <div><strong>Has User Role:</strong> <Tag color={hasRole('user') ? 'green' : 'red'}>{hasRole('user') ? 'Yes' : 'No'}</Tag></div>
            <div><strong>Has Manager Role:</strong> <Tag color={hasRole('manager') ? 'green' : 'red'}>{hasRole('manager') ? 'Yes' : 'No'}</Tag></div>
            {user?.permissions && (
              <div><strong>Has Read Permission:</strong> <Tag color={hasPermission('read') ? 'green' : 'red'}>{hasPermission('read') ? 'Yes' : 'No'}</Tag></div>
            )}
            {user?.permissions && (
              <div><strong>Has Write Permission:</strong> <Tag color={hasPermission('write') ? 'green' : 'red'}>{hasPermission('write') ? 'Yes' : 'No'}</Tag></div>
            )}
          </Space>
        </div>

        <Divider />

        {/* Actions */}
        <div>
          <Typography.Title level={4}>Actions</Typography.Title>
          <Space>
            <Button type="primary" onClick={() => console.log('Current User:', user)}>
              Log User to Console
            </Button>
            <Button onClick={() => console.log('Current Token:', token)}>
              Log Token to Console
            </Button>
            {error && (
              <Button onClick={clearError}>
                Clear Error
              </Button>
            )}
            <Button danger onClick={logout}>
              Logout
            </Button>
          </Space>
        </div>

        {/* Raw User Data */}
        <div>
          <Typography.Title level={4}>Raw User Data (JSON)</Typography.Title>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

      </Space>
    </Card>
  );
}
