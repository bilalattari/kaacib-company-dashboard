import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, Input, Select, Typography, Drawer } from 'antd';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';

export default function Branches() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const companyId = localStorage.getItem('company-id') || 'me';

  const fetchData = async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (filters.status) qp.append('status', filters.status);
      const res = await api.get(`${ENDPOINTS.GET_COMPANY_BRANCHES(companyId)}?${qp.toString()}`);
      setData(res.data?.data?.branches || res.data?.data || res.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters.status]);

  const columns = [
    { title: 'Branch', dataIndex: 'name' },
    { title: 'City', dataIndex: 'city' },
    { title: 'Contact', dataIndex: 'phone', render: (v, r) => (<div>{r.phone}<div className="text-gray-500 text-xs">{r.email}</div></div>) },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='active'?'green':'red'}>{(s||'').toUpperCase()}</Tag> },
    { title: 'Action', key: 'action', render: (_, record) => (
      <Space>
        <Button size="small" onClick={() => { setDetail(record); setOpen(true); }}>View</Button>
      </Space>
    ) },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div className="flex gap-3 items-center">
          <Typography.Title level={5} style={{ margin: 0 }}>Branch Management</Typography.Title>
          <div className="ml-auto flex gap-2">
            <Input.Search placeholder="Search branches" allowClear style={{ width: 240 }} onSearch={(v)=>setFilters(p=>({...p, search:v}))} />
            <Select placeholder="Status" allowClear style={{ width: 160 }} onChange={(v)=>setFilters(p=>({...p, status:v||''}))}>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
            <Button onClick={fetchData}>Refresh</Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table rowKey="_id" loading={loading} dataSource={data} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer open={open} onClose={()=>setOpen(false)} title={detail?.name} width={680}>
        {detail && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card><Typography.Text type="secondary">Address</Typography.Text><div>{detail.address||'N/A'}</div></Card>
            <Card><Typography.Text type="secondary">City</Typography.Text><div>{detail.city||'N/A'}</div></Card>
            <Card><Typography.Text type="secondary">Area</Typography.Text><div>{detail.area||'N/A'}</div></Card>
            <Card><Typography.Text type="secondary">Status</Typography.Text><div>{(detail.status||'').toUpperCase()}</div></Card>
            <Card><Typography.Text type="secondary">Latitude</Typography.Text><div>{detail.coordinates?.lat??'N/A'}</div></Card>
            <Card><Typography.Text type="secondary">Longitude</Typography.Text><div>{detail.coordinates?.lng??'N/A'}</div></Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}


