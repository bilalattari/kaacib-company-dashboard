import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isValidObjectId } from '../../helpers';
import { getParentTicketById } from '../../apis';
import { ConfigProvider, message, Tabs } from 'antd';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import { Loader2 } from 'lucide-react';
import Tickets from '../Tickets';

const statusArr = [{ value: 'ticket', label: 'Tickets' }];

export default function ServiceDetail() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ticket');

  const { theme_color } = useSelector(selectCompanyInfo) || {};

  const asset = undefined;

  useEffect(() => {
    fetchServiceDetails();
  }, []);

  const fetchServiceDetails = async () => {
    try {
      const isValid = isValidObjectId(id);
      if (!isValid) {
        navigate('/services');
        return;
      }
      setLoading(true);
      const { data } = await getParentTicketById(id);
      setService(data?.parentTicket || {});
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Failed to fetch service details',
      );
    } finally {
      setLoading(false);
    }
  };

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
            Service Information
          </h1>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Ticket Number:
              </p>
              <p className="text-sm">
                {service?.parent_ticket_number || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Service:</p>
              <p className="text-sm">
                {service?.service_type?.title?.en || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Contract:</p>
              <p className="text-sm">{service?.contract?.title || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Month:</p>
              <p className="text-sm">{service?.contract_month || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Assets Allowed:
              </p>
              <p className="text-sm">
                {service?.scheduled_service_details?.asset_count || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Asset Type:</p>
              <p className="text-sm capitalize">
                {service?.scheduled_service_details?.asset_type || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="w-1/2 border-2 theme-border rounded-lg p-6 shadow-sm">
          <h1 className="text-center text-md xl:text-lg font-semibold mb-4">
            Ticket Statistics
          </h1>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Status:</p>
              <p className="text-sm capitalize">{service?.status || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Frequency:</p>
              <p className="text-sm capitalize">
                {service?.scheduled_service_details?.frequency || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Total Tickets:
              </p>
              <p className="text-sm">
                {service?.tickets_total !== undefined
                  ? service.tickets_total
                  : 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Tickets Done:
              </p>
              <p className="text-sm">
                {service?.tickets_done !== undefined
                  ? service.tickets_done
                  : 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Tickets Pending:
              </p>
              <p className="text-sm">
                {service?.tickets_pending !== undefined
                  ? service.tickets_pending
                  : 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Corrective Requests:
              </p>
              <p className="text-sm">
                {service?.tickets_corrective_request !== undefined
                  ? service.tickets_corrective_request
                  : 'N/A'}
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
        />
      </ConfigProvider>

      {activeTab === 'ticket' && service && (
        <Tickets isService={true} service={service} />
      )}
    </main>
  );
}
