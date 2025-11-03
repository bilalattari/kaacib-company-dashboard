import { useEffect, useState } from 'react';
import { getBranches, getUsers } from '../../apis';
import { message, Tag, Tooltip } from 'antd';
import ThemedTable from '../../components/ThemedTable';
import { format, parseISO } from 'date-fns';

const Branches = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data } = await getBranches();
      setData(data?.data?.branches || []);
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
        <span className="font-medium">
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
  ];

  return (
    <div className="w-full h-full">
      <ThemedTable loading={loading} columns={columns} data={data} />
    </div>
  );
};

export default Branches;
