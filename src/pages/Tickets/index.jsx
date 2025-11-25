import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTicketSchema } from '../../helpers/schema';
import { format, parseISO } from 'date-fns';
import {
  createTicket as createTicketApi,
  getTickets,
  getCompanyInfo,
  getBranches,
  getAssets,
  getServices,
} from '../../apis';
import { message, Tag, Tooltip, Space, Tabs, ConfigProvider } from 'antd';
import { PlusCircle, Eye } from 'lucide-react';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import DrawerForm from '../../components/DrawerForm';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import { useNavigate } from 'react-router-dom';
import { getCachedData, setCachedData, clearCache } from '../../helpers/cache';

const statusArr = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'awaiting_approval', label: 'Awaiting Approval' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
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

const Tickets = ({ isAsset, asset, isService, service, ticketType }) => {
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
    fetchInfo();
    fetchBranches();
    fetchAssets();
    fetchServices();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filter changes
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [filterStatus]);

  useEffect(() => {
    fetchTickets();
  }, [pagination.current, pagination.pageSize, filterStatus]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Map filter status to API status
      let apiStatus = filterStatus;
      
      if (filterStatus === 'all') {
        // Don't send status param for 'all'
        apiStatus = undefined;
      } else if (filterStatus === 'pending') {
        // Pending includes: created, assigned, inspecting
        // Send as comma-separated string or let API handle multiple statuses
        apiStatus = 'pending'; // Or use: 'created,assigned,inspecting'
      } else if (filterStatus === 'awaiting_approval') {
        // Awaiting Approval includes: quotation_pending, awaiting_approval
        apiStatus = 'awaiting_approval'; // Or use: 'quotation_pending,awaiting_approval'
      }
      // For in_progress and completed, use filterStatus as is

      // Determine ticket type
      let ticketTypeParam = 'corrective';
      if (isService && service?._id) {
        // If ticketType prop is provided, use it; otherwise default to 'continuous' for scheduled
        ticketTypeParam = ticketType === 'corrective' ? 'corrective' : 'continuous';
      } else if (isAsset && asset?._id) {
        ticketTypeParam = '';
      }

      const { data: res } = await getTickets({
        page: pagination.current,
        limit: pagination.pageSize,
        ...(apiStatus && { status: apiStatus }),
        type: ticketTypeParam,
        ...(isAsset && asset?._id && { asset: asset._id, type: '' }),
        ...(isService &&
          service?._id && { parent: service._id }),
      });
      
      setData(res?.data?.tickets || []);
      setPagination((prev) => ({
        ...prev,
        total: res?.data?.pagination?.total || res?.data?.tickets?.length || 0,
      }));
    } catch (err) {
      console.error('Error fetching tickets =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInfo = async () => {
    try {
      const cachedInfo = getCachedData('companyInfo');
      if (cachedInfo) {
        setContract(cachedInfo?.contracts?.[0] || {});
        return;
      }

      const { data } = await getCompanyInfo();
      const companyData = data?.data;
      setCachedData('companyInfo', companyData);
      setContract(companyData?.contracts?.[0] || {});
    } catch (err) {
      console.error('Error fetching company details =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const fetchServices = async () => {
    try {
      const cachedServices = getCachedData('services');
      if (cachedServices) {
        setServices(cachedServices);
        return;
      }

      const { data } = await getServices();
      const servicesData = data?.data || [];
      setCachedData('services', servicesData);
      setServices(servicesData);
    } catch (err) {
      console.error('Error fetching services =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const fetchBranches = async () => {
    try {
      const cachedData = getCachedData('branches');
      if (cachedData) {
        setBranches(cachedData.branches);
        return;
      }

      const { data } = await getBranches();
      const branchesData = data?.data?.branches || [];
      setCachedData('branches', branchesData);
      setBranches(branchesData);
    } catch (err) {
      console.error('Error fetching branches =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    }
  };

  const fetchAssets = async () => {
    try {
      const cachedAssets = getCachedData('assets');
      if (cachedAssets) {
        setAssets(cachedAssets);
        return;
      }

      const { data } = await getAssets();
      const assetsData = data?.data?.assets || [];
      setCachedData('assets', assetsData);
      setAssets(assetsData);
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

  const filteredAssets = useMemo(() => {
    if (!selectedBranch) return [];

    const filtered = assets
      .filter((asset) => asset.branch._id === selectedBranch)
      .map((asset) => ({
        value: asset._id,
        label: asset.name,
      }));

    return filtered;
  }, [selectedBranch, assets]);

  // Status display mapping
  const getStatusDisplayText = (status) => {
    const statusMap = {
      created: 'Created',
      assigned: 'Assigned',
      on_site: 'On-Site',
      inspecting: 'Inspecting',
      quotation_pending: 'Quotation Pending',
      awaiting_approval: 'Awaiting Approval',
      approved: 'Approved',
      in_progress: 'In Progress',
      completed: 'Completed',
    };
    return statusMap[status] || status?.toUpperCase().replace('_', ' ') || '—';
  };

  // Use appropriate columns based on context
  const columns = useMemo(() => {
    // Scheduled Services columns
    if (isService && ticketType === 'scheduled') {
      return [
        {
          title: 'Service ID',
          dataIndex: 'ticket_number',
          key: 'ticket_number',
          render: (text, record) => (
            <span
              className="font-medium cursor-pointer theme-text"
              onClick={() => navigate(`/tickets/${record._id || record.id}`)}
            >
              {text}
            </span>
          ),
        },
        {
          title: 'Equipment',
          dataIndex: ['asset', 'name'],
          key: 'asset.name',
          render: (text) => text || '—',
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
          title: 'Scheduled Date',
          dataIndex: 'scheduled_date',
          key: 'scheduled_date',
          render: (date) => (date ? format(parseISO(date), 'dd MMM, yyyy') : '—'),
        },
        {
          title: 'Worker/Team',
          dataIndex: ['worker'],
          key: 'worker',
          render: (worker, record) => {
            if (worker) {
              const firstName = worker.first_name || '';
              const lastName = worker.last_name || '';
              return firstName || lastName 
                ? `${firstName} ${lastName}`.trim() 
                : worker.name || '—';
            }
            return record.team?.name || '—';
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
                : status === 'pending' || status === 'created'
                ? 'default'
                : 'orange';
            const statusText =
              status === 'pending' || status === 'created'
                ? 'Pending'
                : status === 'assigned'
                ? 'Assigned'
                : status === 'completed' || status === 'closed'
                ? 'Completed'
                : getStatusDisplayText(status);
            return <Tag color={color}>{statusText}</Tag>;
          },
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
                className="cursor-pointer theme-text hover:opacity-70"
              />
            </Space>
          ),
        },
      ];
    }

    // Corrective Tickets columns (default)
    return [
      {
        title: 'Ticket ID',
        dataIndex: 'ticket_number',
        key: 'ticket_number',
        render: (text, record) => (
          <span
            className="font-medium cursor-pointer theme-text"
            onClick={() => navigate(`/tickets/${record._id || record.id}`)}
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
              : status === 'quotation_pending' || status === 'awaiting_approval'
              ? 'orange'
              : status === 'in_progress' || status === 'on_site' || status === 'inspecting'
              ? 'cyan'
              : status === 'created'
              ? 'default'
              : 'volcano';
          return (
            <Tag color={color}>{getStatusDisplayText(status)}</Tag>
          );
        },
      },
      ...(isAsset
        ? [
            {
              title: 'Type',
              dataIndex: 'type',
              key: 'type',
              render: (type) => <p className="capitalize">{type}</p>,
            },
          ]
        : []),
      {
        title: 'Service Type',
        dataIndex: ['service', 'title', 'en'],
        key: 'service.title.en',
        render: (text, record) => {
          // Handle both service.title.en and service.name
          return record.service?.title?.en || record.service?.name || text || '—';
        },
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
        title: 'Equipment',
        dataIndex: ['asset', 'name'],
        key: 'asset.name',
        render: (text) => text || '—',
      },
      {
        title: 'Created On',
        dataIndex: 'createdAt',
        key: 'createdAt',
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
              className="cursor-pointer theme-text hover:opacity-70"
            />
          </Space>
        ),
      },
    ];
  }, [isService, ticketType, isAsset, navigate]);

  const formItems = useMemo(
    () => [
      {
        name: 'service_id',
        label: 'Service Type',
        type: 'select',
        placeholder: 'Select Service Type',
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
        options: branches?.map((branch) => ({
          value: branch._id,
          label: branch.name,
        })),
      },
      {
        name: 'asset_id',
        label: 'Equipment',
        type: 'select',
        placeholder: 'Select Equipment',
        options: filteredAssets,
      },
      {
        name: 'description',
        label: 'Issue Description',
        type: 'textarea',
        placeholder: 'Describe the issue. Example: AC not cooling, unusual noise, electrical tripping…',
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
        label: 'Requested Date',
        type: 'date',
        placeholder: 'Select Date',
      },
    ],
    [services, branches, filteredAssets],
  );

  return (
    <div className="w-full h-full px-4">
      {/* Page Title - Only show for main corrective tickets page */}
      {!isService && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold theme-text">Corrective Tickets</h1>
          <p className="text-gray-600 mt-2">
            On-demand repair requests for equipment breakdowns
          </p>
        </div>
      )}

      {/* Tabs - Only show for main corrective tickets page */}
      {!isService && (
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
                <div className="w-full flex items-center justify-end py-4">
                  <ThemedButton
                    text="New Corrective Ticket"
                    icon={<PlusCircle />}
                    onClick={() => setDrawerVisible(true)}
                  />
                </div>
              ),
            }}
          />
        </ConfigProvider>
      )}

      {/* Create Ticket Drawer */}
      <DrawerForm
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        title="Create Corrective Ticket"
        action={'create'}
        form={createTicketForm}
        onSubmit={createTicket}
        formItems={formItems}
        showImageUpload={true}
        imageRequired={false}
        submitButtonText="Create Ticket"
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
