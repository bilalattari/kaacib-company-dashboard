import React from 'react';
import { Drawer, Table, Button, Typography, Space, Card, Row, Col, Statistic } from 'antd';
import { HistoryOutlined, ReloadOutlined, CalendarOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';

export default function AssetHistoryDrawer({ 
  open, 
  onClose, 
  history, 
  asset, 
  loading = false,
  onRefresh 
}) {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'service_date',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <span>{date ? new Date(date).toLocaleString() : '-'}</span>
        </div>
      ),
      sorter: (a, b) => new Date(a.service_date) - new Date(b.service_date),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Service Type',
      dataIndex: 'service_type',
      render: (type) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          background: '#f0f0f0',
          fontSize: '12px',
          fontWeight: 500
        }}>
          {type || 'N/A'}
        </span>
      )
    },
    {
      title: 'Worker',
      dataIndex: ['worker', 'first_name'],
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined style={{ color: '#52c41a' }} />
          <span>
            {record?.worker ? 
              `${record.worker.first_name || ''} ${record.worker.last_name || ''}`.trim() : 
              'N/A'
            }
          </span>
        </div>
      )
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      render: (cost) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarOutlined style={{ color: '#faad14' }} />
          <span style={{ fontWeight: 500 }}>
            {cost ? `$${cost}` : 'N/A'}
          </span>
        </div>
      )
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      render: (notes) => (
        <span style={{ 
          maxWidth: '200px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {notes || '-'}
        </span>
      )
    }
  ];

  // Calculate statistics
  const stats = {
    total: history?.items?.length || 0,
    totalCost: history?.items?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0,
    lastService: history?.items?.[0]?.service_date || null
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HistoryOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            Service History{asset ? ` • ${asset.name}` : ''}
          </Typography.Title>
        </div>
      }
      width={800}
      open={open}
      onClose={onClose}
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={onRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      }
      destroyOnHidden
    >
      <div style={{ padding: '20px 0' }}>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Total Services"
                value={stats.total}
                prefix="🔧"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Total Cost"
                value={stats.totalCost}
                prefix="$"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Last Service"
                value={stats.lastService ? new Date(stats.lastService).toLocaleDateString() : 'N/A'}
                valueStyle={{ color: '#faad14', fontSize: '14px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Service History Table */}
        <Card>
          <Table
            size="small"
            rowKey={(record) => record._id || record.id}
            loading={loading}
            dataSource={history?.items || []}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} service records`
            }}
            scroll={{ x: 600 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <HistoryOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                  <Typography.Text type="secondary">
                    No service history found for this asset
                  </Typography.Text>
                </div>
              )
            }}
          />
        </Card>
      </div>
    </Drawer>
  );
}
