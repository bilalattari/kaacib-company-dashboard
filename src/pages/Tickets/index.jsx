import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTicketSchema } from '../../helpers/schema';
import { format, parseISO } from 'date-fns';
import {
  createTicket as createTicketApi,
  getTickets,
  getTicketById,
  getCompanyInfo,
  getBranches,
  getAssets,
} from '../../apis';
import {
  Divider,
  message,
  Tag,
  Tooltip,
  Button,
  Space,
  Tabs,
  ConfigProvider,
} from 'antd';
import { PlusCircle, Eye } from 'lucide-react';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import DrawerForm from '../../components/DrawerForm';

const statusArr = [
  { value: 'all', label: 'All' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

const Tickets = () => {
  const [data, setData] = useState([]);
  const [contract, setContract] = useState({});
  const [branches, setBranches] = useState([]);
  const [assets, setAssets] = useState([]);
  const [services, setServices] = useState([]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [formAction, setFormAction] = useState('create');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const createTicketForm = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'normal',
    },
  });

  useEffect(() => {
    fetchTickets();
    fetchInfo();
    fetchBranches();
    fetchAssets();
  }, [pagination.current, pagination.pageSize, filterStatus]);

  useEffect(() => {
    console.log('Pagination changed', pagination.current);
  }, [pagination.current]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data: res } = await getTickets({
        page: pagination.current,
        limit: pagination.pageSize,
        status: filterStatus,
      });
      setData(res?.data?.tickets || []);
      setPagination((prev) => ({
        ...prev,
        total: res?.data?.pagination?.total || res?.data?.tickets?.length || 0,
      }));
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInfo = async () => {
    try {
      const { data } = await getCompanyInfo();
      setContract(data?.data?.contracts[0] || {});
      setServices(data?.data?.contracts[0]?.services || []);
    } catch (err) {
      console.error('Error fetching company details =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await getBranches();
      setBranches(data?.data?.branches || []);
    } catch (err) {
      console.error('Error fetching branches =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const fetchAssets = async () => {
    try {
      const { data } = await getAssets();
      setAssets(data?.data?.assets || []);
    } catch (err) {
      console.error('Error fetching assets =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const fetchTicketDetails = async (id) => {
    try {
      setLoading(true);
      const { data } = await getTicketById(id);
      setSelectedTicket(data?.data?.ticket);
      setDetailDrawerVisible(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Create Ticket Submit Handler
  const createTicket = async (values) => {
    try {
      const data = {
        ...values,
        contract_id: contract._id,
      };
      await createTicketApi(data);
      message.success('Ticket created successfully');
      fetchTickets();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const columns = [
    {
      title: 'Ticket No',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (text, record) => (
        <span
          className="font-medium cursor-pointer theme-text"
          onClick={() => fetchTicketDetails(record.id)}
        >
          {text}
        </span>
      ),
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
          medium: 'gold',
          high: 'red',
        };
        return (
          <Tag className="capitalize" color={colors[priority] || 'default'}>
            {priority === 'red'
              ? 'High'
              : priority === 'yellow'
              ? 'Medium'
              : priority}
          </Tag>
        );
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
            : status === 'completed' || status === 'closed'
            ? 'green'
            : status === 'quotation_pending'
            ? 'orange'
            : 'volcano';
        return (
          <Tag color={color}>{status.toUpperCase().replace('_', ' ')}</Tag>
        );
      },
    },
    {
      title: 'Service',
      dataIndex: ['service', 'title', 'en'],
      key: 'service.title.en',
      render: (text, record) => record.service?.name || text || '—',
    },
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branch.name',
      render: (text, record) => (
        <Tooltip title={record.branch?.city}>
          <span>{text || '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Asset',
      dataIndex: ['asset', 'name'],
      key: 'asset.name',
      render: (text) => text || '—',
    },
    {
      title: 'Date',
      dataIndex: 'scheduled_date',
      key: 'scheduled_date',
      render: (date) => (date ? format(parseISO(date), 'dd MMM, yyyy') : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Eye size={16} />
        </Space>
      ),
    },
  ];

  const formItems = [
    {
      name: 'service_id',
      label: 'Service',
      type: 'select',
      placeholder: 'Select Service',
      options: services.map((service) => ({
        value: service._id,
        label: service.title.en,
      })),
    },
    {
      name: 'branch_id',
      label: 'Branch',
      type: 'select',
      placeholder: 'Select Branch',
      options: branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
      })),
    },
    {
      name: 'asset_id',
      label: 'Asset',
      type: 'select',
      placeholder: 'Select Asset',
      options: assets.map((asset) => ({
        value: asset._id,
        label: asset.name,
      })),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter ticket description',
      rows: 3,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      placeholder: 'Select Priority',
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
    },
    {
      name: 'scheduled_date',
      label: 'Date',
      type: 'date',
      placeholder: 'Select Date',
    },
  ];

  return (
    <div className="w-full h-full px-4">
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              inkBarColor: '#ff3300',
            },
          },
        }}
      >
        <Tabs
          defaultActiveKey="all"
          onChange={(key) => setFilterStatus(key)}
          items={statusArr.map((status) => ({
            key: status.value,
            label: <span className="theme-text">{status.label}</span>,
          }))}
          tabBarExtraContent={{
            right: (
              <div className="w-full flex items-center justify-end py-4">
                <ThemedButton
                  text="Create Ticket"
                  icon={<PlusCircle />}
                  onClick={() => setDrawerVisible(true)}
                />
              </div>
            ),
          }}
        />
      </ConfigProvider>

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

      {/* Create Ticket Drawer */}
      <DrawerForm
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        title="Create ticket"
        action={formAction}
        form={createTicketForm}
        onSubmit={createTicket}
        formItems={formItems}
      />
    </div>
  );
};

export default Tickets;
