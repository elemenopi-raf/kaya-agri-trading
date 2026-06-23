import { useEffect, useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import api from '../services/api'
import type { Customer } from '../types'

interface Props {
  customer: Customer | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function CustomerEditModal({ customer, open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer && open) {
      form.setFieldsValue({
        name: customer.name,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
      })
    }
  }, [customer, open, form])

  async function handleSubmit() {
    if (!customer) return
    try {
      setLoading(true)
      const values = await form.validateFields()
      await api.put(`/customers/${customer.id}`, values)
      message.success('Customer updated')
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err.message) message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Edit Customer" open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={loading} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CustomerEditModal
