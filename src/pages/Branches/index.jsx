import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBranch as createBranchApi, getBranches } from '../../apis';
import { createBranchSchema } from '../../helpers/schema';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { message, Tag, Tooltip, Button, Space, Popconfirm } from 'antd';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import DrawerForm from '../../components/DrawerForm';

const Branches = () => {
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [data, setData] = useState([]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const createBranchForm = useForm({
    resolver: zodResolver(createBranchSchema),
  });

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

  const createBranch = async (data) => {
    try {
      const obj = {
        ...data,
        coordinates: {
          lat: 0,
          lng: 0,
        },
      };
      await createBranchApi(obj);
      fetchBranches();
      message.success('Branch created successfully.');
      return true;
    } catch (err) {
      console.error(err);
      throw err;
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
      title: 'Tickets',
      dataIndex: 'tickets',
      key: 'tickets',
      render: (num) => <span>{num ?? 0}</span>,
    },
    {
      title: 'Assets',
      dataIndex: 'assets',
      key: 'assets',
      render: (num) => <span>{num ?? 0}</span>,
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<Eye size={16} />}
              onClick={() => fetchBranchDetails(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<Edit size={16} />}
              onClick={() => {
                setEditingBranch(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this branch?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<Trash2 size={16} />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const formItems = [
    {
      name: 'name',
      label: 'Branch Name',
      type: 'text',
      placeholder: 'Enter branch name',
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
      placeholder: 'Enter branch address',
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Enter city',
    },
    {
      name: 'area',
      label: 'Area',
      type: 'text',
      placeholder: 'Enter area',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Enter phone number',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Select status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

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

      <DrawerForm
        action={'create'}
        title={editingBranch ? 'Edit branch' : 'Create branch'}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        form={createBranchForm}
        formItems={formItems}
        onSubmit={createBranch}
      />
    </div>
  );
};

export default Branches;
