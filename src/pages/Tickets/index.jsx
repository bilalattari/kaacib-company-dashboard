import { useEffect, useState } from 'react';
import { getTickets } from '../../apis';
import { Divider, Drawer, message, Tag, Tooltip } from 'antd';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import { format, parseISO } from 'date-fns';
import { PlusCircle } from 'lucide-react';

const Tickets = () => {
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await getTickets();
      setData(data?.data?.tickets || []);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Ticket No',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          red: 'red',
          yellow: 'gold',
          normal: 'green',
        };
        return <Tag color={colors[priority] || 'default'}>{priority}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color =
          status === 'assigned'
            ? 'blue'
            : status === 'completed'
            ? 'green'
            : 'volcano';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Company',
      dataIndex: ['company', 'name'],
      key: 'company.name',
    },
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branch.name',
      render: (text, record) => (
        <Tooltip title={record.branch?.city}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Asset',
      dataIndex: ['asset', 'name'],
      key: 'asset.name',
    },
    {
      title: 'Service',
      dataIndex: ['service', 'title', 'en'],
      key: 'service.title.en',
    },
    {
      title: 'Assigned Worker',
      key: 'worker',
      render: (_, record) => (
        <span>
          {record.worker?.first_name} {record.worker?.last_name}
        </span>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date) =>
        date ? format(parseISO(date), 'dd MMM, yyyy hh:mm a') : '—',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? format(parseISO(date), 'dd MMM, yyyy') : '—'),
    },
  ];

  const toggleDrawerVisible = () => {
    setDrawerVisible((prev) => !prev);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full flex-content-right px-4">
        <ThemedButton
          text="Create Ticket"
          icon={<PlusCircle />}
          onClick={toggleDrawerVisible}
        />
      </div>

      <Drawer
        title="Create Ticket"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={500}
      >
        <p>Add Ticke Form</p>
      </Drawer>
      <Divider />

      <ThemedTable loading={loading} columns={columns} data={data} />
    </div>
  );
};

export default Tickets;
