import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

const formatTime = (dateString) => {
  return format(new Date(dateString), 'MMM dd, hh:mm a');
};

const Message = ({ message }) => {
  const senderName =
    message.sender.role === 'worker' || message.sender.role === 'customer'
      ? `${message.sender.first_name} ${message.sender.last_name}`.trim() ||
        message.sender.first_name
      : 'System';

  const isSystem = message.type === 'system';
  const isProposal = message.type === 'proposal';
  const isImage = message.type === 'image';

  // Different background colors based on role
  const borderColor =
    message.sender.role === 'worker'
      ? 'border-gray-600'
      : message.sender.role === 'customer'
      ? 'theme-border'
      : 'bg-amber-50';

  return (
    <div
      key={message._id}
      className={`w-full p-4 rounded-lg border-2 ${borderColor} mb-4`}
    >
      {/* Header with name, role badge, and time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-semibold text-gray-700">
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{senderName}</span>
            <span className="px-2 py-0.5 rounded text-xs bg-white text-gray-600 border uppercase">
              {isSystem ? 'system' : message.sender.role}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {formatTime(message.createdAt)}
        </span>
      </div>

      {/* Message content */}
      <div className="ml-12">
        <p className="text-gray-700 text-sm">{message.message}</p>

        {/* Distance indicator for location messages */}
        {message.meta?.kilometers !== undefined && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>Distance: {message.meta.kilometers} meters</span>
          </div>
        )}

        {/* Cost Proposal */}
        {isProposal && message.meta && (
          <div className="mt-3 bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-sm mb-3">Cost Proposal</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-gray-500 mb-1">Material Cost</p>
                <p className="font-semibold">
                  {message.meta.material_cost} PKR
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Labor Cost</p>
                <p className="font-semibold">{message.meta.labor_cost} PKR</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Cost</p>
                <p className="font-semibold text-blue-600">
                  {message.meta.total_cost} PKR
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image attachments */}
        {isImage &&
          message.attachmentUrl &&
          message.attachmentUrl.length > 0 && (
            <div className="mt-3">
              <img
                src={message.attachmentUrl[0]}
                alt="Attachment"
                className="max-w-sm rounded-lg border"
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default function TicketChat({ data }) {
  return (
    <div className="w-full h-full overflow-y-auto p-4">
      {data && data.length > 0 ? (
        data.map((message) => <Message message={message} />)
      ) : (
        <div className="text-center text-gray-500 py-8">
          No messages available
        </div>
      )}
    </div>
  );
}
