import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, Input, Select, Typography, Row, Col, Statistic, Badge, Tooltip, message } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, PlusOutlined, PhoneOutlined, MailOutlined, EditOutlined } from '@ant-design/icons';
import BranchFormModal from '../../components/modals/BranchFormModal';
import BranchViewModal from '../../components/modals/BranchViewModal';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';

export default function Branches() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const companyId = localStorage.getItem('company-id') || 'me';

  const fetchData = async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (filters.status) qp.append('status', filters.status);
      const res = await api.get(`${ENDPOINTS.GET_COMPANY_BRANCHES(companyId)}?${qp.toString()}`);
      setData(res.data?.data?.branches || res.data?.data || res.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters.status]);

  const handleCreateBranch = async (payload) => {
    try {
      setLoading(true);
      const res = await api.post(ENDPOINTS.CREATE_COMPANY_BRANCH(companyId), payload);
      message.success('Branch created successfully');
      setFormOpen(false);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBranch = async (payload) => {
    try {
      setLoading(true);
      const res = await api.put(ENDPOINTS.UPDATE_COMPANY_BRANCH(companyId, editing._id), payload);
      message.success('Branch updated successfully');
      setFormOpen(false);
      setEditing(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update branch');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBranch = (branch) => {
    setDetail(branch);
    setViewOpen(true);
  };

  const handleEditBranch = (branch) => {
    setEditing(branch);
    setFormOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    { 
      title: 'Branch Information', 
      dataIndex: 'name',
      render: (text, record) => (
        <div>
          <div className="font-semibold text-kaacib-primary text-base">
            {/* <BuildingOutlined style={{ marginRight: '8px' }} /> */}
            {text}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {record.area && `📍 ${record.area}`}
          </div>
        </div>
      )
    },
    { 
      title: 'Location', 
      dataIndex: 'city',
      render: (city, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{city}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.address}
          </div>
        </div>
      )
    },
    { 
      title: 'Contact Information', 
      render: (_, record) => (
        <div>
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <PhoneOutlined style={{ marginRight: '6px', color: '#52c41a' }} />
              <span style={{ fontSize: '14px' }}>{record.phone}</span>
            </div>
          )}
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <MailOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
              <span style={{ fontSize: '12px', color: '#666' }}>{record.email}</span>
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      render: (status) => (
        <Badge 
          status={getStatusColor(status)} 
          text={<span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{status}</span>} 
        />
      )
    },
    { 
      title: 'Branch Type', 
      dataIndex: 'is_main_branch',
      render: (isMain) => (
        <Tag color={isMain ? 'gold' : 'blue'}>
          {isMain ? '🏢 Main Branch' : '📍 Sub Branch'}
        </Tag>
      )
    },
    { 
      title: 'Statistics', 
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ color: '#1890ff', fontWeight: 500 }}>
            📦 {record.total_assets || 0} Assets
          </div>
          <div style={{ color: '#52c41a', fontWeight: 500 }}>
            👥 {record.total_users || 0} Users
          </div>
          <div style={{ color: '#faad14', fontWeight: 500 }}>
            📋 {record.total_bookings || 0} Bookings
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewBranch(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Branch">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditBranch(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Calculate statistics
  const stats = {
    total: data.length,
    active: data.filter(b => b.status === 'active').length,
    inactive: data.filter(b => b.status === 'inactive').length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <Typography.Title level={2} className="m-0 text-kaacib-primary">
          Branch Management
        </Typography.Title>
        <Typography.Text type="secondary" className="text-base">
          Manage and monitor your company branches across different locations
        </Typography.Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card className="card-kaacib">
            <Statistic
              title="Total Branches"
              value={stats.total}
              prefix="🏢"
              valueStyle={{ color: '#133260' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="card-kaacib">
            <Statistic
              title="Active Branches"
              value={stats.active}
              prefix="✅"
              valueStyle={{ color: '#FF3605' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="card-kaacib">
            <Statistic
              title="Inactive Branches"
              value={stats.inactive}
              prefix="⏸️"
              valueStyle={{ color: '#133260' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="card-kaacib mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Search branches by name, city, or area..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              onSearch={(v) => setFilters(p => ({ ...p, search: v }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Filter by Status"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={(v) => setFilters(p => ({ ...p, status: v || '' }))}
            >
              <Select.Option value="active">✅ Active</Select.Option>
              <Select.Option value="inactive">⏸️ Inactive</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Space size="middle">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchData}
                size="large"
              >
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="large"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Add New Branch
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Branches Table */}
      <Card>
        <Table 
          rowKey="_id" 
          loading={loading} 
          dataSource={data} 
          columns={columns} 
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} branches`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Branch Form Modal */}
      <BranchFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdateBranch : handleCreateBranch}
        editing={editing}
        loading={loading}
      />

      {/* Branch View Modal */}
      <BranchViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        branch={detail}
        loading={loading}
      />
    </div>
  );
}


