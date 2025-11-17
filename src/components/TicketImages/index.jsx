import { Image as ImageIcon } from 'lucide-react';

export default function TicketImages({ data }) {
  console.log('TicketImages data:', data);

  // Handle both service_end_images array and regular images array
  const images = data || [];

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400">
        <ImageIcon className="w-16 h-16 mb-3" />
        <p className="text-sm">No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 theme-text" />
        <h2 className="text-lg font-semibold">Service Completion Images</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl) => (
          <div
            key={imageUrl.split('/')[-1]}
            className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
          >
            <img
              src={imageUrl}
              alt={`Service completion`}
              className="w-full h-fit object-fit group-hover:scale-105 transition-transform duration-300"
              onClick={() => window.open(imageUrl, '_blank')}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
