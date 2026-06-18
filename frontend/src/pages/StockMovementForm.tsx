import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Select, Button, Typography, message } from 'antd'
import api from '../services/api'
import type { Product, PagedResponse } from '../types'

function StockMovementForm() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (productSearch.length >= 1 && !selectedProduct) {
      api.get<PagedResponse<Product>>(`/products?search=${encodeURIComponent(productSearch)}&pageSize=10`)
        .then(data => setProducts(data.items))
        .catch(() => setProducts([]))
    } else { setProducts([]) }
  }, [productSearch, selectedProduct])

  async function handleSubmit(values: any) {
    if (!selectedProduct) { message.error('Select a product'); return }
    if (!values.quantity || parseFloat(values.quantity) <= 0) { message.error('Quantity must be positive'); return }

    try {
      setSubmitting(true)
      await api.post('/stock-movements', {
        productId: selectedProduct.id,
        movementType: values.movementType,
        quantity: values.quantity,
        notes: values.notes || undefined,
      })
      message.success('Stock movement recorded')
      navigate('/stock-movements')
    } catch (err: any) {
      message.error(err.message || 'Failed to record movement')
    } finally {
      setSubmitting(false)
    }
  }

  const emDash = String.fromCharCode(8212)

  return (
    <div style={{ maxWidth: 500 }}>
      <Typography.Title level={3}>Record Stock Movement</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ movementType: 'IN' }}>
        <Form.Item label="Product" required>
          {selectedProduct ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input value={`${selectedProduct.name} (${selectedProduct.sku || 'no sku'}) ${emDash} stock: ${selectedProduct.currentStock} ${selectedProduct.unitOfMeasureAbbr}`}
                style={{ background: '#f5f5f5' }} readOnly />
              <Button onClick={() => { setSelectedProduct(null); setProductSearch(''); form.setFieldValue('productId', undefined) }}>Change</Button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <Input placeholder="Search product..."
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)} />
              {showDropdown && products.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d9d9d9', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                  {products.map(p => (
                    <div key={p.id} onMouseDown={() => { setSelectedProduct(p); setShowDropdown(false) }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
                      {p.name} <span style={{ color: '#999' }}>(stock: {p.currentStock} {p.unitOfMeasureAbbr})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>Record</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/stock-movements')}>Cancel</Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default StockMovementForm
