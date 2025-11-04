import { useEffect, useState } from 'react';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
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
  Popconfirm,
  Checkbox,
} from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, changePasswordSchema } from '../../helpers/schema';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Edit, Trash2, Eye, Key } from 'lucide-react';

const { Option } = Select;

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getUsers({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setData(data?.data?.users || data?.data?.companyUsers || []);
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

  const fetchUserDetails = async (id) => {
    try {
      setLoading(true);
      const { data } = await getUserById(id);
      setSelectedUser(data?.data?.user);
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
      await deleteUser(id);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <span
          className="font-medium cursor-pointer theme-text"
          onClick={() => fetchUserDetails(record.id)}
        >
          {record.first_name} {record.last_name}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <span>
          {phone?.startsWith('92')
            ? `+${phone.slice(0, 2)} ${phone.slice(2, 6)} ${phone.slice(6)}`
            : phone || '—'}
        </span>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          company_admin: 'purple',
          branch_admin: 'blue',
          technician: 'green',
          user: 'gold',
        };
        const label =
          role?.charAt(0).toUpperCase() + role?.slice(1).replace('_', ' ');
        return <Tag color={colors[role] || 'default'}>{label}</Tag>;
      },
    },
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branch.name',
      render: (branchName) => branchName || '—',
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
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => {
        const perms = record.permissions || {};
        const activePerms = Object.keys(perms)
          .filter((key) => perms[key])
          .map((key) => key.replaceAll('_', ' '));
        return (
          <Tooltip
            title={
              activePerms.length > 0
                ? activePerms.join(', ')
                : 'No active permissions'
            }
          >
            <Tag color="geekblue">{activePerms.length} enabled</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) =>
        date ? format(parseISO(date), 'dd MMM, yyyy hh:mm a') : '—',
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date) =>
        date ? format(parseISO(date), 'dd MMM, yyyy hh:mm a') : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Eye size={16} />}
            onClick={() => fetchUserDetails(record.id)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<Edit size={16} />}
            onClick={() => {
              setEditingUser(record);
              setDrawerVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            icon={<Key size={16} />}
            onClick={() => {
              setSelectedUser(record);
              setPasswordModalVisible(true);
            }}
          >
            Password
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
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

  // Create/Edit User Form
  const UserForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
      reset,
    } = useForm({
      resolver: zodResolver(createUserSchema),
      defaultValues: editingUser || {
        role: 'branch_admin',
        status: 'active',
        permissions: {
          can_book_services: false,
          can_complete_bookings: false,
          can_view_worker_contacts: false,
          can_manage_assets: false,
          can_manage_branches: false,
          can_manage_users: false,
        },
      },
    });

    useEffect(() => {
      if (editingUser) {
        Object.keys(editingUser).forEach((key) => {
          setValue(key, editingUser[key]);
        });
      } else {
        reset({
          role: 'branch_admin',
          status: 'active',
          permissions: {
            can_book_services: false,
            can_complete_bookings: false,
            can_view_worker_contacts: false,
            can_manage_assets: false,
            can_manage_branches: false,
            can_manage_users: false,
          },
        });
      }
    }, [editingUser, setValue, reset]);

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        if (editingUser) {
          // Remove password from update if not editing
          const { password, ...updateData } = values;
          await updateUser(editingUser.id, updateData);
          message.success('User updated successfully');
        } else {
          await createUser(values);
          message.success('User created successfully');
        }
        setDrawerVisible(false);
        setEditingUser(null);
        fetchUsers();
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">First Name *</label>
          <Input
            {...register('first_name')}
            placeholder="Enter first name"
            className="mt-1"
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Last Name *</label>
          <Input
            {...register('last_name')}
            placeholder="Enter last name"
            className="mt-1"
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Email *</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="Enter email"
            className="mt-1"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Phone *</label>
          <Input
            {...register('phone')}
            placeholder="Enter phone number"
            className="mt-1"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {!editingUser && (
          <div>
            <label className="theme-text font-semibold">Password *</label>
            <Input.Password
              {...register('password')}
              placeholder="Enter password"
              className="mt-1"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
        )}

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
          <label className="theme-text font-semibold">Role *</label>
          <Select
            value={watch('role')}
            onChange={(value) => setValue('role', value)}
            className="w-full mt-1"
          >
            <Option value="company_admin">Company Admin</Option>
            <Option value="branch_admin">Branch Admin</Option>
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">Status</label>
          <Select
            value={watch('status')}
            onChange={(value) => setValue('status', value)}
            className="w-full mt-1"
          >
            <Option value="active">Active</Option>
            <Option value="suspended">Suspended</Option>
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">Permissions</label>
          <div className="flex flex-col gap-2 mt-2">
            {[
              'can_book_services',
              'can_complete_bookings',
              'can_view_worker_contacts',
              'can_manage_assets',
              'can_manage_branches',
              'can_manage_users',
            ].map((perm) => (
              <Checkbox
                key={perm}
                checked={watch(`permissions.${perm}`)}
                onChange={(e) =>
                  setValue(`permissions.${perm}`, e.target.checked)
                }
              >
                {perm.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Checkbox>
            ))}
          </div>
        </div>

        <ThemedButton
          type="submit"
          text={editingUser ? 'Update User' : 'Create User'}
          loading={loading}
          className="mt-2"
        />
      </form>
    );
  };

  // Change Password Form
  const ChangePasswordForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await changePassword(values);
        message.success('Password changed successfully');
        setPasswordModalVisible(false);
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Current Password *</label>
          <Input.Password
            {...register('currentPassword')}
            placeholder="Enter current password"
            className="mt-1"
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">New Password *</label>
          <Input.Password
            {...register('newPassword')}
            placeholder="Enter new password"
            className="mt-1"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <ThemedButton type="submit" text="Change Password" loading={loading} className="mt-2" />
      </form>
    );
  };

  return (
    <div className="w-full h-full px-4">
      <div className="w-full flex-content-right py-4">
        <ThemedButton
          text="Create User"
          icon={<PlusCircle />}
          onClick={() => {
            setEditingUser(null);
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

      {/* Create/Edit User Drawer */}
      <Drawer
        title={editingUser ? 'Edit User' : 'Create User'}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setEditingUser(null);
        }}
        width={500}
      >
        <UserForm />
      </Drawer>

      {/* User Details Drawer */}
      <Drawer
        title={`User Details - ${selectedUser?.first_name || ''} ${selectedUser?.last_name || ''}`}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedUser(null);
        }}
        width={600}
      >
        {selectedUser && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">
              {selectedUser.first_name} {selectedUser.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selectedUser.phone}</Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag
                color={
                  selectedUser.role === 'company_admin' ? 'purple' : 'blue'
                }
              >
                {selectedUser.role?.replace('_', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Branch">
              {selectedUser.branch?.name || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedUser.status === 'active' ? 'green' : 'volcano'}>
                {selectedUser.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {selectedUser.created_at
                ? format(parseISO(selectedUser.created_at), 'dd MMM, yyyy hh:mm a')
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Login">
              {selectedUser.last_login
                ? format(parseISO(selectedUser.last_login), 'dd MMM, yyyy hh:mm a')
                : '—'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          setSelectedUser(null);
        }}
        footer={null}
      >
        <ChangePasswordForm />
      </Modal>
    </div>
  );
};

export default Users;
