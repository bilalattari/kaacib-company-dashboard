import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  getUsers,
  changePassword,
  getBranches,
} from '../../apis';
import { message, Tag, Tooltip, Space, Popconfirm } from 'antd';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, changePasswordSchema } from '../../helpers/schema';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import { PlusCircle, Edit, Trash2, Eye, Key } from 'lucide-react';
import DrawerForm from '../../components/DrawerForm';

const Users = () => {
  const [data, setData] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const createUserForm = useForm({
    resolver: zodResolver(createUserSchema),
  });

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

  const createUser = async (data) => {
    try {
      await createUserApi(data);
      message.success('User created successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  const updateUser = async (data) => {
    try {
      if (data.password === '') {
        delete data.password;
      }

      await updateUserApi(selectedUserId, data);
      message.success('User updated successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      setLoading(true);
      await deleteUserApi(id);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const formItems = [
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter first name',
      required: true,
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter last name',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Enter email address',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Enter phone number',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter password',
      required: true,
    },
    {
      name: 'branch_id',
      label: 'Branch',
      type: 'select',
      placeholder: 'Select branch (optional)',
      options: branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
      })),
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      placeholder: 'Select role',
      required: true,
      options: [
        { value: 'company_admin', label: 'Company Admin' },
        { value: 'branch_admin', label: 'Branch Admin' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Select status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
      ],
    },
  ];

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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Eye
              size={16}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
              onClick={() => fetchUserDetails(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Edit
              size={16}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
              onClick={() => {
                createUserForm.reset({
                  ...record,
                  branch_id: record.branch._id,
                  password: null,
                });
                setSelectedUserId(record._id);
                setIsEditMode(true);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => deleteUser(record._id)}
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

  return (
    <div className="w-full h-full px-4">
      <div className="w-full flex-content-right py-4">
        <ThemedButton
          text="Create User"
          icon={<PlusCircle />}
          onClick={() => {
            setIsEditMode(false);
            setDrawerVisible(true);
          }}
        />
      </div>

      <DrawerForm
        action={isEditMode ? 'edit' : 'create'}
        title={isEditMode ? 'Edit user' : 'Create user'}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        form={createUserForm}
        formItems={formItems}
        onSubmit={isEditMode ? updateUser : createUser}
      />

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
    </div>
  );
};

export default Users;
