import { useEffect, useState } from 'react';
import {
  createBooking,
  getBookings,
  getBookingById,
  completeBooking,
  getBookingWorkersList,
  getBookingWorker,
  getBranches,
  getAssets,
} from '../../apis';
import {
  message,
  Tag,
  Tooltip,
  Drawer,
  Modal,
  Input,
  Select,
  Button,
  Space,
  Descriptions,
  InputNumber,
  Rate,
} from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBookingSchema, completeBookingSchema } from '../../helpers/schema';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Eye, Check, Users } from 'lucide-react';

const { TextArea } = Input;
const { Option } = Select;

const Bookings = () => {
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [branches, setBranches] = useState([]);
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchBookings();
    fetchBranches();
    fetchAssets();
  }, [pagination.current, pagination.pageSize]);

  const fetchBranches = async () => {
    try {
      const { data } = await getBranches();
      setBranches(data?.data?.branches || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchAssets = async () => {
    try {
      const { data } = await getAssets();
      setAssets(data?.data?.assets || []);
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await getBookings({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setData(data?.data?.bookings || []);
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

  const fetchBookingDetails = async (id) => {
    try {
      setLoading(true);
      const { data } = await getBookingById(id);
      setSelectedBooking(data?.data?.booking);
      setDetailDrawerVisible(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Booking No',
      dataIndex: 'booking_number',
      key: 'booking_number',
      render: (text, record) => (
        <span
          className="font-medium cursor-pointer theme-text"
          onClick={() => fetchBookingDetails(record.id)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Service',
      dataIndex: ['service', 'name'],
      key: 'service.name',
      render: (text, record) => record.service?.name || text || '—',
    },
    {
      title: 'Worker',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color =
          status === 'completed' || status === 'work_completed'
            ? 'green'
            : status === 'in_progress'
            ? 'blue'
            : status === 'requested'
            ? 'orange'
            : 'volcano';
        return <Tag color={color}>{status.toUpperCase().replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Scheduled Start',
      dataIndex: 'scheduled_start',
      key: 'scheduled_start',
      render: (date) =>
        date ? format(parseISO(date), 'dd MMM, yyyy hh:mm a') : '—',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) =>
        date ? format(parseISO(date), 'dd MMM, yyyy') : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Eye size={16} />}
            onClick={() => fetchBookingDetails(record.id)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  // Create Booking Form
  const CreateBookingForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = useForm({
      resolver: zodResolver(createBookingSchema),
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await createBooking(values);
        message.success('Booking created successfully');
        setDrawerVisible(false);
        fetchBookings();
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Branch (Optional)</label>
          <Select
            value={watch('branch_id')}
            onChange={(value) => setValue('branch_id', value)}
            className="w-full mt-1"
            allowClear
            placeholder="Select branch"
          >
            {branches.map((branch) => (
              <Option key={branch.id} value={branch.id}>
                {branch.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">Asset (Optional)</label>
          <Select
            value={watch('asset_id')}
            onChange={(value) => setValue('asset_id', value)}
            className="w-full mt-1"
            allowClear
            placeholder="Select asset"
          >
            {assets.map((asset) => (
              <Option key={asset.id} value={asset.id}>
                {asset.name}
              </Option>
            ))}
          </Select>
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
            placeholder="Enter description (min 10, max 500 characters)"
            rows={4}
            className="mt-1"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Address *</label>
          <Input
            {...register('location.address')}
            placeholder="Enter complete address"
            className="mt-1"
          />
          {errors.location?.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.address.message}
            </p>
          )}
        </div>

        <div>
          <label className="theme-text font-semibold">Scheduled Start (Optional)</label>
          <Input
            {...register('scheduled_start')}
            type="datetime-local"
            className="mt-1"
          />
        </div>

        <ThemedButton
          type="submit"
          text="Create Booking"
          loading={loading}
          className="mt-2"
        />
      </form>
    );
  };

  // Complete Booking Form
  const CompleteBookingForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = useForm({
      resolver: zodResolver(completeBookingSchema),
      defaultValues: {
        payment_method: 'cash',
      },
    });

    const onSubmit = async (values) => {
      try {
        setLoading(true);
        await completeBooking(selectedBooking?.id, values);
        message.success('Booking completed successfully');
        setCompleteModalVisible(false);
        fetchBookingDetails(selectedBooking?.id);
        fetchBookings();
      } catch (err) {
        message.error(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="theme-text font-semibold">Payment Method *</label>
          <Select
            value={watch('payment_method')}
            onChange={(value) => setValue('payment_method', value)}
            className="w-full mt-1"
          >
            <Option value="cash">Cash</Option>
            <Option value="card">Card</Option>
            <Option value="wallet">Wallet</Option>
            <Option value="company_account">Company Account</Option>
          </Select>
        </div>

        <div>
          <label className="theme-text font-semibold">Rating (Optional)</label>
          <Rate
            value={watch('rating')}
            onChange={(value) => setValue('rating', value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Review (Optional)</label>
          <TextArea
            {...register('review')}
            placeholder="Enter review"
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <label className="theme-text font-semibold">Completion Notes (Optional)</label>
          <TextArea
            {...register('completion_notes')}
            placeholder="Enter completion notes"
            rows={3}
            className="mt-1"
          />
        </div>

        <ThemedButton
          type="submit"
          text="Complete Booking"
          loading={loading}
          className="mt-2"
        />
      </form>
    );
  };

  return (
    <div className="w-full h-full px-4">
      <div className="w-full flex-content-right py-4">
        <ThemedButton
          text="Create Booking"
          icon={<PlusCircle />}
          onClick={() => setDrawerVisible(true)}
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

      {/* Create Booking Drawer */}
      <Drawer
        title="Create Booking"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={500}
      >
        <CreateBookingForm />
      </Drawer>

      {/* Booking Details Drawer */}
      <Drawer
        title={`Booking Details - ${selectedBooking?.booking_number || ''}`}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedBooking(null);
        }}
        width={600}
        extra={
          selectedBooking?.status === 'in_progress' && (
            <Button
              type="primary"
              icon={<Check />}
              onClick={() => setCompleteModalVisible(true)}
            >
              Complete
            </Button>
          )
        }
      >
        {selectedBooking && (
          <div className="flex flex-col gap-4">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Booking Number">
                {selectedBooking.booking_number}
              </Descriptions.Item>
              <Descriptions.Item label="Service">
                {selectedBooking.service?.name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Worker">
                {selectedBooking.worker?.first_name && selectedBooking.worker?.last_name
                  ? `${selectedBooking.worker.first_name} ${selectedBooking.worker.last_name}`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedBooking.status === 'completed' ||
                    selectedBooking.status === 'work_completed'
                      ? 'green'
                      : selectedBooking.status === 'in_progress'
                      ? 'blue'
                      : 'orange'
                  }
                >
                  {selectedBooking.status?.toUpperCase().replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedBooking.description || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedBooking.location?.address_line1 || selectedBooking.location?.address || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {selectedBooking.location?.city || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Scheduled Start">
                {selectedBooking.scheduled_start
                  ? format(parseISO(selectedBooking.scheduled_start), 'dd MMM, yyyy hh:mm a')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {selectedBooking.created_at
                  ? format(parseISO(selectedBooking.created_at), 'dd MMM, yyyy hh:mm a')
                  : '—'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Complete Booking Modal */}
      <Modal
        title="Complete Booking"
        open={completeModalVisible}
        onCancel={() => setCompleteModalVisible(false)}
        footer={null}
      >
        <CompleteBookingForm />
      </Modal>
    </div>
  );
};

export default Bookings;

