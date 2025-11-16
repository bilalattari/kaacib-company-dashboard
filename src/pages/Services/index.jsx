import { useEffect, useState } from 'react';
import { getParentTickets } from '../../apis';
import { message, Space, Tag } from 'antd';
import { Eye } from 'lucide-react';
import ThemedTable from '../../components/ThemedTable';
import { format, parse } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../redux/slices/companySlice';

export default function Services() {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { theme_color } = useSelector(selectCompanyInfo) || {};

  useEffect(() => {
    fetchTickets();
  }, [pagination.current, pagination.pageSize]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await getParentTickets({
        page: pagination.current,
        limit: pagination.pageSize,
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

  const columns = [
    {
      title: 'Ticket No',
      dataIndex: 'parent_ticket_number',
      key: 'parent_ticket_number',
      render: (text) => (
        <span className="font-medium cursor-pointer theme-text">{text}</span>
      ),
    },
    {
      title: 'Month',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Tag color={theme_color || ''} className="uppercase opacity-70!">
          {text}
        </Tag>
      ),
    },
    {
      title: 'Total Tickets',
      dataIndex: 'tickets_total',
      key: 'tickets_total',
    },
    {
      title: 'Pending',
      dataIndex: 'tickets_pending',
      key: 'tickets_pending',
    },
    {
      title: 'Completed',
      dataIndex: 'tickets_done',
      key: 'tickets_done',
    },
    {
      title: 'Requests',
      dataIndex: 'tickets_corrective_request',
      key: 'tickets_corrective_request',
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

  return (
    <div className="w-full h-full px-4">
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
}
