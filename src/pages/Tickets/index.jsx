import { useCallback, useEffect, useState } from 'react';
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
  getServices,
  approveRejectQuotation,
} from '../../apis';
import {
  message,
  Tag,
  Tooltip,
  Space,
  Tabs,
  ConfigProvider,
  Drawer,
  Row,
  Col,
  Modal,
} from 'antd';
import { PlusCircle, Eye, Loader2 } from 'lucide-react';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import DrawerForm from '../../components/DrawerForm';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import { useNavigate } from 'react-router-dom';

const statusArr = [
  { value: 'all', label: 'All' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

const colors = {
  red: 'red',
  yellow: 'gold',
  normal: 'green',
  medium: 'gold',
  high: 'red',
};

const getStatusColor = (status) => {
  return colors[status] || 'gray';
};

const Tickets = ({ isAsset, asset }) => {
  const [data, setData] = useState([]);
  const [contract, setContract] = useState({});
  const [branches, setBranches] = useState([]);
  const [assets, setAssets] = useState([]);
  const [services, setServices] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const navigate = useNavigate();
  const companyInfo = useSelector(selectCompanyInfo);

  const createTicketForm = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'normal',
      ...(isAsset && asset?._id && { asset_id: asset._id }),
      ...(isAsset && asset?.branch?._id && { branch_id: asset.branch._id }),
    },
  });

  useEffect(() => {
    fetchTickets();
    fetchInfo();
    fetchBranches();
    fetchAssets();
    fetchServices();
  }, [pagination.current, pagination.pageSize, filterStatus]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data: res } = await getTickets({
        page: pagination.current,
        limit: pagination.pageSize,
        status: filterStatus,
        ...(isAsset && asset?._id && { asset: asset._id }),
      });
      setData(res?.data?.tickets || []);
      setPagination((prev) => ({
        ...prev,
        total: res?.data?.pagination?.total || res?.data?.tickets?.length || 0,
      }));
      setLoading(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInfo = async () => {
    try {
      const { data } = await getCompanyInfo();
      setContract(data?.data?.contracts?.[0] || {});
    } catch (err) {
      console.error('Error fetching company details =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await getServices();
      setServices(data?.data || []);
    } catch (err) {
      console.error('Error fetching services =>', err);
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

  // Create Ticket Submit Handler
  const createTicket = async (values, imageUrls) => {
    try {
      const data = {
        ...values,
        contract_id: contract._id,
        images: imageUrls,
      };
      await createTicketApi(data);
      message.success('Ticket created successfully');
      fetchTickets();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const selectedBranch = createTicketForm.watch('branch_id');

  const filteredAssets = useCallback(() => {
    if (!selectedBranch) return [];

    const filtered = assets
      .filter((asset) => asset.branch._id === selectedBranch)
      .map((asset) => ({
        value: asset._id,
        label: asset.name,
      }));

    return filtered;
  }, [selectedBranch, assets]);

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
        const color = getStatusColor(priority);
        return (
          <Tag className="capitalize" color={color}>
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
      render: (record) => (
        <Space>
          <Eye
            size={16}
            onClick={() => {
              navigate(`/tickets/${record._id}`);
            }}
            className="cursor-pointer"
          />
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
      options: filteredAssets(),
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
              ...(companyInfo?.theme_color && {
                inkBarColor: companyInfo?.theme_color,
              }),
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
              <div className={`w-full flex items-center justify-end py-4`}>
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

      {/* Create Ticket Drawer */}
      <DrawerForm
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        title="Create ticket"
        action={'create'}
        form={createTicketForm}
        onSubmit={createTicket}
        formItems={formItems}
        showImageUpload={true}
        imageRequired={true}
      />

      {/* Tickets Table */}
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

export default Tickets;
