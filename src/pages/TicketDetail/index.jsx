import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById } from '../../apis';
import { isValidObjectId } from '../../helpers';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import { useSelector } from 'react-redux';
import { ConfigProvider, message, Tabs } from 'antd';
import { Loader2 } from 'lucide-react';
import TicketHistory from '../../components/TicketHistory';
import TicketQuotation from '../../components/TicketQuotation';
import Images from '../../components/TicketImages';

const statusArr = [
  { value: 'history', label: 'History' },
  { value: 'images', label: 'Images' },
];

const TicketDetail = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('history');

  const navigate = useNavigate();
  const { theme_color } = useSelector(selectCompanyInfo) || {};

  useEffect(() => {
    fetchTicketDetails();
  }, []);

  const fetchTicketDetails = async () => {
    try {
      const isValid = isValidObjectId(id);
      if (!isValid) {
        navigate('/tickets');
        return;
      }
      setLoading(true);
      const { data } = await getTicketById(id);
      setData(data.data || {});
      setTicket(data.data.ticket || {});
      if (data.data.ticket?.type === 'corrective') {
        const isAlreadyAdded = statusArr.find(
          (item) => item.value === 'quotation',
        );
        if (!isAlreadyAdded) {
          statusArr.unshift({ value: 'quotation', label: 'Quotation' });
          setActiveTab('quotation');
        }
      }
    } catch (err) {
      console.error('Error fetching ticket details =>', err);
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

  if (loading) {
    return (
      <div className="w-full h-screen px-4 flex items-center justify-center">
        <Loader2 className="animate-spin theme-text size-8" />
      </div>
    );
  }

  return (
    <main className="w-full h-full px-4">
      <div className="w-full flex items-center justify-between gap-6 mb-6">
        <div className="w-1/2 border-2 theme-border rounded-lg p-6 shadow-sm">
          <h1 className="text-center text-md xl:text-lg font-semibold mb-4">
            Ticket Information
          </h1>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Status:</p>
              <p className="text-sm capitalize">{ticket?.status || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Contract:</p>
              <p className="text-sm">{ticket?.contract?.title || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Service:</p>
              <p className="text-sm">{ticket?.service?.title?.en || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Branch:</p>
              <p className="text-sm">{ticket?.branch?.name || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Asset:</p>
              <p className="text-sm">{ticket?.asset?.name || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Worker:</p>
              <p className="text-sm">
                {ticket?.worker
                  ? `${ticket.worker.first_name} ${ticket.worker.last_name}`.trim()
                  : 'Not Assigned'}
              </p>
            </div>
          </div>
        </div>

        <div className="w-1/2 border-2 theme-border rounded-lg p-6 shadow-sm">
          <h1 className="text-center text-md xl:text-lg font-semibold mb-4">
            Additional Details
          </h1>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Ticket Number:
              </p>
              <p className="text-sm">{ticket?.ticket_number || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Priority:</p>
              <p className="text-sm capitalize">{ticket?.priority || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Type:</p>
              <p className="text-sm capitalize">{ticket?.type || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Completed At:
              </p>
              <p className="text-sm capitalize">
                {ticket?.completed_at || '-'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Description:
              </p>
              <p className="text-sm capitalize">{ticket?.description || '-'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Created By:</p>
              <p className="text-sm capitalize">
                {ticket?.created_by?.name || 'Ahmed Raza'}
              </p>
            </div>
          </div>
        </div>
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
          defaultActiveKey={activeTab}
          onChange={(key) => setActiveTab(key)}
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

      {activeTab === 'quotation' && ticket?.type === 'corrective' && (
        <TicketQuotation data={ticket?.quotation} ticketId={ticket?._id} />
      )}
      {activeTab === 'history' && <TicketHistory data={data?.history} />}
      {activeTab === 'images' && <Images data={ticket?.service_end_images} />}
    </main>
  );
};

export default TicketDetail;
