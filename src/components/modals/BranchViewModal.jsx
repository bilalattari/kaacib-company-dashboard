import React from 'react';
import { Modal, Card, Row, Col, Typography, Badge, Button, Space } from 'antd';
import {   PhoneOutlined, MailOutlined, ReloadOutlined } from '@ant-design/icons';

export default function BranchViewModal({ 
  open, 
  onClose, 
  branch, 
  loading = false 
}) {
  if (!branch) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* <BuildingOutlined style={{ color: '#1890ff', fontSize: '20px' }} /> */}
          <Typography.Title level={4} style={{ margin: 0 }}>
            {branch.name} - Branch Details
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
      width={900}
      style={{ top: 20 }}
      destroyOnHidden
    >
      <div style={{ padding: '20px 0' }}>
        <Row gutter={[16, 16]}>
          {/* Basic Information */}
          <Col xs={24} sm={12}>
            <Card 
              size="small" 
              style={{ height: '100%', border: '1px solid #f0f0f0' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* <BuildingOutlined style={{ color: '#1890ff' }} /> */}
                  <span style={{ fontWeight: 600 }}>Basic Information</span>
                </div>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    BRANCH NAME
                  </Typography.Text>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#1890ff' }}>
                    {branch.name}
                  </div>
                </div>
                
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    STATUS
                  </Typography.Text>
                  <div style={{ marginTop: '4px' }}>
                    <Badge 
                      status={getStatusColor(branch.status)} 
                      text={
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {branch.status}
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
                    {branch.address || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    CITY
                  </Typography.Text>
                  <div style={{ fontWeight: 500, marginTop: '4px' }}>
                    {branch.city || 'N/A'}
                  </div>
                </div>

                {branch.area && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      AREA
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                      {branch.area}
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col xs={24} sm={12}>
            <Card 
              size="small" 
              style={{ height: '100%', border: '1px solid #f0f0f0' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneOutlined style={{ color: '#faad14' }} />
                  <span style={{ fontWeight: 600 }}>Contact Information</span>
                </div>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {branch.phone && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      PHONE NUMBER
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PhoneOutlined style={{ color: '#52c41a' }} />
                      {branch.phone}
                    </div>
                  </div>
                )}

                {branch.email && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      EMAIL ADDRESS
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MailOutlined style={{ color: '#1890ff' }} />
                      {branch.email}
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Coordinates */}
          {branch.coordinates && (
            <Col xs={24} sm={12}>
              <Card 
                size="small" 
                style={{ height: '100%', border: '1px solid #f0f0f0' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* <MapPinOutlined style={{ color: '#722ed1' }} /> */}
                    <span style={{ fontWeight: 600 }}>Coordinates</span>
                  </div>
                }
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      LATITUDE
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                      {branch.coordinates.lat || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                      LONGITUDE
                    </Typography.Text>
                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                      {branch.coordinates.lng || 'N/A'}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </Modal>
  );
}
