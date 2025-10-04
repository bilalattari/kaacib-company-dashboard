import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, Typography, message } from 'antd';
import { SettingOutlined, TagOutlined } from '@ant-design/icons';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';

export default function AssetFormModal({ 
  open, 
  onClose, 
  onSubmit, 
  editing, 
  loading = false 
}) {
  const [form] = Form.useForm();
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (open) {
      loadBranches();
      
      if (editing) {
        form.setFieldsValue({
          ...editing,
          branch_id: editing.branch?._id,
          location_address: editing.location?.address || '',
          location_lat: editing.location?.coordinates?.lat || '',
          location_lng: editing.location?.coordinates?.lng || ''
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editing]);

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
      
      // Build location object as expected by backend validator
      let location = null;
      if (values.location_address) {
        location = {
          address: values.location_address,
          coordinates: values.location_lat && values.location_lng ? {
            lat: parseFloat(values.location_lat),
            lng: parseFloat(values.location_lng)
          } : undefined
        };
      }

      const payload = {
        name: values.name,
        asset_type: values.asset_type,
        status: values.status || 'active',
        location: location,
        serial_number: values.serial_number || '',
        model_number: values.model_number || '',
        brand: values.brand || '',
        description: values.description || '',
        branch_id: values.branch_id || undefined,
        maintenance_interval_days: values.maintenance_interval_days || 90,
        images: values.images || []
      };

      await onSubmit(payload);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
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
            {editing ? 'Edit Asset' : 'Create New Asset'}
          </Typography.Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={editing ? 'Update Asset' : 'Create Asset'}
      cancelText="Cancel"
      okButtonProps={{ loading, size: 'large' }}
      cancelButtonProps={{ size: 'large' }}
      width={900}
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    {/* <BoxesOutlined style={{ marginRight: '8px' }} /> */}
                    Asset Name
                  </span>
                }
                rules={[
                  { required: true, message: 'Asset name is required' },
                  { min: 2, max: 100, message: 'Name must be between 2-100 characters' }
                ]}
              >
                <Input placeholder="Enter asset name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="asset_type"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    <TagOutlined style={{ marginRight: '8px' }} />
                    Asset Type
                  </span>
                }
                rules={[{ required: true, message: 'Asset type is required' }]}
              >
                <Select placeholder="Select asset type">
                  <Select.Option value="equipment">🔧 Equipment</Select.Option>
                  <Select.Option value="vehicle">🚗 Vehicle</Select.Option>
                  <Select.Option value="property">🏢 Property</Select.Option>
                  <Select.Option value="furniture">🪑 Furniture</Select.Option>
                  <Select.Option value="technology">💻 Technology</Select.Option>
                  <Select.Option value="other">📦 Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="branch_id"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Branch
                  </span>
                }
              >
                <Select allowClear placeholder="Select branch">
                  {branches.map(b => (
                    <Select.Option key={b._id} value={b._id}>
                      {b.name}
                    </Select.Option>
                  ))}
                </Select>
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
              >
                <Select placeholder="Select status">
                  <Select.Option value="active">✅ Active</Select.Option>
                  <Select.Option value="inactive">⏸️ Inactive</Select.Option>
                  <Select.Option value="maintenance">🔧 Maintenance</Select.Option>
                  <Select.Option value="retired">🏁 Retired</Select.Option>
                </Select>
              </Form.Item>
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
              >
                <Input placeholder="Enter asset location address" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Typography.Text type="secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                📍 Location Coordinates (Optional)
              </Typography.Text>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="location_lat"
                label="Latitude"
                rules={[
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

            <Col xs={24} sm={12}>
              <Form.Item
                name="serial_number"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Serial Number
                  </span>
                }
              >
                <Input placeholder="Enter serial number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="model_number"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Model Number
                  </span>
                }
              >
                <Input placeholder="Enter model number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="brand"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Brand
                  </span>
                }
              >
                <Input placeholder="Enter brand name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="maintenance_interval_days"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    <SettingOutlined style={{ marginRight: '8px' }} />
                    Maintenance Interval (Days)
                  </span>
                }
                rules={[
                  { type: 'number', min: 1, max: 365, message: 'Must be between 1-365 days' }
                ]}
              >
                <Input 
                  type="number" 
                  min={1} 
                  max={365} 
                  placeholder="90" 
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="description"
                label={
                  <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    Description
                  </span>
                }
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Enter asset description"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}
