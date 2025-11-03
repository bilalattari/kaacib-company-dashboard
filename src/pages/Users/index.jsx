import { useEffect, useState } from 'react';
import { getUsers } from '../../apis';
import { message, Tag, Tooltip } from 'antd';
import ThemedTable from '../../components/ThemedTable';
import { format, parseISO } from 'date-fns';

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getUsers();
      setData(data?.data?.companyUsers || []);
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
        <span className="font-medium">
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
          role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
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
          {status.toUpperCase()}
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
      dataIndex: 'createdAt',
      key: 'createdAt',
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
  ];

  return (
    <div className="w-full h-full">
      <ThemedTable loading={loading} columns={columns} data={data} />
    </div>
  );
};

export default Users;
