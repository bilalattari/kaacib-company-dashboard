import React from 'react';

export default function Bookings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-kaacib-primary">Booking Management</h2>
        <p className="text-gray-600 text-base">Manage and track all company bookings and reservations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-kaacib p-5">
          <div className="text-2xl font-bold text-kaacib-primary">24</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="card-kaacib p-5">
          <div className="text-2xl font-bold text-kaacib-secondary">18</div>
          <div className="text-sm text-gray-600">Active Bookings</div>
        </div>
        <div className="card-kaacib p-5">
          <div className="text-2xl font-bold text-kaacib-primary">4</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card-kaacib p-5">
          <div className="text-2xl font-bold text-kaacib-secondary">2</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>
      
      <div className="card-kaacib p-6">
        <h3 className="text-lg font-semibold mb-4 text-kaacib-primary">Recent Bookings</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p>Bookings table will be implemented here</p>
        </div>
      </div>
    </div>
  );
}


