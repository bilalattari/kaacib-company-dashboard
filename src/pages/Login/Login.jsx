import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Form, Input, Typography, Row, Col, Divider, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {  Building2, Shield, Users, TrendingUp } from 'lucide-react';

export default function Login() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const result = await login(values);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row gutter={0} style={{ width: '100%', maxWidth: '1200px' }}>
        {/* Left Side - Branding & Features */}
        <Col xs={0} lg={14}>
          <div style={{
            height: '100%',
            minHeight: '600px',
            background: 'linear-gradient(135deg, #001529 0%, #001529 100%)',
            borderRadius: '16px 0 0 16px',
            padding: '60px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: 'bold', 
                  marginBottom: '16px',
                  letterSpacing: '2px'
                }}>
                  KAACIB
                </div>
                <div style={{ 
                  fontSize: '20px', 
                  opacity: 0.9,
                  fontWeight: 300
                }}>
                  Company Portal
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <Typography.Title level={2} style={{ color: 'white', marginBottom: '16px' }}>
                  Welcome to Your Business Hub
                </Typography.Title>
                <Typography.Text style={{ 
                  fontSize: '16px', 
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: '1.6'
                }}>
                  Manage your company assets, branches, and operations with our comprehensive business management platform.
                </Typography.Text>
              </div>

              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Building2 size={24} style={{ marginRight: '16px', color: 'rgba(255,255,255,0.8)' }} />
                  <span>Centralized Branch Management</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Shield size={24} style={{ marginRight: '16px', color: 'rgba(255,255,255,0.8)' }} />
                  <span>Secure Asset Tracking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Users size={24} style={{ marginRight: '16px', color: 'rgba(255,255,255,0.8)' }} />
                  <span>Team Collaboration Tools</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp size={24} style={{ marginRight: '16px', color: 'rgba(255,255,255,0.8)' }} />
                  <span>Real-time Analytics</span>
                </div>
              </Space>
            </div>
          </div>
        </Col>

        {/* Right Side - Login Form */}
        <Col xs={24} lg={10}>
          <div style={{
            background: 'white',
            borderRadius: '0 16px 16px 0',
            padding: '60px 40px',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#1890ff',
                marginBottom: '8px'
              }}>
                Welcome Back
              </div>
              <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
                Sign in to your company account
              </Typography.Text>
            </div>

            <Form 
              layout="vertical" 
              form={form} 
              onFinish={onFinish}
              size="large"
            >
              <Form.Item 
                name="email" 
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              > 
                <Input 
                  placeholder="Enter your email address" 
                  // prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                  style={{ height: '48px' }}
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
                  // prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                  style={{ height: '48px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '24px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={isLoading}
                  style={{ 
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  Sign In to Dashboard
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '24px 0' }}>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                Secure Login
              </Typography.Text>
            </Divider>
          </div>
        </Col>
      </Row>
    </div>
  );
}

