import { useState } from 'react'
import { Modal, Form, Input, Select, Button, message } from 'antd'
import api from '../services/api'
import type { Sale } from '../types'

interface Props {
  open: boolean
  saleId: number
  onSuccess: (sale: Sale) => void
  onClose: () => void
}

function AddPaymentModal({ open, saleId, onSuccess, onClose }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(values: any) {
    try {
      setSubmitting(true)
      const updated = await api.put<Sale>(`/sales/${saleId}/payment`, {
        saleId,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        referenceNo: values.referenceNo?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      })
      message.success('Payment added')
      onSuccess(updated)
    } catch (err: any) {
      message.error(err.message || 'Failed to add payment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add Payment" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleSubmit}
        initialValues={{ paymentMethod: 'CASH' }}>
        <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Amount is required' }]}>
          <Input type="number" step="0.01" min="0.01" />
        </Form.Item>
        <Form.Item name="paymentMethod" label="Payment Method" rules={[{ required: true }]}>
          <Select options={[
            { label: 'CASH', value: 'CASH' },
            { label: 'TRANSFER', value: 'TRANSFER' },
            { label: 'GCASH', value: 'GCASH' },
            { label: 'CHECK', value: 'CHECK' },
            { label: 'OTHER', value: 'OTHER' },
          ]} />
        </Form.Item>
        <Form.Item name="referenceNo" label="Reference No">
          <Input />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>Add Payment</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddPaymentModal
