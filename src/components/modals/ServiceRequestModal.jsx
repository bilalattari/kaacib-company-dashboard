import React from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, Typography, message } from 'antd';
import { ToolOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';

export default function ServiceRequestModal({ 
  open, 
  onClose, 
  onSubmit, 
  asset, 
  loading = false 
}) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Build location object for service request
      const location = {
        address: values.location_address,
        coordinates: values.location_lat && values.location_lng ? {
          lat: parseFloat(values.location_lat),
          lng: parseFloat(values.location_lng)
        } : undefined
      };

      const payload = {
        service_id: values.service_id,
        sub_services: values.sub_services || [],
        description: values.description,
        scheduled_start: values.scheduled_start ? new Date(values.scheduled_start).toISOString() : undefined,
        location: location,
      };

      await onSubmit(payload);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ToolOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            Create Service Request{asset ? ` • ${asset.name}` : ''}
          </Typography.Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Create Request"
      cancelText="Cancel"
      okButtonProps={{ loading, size: 'large' }}
      cancelButtonProps={{ size: 'large' }}
      width={700}
      style={{ top: 20 }}
      destroyOnHidden
      maskClosable={false}
    >
      <div style={{ padding: '20px 0', maxHeight: '70vh', overflowY: 'auto' }}>
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          size="large"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="service_id"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    <FileTextOutlined style={{ marginRight: '8px' }} />
                    Service ID
                  </span>
                }
                rules={[
                  { required: true, message: 'Service ID is required' },
                  { pattern: /^[0-9a-fA-F]{24}$/, message: 'Invalid service ID format' }
                ]}
              >
                <Input placeholder="Enter service ID" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="sub_services"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Sub Services
                  </span>
                }
              >
                <Select 
                  mode="multiple" 
                  placeholder="Select sub services"
                  options={[
                    { label: 'Maintenance', value: 'maintenance' },
                    { label: 'Repair', value: 'repair' },
                    { label: 'Inspection', value: 'inspection' },
                    { label: 'Cleaning', value: 'cleaning' },
                    { label: 'Calibration', value: 'calibration' },
                    { label: 'Testing', value: 'testing' }
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="description"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    <FileTextOutlined style={{ marginRight: '8px' }} />
                    Description
                  </span>
                }
                rules={[
                  { required: true, message: 'Description is required' },
                  { min: 10, max: 500, message: 'Description must be between 10-500 characters' }
                ]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Describe the service request in detail"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="scheduled_start"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    <CalendarOutlined style={{ marginRight: '8px' }} />
                    Scheduled Start
                  </span>
                }
              >
                <Input type="datetime-local" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Typography.Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                📍 Service Location
              </Typography.Text>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="location_address"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    {/* <MapPinOutlined style={{ marginRight: '8px' }} /> */}
                    Location Address
                  </span>
                }
                rules={[{ required: true, message: 'Location address is required' }]}
              >
                <Input placeholder="Enter service location address" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="location_lat"
                label="Latitude"
                rules={[
                  { required: true, message: 'Latitude is required' },
                  { pattern: /^-?([0-8]?[0-9]|90)(\.[0-9]{1,6})?$/, message: 'Invalid latitude' }
                ]}
              >
                <Input 
                  placeholder="Enter latitude" 
                  type="number" 
                  step="any"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="location_lng"
                label="Longitude"
                rules={[
                  { required: true, message: 'Longitude is required' },
                  { pattern: /^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]{1,6})?$/, message: 'Invalid longitude' }
                ]}
              >
                <Input 
                  placeholder="Enter longitude" 
                  type="number" 
                  step="any"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}
