import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, Typography, message } from 'antd';
import {  PhoneOutlined, MailOutlined } from '@ant-design/icons';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';

export default function BranchFormModal({ 
  open, 
  onClose, 
  onSubmit, 
  editing, 
  loading = false 
}) {
  const [form] = Form.useForm();
  const [branches, setBranches] = useState([]);
  // Hardcoded coordinates per request
  const HARDCODED_COORDS = { lat: 0, lng: 0 };

  useEffect(() => {
    if (!open) return;

    const init = async () => {
      // if any reference data is needed in future, load here
      // await loadBranches();

      if (editing) {
        form.resetFields();

        form.setFieldsValue({
          name: editing.name ?? '',
          address: editing.address ?? '',
          city: editing.city ?? '',
          area: editing.area ?? '',
          phone: editing.phone ?? '',
          email: editing.email ?? '',
          status: editing.status ?? 'active',
        });
      } else {
        form.resetFields();
      }
    };

    init();
  }, [open, editing, form]);

  const loadBranches = async () => {
    try {
      const res = await api.get(ENDPOINTS.GET_COMPANY_BRANCHES());
      const data = res.data?.data?.branches || res.data?.branches || res.data || [];
      setBranches(data);
    } catch (e) {
      console.error('Failed to load branches:', e);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Use hardcoded coordinates per request
      const coordinates = { ...HARDCODED_COORDS };

      const payload = {
        name: values.name,
        address: values.address || '',
        city: values.city || '',
        area: values.area || '',
        phone: values.phone || '',
        email: values.email || '',
        coordinates,
        status: values.status || 'active'
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
          {/* <BuildingOutlined style={{ color: '#1890ff', fontSize: '20px' }} /> */}
          <Typography.Title level={4} style={{ margin: 0 }}>
            {editing ? 'Edit Branch' : 'Create New Branch'}
          </Typography.Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={editing ? 'Update Branch' : 'Create Branch'}
      cancelText="Cancel"
      okButtonProps={{ loading, size: 'large' }}
      cancelButtonProps={{ size: 'large' }}
      width={800}
      style={{ top: 20 }}
      destroyOnHidden
      forceRender
      maskClosable={false}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' , overflowX: 'hidden', paddingTop: 20, paddingBottom: 20 } }}
    >
      <div>
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          size="large"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    {/* <BuildingOutlined style={{ marginRight: '8px' }} /> */}
                    Branch Name
                  </span>
                }
                rules={[
                  { required: true, message: 'Branch name is required' },
                  { min: 2, max: 100, message: 'Name must be between 2-100 characters' }
                ]}
              >
                <Input placeholder="Enter branch name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Status
                  </span>
                }
                rules={[{ required: true, message: 'Status is required' }]}
              >
                <Select placeholder="Select status">
                  <Select.Option value="active">✅ Active</Select.Option>
                  <Select.Option value="inactive">⏸️ Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="address"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    {/* <MapPinOutlined style={{ marginRight: '8px' }} /> */}
                    Address
                  </span>
                }
                rules={[
                  { required: true, message: 'Address is required' },
                  { min: 10, max: 200, message: 'Address must be between 10-200 characters' }
                ]}
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Enter complete address" 
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="city"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    City
                  </span>
                }
                rules={[
                  { required: true, message: 'City is required' },
                  { min: 2, max: 50, message: 'City must be between 2-50 characters' }
                ]}
              >
                <Input placeholder="Enter city name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="area"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Area
                  </span>
                }
              >
                <Input placeholder="Enter area/sector" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    <PhoneOutlined style={{ marginRight: '8px' }} />
                    Phone Number
                  </span>
                }
                rules={[
                  { required: true, message: 'Phone number is required' },
                  { pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/, message: 'Invalid phone number format' }
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    <MailOutlined style={{ marginRight: '8px' }} />
                    Email Address
                  </span>
                }
                rules={[
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>

            
          </Row>
        </Form>
      </div>
    </Modal>
  );
}
