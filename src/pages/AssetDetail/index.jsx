import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isValidObjectId } from '../../helpers';
import { getAssetById } from '../../apis';
import { ConfigProvider, message, Tabs } from 'antd';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../redux/slices/companySlice';
import Images from '../../components/TicketImages';
import Tickets from '../Tickets';
import { Loader2 } from 'lucide-react';

const statusArr = [
  { value: 'ticket', label: 'Tickets' },
  { value: 'image', label: 'Images' },
];

export default function AssetDetail() {
  const { id } = useParams();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ticket');

  const { theme_color } = useSelector(selectCompanyInfo) || {};

  useEffect(() => {
    fetchAssetDetails();
  }, []);

  const fetchAssetDetails = async () => {
    try {
      const isValid = isValidObjectId(id);
      if (!isValid) {
        navigate('/assets');
        return;
      }
      setLoading(true);
      const { data } = await getAssetById(id);
      setAsset(data?.data?.asset || {});
    } catch (err) {
      message.error(
        err.response?.data?.message || 'Failed to fetch asset details',
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
            Asset Information
          </h1>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Name:</p>
              <p className="text-sm">{asset?.name || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Type:</p>
              <p className="text-sm capitalize">{asset?.asset_type || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Brand:</p>
              <p className="text-sm">{asset?.brand || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Model Number:
              </p>
              <p className="text-sm">{asset?.model_number || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Branch:</p>
              <p className="text-sm">{asset?.branch?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="w-1/2 border-2 theme-border rounded-lg p-6 shadow-sm">
          <h1 className="text-center text-md xl:text-lg font-semibold mb-4">
            Additional Details
          </h1>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">Status:</p>
              <p className="text-sm capitalize">{asset?.status || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Serial Number:
              </p>
              <p className="text-sm">{asset?.serial_number || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Description:
              </p>
              <p className="text-sm">{asset?.description || 'N/A'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Total Maintenance Cost:
              </p>
              <p className="text-sm">
                {asset?.total_maintenance_cost !== undefined
                  ? `${asset.total_maintenance_cost}`
                  : 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-gray-600">
                Total Service Requests:
              </p>
              <p className="text-sm">
                {asset?.total_service_requests !== undefined
                  ? asset.total_service_requests
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

      {activeTab === 'ticket' && <Tickets isAsset={true} asset={asset} />}
      {activeTab === 'image' && (
        <Images data={asset?.images} title="Asset Images" />
      )}
    </main>
  );
}
