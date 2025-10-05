import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Form, Input, Typography, Row, Col, Divider, Space, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {  Building2, Shield, Users, TrendingUp } from 'lucide-react';

export default function Login() {
  const { login, isLoggingIn, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Hardcoded credentials for testing
  const defaultCredentials = {
    email: "bilal@karachitechsolutions.com.pk",
    password: "12345678"
  };

  const onFinish = async (values) => {
    const result = await login(values);
    if (result.success) {
      navigate('/');
    }
  };

  // Set default credentials on component mount
  useEffect(() => {
    form.setFieldsValue(defaultCredentials);
  }, [form]);

  // Clear error when user starts typing
  const handleInputChange = () => {
    if (error) {
      clearError();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <Row gutter={0} className="w-full max-w-6xl">
        {/* Left Side - Branding & Features */}
        <Col xs={0} lg={14}>
          <div className="h-full min-h-[600px] bg-kaacib-primary rounded-l-2xl p-16 flex flex-col justify-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30" style={{
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            }} />
            
            <div className="relative z-10">
              <div className="mb-10">
                <div className="text-5xl font-bold mb-4 tracking-wider">
                  KAACIB
                </div>
                <div className="text-xl opacity-90 font-light">
                  Company Portal
                </div>
              </div>

              <div className="mb-10">
                <Typography.Title level={2} className="text-white mb-4">
                  Welcome to Your Business Hub
                </Typography.Title>
                <Typography.Text className="text-base text-white/90 leading-relaxed">
                  Manage your company assets, branches, and operations with our comprehensive KAACIB business management platform.
                </Typography.Text>
              </div>

              <Space direction="vertical" size="large" className="w-full">
                <div className="flex items-center">
                  <Building2 size={24} className="mr-4 text-white/80" />
                  <span>Centralized Branch Management</span>
                </div>
                <div className="flex items-center">
                  <Shield size={24} className="mr-4 text-white/80" />
                  <span>Secure Asset Tracking</span>
                </div>
                <div className="flex items-center">
                  <Users size={24} className="mr-4 text-white/80" />
                  <span>Team Collaboration Tools</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp size={24} className="mr-4 text-white/80" />
                  <span>Real-time Analytics</span>
                </div>
              </Space>
            </div>
          </div>
        </Col>

        {/* Right Side - Login Form */}
        <Col xs={24} lg={10}>
          <div className="bg-white rounded-r-2xl p-16 min-h-[600px] flex flex-col justify-center shadow-2xl">
            <div className="text-center mb-10">
              <div className="text-3xl font-bold text-kaacib-primary mb-2">
                Welcome Back
              </div>
              <Typography.Text type="secondary" className="text-base">
                Sign in to your company account
              </Typography.Text>
            </div>

            <Form 
              layout="vertical" 
              form={form} 
              onFinish={onFinish}
              size="large"
            >
              {/* Error Alert */}
              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  className="mb-6"
                  closable
                />
              )}

              <Form.Item 
                name="email" 
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              > 
                <Input 
                  placeholder="Enter your email address" 
                  className="h-12 border-gray-200 focus:border-kaacib-primary focus:ring-kaacib-primary"
                  onChange={handleInputChange}
                />
              </Form.Item>
              
              <Form.Item 
                name="password" 
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              > 
                <Input.Password 
                  placeholder="Enter your password" 
                  className="h-12 border-gray-200 focus:border-kaacib-primary focus:ring-kaacib-primary"
                  onChange={handleInputChange}
                />
              </Form.Item>

              <Form.Item className="mb-6">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={isLoggingIn}
                  size="large"
                  className="h-12 text-base font-semibold"
                >
                  Sign In to Dashboard
                </Button>
              </Form.Item>
            </Form>

            <Divider className="my-6">
              <Typography.Text type="secondary" className="text-xs">
                Secure Login
              </Typography.Text>
            </Divider>
          </div>
        </Col>
      </Row>
    </div>
  );
}

