import React from 'react';
import AuthDemo from '../../components/AuthDemo';

export default function Dashboard() {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1890ff' }}>
        Company Dashboard
      </h2>
      
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Welcome to KAACIB Company Portal
        </h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Manage your company assets, branches, and operations efficiently.
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #f0f0f0',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>12</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Branches</div>
        </div>
        <div style={{ 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #f0f0f0',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>45</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Active Assets</div>
        </div>
        <div style={{ 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #f0f0f0',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>8</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Pending Bookings</div>
        </div>
        <div style={{ 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #f0f0f0',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>3</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Service Requests</div>
        </div>
      </div>

      {/* Auth Demo Component */}
      <AuthDemo />
    </div>
  );
}


