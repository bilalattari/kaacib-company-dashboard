import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Card, Tag, Space, Button, Input, Select, Typography, message, Row, Col, Statistic, Badge, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, ToolOutlined, EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { fetchAssets, setAssetFilters, createAsset, updateAssetById, deleteAssetById, fetchAssetHistory, createAssetServiceRequest } from '../../features/assets/assetsSlice';
import AssetFormModal from '../../components/modals/AssetFormModal';
import AssetViewModal from '../../components/modals/AssetViewModal';
import AssetHistoryDrawer from '../../components/modals/AssetHistoryDrawer';
import ServiceRequestModal from '../../components/modals/ServiceRequestModal';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';

export default function Assets() {
  const dispatch = useDispatch();
  const { list, loading, filters, history } = useSelector(s => s.assets);
  const [formOpen, setFormOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [serviceOpen, setServiceOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [viewing, setViewing] = React.useState(null);
  const [branches, setBranches] = React.useState([]);

  useEffect(() => { dispatch(fetchAssets(filters)); }, [filters]);

  // load branches for form select
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(ENDPOINTS.GET_COMPANY_BRANCHES());
        const data = res.data?.data?.branches || res.data?.branches || res.data || [];
        setBranches(data);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  const onDelete = async (id) => {
    try {
      const result = await dispatch(deleteAssetById(id));
      if (deleteAssetById.fulfilled.match(result)) {
        message.success('Asset deleted successfully');
        dispatch(fetchAssets(filters));
      } else {
        message.error(result.payload || 'Failed to delete asset');
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleCreateAsset = async (payload) => {
    try {
      const result = await dispatch(createAsset(payload));
      if (createAsset.fulfilled.match(result)) {
        message.success('Asset created successfully');
        setFormOpen(false);
        dispatch(fetchAssets(filters));
      } else {
        message.error(result.payload || 'Failed to create asset');
      }
    } catch (error) {
      message.error('Failed to create asset');
    }
  };

  const handleUpdateAsset = async (payload) => {
    try {
      const result = await dispatch(updateAssetById({ id: editing._id, data: payload }));
      if (updateAssetById.fulfilled.match(result)) {
        message.success('Asset updated successfully');
        setFormOpen(false);
        setEditing(null);
        dispatch(fetchAssets(filters));
      } else {
        message.error(result.payload || 'Failed to update asset');
      }
    } catch (error) {
      message.error('Failed to update asset');
    }
  };

  const handleViewAsset = (asset) => {
    setViewing(asset);
    setViewOpen(true);
  };

  const handleEditAsset = (asset) => {
    setEditing(asset);
    setFormOpen(true);
  };

  const handleOpenHistory = async (asset) => {
    setViewing(asset);
    setHistoryOpen(true);
    await dispatch(fetchAssetHistory({ id: asset._id }));
  };

  const handleServiceRequest = (asset) => {
    setEditing(asset);
    setServiceOpen(true);
  };

  const handleCreateServiceRequest = async (payload) => {
    try {
      const result = await dispatch(createAssetServiceRequest({ id: editing._id, data: payload }));
      if (createAssetServiceRequest.fulfilled.match(result)) {
        message.success('Service request created successfully');
        setServiceOpen(false);
        setEditing(null);
      } else {
        message.error(result.payload || 'Failed to create service request');
      }
    } catch (error) {
      message.error('Failed to create service request');
    }
  };

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

  const columns = [
    { 
      title: 'Asset', 
      dataIndex: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1890ff' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {getTypeIcon(record.asset_type)} {record.asset_type?.toUpperCase()}
          </div>
        </div>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      render: (status) => (
        <Badge 
          status={getStatusColor(status)} 
          text={<span style={{ textTransform: 'capitalize' }}>{status}</span>} 
        />
      )
    },
    { 
      title: 'Location', 
      dataIndex: 'location', 
      render: (loc) => (
        <div>
          <div>{loc?.address || '-'}</div>
          {loc?.coordinates && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              📍 {loc.coordinates.lat?.toFixed(4)}, {loc.coordinates.lng?.toFixed(4)}
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Details', 
      render: (_, record) => (
        <div>
          <div><strong>Serial:</strong> {record.serial_number || '-'}</div>
          <div><strong>Brand:</strong> {record.brand || '-'}</div>
          <div><strong>Model:</strong> {record.model_number || '-'}</div>
        </div>
      )
    },
    {
      title: 'Actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewAsset(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Asset">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditAsset(record)}
            />
          </Tooltip>
          <Tooltip title="Service History">
            <Button 
              type="text" 
              icon={<HistoryOutlined />} 
              onClick={() => handleOpenHistory(record)}
            />
          </Tooltip>
          <Tooltip title="Request Service">
            <Button 
              type="text" 
              icon={<ToolOutlined />} 
              onClick={() => handleServiceRequest(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Asset"
            description="Are you sure you want to delete this asset? This action cannot be undone."
            onConfirm={() => onDelete(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Tooltip title="Delete Asset">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Calculate statistics
  const stats = {
    total: list.length,
    active: list.filter(a => a.status === 'active').length,
    maintenance: list.filter(a => a.status === 'maintenance').length,
    retired: list.filter(a => a.status === 'retired').length
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <Typography.Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          Asset Management
        </Typography.Title>
        <Typography.Text type="secondary">
          Manage and track your company assets efficiently
        </Typography.Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Assets"
              value={stats.total}
              prefix="📦"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Assets"
              value={stats.active}
              prefix="✅"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Under Maintenance"
              value={stats.maintenance}
              prefix="🔧"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Retired Assets"
              value={stats.retired}
              prefix="🏁"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Search assets by name, serial, or brand..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              onSearch={(v) => dispatch(setAssetFilters({ search: v }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Filter by Type"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={(v) => dispatch(setAssetFilters({ asset_type: v || '' }))}
            >
              <Select.Option value="equipment">🔧 Equipment</Select.Option>
              <Select.Option value="vehicle">🚗 Vehicle</Select.Option>
              <Select.Option value="property">🏢 Property</Select.Option>
              <Select.Option value="furniture">🪑 Furniture</Select.Option>
              <Select.Option value="technology">💻 Technology</Select.Option>
              <Select.Option value="other">📦 Other</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Filter by Status"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={(v) => dispatch(setAssetFilters({ status: v || '' }))}
            >
              <Select.Option value="active">✅ Active</Select.Option>
              <Select.Option value="inactive">⏸️ Inactive</Select.Option>
              <Select.Option value="maintenance">🔧 Maintenance</Select.Option>
              <Select.Option value="retired">🏁 Retired</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space size="middle">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => dispatch(fetchAssets(filters))}
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
                Add New Asset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Assets Table */}
      <Card>
        <Table 
          rowKey="_id" 
          loading={loading} 
          dataSource={list} 
          columns={columns} 
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} assets`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Asset Form Modal */}
      <AssetFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdateAsset : handleCreateAsset}
        editing={editing}
        loading={loading}
      />

      {/* Asset View Modal */}
      <AssetViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        asset={viewing}
        loading={loading}
      />

      {/* Asset History Drawer */}
      <AssetHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        asset={viewing}
        loading={history.loading}
        onRefresh={() => viewing && dispatch(fetchAssetHistory({ id: viewing._id }))}
      />

      {/* Service Request Modal */}
      <ServiceRequestModal
        open={serviceOpen}
        onClose={() => {
          setServiceOpen(false);
          setEditing(null);
        }}
        onSubmit={handleCreateServiceRequest}
        asset={editing}
        loading={loading}
      />
    </div>
  );
}




