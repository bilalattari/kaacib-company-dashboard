import './App.css'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { BrowserRouter, Route, Routes } from 'react-router'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DashboardLayout from './layouts/DashboardLayout'


function DashboardHome() {
  return <div>Welcome</div>
}

export default function App() {
  return (
    <Provider store={store}>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<><Login /></>} />
          <Route path="/signup" element={<><Signup /></>} />
        </Routes>
    </BrowserRouter>
    </Provider>
  )
}
