import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById } from '../../apis';
import { isValidObjectId } from '../../helpers';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import { useSelector } from 'react-redux';
import { ConfigProvider, message, Tabs } from 'antd';

const statusArr = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'chat', label: 'Chat' },
  { value: 'history', label: 'History' },
  { value: 'workers', label: 'Notified Workers' },
  { value: 'images', label: 'Images' },
  { value: 'rating', label: 'Rating' },
  { value: 'comments', label: 'Comments' },
];

const TicketDetail = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);

  const navigate = useNavigate();
  const { theme_color } = useSelector(selectCompanyInfo) || {};

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const isValid = isValidObjectId(id);
      if (!isValid) {
        navigate('/tickets');
        return;
      }
      setLoading(true);
      const { data } = await getTicketById(id);
      setTicket(data?.ticket);
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Failed to fetch ticket details',
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleQuotationAction = async (action) => {
  //   try {
  //     if (!selectedTicket || !action) return;

  //     const data = await approveRejectQuotation(selectedTicket._id, {
  //       action,
  //       rejection_reason: reason,
  //     });

  //     setReason(null);
  //     setRejectModal(false);
  //     message.success(`Quotation ${action}ed successfully.`);
  //     fetchTickets();
  //     console.log(data);
  //   } catch (err) {
  //     message.error(
  //       err.response?.data?.message || `Failed to ${action} ticket.`,
  //     );
  //   }
  // };

  return (
    <div className="w-full h-full px-4">
      <div className="w-1/2 border-2 border-gray-200 rounded-lg p-6 mb-6 bg-white shadow-sm">
        {loading ? (
          <div className="text-gray-500">Loading ticket details...</div>
        ) : ticket ? (
          <div className="space-y-4">
            <div>
              <span className="text-gray-600 font-medium">Ticket Number: </span>
              <span className="text-gray-900">{ticket.ticket_number}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Status: </span>
              <span className="text-gray-900 capitalize">{ticket.status}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Description: </span>
              <span className="text-gray-900">
                {ticket.description || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Service: </span>
              <span className="text-gray-900">
                {ticket.service?.title?.en || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Asset Name: </span>
              <span className="text-gray-900">
                {ticket.asset?.name || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Worker Name: </span>
              <span className="text-gray-900">
                {ticket.worker?.name || 'Not Assigned'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No ticket data available</div>
        )}
      </div>

      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              ...(theme_color && {
                inkBarColor: theme_color,
              }),
            },
          },
        }}
      >
        <Tabs
          defaultActiveKey="quotation"
          onChange={(key) => setFilterStatus(key)}
          items={statusArr.map((status) => ({
            key: status.value,
            label: <span className="theme-text">{status.label}</span>,
          }))}
          // tabBarExtraContent={{
          //   right: (
          //     <div className="w-full flex items-center justify-end py-4">
          //       <ThemedButto
          //         text="Create Ticket"
          //         icon={<PlusCircle />}
          //         onClick={() => setDrawerVisible(true)}
          //       />
          //     </div>
          //   ),
          // }}
        />
      </ConfigProvider>
    </div>
  );
};

export default TicketDetail;
