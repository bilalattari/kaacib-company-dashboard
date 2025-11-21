import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createBranch as createBranchApi,
  getBranches,
  updateBranch,
} from '../../apis';
import { createBranchSchema } from '../../helpers/schema';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { message, Tag, Tooltip, Button, Space, Popconfirm } from 'antd';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import DrawerForm from '../../components/DrawerForm';
import { clearCache, getCachedData, setCachedData } from '../../helpers/cache';

const Branches = () => {
  const [data, setData] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(null);
  const [loading, setLoading] = useState(false);
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
      const cacheKey = 'branches';
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData?.branches || []);
        setPagination((prev) => ({
          ...prev,
          total: cachedData?.pagination?.total || 0,
        }));
        return;
      }
      const { data } = await getBranches({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setData(data?.data?.branches || []);
      setPagination((prev) => ({
        ...prev,
        total: data?.data?.pagination?.total || 0,
      }));
      setCachedData(cacheKey, data?.data || {});
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const createBranch = async (data) => {
    try {
      const cacheKey = 'branches';
      await createBranchApi(data);
      clearCache(cacheKey);
      fetchBranches();
      message.success('Branch created successfully.');
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const editBranch = async (data) => {
    if (!selectedBranchId) return;
    try {
      const cacheKey = 'branches';
      await updateBranch(selectedBranchId, data);
      clearCache(cacheKey);
      fetchBranches();
      message.success('Branch updated successfully.');
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const formItems = [
    {
      name: 'name',
      label: 'Branch Name',
      type: 'text',
      placeholder: 'Enter branch name',
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
      name: 'address',
      label: 'Address',
      type: 'textarea',
      placeholder: 'Enter branch address',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Enter phone number',
    },
    {
      name: 'map_link',
      label: 'Google Map Link',
      type: 'text',
      placeholder: 'Enter google map link',
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
            <Button type="link" icon={<Eye size={16} />} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<Edit size={16} />}
              onClick={() => {
                setSelectedBranchId(record._id);
                setIsEditMode(true);
                createBranchForm.reset(record);
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

  return (
    <div className="w-full h-full px-4">
      <div className="w-full flex-content-right py-4">
        <ThemedButton
          text="Create Branch"
          icon={<PlusCircle />}
          onClick={() => {
            setIsEditMode(false);
            setSelectedBranchId(null);
            createBranchForm.reset({
              name: '',
              city: '',
              area: '',
              address: '',
              phone: '',
              map_link: '',
              status: 'active',
            });
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
        action={isEditMode ? 'edit' : 'create'}
        title={isEditMode ? 'Edit branch' : 'Create branch'}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        form={createBranchForm}
        formItems={formItems}
        onSubmit={isEditMode ? editBranch : createBranch}
      />
    </div>
  );
};

export default Branches;
