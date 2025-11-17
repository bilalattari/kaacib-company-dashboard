import { format } from 'date-fns';
import {
  User,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';

export default function TicketHistory({ data }) {
  const formatTime = (dateString) => {
    return format(new Date(dateString), 'MMM dd, hh:mm a');
  };

  const getEventIcon = (eventType) => {
    const iconMap = {
      worker_assigned: User,
      worker_accepted: CheckCircle,
      arriving: Clock,
      worker_arrived: MapPin,
      cost_proposed: DollarSign,
      proposal: FileText,
      cost_accepted: CheckCheck,
      in_progress: Clock,
      service_end_request: AlertCircle,
      payment_requested: DollarSign,
      payment_created: DollarSign,
      payment_processed: CheckCheck,
    };

    return iconMap[eventType] || AlertCircle;
  };

  const getEventIconColor = (eventType) => {
    const colorMap = {
      worker_assigned: 'bg-blue-500',
      worker_accepted: 'bg-green-500',
      arriving: 'bg-gray-500',
      worker_arrived: 'bg-blue-500',
      cost_proposed: 'bg-gray-500',
      proposal: 'bg-teal-500',
      cost_accepted: 'bg-blue-500',
      in_progress: 'bg-gray-500',
      service_end_request: 'bg-gray-500',
      payment_requested: 'bg-gray-500',
      payment_created: 'bg-gray-500',
      payment_processed: 'bg-green-500',
    };

    return colorMap[eventType] || 'bg-gray-400';
  };

  const formatEventTitle = (eventType) => {
    const titleMap = {
      worker_assigned: 'Worker Assigned',
      worker_accepted: 'Worker Accepted',
      arriving: 'Arriving',
      worker_arrived: 'Worker Arrived',
      cost_proposed: 'Cost Proposed',
      proposal: 'Proposal',
      cost_accepted: 'Cost Accepted',
      in_progress: 'In Progress',
      service_end_request: 'Service End Request',
      payment_requested: 'Payment Requested',
      payment_created: 'Payment Created',
      payment_processed: 'Payment Processed',
    };

    return (
      titleMap[eventType] ||
      eventType
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400">
        <Clock className="w-16 h-16 mb-3" />
        <p className="text-sm">No history available</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {data.map((event, index) => {
            const IconComponent = getEventIcon(event.eventType);
            const iconColor = getEventIconColor(event.eventType);
            const actorName = event.actor
              ? `${event.actor.first_name} ${event.actor.last_name}`.trim() ||
                event.actor.first_name
              : 'System';

            return (
              <div key={event._id} className="relative pl-16">
                {/* Icon circle */}
                <div
                  className={`absolute left-0 w-12 h-12 ${iconColor} rounded-full flex items-center justify-center z-10`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Content card */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {formatEventTitle(event.eventType)}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.notes}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {actorName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border">
                          {event.actor?.role || 'system'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {formatTime(event.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
