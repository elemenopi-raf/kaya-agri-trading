import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Form, Input, Select, Button, message } from 'antd'
import api from '../services/api'
import type { Product, PagedResponse } from '../types'

interface Props {
  open: boolean
  onClose: () => void
}

function StockMovementCreateModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [products, setProducts] = useState<Product[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      form.resetFields()
      setSuccess(false)
      api.get<PagedResponse<Product>>('/products?pageSize=200')
        .then(data => setProducts(data.items))
        .catch(() => {})
    }
  }, [open])

  async function handleSubmit(values: any) {
    if (!values.productId) { message.error('Select a product'); return }
    if (!values.quantity || parseFloat(values.quantity) <= 0) { message.error('Quantity must be positive'); return }

    try {
      setSubmitting(true)
      await api.post('/stock-movements', {
        productId: values.productId,
        movementType: values.movementType,
        quantity: values.quantity,
        notes: values.notes || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      message.error(err.message || 'Failed to record movement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Modal title="Record Stock Movement" open={open && !success} onCancel={onClose} footer={null} destroyOnClose
        width={500}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ movementType: 'IN' }}>
          <Form.Item name="productId" label="Product" rules={[{ required: true, message: 'Select a product' }]}>
            <Select showSearch placeholder="Search or select a product..."
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={products.map(p => ({
                label: `${p.name} — stock: ${p.currentStock} ${p.unitOfMeasureAbbr}`,
                value: p.id,
              }))} />
          </Form.Item>

          <Form.Item name="movementType" label="Movement Type">
            <Select options={[
              { label: 'IN - Stock In', value: 'IN' },
              { label: 'OUT - Stock Out', value: 'OUT' },
              { label: 'ADJUSTMENT - Adjust Stock', value: 'ADJUSTMENT' },
            ]} />
          </Form.Item>

          <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: 'Enter quantity' }]}>
            <Input type="number" step="0.01" min="0.01" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="e.g. Received from supplier" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Record</Button>
          </div>
        </Form>
      </Modal>
      <Modal title="Success" open={open && success} closable={false} footer={
        <Button type="primary" onClick={() => { onClose(); navigate('/stock-movements', { state: { refresh: Date.now() } }) }}>OK</Button>
      }>
        <p>Stock movement recorded successfully!</p>
      </Modal>
    </>
  )
}

export default StockMovementCreateModal
