import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Card, Tag, Space, Button, Input, Select, Typography, Modal, Form, Drawer, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { fetchAssets, setAssetFilters, createAsset, updateAssetById, deleteAssetById, fetchAssetHistory, createAssetServiceRequest } from '../../features/assets/assetsSlice';
import api from '../../helpers/api';
import { ENDPOINTS } from '../../helpers/endPoints';

export default function Assets() {
  const [form] = Form.useForm();
  const [serviceForm] = Form.useForm();
  const dispatch = useDispatch();
  const { list, loading, filters, history } = useSelector(s => s.assets);
  const [openModal, setOpenModal] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [serviceOpen, setServiceOpen] = React.useState(false);
  const [branches, setBranches] = React.useState([]);

  useEffect(()=>{ dispatch(fetchAssets(filters)); }, [filters]);

  // load branches for form select
  useEffect(()=>{
    (async ()=>{
      try {
        const res = await api.get(ENDPOINTS.GET_COMPANY_BRANCHES());
        const data = res.data?.data?.branches || res.data?.branches || res.data || [];
        setBranches(data);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  const onDelete = (id) => {
    Modal.confirm({ title: 'Delete Asset?', content: 'This action cannot be undone.', okType: 'danger', onOk: async ()=>{
      try { await dispatch(deleteAssetById(id)); message.success('Deleted'); } catch { message.error('Delete failed'); }
    }});
  };

  const onOpenHistory = async (id) => {
    setHistoryOpen(true);
    await dispatch(fetchAssetHistory({ id }));
  };

  const onSubmitAsset = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        asset_type: values.asset_type,
        status: values.status,
        location: values.location,
        serial_number: values.serial_number,
        model_number: values.model_number,
        brand: values.brand,
        description: values.description,
        branch_id: values.branch_id || undefined,
      };
      if (editing) {
        await dispatch(updateAssetById({ id: editing._id, data: payload }));
        message.success('Asset updated');
      } else {
        await dispatch(createAsset(payload));
        message.success('Asset created');
      }
      setOpenModal(false);
      dispatch(fetchAssets(filters));
    } catch (e) { /* form errors already shown */ }
  };

  const onSubmitServiceRequest = async () => {
    try {
      const values = await serviceForm.validateFields();
      const reqPayload = {
        service_id: values.service_id,
        description: values.description,
        scheduled_start: values.scheduled_start ? new Date(values.scheduled_start).toISOString() : undefined,
        location: values.location,
      };
      await dispatch(createAssetServiceRequest({ id: editing._id, data: reqPayload }));
      message.success('Service request created');
      setServiceOpen(false);
    } catch (e) { /* ignore */ }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Type', dataIndex: 'asset_type', render: v => (v||'').toUpperCase() },
    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s==='active'?'green': s==='maintenance'?'orange':'red'}>{(s||'').toUpperCase()}</Tag> },
    { title: 'Location', dataIndex: 'location' },
    { title: 'Serial', dataIndex: 'serial_number' },
    { title: 'Brand', dataIndex: 'brand' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={()=>{ setEditing(record); form.setFieldsValue({ ...record, branch_id: record.branch?._id }); setOpenModal(true); }}>Edit</Button>
          <Button size="small" danger onClick={()=> onDelete(record._id)}>Delete</Button>
          <Button size="small" onClick={()=> onOpenHistory(record._id)}>History</Button>
          <Button size="small" type="primary" onClick={()=>{ setEditing(record); serviceForm.resetFields(); setServiceOpen(true); }}>Service</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div className="flex gap-3 items-center">
          <Typography.Title level={5} style={{ margin: 0 }}>Assets</Typography.Title>
          <div className="ml-auto flex gap-2">
            <Input.Search placeholder="Search assets" allowClear style={{ width: 240 }} onSearch={(v)=>dispatch(setAssetFilters({ search: v }))} />
            <Select placeholder="Type" allowClear style={{ width: 160 }} onChange={(v)=>dispatch(setAssetFilters({ asset_type: v||'' }))}>
              <Select.Option value="equipment">Equipment</Select.Option>
              <Select.Option value="vehicle">Vehicle</Select.Option>
              <Select.Option value="facility">Facility</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
            <Select placeholder="Status" allowClear style={{ width: 160 }} onChange={(v)=>dispatch(setAssetFilters({ status: v||'' }))}>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="maintenance">Maintenance</Select.Option>
              <Select.Option value="out_of_order">Out of Order</Select.Option>
              <Select.Option value="retired">Retired</Select.Option>
            </Select>
            <Button onClick={()=>dispatch(fetchAssets(filters))}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={()=>{ setEditing(null); form.resetFields(); setOpenModal(true); }}>New Asset</Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table rowKey="_id" loading={loading} dataSource={list} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing? 'Edit Asset' : 'Create Asset'}
        open={openModal}
        onCancel={()=> setOpenModal(false)}
        onOk={()=> onSubmitAsset()}
        okButtonProps={{ loading }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input/>
          </Form.Item>
          <Form.Item name="asset_type" label="Type" rules={[{ required: true }]}>
            <Select placeholder="Select type">
              <Select.Option value="equipment">Equipment</Select.Option>
              <Select.Option value="vehicle">Vehicle</Select.Option>
              <Select.Option value="facility">Facility</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="branch_id" label="Branch">
            <Select allowClear placeholder="Select branch">
              {branches.map(b => (
                <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select allowClear>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="maintenance">Maintenance</Select.Option>
              <Select.Option value="out_of_order">Out of Order</Select.Option>
              <Select.Option value="retired">Retired</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="Location"><Input/></Form.Item>
          <Form.Item name="serial_number" label="Serial"><Input/></Form.Item>
          <Form.Item name="model_number" label="Model"><Input/></Form.Item>
          <Form.Item name="brand" label="Brand"><Input/></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3}/></Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Asset Service History"
        width={520}
        open={historyOpen}
        onClose={()=> setHistoryOpen(false)}
      >
        <Table
          size="small"
          rowKey={(r)=> r._id}
          loading={history.loading}
          dataSource={history.items}
          pagination={false}
          columns={[
            { title: 'Date', dataIndex: 'service_date', render: v => v? new Date(v).toLocaleString() : '-' },
            { title: 'Type', dataIndex: 'service_type' },
            { title: 'Worker', dataIndex: ['worker','first_name'], render: (_, r)=> r?.worker ? `${r.worker.first_name||''} ${r.worker.last_name||''}`.trim() : '-' },
            { title: 'Cost', dataIndex: 'cost' },
            { title: 'Notes', dataIndex: 'notes' },
          ]}
        />
      </Drawer>

      <Modal
        title={`Create Service Request${editing? ` • ${editing.name}`: ''}`}
        open={serviceOpen}
        onCancel={()=> setServiceOpen(false)}
        onOk={()=> onSubmitServiceRequest()}
        okText="Create"
        okButtonProps={{ loading }}
        destroyOnClose
      >
        <Form form={serviceForm} layout="vertical" preserve={false}>
          <Form.Item name="service_id" label="Service" rules={[{ required: true }]}>
            <Input placeholder="Service ID"/>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3}/>
          </Form.Item>
          <Form.Item name="scheduled_start" label="Scheduled Start">
            <Input type="datetime-local"/>
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function onDelete(id){
  Modal.confirm({ title: 'Delete Asset?', content: 'This action cannot be undone.', okType: 'danger', onOk: async ()=>{
    try { await window.appDispatch(deleteAssetById(id)); message.success('Deleted'); } catch { message.error('Delete failed'); }
  }});
}

function onOpenHistory(id){
  window.appDispatch(fetchAssetHistory({ id }));
  // History drawer state controlled in component; we use a custom dispatcher holder below.
}



