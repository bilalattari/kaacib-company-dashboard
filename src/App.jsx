import './App.css'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ConfigProvider, theme } from 'antd'
import Login from './pages/Login/Login'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Branches from './pages/Branches/Branches'
import Bookings from './pages/Bookings/Bookings'
import Assets from './pages/Assets/Assets'
import PrivateRoute from './routes/PrivateRoute'
import PublicRoute from './routes/PublicRoute'


function DashboardHome() {
  return <div>Welcome</div>
}

export default function App() {
  // KAACIB Theme Configuration
  const kaacibTheme = {
    token: {
      // Primary colors
      colorPrimary: '#133260',
      colorPrimaryHover: '#1a4a7a',
      colorPrimaryActive: '#0f2640',
      
      // Secondary colors
      colorSuccess: '#FF3605',
      colorWarning: '#FF3605',
      colorError: '#ff4d4f',
      
      // Background colors
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      
      // Border colors
      colorBorder: '#d9d9d9',
      colorBorderSecondary: '#f0f0f0',
      
      // Text colors
      colorText: '#262626',
      colorTextSecondary: '#8c8c8c',
      
      // Border radius
      borderRadius: 0,
      borderRadiusLG: 0,
      
      // Shadows
      boxShadow: '0 4px 20px rgba(19, 50, 96, 0.1)',
      boxShadowSecondary: '0 2px 8px rgba(19, 50, 96, 0.05)',
    },
    components: {
      Button: {
        primaryShadow: '0 4px 12px rgba(19, 50, 96, 0.15)',
        defaultShadow: '0 2px 4px rgba(19, 50, 96, 0.1)',
        borderRadius: 0,
        borderRadiusLG: 0,
        borderRadiusSM: 0,
      },
      Card: {
        boxShadowTertiary: '0 4px 20px rgba(19, 50, 96, 0.1)',
      },
    },
  };

  return (
    <ConfigProvider theme={kaacibTheme}>
      <AuthProvider>
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="branches" element={<Branches />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="assets" element={<Assets />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </Provider>
      </AuthProvider>
    </ConfigProvider>
  )
}
