import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isValidObjectId } from '../../helpers';
import { getParentTicketById } from '../../apis';
import { message, Tag, Card } from 'antd';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import { Loader2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import Tickets from '../Tickets';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);

  const companyInfo = useSelector(selectCompanyInfo) || {};
  const { theme_color } = companyInfo;

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

  // Format contract month
  const formatServiceMonth = (month) => {
    if (!month) return 'N/A';
    try {
      const parsedDate = parse(month, 'yyMM', new Date());
      return format(parsedDate, 'MMMM yyyy');
    } catch (error) {
      return month;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen px-4 flex items-center justify-center">
        <Loader2 className="animate-spin theme-text size-8" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="w-full h-full px-4 flex items-center justify-center">
        <p className="text-gray-500">Service cycle not found</p>
      </div>
    );
  }

  return (
    <main className="w-full h-full px-4 py-6">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text mb-2">Service Cycle Details</h1>
        <p className="text-gray-600 text-base">
          Overview of scheduled services for this month.
        </p>
      </div>

      {/* Summary Boxes */}
      <div className="w-full flex items-start justify-between gap-6 mb-8">
        {/* Cycle Summary */}
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
              Cycle Summary
            </h2>
          }
        >
          <div className="space-y-5">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">Cycle ID:</p>
              <p className="text-sm font-medium theme-text m-0">
                {service?.parent_ticket_number || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Service Type:
              </p>
              <p className="text-sm m-0">
                {service?.service_type?.title?.en || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">Contract:</p>
              <p className="text-sm m-0">{service?.contract?.title || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Service Month:
              </p>
              <p className="text-sm font-medium m-0">
                {formatServiceMonth(service?.contract_month)}
              </p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Branches Included:
              </p>
              <p className="text-sm m-0">
                {service?.branches?.length || service?.scheduled_service_details?.branches_count || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-center py-2">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Total Equipment Covered:
              </p>
              <p className="text-sm font-medium theme-text m-0">
                {service?.scheduled_service_details?.asset_count || service?.tickets_total || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Service Summary */}
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
              Service Summary
            </h2>
          }
        >
          <div className="space-y-5">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Cycle Status:
              </p>
              <Tag color={getStatusColor(service?.status)} className="capitalize m-0">
                {getCycleStatus(service?.status)}
              </Tag>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">Frequency:</p>
              <p className="text-sm capitalize m-0">
                {service?.scheduled_service_details?.frequency || 'Monthly'}
              </p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Total Services:
              </p>
              <p className="text-sm font-medium theme-text m-0">
                {service?.tickets_total !== undefined
                  ? service.tickets_total
                  : 0}
              </p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Pending Services:
              </p>
              <p className="text-sm font-medium m-0">
                {service?.tickets_pending !== undefined
                  ? service.tickets_pending
                  : 0}
              </p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Completed Services:
              </p>
              <p className="text-sm font-medium m-0">
                {service?.tickets_done !== undefined ? service.tickets_done : 0}
              </p>
            </div>
            <div className="flex justify-between items-center py-2">
              <p className="font-semibold text-sm text-gray-600 m-0">
                Corrective Requests:
              </p>
              <p className="text-sm font-medium m-0">
                {service?.tickets_corrective_request !== undefined
                  ? service.tickets_corrective_request
                  : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Scheduled Services Section */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold theme-text mb-2">Scheduled Services</h2>
          <p className="text-sm text-gray-600">
            Preventive tickets that belong to this month's cycle.
          </p>
        </div>
        {service && (
          <Tickets isService={true} service={service} ticketType="scheduled" />
        )}
      </div>
    </main>
  );
}
