import React from 'react';
import { Modal, Card, Row, Col, Typography, Badge, Button, Space, Tag } from 'antd';
import { TagOutlined, SettingOutlined, CalendarOutlined } from '@ant-design/icons';

export default function AssetViewModal({ 
  open, 
  onClose, 
  asset, 
  loading = false 
}) {
  if (!asset) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      case 'retired': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'equipment': return '🔧';
      case 'vehicle': return '🚗';
      case 'property': return '🏢';
      case 'furniture': return '🪑';
      case 'technology': return '💻';
      default: return '📦';
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* <BoxesOutlined style={{ color: '#1890ff', fontSize: '20px' }} /> */}
          <Typography.Title level={4} style={{ margin: 0 }}>
            {asset.name} - Asset Details
          </Typography.Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} size="large">
          Close
        </Button>
      ]}
      width={1000}
      style={{ top: 20 }}
      destroyOnHidden
    >
      <div style={{ padding: '20px 0', maxHeight: '70vh', overflowY: 'auto' }}>
        <Row gutter={[16, 16]}>
          {/* Basic Information */}
          <Col xs={24} sm={12}>
            <Card 
              size="small" 
              style={{ height: '100%', border: '1px solid #f0f0f0' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* <BoxesOutlined style={{ color: '#1890ff' }} /> */}
                  <span style={{ fontWeight: 600 }}>Basic Information</span>
                </div>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    ASSET NAME
                  </Typography.Text>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#1890ff' }}>
                    {asset.name}
                  </div>
                </div>
                
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    TYPE
                  </Typography.Text>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{getTypeIcon(asset.asset_type)}</span>
                    <Tag color="blue" style={{ textTransform: 'capitalize' }}>
                      {asset.asset_type}
                    </Tag>
                  </div>
                </div>
                
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    STATUS
                  </Typography.Text>
                  <div style={{ marginTop: '4px' }}>
                    <Badge 
                      status={getStatusColor(asset.status)} 
                      text={
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {asset.status}
                        </span>
                      } 
                    />
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Location Information */}
          <Col xs={24} sm={12}>
            <Card 
              size="small" 
              style={{ height: '100%', border: '1px solid #f0f0f0' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* <MapPinOutlined style={{ color: '#52c41a' }} /> */}
                  <span style={{ fontWeight: 600 }}>Location</span>
                </div>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    ADDRESS
                  </Typography.Text>
                  <div style={{ fontWeight: 500, marginTop: '4px' }}>
                    {asset.location?.address || 'N/A'}
                  </div>
                </div>
                
                {asset.location?.coordinates && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      COORDINATES
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* <MapPinOutlined style={{ color: '#faad14' }} /> */}
                      {asset.location.coordinates.lat?.toFixed(4)}, {asset.location.coordinates.lng?.toFixed(4)}
                    </div>
                  </div>
                )}

                {asset.branch && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      BRANCH
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                      {asset.branch.name}
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Technical Details */}
          <Col xs={24} sm={12}>
            <Card 
              size="small" 
              style={{ height: '100%', border: '1px solid #f0f0f0' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TagOutlined style={{ color: '#faad14' }} />
                  <span style={{ fontWeight: 600 }}>Technical Details</span>
                </div>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {asset.serial_number && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      SERIAL NUMBER
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                      {asset.serial_number}
                    </div>
                  </div>
                )}

                {asset.model_number && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      MODEL NUMBER
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                      {asset.model_number}
                    </div>
                  </div>
                )}

                {asset.brand && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      BRAND
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                      {asset.brand}
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Maintenance Information */}
          <Col xs={24} sm={12}>
            <Card 
              size="small" 
              style={{ height: '100%', border: '1px solid #f0f0f0' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SettingOutlined style={{ color: '#722ed1' }} />
                  <span style={{ fontWeight: 600 }}>Maintenance</span>
                </div>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    MAINTENANCE INTERVAL
                  </Typography.Text>
                  <div style={{ fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined style={{ color: '#52c41a' }} />
                    {asset.maintenance_interval_days || 90} days
                  </div>
                </div>

                {asset.createdAt && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      CREATED DATE
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Description */}
          {asset.description && (
            <Col xs={24}>
              <Card 
                size="small" 
                style={{ border: '1px solid #f0f0f0' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography.Text strong>Description</Typography.Text>
                  </div>
                }
              >
                <Typography.Text>{asset.description}</Typography.Text>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </Modal>
  );
}
