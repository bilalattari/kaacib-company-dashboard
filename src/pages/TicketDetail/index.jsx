import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById } from '../../apis';
import { isValidObjectId } from '../../helpers';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import { useSelector } from 'react-redux';
import { ConfigProvider, message, Tabs, Tag, Card } from 'antd';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import TicketHistory from '../../components/TicketHistory';
import TicketQuotation from '../../components/TicketQuotation';
import Images from '../../components/TicketImages';

const getTabItems = (ticketType, hasReport) => {
  const tabs = [
    { value: 'details', label: 'Details' },
  ];
  
  if (ticketType === 'corrective') {
    tabs.push({ value: 'quotation', label: 'Quotation & Cost' });
  }
  
  if (hasReport) {
    tabs.push({ value: 'report', label: 'Report' });
  }
  
  tabs.push(
    { value: 'history', label: 'History' },
    { value: 'images', label: 'Images' }
  );
  
  return tabs;
};

const TicketDetail = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  const navigate = useNavigate();
  const companyInfo = useSelector(selectCompanyInfo) || {};
  const { theme_color } = companyInfo;

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
      // Quotation tab is always available, but content differs based on ticket type
    } catch (err) {
      console.error('Error fetching ticket details =>', err);
      message.error(
        err.response?.data?.message || 'Failed to fetch ticket details',
      );
    } finally {
      setLoading(false);
    }
  };

  // Get status display text
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
      closed: 'Closed',
    };
    return statusMap[status] || status?.toUpperCase().replace('_', ' ') || '—';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colorMap = {
      assigned: 'blue',
      completed: 'green',
      closed: 'green',
      quotation_pending: 'orange',
      awaiting_approval: 'orange',
      on_site: 'cyan',
      inspecting: 'purple',
      in_progress: 'blue',
      created: 'default',
    };
    return colorMap[status] || 'volcano';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colorMap = {
      high: 'red',
      medium: 'gold',
      normal: 'green',
      red: 'red',
      yellow: 'gold',
    };
    return colorMap[priority] || 'default';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return format(parseISO(dateString), 'dd MMM, yyyy hh:mm a');
    } catch (error) {
      return dateString;
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

  if (!ticket) {
    return (
      <div className="w-full h-full px-4 flex items-center justify-center">
        <p className="text-gray-500">Ticket not found</p>
      </div>
    );
  }

  return (
    <main className="w-full h-full px-4 py-6">
      {/* Page Title */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold theme-text mb-2">
              {ticket?.type === 'corrective' ? 'Corrective Ticket Details' : 'Scheduled Service Details'}
            </h1>
            <p className="text-gray-600 text-base">
              Ticket ID: <span className="font-medium theme-text">{ticket?.ticket_number || 'N/A'}</span>
            </p>
          </div>
          <Tag color={getStatusColor(ticket?.status)} className="capitalize text-base px-4 py-1">
            {getStatusDisplayText(ticket?.status)}
          </Tag>
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
          items={getTabItems(ticket?.type, data?.reportStatus?.report_submitted).map((tab) => ({
            key: tab.value,
            label: <span className="theme-text">{tab.label}</span>,
          }))}
        />
      </ConfigProvider>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="mt-6">
          <div className="w-full flex items-start justify-between gap-6">
            {/* Ticket Information */}
            <Card
              className="w-1/2 shadow-lg rounded-xl border-0"
              headStyle={{
                borderBottom: `2px solid ${theme_color || '#1890ff'}20`,
                padding: '20px 24px',
                marginBottom: '0',
              }}
              bodyStyle={{
                padding: '24px',
              }}
              title={
                <h2 className="text-xl font-semibold theme-text m-0 text-center">
                  Ticket Information
                </h2>
              }
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Status:</p>
                  <Tag color={getStatusColor(ticket?.status)} className="capitalize m-0">
                    {getStatusDisplayText(ticket?.status)}
                  </Tag>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Contract:</p>
                  <p className="text-sm m-0">{ticket?.contract?.title || 'N/A'}</p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Service Type:</p>
                  <p className="text-sm m-0">
                    {ticket?.service?.title?.en || ticket?.parent_ticket?.service_type?.title?.en || 'N/A'}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Branch:</p>
                  <p className="text-sm m-0">{ticket?.branch?.name || 'N/A'}</p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Equipment:</p>
                  <p className="text-sm m-0">{ticket?.asset?.name || 'N/A'}</p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <p className="font-semibold text-sm text-gray-600 m-0">Assigned Worker:</p>
                  <p className="text-sm m-0">
                    {ticket?.worker
                      ? `${ticket.worker.first_name || ''} ${ticket.worker.last_name || ''}`.trim() || 'N/A'
                      : 'Not Assigned'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Additional Details */}
            <Card
              className="w-1/2 shadow-lg rounded-xl border-0"
              headStyle={{
                borderBottom: `2px solid ${theme_color || '#1890ff'}20`,
                padding: '20px 24px',
                marginBottom: '0',
              }}
              bodyStyle={{
                padding: '24px',
              }}
              title={
                <h2 className="text-xl font-semibold theme-text m-0 text-center">
                  Additional Details
                </h2>
              }
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">
                    Ticket Number:
                  </p>
                  <p className="text-sm font-medium theme-text m-0">
                    {ticket?.ticket_number || 'N/A'}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Priority:</p>
                  <Tag color={getPriorityColor(ticket?.priority)} className="capitalize m-0">
                    {ticket?.priority === 'red'
                      ? 'High'
                      : ticket?.priority === 'yellow'
                      ? 'Medium'
                      : ticket?.priority || 'Normal'}
                  </Tag>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Ticket Type:</p>
                  <p className="text-sm capitalize m-0">
                    {ticket?.type === 'continuous' ? 'Scheduled' : ticket?.type === 'corrective' ? 'Corrective' : ticket?.type || 'N/A'}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Created On:</p>
                  <p className="text-sm m-0">
                    {ticket?.createdAt ? formatDate(ticket.createdAt) : '—'}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Completed On:</p>
                  <p className="text-sm m-0">
                    {ticket?.completed_at ? formatDate(ticket.completed_at) : '—'}
                  </p>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-600 m-0">Issue Description:</p>
                  <p className="text-sm text-right m-0 max-w-[60%]">
                    {ticket?.description || '—'}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <p className="font-semibold text-sm text-gray-600 m-0">Created By:</p>
                  <p className="text-sm m-0">
                    {ticket?.created_by?.name || ticket?.created_by?.email || 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Quotation Tab */}
      {activeTab === 'quotation' && (
        <div className="mt-6">
          {ticket?.type === 'corrective' && ticket?.quotation ? (
            <TicketQuotation
              data={ticket?.quotation}
              ticketId={ticket?._id}
              ticketStatus={ticket?.status}
            />
          ) : (
            <Card className="shadow-lg rounded-xl border-0">
              <div className="text-center py-12">
                <p className="text-gray-500 text-base">
                  No quotation available yet.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Report Tab */}
      {activeTab === 'report' && (
        <div className="mt-6">
          {data?.reportStatus?.report_submitted && data?.serviceReport ? (
            <Card className="shadow-lg rounded-xl border-0">
              <div className="p-6">
                <h3 className="text-lg font-semibold theme-text mb-6">Service Report</h3>
                
                {/* Report Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-1">Report Status:</p>
                      <Tag color="green" className="m-0">Submitted</Tag>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-1">Submitted At:</p>
                      <p className="text-sm m-0">
                        {data?.serviceReport?.submitted_at ? formatDate(data.serviceReport.submitted_at) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-1">Report ID:</p>
                      <p className="text-sm m-0">{data?.reportStatus?.report_id || '—'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-1">Work Required:</p>
                      <Tag color={data?.serviceReport?.work_required ? 'orange' : 'green'} className="m-0">
                        {data?.serviceReport?.work_required ? 'Yes' : 'No'}
                      </Tag>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-1">Submitted By:</p>
                      <p className="text-sm m-0">
                        {data?.serviceReport?.worker
                          ? `${data.serviceReport.worker.first_name || ''} ${data.serviceReport.worker.last_name || ''}`.trim() || 'N/A'
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report Answers */}
                {data?.serviceReport?.answers && data.serviceReport.answers.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-base font-semibold text-gray-700 mb-4">Checklist Items</h4>
                    <div className="space-y-3">
                      {data.serviceReport.answers.map((answer, index) => (
                        <div
                          key={answer._id || index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <p className="text-sm text-gray-700 m-0 flex-1">
                            {answer.question_text?.en || answer.question_text || 'N/A'}
                          </p>
                          <Tag color={answer.is_checked ? 'green' : 'default'} className="m-0">
                            {answer.is_checked ? 'Yes' : 'No'}
                          </Tag>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {data?.serviceReport?.comments && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-700 mb-2">Comments</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 m-0 whitespace-pre-wrap">
                        {data.serviceReport.comments}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="shadow-lg rounded-xl border-0">
              <div className="text-center py-12">
                <p className="text-gray-500 text-base">
                  No service report available yet.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="mt-6">
          <TicketHistory data={data?.history} />
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="mt-6">
          {ticket?.images && ticket.images.length > 0 ? (
            <Images data={ticket?.images} />
          ) : (
            <Card className="shadow-lg rounded-xl border-0">
              <div className="text-center py-12">
                <p className="text-gray-500 text-base">
                  No images uploaded for this ticket yet.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </main>
  );
};

export default TicketDetail;
