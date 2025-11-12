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
} from '../../apis';
import {
  message,
  Tag,
  Tooltip,
  Space,
  Tabs,
  ConfigProvider,
  Drawer,
  Descriptions,
  Image,
  Spin,
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
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
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
    fetchServices();
  }, [pagination.current, pagination.pageSize, filterStatus]);

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

  const fetchTicketDetails = async (id) => {
    try {
      setDetailLoading(true);
      const { data } = await getTicketById(id);
      setSelectedTicket(data?.data?.ticket);
      setDetailDrawerVisible(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setDetailLoading(false);
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
      render: (_, record) => (
        <Space>
          <Eye
            size={16}
            className="cursor-pointer theme-text hover:opacity-70"
            onClick={() => fetchTicketDetails(record.id)}
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
        showImageUpload={true}
        imageRequired={true}
      />

      {/* Ticket Detail Drawer */}
      <Drawer
        title={<p className="text-xl font-normal">Ticket Details</p>}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedTicket(null);
        }}
        width={800}
        closable={true}
      >
        {detailLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : selectedTicket ? (
          <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-semibold theme-text">
                  {selectedTicket.ticket_number || 'N/A'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedTicket.createdAt
                    ? format(parseISO(selectedTicket.createdAt), 'dd MMM, yyyy HH:mm')
                    : '—'}
                </p>
              </div>
              <Space>
                <Tag
                  className="capitalize"
                  color={
                    selectedTicket.priority === 'red' || selectedTicket.priority === 'high'
                      ? 'red'
                      : selectedTicket.priority === 'yellow' ||
                          selectedTicket.priority === 'medium'
                        ? 'gold'
                        : 'green'
                  }
                >
                  {selectedTicket.priority === 'red'
                    ? 'High'
                    : selectedTicket.priority === 'yellow'
                      ? 'Medium'
                      : selectedTicket.priority || 'Normal'}
                </Tag>
                <Tag
                  color={
                    selectedTicket.status === 'assigned'
                      ? 'blue'
                      : selectedTicket.status === 'completed' ||
                          selectedTicket.status === 'closed'
                        ? 'green'
                        : selectedTicket.status === 'quotation_pending'
                          ? 'orange'
                          : 'volcano'
                  }
                >
                  {selectedTicket.status
                    ? selectedTicket.status.toUpperCase().replace('_', ' ')
                    : '—'}
                </Tag>
              </Space>
            </div>

            {/* Details Section */}
            <Descriptions
              column={1}
              bordered
              className="w-full"
              labelStyle={{
                fontWeight: 600,
                width: '200px',
                backgroundColor: '#fafafa',
              }}
            >
              <Descriptions.Item label="Service">
                {selectedTicket.service?.title?.en ||
                  selectedTicket.service?.name ||
                  '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Branch">
                <div>
                  <div className="font-medium">
                    {selectedTicket.branch?.name || '—'}
                  </div>
                  {selectedTicket.branch?.city && (
                    <div className="text-sm text-gray-500">
                      {selectedTicket.branch.city}
                    </div>
                  )}
                  {selectedTicket.branch?.address && (
                    <div className="text-sm text-gray-500">
                      {selectedTicket.branch.address}
                    </div>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Asset">
                {selectedTicket.asset?.name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Scheduled Date">
                {selectedTicket.scheduled_date
                  ? format(parseISO(selectedTicket.scheduled_date), 'dd MMM, yyyy')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                <div className="whitespace-pre-wrap">
                  {selectedTicket.description || '—'}
                </div>
              </Descriptions.Item>
              {selectedTicket.worker && (
                <Descriptions.Item label="Assigned Worker">
                  <div>
                    <div className="font-medium">
                      {selectedTicket.worker?.name || '—'}
                    </div>
                    {selectedTicket.worker?.email && (
                      <div className="text-sm text-gray-500">
                        {selectedTicket.worker.email}
                      </div>
                    )}
                    {selectedTicket.worker?.phone && (
                      <div className="text-sm text-gray-500">
                        {selectedTicket.worker.phone}
                      </div>
                    )}
                  </div>
                </Descriptions.Item>
              )}
              {selectedTicket.quotation && (
                <Descriptions.Item label="Quotation">
                  <div>
                    <div className="font-medium">
                      Amount: {selectedTicket.quotation?.amount || '—'}
                    </div>
                    {selectedTicket.quotation?.status && (
                      <Tag
                        color={
                          selectedTicket.quotation.status === 'approved'
                            ? 'green'
                            : selectedTicket.quotation.status === 'rejected'
                              ? 'red'
                              : 'orange'
                        }
                      >
                        {selectedTicket.quotation.status.toUpperCase()}
                      </Tag>
                    )}
                  </div>
                </Descriptions.Item>
              )}
              {selectedTicket.completedAt && (
                <Descriptions.Item label="Completed Date">
                  {format(
                    parseISO(selectedTicket.completedAt),
                    'dd MMM, yyyy HH:mm',
                  )}
                </Descriptions.Item>
              )}
              {selectedTicket.updatedAt && (
                <Descriptions.Item label="Last Updated">
                  {format(
                    parseISO(selectedTicket.updatedAt),
                    'dd MMM, yyyy HH:mm',
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Images Section */}
            {selectedTicket.images && selectedTicket.images.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold theme-text">Images</h3>
                <Image.PreviewGroup>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTicket.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Ticket image ${index + 1}`}
                        className="rounded-md"
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            {/* Notes Section */}
            {selectedTicket.notes && selectedTicket.notes.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold theme-text">Notes</h3>
                <div className="flex flex-col gap-3">
                  {selectedTicket.notes.map((note, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {note.createdBy?.name || 'System'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {note.createdAt
                            ? format(parseISO(note.createdAt), 'dd MMM, yyyy HH:mm')
                            : '—'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {note.note || note.content || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No ticket data available</p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Tickets;
