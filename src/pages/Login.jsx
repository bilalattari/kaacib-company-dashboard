import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { Button, Card, Form, Input, Typography } from 'antd';

export default function Login() {
  const dispatch = useDispatch();
  const { loading } = useSelector(s => s.auth);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    dispatch(login(values)).unwrap().then(() => {
      window.location.href = '/';
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card style={{ width: 400 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>Company Login</Typography.Title>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required' }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Login</Button>
        </Form>
      </Card>
    </div>
  );
}


