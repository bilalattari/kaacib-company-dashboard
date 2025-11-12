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
  Descriptions,
  Image,
  Row,
  Col,
  Spin,
  Modal,
} from 'antd';
import { PlusCircle, Eye, Loader2 } from 'lucide-react';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import DrawerForm from '../../components/DrawerForm';
import { set } from 'zod';

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

const Tickets = () => {
  const [data, setData] = useState([]);
  const [contract, setContract] = useState({});
  const [branches, setBranches] = useState([]);
  const [assets, setAssets] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formAction, setFormAction] = useState('create');

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [ticketDrawerVisible, setTicketDrawerVisible] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [reason, setReason] = useState('');
  const [ticketDetilsLoading, setTicketDetilsLoading] = useState(false);
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
      setTicketDetilsLoading(true);
      const { data } = await getTicketById(id);

      setSelectedTicket(data?.ticket || null);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setDetailLoading(false);
      setTicketDetilsLoading(false);
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

  const handleQuotationAction = async (action) => {
    try {
      if (!selectedTicket || !action) return;

      const data = await approveRejectQuotation(selectedTicket._id, {
        action,
        rejection_reason: reason,
      });

      setReason(null);
      setRejectModal(false);
      setTicketDrawerVisible(false);
      message.success(`Quotation ${action}ed successfully.`);
      fetchTickets();
      console.log(data);
    } catch (err) {
      message.error(
        err.response?.data?.message || `Failed to ${action} ticket.`,
      );
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
              fetchTicketDetails(record._id);
              setTicketDrawerVisible(true);
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

      <Drawer
        title="Ticket Details"
        width={800}
        open={ticketDrawerVisible}
        onClose={() => {
          setTicketDrawerVisible(false);
          setSelectedTicket((_) => null);
        }}
      >
        <Modal
          open={rejectModal}
          onCancel={() => setRejectModal(false)}
          title="Reject Quotation"
          footer={null}
        >
          <div className="text-lg my-4">
            <input
              type="text"
              placeholder="Enter reason of rejection"
              className="w-full p-2 border-2 theme-border rounded-md"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="w-full mx-auto flex items-center justify-between gap-4 mt-8">
              <ThemedButton
                text="Cancel"
                variant="outlined"
                onClick={() => setRejectModal(true)}
                className="w-1/2"
              />
              <ThemedButton
                text="Confirm"
                onClick={() => handleQuotationAction('reject')}
                className="w-1/2"
              />
            </div>
          </div>
        </Modal>

        {ticketDetilsLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="animate-spin theme-text size-12" />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p className="font-semibold text-lg">
                  Priority:
                  <Tag
                    color={getStatusColor(selectedTicket?.priority)}
                    className="uppercase ml-2! font-normal"
                  >
                    {selectedTicket?.priority}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <p className="font-semibold text-lg">
                  Branch:
                  <span className="capitalize ml-2! font-normal">
                    {selectedTicket?.branch?.name}
                  </span>
                </p>
              </Col>
              <Col span={12}>
                <p className="font-semibold text-lg">
                  Asset:
                  <span className="capitalize ml-2! font-normal">
                    {selectedTicket?.asset?.name || 'N/A'}
                  </span>
                </p>
              </Col>
              <Col span={12}>
                <p className="font-semibold text-lg">
                  Service:
                  <span className="capitalize ml-2! font-normal">
                    {selectedTicket?.service?.title?.en || 'N/A'}
                  </span>
                </p>
              </Col>
            </Row>

            <div className="w-4/5 mx-auto mt-8 py-8 border-2 border-gray-400 rounded-md">
              <p className="font-bold text-xl text-center mb-8">
                Quotation Details
              </p>

              <div className="w-3/5 mx-auto">
                <p className="flex items-center justify-between font-medium text-lg">
                  Labor Cost
                  <span>{selectedTicket?.quotation?.labor_cost || 0}</span>
                </p>
                <p className="flex items-center justify-between font-medium text-lg">
                  Material Cost
                  <span>{selectedTicket?.quotation?.materials_cost || 0}</span>
                </p>
                <p className="flex items-center justify-between font-medium text-lg">
                  Materials Needed
                  <span>
                    {selectedTicket?.quotation?.materials_needed?.length || 0}
                  </span>
                </p>
                <p className="flex items-center justify-between font-medium text-lg">
                  Materials Provider
                  <span className="capitalize">
                    {selectedTicket?.quotation?.materials_provided_by || 'N/A'}
                  </span>
                </p>
                <p className="flex items-center justify-between font-medium text-lg">
                  Total Cost
                  <span className="capitalize">
                    {selectedTicket?.quotation?.total_cost || 0}
                  </span>
                </p>
              </div>

              {!selectedTicket?.quotation?.approved &&
                !selectedTicket?.quotation?.rejected ? (
                <div className="w-1/2 mx-auto flex items-center justify-between gap-4 mt-8">
                  <ThemedButton
                    text="Reject"
                    variant="outlined"
                    onClick={() => setRejectModal(true)}
                    className="w-1/2"
                  />
                  <ThemedButton
                    text="Approve"
                    onClick={() => handleQuotationAction('approve')}
                    className="w-1/2"
                  />
                </div>
              ) : (
                <div className="w-1/2 mx-auto mt-8 p-2 rounded-md text-center theme-text border-2 theme-border">
                  <p>
                    {selectedTicket?.quotation?.approved
                      ? 'Approved'
                      : 'Rejected'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Tickets;
