import { useEffect, useState } from 'react';
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetServiceHistory,
  createAssetServiceRequest,
  getBranches,
} from '../../apis';
import {
  message,
  Tag,
  Tooltip,
  Drawer,
  Modal,
  Input,
  Select,
  Button,
  Space,
  Descriptions,
  Card,
  Popconfirm,
  InputNumber,
} from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAssetSchema, createBookingSchema } from '../../helpers/schema';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Edit, Trash2, Eye, History, Wrench } from 'lucide-react';

const { TextArea } = Input;
const { Option } = Select;

const Assets = () => {
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [serviceHistoryModalVisible, setServiceHistoryModalVisible] = useState(false);
  const [serviceRequestModalVisible, setServiceRequestModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchAssets();
    fetchBranches();
  }, [pagination.current, pagination.pageSize]);

  const fetchBranches = async () => {
    try {
      const { data } = await getBranches();
      setBranches(data?.data?.branches || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data } = await getAssets({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setData(data?.data?.assets || []);
      setPagination((prev) => ({
        ...prev,
        total: data?.data?.pagination?.totalItems || 0,
      }));
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetDetails = async (id) => {
    try {
      setLoading(true);
      const { data } = await getAssetById(id);
      setSelectedAsset(data?.data?.asset);
      setDetailDrawerVisible(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceHistory = async (id) => {
    try {
      setLoading(true);
      const { data } = await getAssetServiceHistory(id);
      setServiceHistory(data?.data?.serviceHistory || []);
      setServiceHistoryModalVisible(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteAsset(id);
      message.success('Asset deleted successfully');
      fetchAssets();
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Serial #',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text) => (
        <Tooltip title={text}>
          <span>{text ? text : '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span
          className="font-medium cursor-pointer theme-text"
          onClick={() => fetchAssetDetails(record.id)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'asset_type',
      key: 'asset_type',
      render: (type) => (
        <Tag color="blue">{type?.charAt(0).toUpperCase() + type?.slice(1)}</Tag>
      ),
    },
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branch.name',
      render: (text) => text || '—',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'volcano'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Address',
      dataIndex: ['location', 'address'],
      key: 'location.address',
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Maintenance Interval',
      dataIndex: 'maintenance_interval_days',
      key: 'maintenance_interval_days',
      render: (days) => <span>{days ? `${days} days` : '—'}</span>,
    },
    {
      title: 'Service Requests',
      dataIndex: 'total_service_requests',
      key: 'total_service_requests',
      render: (num) => <span>{num ?? 0}</span>,
    },
    {
      title: 'Total Maintenance Cost',
      dataIndex: 'total_maintenance_cost',
      key: 'total_maintenance_cost',
      render: (cost) => `Rs ${cost?.toLocaleString() || 0}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Eye size={16} />}
            onClick={() => fetchAssetDetails(record.id)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<History size={16} />}
            onClick={() => fetchServiceHistory(record.id)}
          >
            History
          </Button>
          <Button
            type="link"
            icon={<Edit size={16} />}
            onClick={() => {
              setEditingAsset(record);
              setDrawerVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this asset?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<Trash2 size={16} />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Create/Edit Asset Form
  const AssetForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
      reset,
    } = useForm({
      resolver: zodResolver(createAssetSchema),
      defaultValues: editingAsset || {
        status: 'active',
        asset_type: 'equipment',
        maintenance_interval_days: 90,
      },
    });

    useEffect(() => {
      if (editingAsset) {
        Object.keys(editingAsset).forEach((key) => {
          setValue(key, editingAsset[key]);
        });
      } else {
        reset({
          status: 'active',
          asset_type: 'equipment',
          maintenance_interval_days: 90,
        });
      }
    }, [editingAsset, setValue, reset]);

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        if (editingAsset) {
          await updateAsset(editingAsset.id, values);
          message.success('Asset updated successfully');
        } else {
          await createAsset(values);
          message.success('Asset created successfully');
        }
        setDrawerVisible(false);
        setEditingAsset(null);
        fetchAssets();
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Branch (Optional)</label>
          <Select
            value={watch('branch_id')}
            onChange={(value) => setValue('branch_id', value)}
            className="w-full mt-1"
            allowClear
            placeholder="Select branch"
          >
            {branches.map((branch) => (
              <Option key={branch.id} value={branch.id}>
                {branch.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">Name *</label>
          <Input
            {...register('name')}
            placeholder="Enter asset name"
            className="mt-1"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Asset Type *</label>
          <Select
            value={watch('asset_type')}
            onChange={(value) => setValue('asset_type', value)}
            className="w-full mt-1"
          >
            <Option value="equipment">Equipment</Option>
            <Option value="vehicle">Vehicle</Option>
            <Option value="property">Property</Option>
            <Option value="furniture">Furniture</Option>
            <Option value="technology">Technology</Option>
            <Option value="other">Other</Option>
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">Description (Optional)</label>
          <TextArea
            {...register('description')}
            placeholder="Enter description"
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Serial Number (Optional)</label>
          <Input
            {...register('serial_number')}
            placeholder="Enter serial number"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Model Number (Optional)</label>
          <Input
            {...register('model_number')}
            placeholder="Enter model number"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Brand (Optional)</label>
          <Input
            {...register('brand')}
            placeholder="Enter brand name"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Status</label>
          <Select
            value={watch('status')}
            onChange={(value) => setValue('status', value)}
            className="w-full mt-1"
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="maintenance">Maintenance</Option>
            <Option value="retired">Retired</Option>
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">Location Address (Optional)</label>
          <Input
            {...register('location.address')}
            placeholder="Enter location address"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Maintenance Interval (Days)</label>
          <InputNumber
            value={watch('maintenance_interval_days')}
            onChange={(value) => setValue('maintenance_interval_days', value)}
            min={1}
            max={365}
            className="w-full mt-1"
            placeholder="Enter days (1-365)"
          />
        </div>

        <ThemedButton
          type="submit"
          text={editingAsset ? 'Update Asset' : 'Create Asset'}
          loading={loading}
          className="mt-2"
        />
      </form>
    );
  };

  // Service Request Form
  const ServiceRequestForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = useForm({
      resolver: zodResolver(createBookingSchema),
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await createAssetServiceRequest(selectedAsset?.id, values);
        message.success('Service request created successfully');
        setServiceRequestModalVisible(false);
        fetchAssets();
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Service ID *</label>
          <Input
            {...register('service_id')}
            placeholder="Enter service ID"
            className="mt-1"
          />
          {errors.service_id && (
            <p className="text-red-500 text-sm mt-1">{errors.service_id.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Description *</label>
          <TextArea
            {...register('description')}
            placeholder="Enter description (min 10, max 500 characters)"
            rows={4}
            className="mt-1"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Address Line 1 *</label>
          <Input
            {...register('location.address_line1')}
            placeholder="Enter address line 1"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Address Line 2 (Optional)</label>
          <Input
            {...register('location.address_line2')}
            placeholder="Enter address line 2"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">City *</label>
          <Input
            {...register('location.city')}
            placeholder="Enter city"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Area (Optional)</label>
          <Input
            {...register('location.area')}
            placeholder="Enter area"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">House Number (Optional)</label>
          <Input
            {...register('location.house_no')}
            placeholder="Enter house number"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Scheduled Start (Optional)</label>
          <Input
            {...register('scheduled_start')}
            type="datetime-local"
            className="mt-1"
          />
        </div>

        <ThemedButton
          type="submit"
          text="Create Service Request"
          loading={loading}
          className="mt-2"
        />
      </form>
    );
  };

  return (
    <div className="w-full h-full px-4">
      <div className="w-full flex-content-right py-4">
        <ThemedButton
          text="Create Asset"
          icon={<PlusCircle />}
          onClick={() => {
            setEditingAsset(null);
            setDrawerVisible(true);
          }}
        />
      </div>

      <ThemedTable
        loading={loading}
        columns={columns}
        data={data}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          setCurrentPage: (page) =>
            setPagination((prev) => ({ ...prev, current: page })),
          setResultPerPage: (pageSize) =>
            setPagination((prev) => ({ ...prev, pageSize, current: 1 })),
        }}
      />

      {/* Create/Edit Asset Drawer */}
      <Drawer
        title={editingAsset ? 'Edit Asset' : 'Create Asset'}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setEditingAsset(null);
        }}
        width={500}
      >
        <AssetForm />
      </Drawer>

      {/* Asset Details Drawer */}
      <Drawer
        title={`Asset Details - ${selectedAsset?.name || ''}`}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedAsset(null);
        }}
        width={600}
        extra={
          <ThemedButton
            text="Create Service Request"
            icon={<Wrench />}
            onClick={() => setServiceRequestModalVisible(true)}
          />
        }
      >
        {selectedAsset && (
          <div className="flex flex-col gap-4">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Name">{selectedAsset.name}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="blue">
                  {selectedAsset.asset_type?.charAt(0).toUpperCase() +
                    selectedAsset.asset_type?.slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Serial Number">
                {selectedAsset.serial_number || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Model Number">
                {selectedAsset.model_number || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Brand">
                {selectedAsset.brand || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedAsset.description || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Branch">
                {selectedAsset.branch?.name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedAsset.status === 'active' ? 'green' : 'volcano'}>
                  {selectedAsset.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Maintenance Interval">
                {selectedAsset.maintenance_interval_days
                  ? `${selectedAsset.maintenance_interval_days} days`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedAsset.location?.address || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Service Requests">
                {selectedAsset.total_service_requests || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Total Maintenance Cost">
                Rs {selectedAsset.total_maintenance_cost?.toLocaleString() || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {selectedAsset.created_at
                  ? format(parseISO(selectedAsset.created_at), 'dd MMM, yyyy hh:mm a')
                  : '—'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Service History Modal */}
      <Modal
        title="Service History"
        open={serviceHistoryModalVisible}
        onCancel={() => setServiceHistoryModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="flex flex-col gap-2">
          {serviceHistory.length > 0 ? (
            serviceHistory.map((item, index) => (
              <Card key={index} className="mb-2">
                <p className="font-medium">Ticket: {item.ticket_number}</p>
                <p className="text-sm">Service: {item.service}</p>
                <p className="text-sm">
                  Completed: {item.completed_at ? format(parseISO(item.completed_at), 'dd MMM, yyyy') : '—'}
                </p>
                {item.worker && (
                  <p className="text-sm">
                    Worker: {item.worker.name}
                  </p>
                )}
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No service history available</p>
          )}
        </div>
      </Modal>

      {/* Service Request Modal */}
      <Modal
        title="Create Service Request"
        open={serviceRequestModalVisible}
        onCancel={() => setServiceRequestModalVisible(false)}
        footer={null}
        width={600}
      >
        <ServiceRequestForm />
      </Modal>
    </div>
  );
};

export default Assets;
