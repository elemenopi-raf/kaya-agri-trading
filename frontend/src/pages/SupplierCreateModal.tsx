import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Form, Input, Button, Switch, message } from 'antd'
import api from '../services/api'

interface Props {
  open: boolean
  onClose: () => void
}

function SupplierCreateModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      form.resetFields()
      setSuccess(false)
    }
  }, [open])

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
      setSubmitting(true)
      await api.post('/suppliers', body)
      setSuccess(true)
    } catch (err: any) {
      message.error(err.message || 'Failed to create supplier')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Modal title="New Supplier" open={open && !success} onCancel={onClose} footer={null} destroyOnClose width={480}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Create</Button>
          </div>
        </Form>
      </Modal>
      <Modal title="Success" open={open && success} closable={false} footer={
        <Button type="primary" onClick={() => { onClose(); navigate('/suppliers', { state: { refresh: Date.now() } }) }}>OK</Button>
      }>
        <p>Supplier created successfully!</p>
      </Modal>
    </>
  )
}

export default SupplierCreateModal
