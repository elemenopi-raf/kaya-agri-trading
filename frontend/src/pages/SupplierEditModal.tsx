import { useEffect, useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import api from '../services/api'
import type { Supplier } from '../types'

interface Props {
  supplier: Supplier | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function SupplierEditModal({ supplier, open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (supplier && open) {
      form.setFieldsValue({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
      })
    }
  }, [supplier, open, form])

  async function handleSubmit() {
    if (!supplier) return
    try {
      setLoading(true)
      const values = await form.validateFields()
      await api.put(`/suppliers/${supplier.id}`, values)
      message.success('Supplier updated')
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err.message) message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Edit Supplier" open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={loading} destroyOnClose>
      <Form form={form} layout="vertical">
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
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SupplierEditModal
