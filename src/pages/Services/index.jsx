import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format, parse } from 'date-fns';
import { getParentTickets } from '../../apis';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import { message, Space, Tag } from 'antd';
import { Eye } from 'lucide-react';
import ThemedTable from '../../components/ThemedTable';

export default function Services() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const navigate = useNavigate();
  const companyInfo = useSelector(selectCompanyInfo) || {};
  const { theme_color } = companyInfo;

  useEffect(() => {
    fetchTickets();
  }, [pagination.current, pagination.pageSize]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await getParentTickets({
        page: pagination.current,
        limit: pagination.pageSize,
        ...(companyInfo?._id && { company_id: companyInfo._id }),
      });
      setData(data?.parentTickets || []);
      setPagination((prev) => ({
        ...prev,
        total: data?.pagination?.total || data?.parentTickets?.length || 0,
      }));
      setLoading(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Map backend status to company-friendly status
  const getCycleStatus = (status) => {
    const statusMap = {
      pending: 'Upcoming',
      active: 'In Progress',
      completed: 'Completed',
    };
    return statusMap[status] || status;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'blue',
      active: 'orange',
      completed: 'green',
    };
    return colorMap[status] || 'default';
  };

  const columns = [
    {
      title: 'Cycle ID',
      dataIndex: 'parent_ticket_number',
      key: 'parent_ticket_number',
      render: (text, record) => (
        <span
          className="font-medium cursor-pointer theme-text"
          onClick={() => navigate(`/services/${record._id}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Service Month',
      dataIndex: 'contract_month',
      key: 'contract_month',
      render: (text) => {
        if (!text) return '—';
        try {
          const parsedDate = parse(text, 'yyMM', new Date());
          const monthName = format(parsedDate, 'MMMM yyyy');
          return <span>{monthName}</span>;
        } catch (error) {
          return <span>{text}</span>;
        }
      },
    },
    {
      title: 'Cycle Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="capitalize">
          {getCycleStatus(status)}
        </Tag>
      ),
    },
    {
      title: 'Total Services',
      dataIndex: 'tickets_total',
      key: 'tickets_total',
      render: (text) => text || 0,
    },
    {
      title: 'Pending Services',
      dataIndex: 'tickets_pending',
      key: 'tickets_pending',
      render: (text) => text || 0,
    },
    {
      title: 'Completed Services',
      dataIndex: 'tickets_done',
      key: 'tickets_done',
      render: (text) => text || 0,
    },
    {
      title: 'Corrective Requests',
      dataIndex: 'tickets_corrective_request',
      key: 'tickets_corrective_request',
      render: (text) => text || 0,
    },
    {
      title: 'View Details',
      key: 'actions',
      render: (record) => (
        <Space>
          <Eye
            size={16}
            onClick={() => navigate(`/services/${record._id}`)}
            className="cursor-pointer theme-text hover:opacity-70"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full h-full px-4">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold theme-text">Service Cycles</h1>
        <p className="text-gray-600 mt-2">
          Monthly preventive maintenance cycles for your equipment.
        </p>
      </div>

      {/* Service Cycles Table */}
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
}
