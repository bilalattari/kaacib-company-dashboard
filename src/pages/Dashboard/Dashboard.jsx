import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6">
       <h2 className="text-2xl font-bold mb-6 text-primary">
        KAACIB Dashboard
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Welcome to KAACIB Company Portal
        </h3>
        <p className="text-gray-600 text-sm">
          Manage your company assets, branches, and operations efficiently.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-kaacib p-5">
          <div className="text-2xl font-bold text-kaacib-primary">12</div>
          <div className="text-sm text-gray-600">Total Branches</div>
        </div>
        <div className="card-kaacib p-5">
          <div className="text-2xl font-bold text-kaacib-secondary">45</div>
          <div className="text-sm text-gray-600">Active Assets</div>
        </div>
        <div className="card-kaacib p-5">
          <div className="text-2xl font-bold text-kaacib-primary">8</div>
          <div className="text-sm text-gray-600">Pending Bookings</div>
        </div>
        <div className="card-kaacib p-5">
          <div className="text-2xl font-bold text-kaacib-secondary">3</div>
          <div className="text-sm text-gray-600">Service Requests</div>
        </div>
      </div>

    </div>
  );
}


