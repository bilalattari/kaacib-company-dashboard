import { useEffect, useState } from 'react';
import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  getBranchAssets,
  getBranchUsers,
} from '../../apis';
import { message, Tag, Tooltip, Drawer, Modal, Input, Select, Button, Space, Descriptions, Card, Popconfirm } from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBranchSchema } from '../../helpers/schema';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';

const { TextArea } = Input;
const { Option } = Select;

const Branches = () => {
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchBranches();
  }, [pagination.current, pagination.pageSize]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data } = await getBranches({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setData(data?.data?.branches || []);
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

  const fetchBranchDetails = async (id) => {
    try {
      setLoading(true);
      const [branchRes, assetsRes, usersRes] = await Promise.all([
        getBranchById(id),
        getBranchAssets(id),
        getBranchUsers(id),
      ]);
      setSelectedBranch(branchRes.data?.data?.branch);
      setAssets(assetsRes.data?.data?.assets || []);
      setUsers(usersRes.data?.data?.users || []);
      setDetailDrawerVisible(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteBranch(id);
      message.success('Branch deleted successfully');
      fetchBranches();
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span
          className="font-medium cursor-pointer theme-text"
          onClick={() => fetchBranchDetails(record.id)}
        >
          {text}
          {record.is_main_branch && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              Main
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
      render: (text) => text || '—',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'volcano'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Assets',
      dataIndex: 'total_assets',
      key: 'total_assets',
      render: (num) => <span>{num ?? 0}</span>,
    },
    {
      title: 'Users',
      dataIndex: 'total_users',
      key: 'total_users',
      render: (num) => <span>{num ?? 0}</span>,
    },
    {
      title: 'Bookings',
      dataIndex: 'total_bookings',
      key: 'total_bookings',
      render: (num) => <span>{num ?? 0}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Eye size={16} />}
            onClick={() => fetchBranchDetails(record.id)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<Edit size={16} />}
            onClick={() => {
              setEditingBranch(record);
              setDrawerVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this branch?"
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

  // Create/Edit Branch Form
  const BranchForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
      reset,
    } = useForm({
      resolver: zodResolver(createBranchSchema),
      defaultValues: editingBranch || {
        status: 'active',
        is_main_branch: false,
      },
    });

    // Set form values when editing
    useEffect(() => {
      if (editingBranch) {
        Object.keys(editingBranch).forEach((key) => {
          setValue(key, editingBranch[key]);
        });
      } else {
        reset({
          status: 'active',
          is_main_branch: false,
        });
      }
    }, [editingBranch, setValue, reset]);

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        if (editingBranch) {
          await updateBranch(editingBranch.id, values);
          message.success('Branch updated successfully');
        } else {
          await createBranch(values);
          message.success('Branch created successfully');
        }
        setDrawerVisible(false);
        setEditingBranch(null);
        fetchBranches();
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Name *</label>
          <Input
            {...register('name')}
            placeholder="Enter branch name"
            className="mt-1"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Address *</label>
          <TextArea
            {...register('address')}
            placeholder="Enter complete address"
            rows={3}
            className="mt-1"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">City *</label>
          <Input
            {...register('city')}
            placeholder="Enter city name"
            className="mt-1"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Area (Optional)</label>
          <Input
            {...register('area')}
            placeholder="Enter area name"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Phone (Optional)</label>
          <Input
            {...register('phone')}
            placeholder="Enter phone number"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Email (Optional)</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="Enter email address"
            className="mt-1"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
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
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">
            <input
              type="checkbox"
              {...register('is_main_branch')}
              checked={watch('is_main_branch')}
              onChange={(e) => setValue('is_main_branch', e.target.checked)}
              className="mr-2"
            />
            Is Main Branch
          </label>
        </div>

        <ThemedButton
          type="submit"
          text={editingBranch ? 'Update Branch' : 'Create Branch'}
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
          text="Create Branch"
          icon={<PlusCircle />}
          onClick={() => {
            setEditingBranch(null);
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

      {/* Create/Edit Branch Drawer */}
      <Drawer
        title={editingBranch ? 'Edit Branch' : 'Create Branch'}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setEditingBranch(null);
        }}
        width={500}
      >
        <BranchForm />
      </Drawer>

      {/* Branch Details Drawer */}
      <Drawer
        title={`Branch Details - ${selectedBranch?.name || ''}`}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedBranch(null);
          setAssets([]);
          setUsers([]);
        }}
        width={600}
      >
        {selectedBranch && (
          <div className="flex flex-col gap-4">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Name">{selectedBranch.name}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedBranch.address}</Descriptions.Item>
              <Descriptions.Item label="City">{selectedBranch.city}</Descriptions.Item>
              <Descriptions.Item label="Area">
                {selectedBranch.area || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedBranch.phone || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedBranch.email || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedBranch.status === 'active' ? 'green' : 'volcano'}>
                  {selectedBranch.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Main Branch">
                <Tag color={selectedBranch.is_main_branch ? 'blue' : 'default'}>
                  {selectedBranch.is_main_branch ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              {selectedBranch.coordinates && (
                <>
                  <Descriptions.Item label="Latitude">
                    {selectedBranch.coordinates.lat}
                  </Descriptions.Item>
                  <Descriptions.Item label="Longitude">
                    {selectedBranch.coordinates.lng}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Created At">
                {selectedBranch.created_at
                  ? format(parseISO(selectedBranch.created_at), 'dd MMM, yyyy hh:mm a')
                  : '—'}
              </Descriptions.Item>
            </Descriptions>

            {assets.length > 0 && (
              <Card title="Branch Assets" className="mt-4">
                <div className="flex flex-col gap-2">
                  {assets.map((asset) => (
                    <div key={asset.id} className="border-b pb-2">
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-gray-500">{asset.asset_type}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {users.length > 0 && (
              <Card title="Branch Users" className="mt-4">
                <div className="flex flex-col gap-2">
                  {users.map((user) => (
                    <div key={user.id} className="border-b pb-2">
                      <p className="font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <Tag color="blue" className="mt-1">
                        {user.role}
                      </Tag>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Branches;
