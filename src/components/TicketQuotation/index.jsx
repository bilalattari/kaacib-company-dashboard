import { useState } from 'react';
import { approveRejectQuotation } from '../../apis';
import ThemedButton from '../ThemedButton';
import { FileText, Package, DollarSign, User, Download } from 'lucide-react';
import { Modal, message } from 'antd';

export default function TicketQuotation({ data, ticketId, ticketStatus }) {
  console.log('Ticket Quotation Data =>', data);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if quotation is already approved or rejected
  const isApproved = [
    'quotation_approved',
    'approved',
    'in_progress',
    'completed',
  ].includes(ticketStatus);
  const isRejected = ['quotation_rejected', 'closed', 'cancelled'].includes(
    ticketStatus,
  );

  // Function to download the quotation PDF
  const downloadQuotationPDF = () => {
    if (data?.pdf_url) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.target = '_blank'; // Open in new tab as fallback
      link.download = `Quotation_${Date.now()}.pdf`; // Set filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Function to approve quotation
  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveRejectQuotation(data._id, { action: 'approve' });
      message.success('Quotation approved successfully.');
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          'Failed to approve quotation. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to open reject modal
  const handleRejectClick = () => {
    setRejectModalVisible(true);
  };

  // Function to reject quotation with reason
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      message.error('Please provide a reason for rejection.');
      return;
    }

    try {
      console.log(data);
      setLoading(true);
      await approveRejectQuotation(ticketId, {
        action: 'reject',
        rejection_reason: rejectionReason,
      });
      message.success('Quotation rejected successfully.');
      setRejectModalVisible(false);
      setRejectionReason('');
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          'Failed to reject quotation. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to close modal
  const handleModalCancel = () => {
    setRejectModalVisible(false);
    setRejectionReason('');
  };

  return (
    <div className="w-full p-6">
      {true ? (
        <div className="space-y-6">
          {/* Quotation Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold theme-text flex items-center gap-2">
                <FileText size={24} />
                Quotation Details
              </h3>
              {/* Status Badge */}
              {isApproved && (
                <span className="px-4 py-1.5 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  ✓ Approved
                </span>
              )}
              {isRejected && (
                <span className="px-4 py-1.5 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                  ✗ Rejected
                </span>
              )}
            </div>
            {data?.pdf_url && (
              <ThemedButton
                text="Download Quotation PDF"
                icon={<Download size={18} />}
                onClick={downloadQuotationPDF}
              />
            )}
          </div>

          {/* Quotation Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Labor Cost */}
            <div className="p-4 border-2 theme-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="theme-text" />
                <span className="text-sm text-gray-500 font-medium">
                  Labor Cost
                </span>
              </div>
              <p className="text-2xl font-bold theme-text">
                {data?.labor_cost !== undefined
                  ? `₨ ${data.labor_cost.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>

            {/* Total Materials Cost */}
            <div className="p-4 border-2 theme-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package size={20} className="theme-text" />
                <span className="text-sm text-gray-500 font-medium">
                  Total Materials Cost
                </span>
              </div>
              <p className="text-2xl font-bold theme-text">
                {data?.materials_cost !== undefined
                  ? `₨ ${data.materials_cost.toLocaleString()}`
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data?.materials_needed?.length || 0} item(s)
              </p>
            </div>

            {/* Materials Provided By */}
            <div className="p-4 border-2 theme-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User size={20} className="theme-text" />
                <span className="text-sm text-gray-500 font-medium">
                  Materials Provided By
                </span>
              </div>
              <p className="text-lg font-semibold theme-text capitalize">
                {data?.materials_provided_by || 'N/A'}
              </p>
            </div>

            {/* Total Cost */}
            <div className="p-4 border-2 theme-border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="theme-text" />
                <span className="text-sm text-gray-600 font-medium">
                  Total Cost
                </span>
              </div>
              <p className="text-3xl font-bold theme-text">
                {data?.total_cost !== undefined
                  ? `₨ ${data.total_cost.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Materials Breakdown */}
          {data?.materials_needed && data.materials_needed.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold theme-text mb-3">
                Materials Breakdown
              </h4>
              <div className="border-2 theme-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Material Name
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Unit Cost
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.materials_needed.map((material, index) => (
                      <tr
                        key={material._id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm theme-text">
                          {material.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-center theme-text">
                          {material.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right theme-text">
                          ₨ {material.unit_cost.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold theme-text">
                          ₨ {material.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {data?.notes && (
            <div className="mt-6 p-4 border-2 theme-border rounded-lg bg-yellow-50">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-600">{data.notes}</p>
            </div>
          )}

          {/* Action Buttons - Only show if not already approved or rejected */}
          {!isApproved && !isRejected && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <ThemedButton
                text="Reject"
                onClick={handleRejectClick}
                className="bg-red-500 hover:bg-red-600"
                loading={loading}
              />
              <ThemedButton
                text="Approve"
                onClick={handleApprove}
                loading={loading}
              />
            </div>
          )}
        </div>
      ) : null}

      {/* Rejection Modal */}
      <Modal
        title="Reject Quotation"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={handleModalCancel}
        okText="Reject"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: loading,
        }}
        cancelButtonProps={{
          disabled: loading,
        }}
      >
        <div className="py-4">
          <label
            htmlFor="rejection-reason"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejection-reason"
            rows={4}
            className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Please provide a reason for rejecting this quotation..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={loading}
          />
          {!rejectionReason.trim() && (
            <p className="text-xs text-gray-500 mt-1">
              Reason is required to reject the quotation
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
