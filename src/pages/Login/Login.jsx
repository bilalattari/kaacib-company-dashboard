import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { Button, Card, Form, Input, Typography, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

export default function Login() {
  const dispatch = useDispatch();
  const { loading } = useSelector(s => s.auth);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    dispatch(login(values)).unwrap().then(() => {
      window.location.href = '/';
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-white">
      <Row gutter={0}>
        <Col xs={0} md={12} className="hidden md:block">
          <div className="h-screen w-full bg-[#2F80ED] flex items-center justify-center">
            <img src="/login-illustration.svg" alt="Illustration" className="max-w-[80%]" />
          </div>
        </Col>
        <Col xs={24} md={12} className="flex items-center justify-center p-6">
          <div style={{ maxWidth: 460, width: '100%' }}>
            <div className="mb-8">
              <Typography.Title level={2} style={{ marginBottom: 0, fontWeight: 800 }}>KAACIB DASHBOARD</Typography.Title>
            </div>
            <Card>
              <Typography.Title level={4} style={{ marginBottom: 24 }}>Sign In</Typography.Title>
              <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required' }]}> 
                  <Input placeholder="admin@kaacib.com" size="large" />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Password is required' }]}> 
                  <Input.Password placeholder="••••••••" size="large" />
                </Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>Sign In</Button>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}

