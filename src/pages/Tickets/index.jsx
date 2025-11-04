import { useEffect, useState } from 'react';
import {
  createTicket,
  getTickets,
  getTicketById,
  approveRejectQuotation,
  completeTicket,
  addTicketNote,
} from '../../apis';
import {
  Divider,
  Drawer,
  message,
  Tag,
  Tooltip,
  Modal,
  Input,
  Select,
  Button,
  Space,
  Descriptions,
  Card,
} from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTicketSchema,
  approveRejectQuotationSchema,
  completeTicketSchema,
  addTicketNoteSchema,
} from '../../helpers/schema';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Eye, Check, X, MessageSquare, FileCheck } from 'lucide-react';

const { TextArea } = Input;
const { Option } = Select;

const Tickets = () => {
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [quotationModalVisible, setQuotationModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchTickets();
  }, [pagination.current, pagination.pageSize]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await getTickets({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setData(data?.data?.tickets || []);
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
            : status === 'completed' || status === 'closed'
            ? 'green'
            : status === 'quotation_pending'
            ? 'orange'
            : 'volcano';
        return <Tag color={color}>{status.toUpperCase().replace('_', ' ')}</Tag>;
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
      title: 'Service',
      dataIndex: ['service', 'title', 'en'],
      key: 'service.title.en',
      render: (text, record) => record.service?.name || text || '—',
    },
    {
      title: 'Assigned Worker',
      key: 'worker',
      render: (_, record) => (
        <span>
          {record.worker?.first_name && record.worker?.last_name
            ? `${record.worker.first_name} ${record.worker.last_name}`
            : '—'}
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
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (date ? format(parseISO(date), 'dd MMM, yyyy') : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Eye size={16} />}
            onClick={() => fetchTicketDetails(record.id)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  // Create Ticket Form
  const CreateTicketForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = useForm({
      resolver: zodResolver(createTicketSchema),
      defaultValues: {
        priority: 'normal',
      },
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await createTicket(values);
        message.success('Ticket created successfully');
        setDrawerVisible(false);
        fetchTickets();
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Contract ID *</label>
          <Input
            {...register('contract_id')}
            placeholder="Enter contract ID"
            className="mt-1"
          />
          {errors.contract_id && (
            <p className="text-red-500 text-sm mt-1">{errors.contract_id.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Service ID *</label>
          <Input
            {...register('service_id')}
            placeholder="Enter service ID"
            className="mt-1"
          />
          {errors.service_id && (
            <p className="text-red-500 text-sm mt-1">{errors.service_id.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Description *</label>
          <TextArea
            {...register('description')}
            placeholder="Enter description (min 10, max 1000 characters)"
            rows={4}
            className="mt-1"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Priority</label>
          <Select
            value={watch('priority')}
            onChange={(value) => setValue('priority', value)}
            className="w-full mt-1"
          >
            <Option value="normal">Normal</Option>
            <Option value="yellow">Yellow</Option>
            <Option value="red">Red</Option>
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">Branch ID (Optional)</label>
          <Input
            {...register('branch_id')}
            placeholder="Enter branch ID (optional)"
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Asset ID (Optional)</label>
          <Input
            {...register('asset_id')}
            placeholder="Enter asset ID (optional)"
            className="mt-1"
          />
        </div>

        <ThemedButton
          type="submit"
          text="Create Ticket"
          loading={loading}
          className="mt-2"
        />
      </form>
    );
  };

  // Approve/Reject Quotation Form
  const QuotationForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = useForm({
      resolver: zodResolver(approveRejectQuotationSchema),
      defaultValues: {
        action: 'approve',
      },
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await approveRejectQuotation(selectedTicket?.id, values);
        message.success(
          `Quotation ${values.action === 'approve' ? 'approved' : 'rejected'} successfully`
        );
        setQuotationModalVisible(false);
        fetchTicketDetails(selectedTicket?.id);
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    const action = watch('action');

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Action *</label>
          <Select
            value={watch('action')}
            onChange={(value) => setValue('action', value)}
            className="w-full mt-1"
          >
            <Option value="approve">Approve</Option>
            <Option value="reject">Reject</Option>
          </Select>
        </div>

        {action === 'reject' && (
          <div>
            <label className="theme-text font-semibold">Rejection Reason *</label>
            <TextArea
              {...register('rejection_reason')}
              placeholder="Enter rejection reason (min 10, max 500 characters)"
              rows={4}
              className="mt-1"
            />
            {errors.rejection_reason && (
              <p className="text-red-500 text-sm mt-1">
                {errors.rejection_reason.message}
              </p>
            )}
          </div>
        )}

        <ThemedButton
          type="submit"
          text={action === 'approve' ? 'Approve Quotation' : 'Reject Quotation'}
          loading={loading}
          className="mt-2"
        />
      </form>
    );
  };

  // Complete Ticket Form
  const CompleteTicketForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(completeTicketSchema),
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await completeTicket(selectedTicket?.id, values);
        message.success('Ticket completed successfully');
        setCompleteModalVisible(false);
        fetchTicketDetails(selectedTicket?.id);
        fetchTickets();
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Completion Notes (Optional)</label>
          <TextArea
            {...register('notes')}
            placeholder="Enter completion notes (max 500 characters)"
            rows={4}
            className="mt-1"
          />
          {errors.notes && (
            <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
          )}
        </div>

        <ThemedButton type="submit" text="Complete Ticket" loading={loading} className="mt-2" />
      </form>
    );
  };

  // Add Note Form
  const AddNoteForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(addTicketNoteSchema),
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await addTicketNote(selectedTicket?.id, values);
        message.success('Note added successfully');
        setNoteModalVisible(false);
        fetchTicketDetails(selectedTicket?.id);
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Note Text *</label>
          <TextArea
            {...register('text')}
            placeholder="Enter note text (max 500 characters)"
            rows={4}
            className="mt-1"
          />
          {errors.text && (
            <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>
          )}
        </div>

        <ThemedButton type="submit" text="Add Note" loading={loading} className="mt-2" />
      </form>
    );
  };

  return (
    <div className="w-full h-full px-4">
      <div className="w-full flex-content-right py-4">
        <ThemedButton
          text="Create Ticket"
          icon={<PlusCircle />}
          onClick={() => setDrawerVisible(true)}
        />
      </div>

      <Divider />

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
      <Drawer
        title="Create Ticket"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={500}
      >
        <CreateTicketForm />
      </Drawer>

      {/* Ticket Details Drawer */}
      <Drawer
        title={`Ticket Details - ${selectedTicket?.ticket_number || ''}`}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedTicket(null);
        }}
        width={600}
        extra={
          <Space>
            {selectedTicket?.status === 'quotation_pending' && (
              <Button
                type="primary"
                icon={<FileCheck />}
                onClick={() => setQuotationModalVisible(true)}
              >
                Review Quotation
              </Button>
            )}
            {selectedTicket?.status === 'in_progress' && (
              <Button
                type="primary"
                icon={<Check />}
                onClick={() => setCompleteModalVisible(true)}
              >
                Complete
              </Button>
            )}
            <Button
              icon={<MessageSquare />}
              onClick={() => setNoteModalVisible(true)}
            >
              Add Note
            </Button>
          </Space>
        }
      >
        {selectedTicket && (
          <div className="flex flex-col gap-4">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Ticket Number">
                {selectedTicket.ticket_number}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag>{selectedTicket.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedTicket.status === 'completed' || selectedTicket.status === 'closed'
                      ? 'green'
                      : selectedTicket.status === 'quotation_pending'
                      ? 'orange'
                      : 'blue'
                  }
                >
                  {selectedTicket.status.toUpperCase().replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={selectedTicket.priority === 'red' ? 'red' : 'gold'}>
                  {selectedTicket.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedTicket.description}
              </Descriptions.Item>
              <Descriptions.Item label="Company">
                {selectedTicket.company?.name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Branch">
                {selectedTicket.branch?.name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Asset">
                {selectedTicket.asset?.name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Service">
                {selectedTicket.service?.name || selectedTicket.service?.title?.en || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Worker">
                {selectedTicket.worker?.first_name && selectedTicket.worker?.last_name
                  ? `${selectedTicket.worker.first_name} ${selectedTicket.worker.last_name}`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {selectedTicket.created_at
                  ? format(parseISO(selectedTicket.created_at), 'dd MMM, yyyy hh:mm a')
                  : '—'}
              </Descriptions.Item>
              {selectedTicket.completed_at && (
                <Descriptions.Item label="Completed At">
                  {format(parseISO(selectedTicket.completed_at), 'dd MMM, yyyy hh:mm a')}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedTicket.quotation && (
              <Card title="Quotation Details" className="mt-4">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Materials Cost">
                    Rs {selectedTicket.quotation.materials_cost?.toLocaleString() || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Labor Cost">
                    Rs {selectedTicket.quotation.labor_cost?.toLocaleString() || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Cost">
                    Rs {selectedTicket.quotation.total_cost?.toLocaleString() || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag
                      color={
                        selectedTicket.quotation.approved
                          ? 'green'
                          : selectedTicket.quotation.rejected
                          ? 'red'
                          : 'orange'
                      }
                    >
                      {selectedTicket.quotation.approved
                        ? 'Approved'
                        : selectedTicket.quotation.rejected
                        ? 'Rejected'
                        : 'Pending'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {selectedTicket.notes && selectedTicket.notes.length > 0 && (
              <Card title="Notes" className="mt-4">
                <div className="flex flex-col gap-2">
                  {selectedTicket.notes.map((note, index) => (
                    <div key={index} className="border-b pb-2">
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {note.created_at
                          ? format(parseISO(note.created_at), 'dd MMM, yyyy hh:mm a')
                          : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* Quotation Modal */}
      <Modal
        title="Approve/Reject Quotation"
        open={quotationModalVisible}
        onCancel={() => setQuotationModalVisible(false)}
        footer={null}
      >
        <QuotationForm />
      </Modal>

      {/* Complete Ticket Modal */}
      <Modal
        title="Complete Ticket"
        open={completeModalVisible}
        onCancel={() => setCompleteModalVisible(false)}
        footer={null}
      >
        <CompleteTicketForm />
      </Modal>

      {/* Add Note Modal */}
      <Modal
        title="Add Note"
        open={noteModalVisible}
        onCancel={() => setNoteModalVisible(false)}
        footer={null}
      >
        <AddNoteForm />
      </Modal>
    </div>
  );
};

export default Tickets;
