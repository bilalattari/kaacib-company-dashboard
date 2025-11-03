import { useEffect, useState } from 'react';
import { getAssets } from '../../apis';
import { message, Tag, Tooltip } from 'antd';
import ThemedTable from '../../components/ThemedTable';
import { format, parseISO } from 'date-fns';

const Assets = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data } = await getAssets();
      setData(data?.data?.assets || []);
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
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'asset_type',
      key: 'asset_type',
      render: (type) => (
        <Tag color="blue">{type.charAt(0).toUpperCase() + type.slice(1)}</Tag>
      ),
    },
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branch.name',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      render: (days) => <span>{days} days</span>,
    },
    {
      title: 'Service Requests',
      dataIndex: 'total_service_requests',
      key: 'total_service_requests',
    },
    {
      title: 'Total Maintenance Cost',
      dataIndex: 'total_maintenance_cost',
      key: 'total_maintenance_cost',
      render: (cost) => `Rs ${cost?.toLocaleString() || 0}`,
    },
  ];

  return (
    <div className="w-full h-full">
      <ThemedTable loading={loading} columns={columns} data={data} />
    </div>
  );
};

export default Assets;
