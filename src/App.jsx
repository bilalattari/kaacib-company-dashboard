import './App.css'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
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
  return (
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
  )
}
