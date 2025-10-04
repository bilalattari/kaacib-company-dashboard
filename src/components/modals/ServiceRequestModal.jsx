import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, Typography, message } from 'antd';
import { ToolOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';

export default function ServiceRequestModal({ 
  open, 
  onClose, 
  onSubmit, 
  asset, 
  loading = false 
}) {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [subServices, setSubServices] = useState([]);

  useEffect(() => {
    if (open) {
      loadServices();
      form.resetFields();
    }
  }, [open]);

  const loadServices = async () => {
    try {
      const res = await api.get(ENDPOINTS.GET_ALL_SERVICES());
      const data = res.data?.data || res.data || [];
      setServices(data);
    } catch (e) {
      console.error('Failed to load services:', e);
      message.error('Failed to load services');
    }
  };

  const handleServiceChange = async (serviceId) => {
    if (serviceId) {
      try {
        const res = await api.get(ENDPOINTS.GET_SUBSERVICES_BY_SERVICE(serviceId));
        const data = res.data?.data || res.data || [];
        setSubServices(data);
      } catch (e) {
        console.error('Failed to load sub-services:', e);
        setSubServices([]);
      }
    } else {
      setSubServices([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Build location object for service request with all required fields
      const location = {
        address_line1: values.location_address_line1,
        address_line2: values.location_address_line2 || '',
        city: values.location_city,
        area: values.location_area || '',
        house_no: values.location_house_no || '',
        coordinates: {
          lat: 24.8607, // Karachi coordinates
          lng: 67.0011
        }
      };

      const payload = {
        service_id: values.service_id,
        sub_services: values.sub_services || [],
        description: values.description,
        scheduled_start: values.scheduled_start ? new Date(values.scheduled_start).toISOString() : new Date().toISOString(),
        location: location,
        createdBy: values.createdBy, // This will be set by the backend
        isUrgent: values.isUrgent || true,
        auto_assign: values.auto_assign || true,
        visiting_fee: values.visiting_fee || 0,
        currency: values.currency || 'PKR'
      };

      const result = await onSubmit(payload);
      
      // Only reset form if submission was successful
      if (result && result.success !== false) {
        form.resetFields();
        setSubServices([]); // Clear sub-services as well
      }
    } catch (error) {
      console.error('Form validation error:', error);
      message.error('Please fill in all required fields');
      // Don't reset form on validation error
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
                    Service
                  </span>
                }
                rules={[
                  { required: true, message: 'Service is required' }
                ]}
              >
                <Select 
                  placeholder="Select a service"
                  onChange={handleServiceChange}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {services.map(service => (
                    <Select.Option key={service._id} value={service._id}>
                      {service.title?.en || service.title || 'Unnamed Service'}
                    </Select.Option>
                  ))}
                </Select>
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
                  disabled={subServices.length === 0}
                >
                  {subServices.map(subService => (
                    <Select.Option key={subService._id} value={subService._id}>
                      {subService.title?.en || subService.title || 'Unnamed Sub Service'}
                    </Select.Option>
                  ))}
                </Select>
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
                rules={[{ required: true, message: 'Scheduled start time is required' }]}
              >
                <Input type="datetime-local" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="isUrgent"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Urgent Request
                  </span>
                }
                valuePropName="checked"
              >
                <input type="checkbox" defaultChecked />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="visiting_fee"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Visiting Fee (PKR)
                  </span>
                }
              >
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="300" 
                  defaultValue={300}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Typography.Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                📍 Service Location Details
              </Typography.Text>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="location_address_line1"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Address Line 1 *
                  </span>
                }
                rules={[{ required: true, message: 'Address line 1 is required' }]}
              >
                <Input placeholder="Enter main address (street, building)" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="location_address_line2"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Address Line 2
                  </span>
                }
              >
                <Input placeholder="Enter additional address details (optional)" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="location_city"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    City *
                  </span>
                }
                rules={[{ required: true, message: 'City is required' }]}
              >
                <Input placeholder="Enter city name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="location_area"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Area/Sector
                  </span>
                }
              >
                <Input placeholder="Enter area or sector" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="location_house_no"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    House/Unit Number
                  </span>
                }
              >
                <Input placeholder="Enter house or unit number" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}
