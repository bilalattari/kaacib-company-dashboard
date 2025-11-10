import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAssetSchema } from '../../helpers/schema';
import {
  createAsset as createAssetApi,
  getAssets,
  getBranches,
} from '../../apis';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { message, Tag, Tooltip, Space, Popconfirm } from 'antd';
import ThemedTable from '../../components/ThemedTable';
import DrawerForm from '../../components/DrawerForm';
import ThemedButton from '../../components/ThemedButton';

const Assets = () => {
  const [data, setData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const createAssetForm = useForm({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      status: 'active',
      asset_type: 'equipment',
      maintenance_interval_days: 30,
    },
  });

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
        total: data?.data?.pagination?.total || 0,
      }));
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async (values, imageUrls) => {
    try {
      const data = { ...values };

      if (imageUrls && imageUrls.length > 0) {
        data.images = imageUrls;
      }

      await createAssetApi(data);
      message.success('Asset added successfully');
      fetchAssets();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const columns = [
    {
      title: 'Serial #',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text) => <span>{text ? text : 'N/A'}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'asset_type',
      key: 'asset_type',
      render: (type) => (
        <Tag color="blue" className="capitalize">
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={status === 'active' ? 'green' : 'volcano'}
          className="uppercase"
        >
          {status || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branch.name',
      render: (text) => text || '—',
    },
    {
      title: 'Address',
      dataIndex: ['location', 'address'],
      key: 'location.address',
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || 'N/A'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Maintenance Interval',
      dataIndex: ['maintenance_interval_days'],
      key: 'maintenance_interval_days',
      render: (text) => <span>{`${text} days` || 'N/A'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Eye
              size={16}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Edit
              size={16}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this asset?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Trash2
                size={16}
                className="cursor-pointer text-red-500 hover:text-red-700"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const formItems = [
    {
      name: 'name',
      label: 'Asset Name',
      type: 'text',
      placeholder: 'Enter asset name',
      required: true,
    },
    {
      name: 'asset_type',
      label: 'Asset Type',
      type: 'select',
      placeholder: 'Select asset type',
      required: true,
      options: [
        { value: 'equipment', label: 'Equipment' },
        { value: 'vehicle', label: 'Vehicle' },
        { value: 'property', label: 'Property' },
        { value: 'furniture', label: 'Furniture' },
        { value: 'technology', label: 'Technology' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      name: 'branch_id',
      label: 'Branch',
      type: 'select',
      placeholder: 'Select Branch',
      required: true,
      options: branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
      })),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter asset description',
      rows: 3,
    },
    {
      name: 'maintenance_interval_days',
      label: 'Maintenance Interval (Days)',
      type: 'number',
      placeholder: 'Enter maintenance interval',
      min: 1,
      max: 365,
    },
    {
      name: 'brand',
      label: 'Brand (Optional)',
      type: 'text',
      placeholder: 'Enter brand name',
    },
    {
      name: 'brand',
      label: 'Brand (Optional)',
      type: 'text',
      placeholder: 'Enter brand name',
    },
    {
      name: 'serial_number',
      label: 'Serial Number',
      type: 'text',
      placeholder: 'Enter serial number',
    },
    {
      name: 'model_number',
      label: 'Model Number',
      type: 'text',
      placeholder: 'Enter model number',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Select status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'retired', label: 'Retired' },
      ],
    },
  ];

  return (
    <div className="w-full h-full px-4">
      <div className="w-full flex-content-right py-4">
        <ThemedButton
          text="Create Asset"
          icon={<PlusCircle />}
          onClick={() => {
            setIsEditMode(false);
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
      <DrawerForm
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        title={isEditMode ? 'Edit asset' : 'Create asset'}
        action={isEditMode ? 'edit' : 'create'}
        form={createAssetForm}
        onSubmit={createAsset}
        formItems={formItems}
        showImageUpload={true}
      />
    </div>
  );
};

export default Assets;
