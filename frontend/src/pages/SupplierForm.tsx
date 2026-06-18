import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Button, Typography, Switch, Spin, message } from 'antd'
import api from '../services/api'
import type { Supplier } from '../types'

function SupplierForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (isEdit && id) {
      api.get<Supplier>(`/suppliers/${id}`)
        .then(s => form.setFieldsValue(s))
        .catch(() => navigate('/suppliers'))
        .finally(() => setLoading(false))
    }
  }, [isEdit, id])

  async function handleSubmit(values: any) {
    const body = {
      name: values.name.trim(),
      contactPerson: values.contactPerson?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      email: values.email?.trim() || undefined,
      address: values.address?.trim() || undefined,
      active: values.active,
    }
    try {
      if (isEdit) { await api.put(`/suppliers/${id}`, body) }
      else { await api.post('/suppliers', body) }
      message.success(isEdit ? 'Supplier updated' : 'Supplier created')
      navigate('/suppliers')
    } catch (err: any) {
      message.error(err.message || 'Failed to save supplier')
    }
  }

  if (loading) return <Spin />

  return (
    <div style={{ maxWidth: 500 }}>
      <Typography.Title level={3}>{isEdit ? 'Edit Supplier' : 'New Supplier'}</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ active: true }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contactPerson" label="Contact Person">
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input type="email" />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="active" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{isEdit ? 'Update' : 'Create'}</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/suppliers')}>Cancel</Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default SupplierForm
