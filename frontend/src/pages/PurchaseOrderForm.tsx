import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input, Select, Button, Table, Typography, message } from 'antd'
import api from '../services/api'
import type { PurchaseOrder, Supplier, PagedResponse, Product } from '../types'

function PurchaseOrderForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [supplierId, setSupplierId] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<{ productId: number; productName: string; qtyOrdered: string; unitPrice: string }[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)


  useEffect(() => {
    api.get<PagedResponse<Supplier>>('/suppliers?pageSize=100')
      .then(data => setSuppliers(data.items))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (productSearch.length >= 1) {
      api.get<PagedResponse<Product>>(`/products?search=${encodeURIComponent(productSearch)}&pageSize=10`)
        .then(data => setProducts(data.items))
        .catch(() => setProducts([]))
    } else { setProducts([]) }
  }, [productSearch])

  function addItem(p: Product) {
    if (items.some(i => i.productId === p.id)) return
    setItems([...items, { productId: p.id, productName: p.name, qtyOrdered: '1', unitPrice: String(p.unitPrice || 0) }])
    setProductSearch('')
    setShowProductDropdown(false)
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: string, value: string) {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!supplierId) { setError('Select a supplier'); return }
    if (items.length === 0) { setError('Add at least one item'); return }

    try {
      setSubmitting(true)
      const body = {
        supplierId: Number(supplierId),
        expectedDate: expectedDate || undefined,
        notes: notes.trim() || undefined,
        items: items.map(i => ({ productId: i.productId, qtyOrdered: i.qtyOrdered, unitPrice: i.unitPrice })),
      }
      const created = await api.post<PurchaseOrder>('/purchase-orders', body)
      message.success(`Purchase order ${created.poNumber} created`)
      navigate(`/purchase-orders/${created.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create PO')
    } finally {
      setSubmitting(false)
    }
  }

  if (isEdit) {
    return <div><p>Editing is not supported. Cancel and create a new PO.</p><Button onClick={() => navigate('/purchase-orders')}>Back</Button></div>
  }

  const itemColumns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Qty', key: 'qtyOrdered', render: (_: any, __: any, idx: number) => (
      <Input type="number" step="0.01" min="0.01" value={items[idx]?.qtyOrdered}
        onChange={e => updateItem(idx, 'qtyOrdered', e.target.value)} style={{ width: 80 }} />
    )},
    { title: 'Unit Price', key: 'unitPrice', render: (_: any, __: any, idx: number) => (
      <Input type="number" step="0.01" min="0" value={items[idx]?.unitPrice}
        onChange={e => updateItem(idx, 'unitPrice', e.target.value)} style={{ width: 100 }} />
    )},
    { title: 'Total', key: 'total', render: (_: any, __: any, idx: number) => {
      const item = items[idx]
      return (parseFloat(item?.qtyOrdered || '0') * parseFloat(item?.unitPrice || '0')).toFixed(2)
    }},
    { title: '', key: 'action', render: (_: any, __: any, idx: number) => (
      <Button type="link" danger onClick={() => removeItem(idx)}>Remove</Button>
    )},
  ]

  return (
    <div style={{ maxWidth: 700 }}>
      <Typography.Title level={3}>New Purchase Order</Typography.Title>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label>Supplier *</label>
          <Select value={supplierId} onChange={v => setSupplierId(v)} style={{ width: '100%' }}
            options={suppliers.filter(s => s.active).map(s => ({ label: s.name, value: String(s.id) }))} />
        </div>
        <div>
          <label>Expected Date</label>
          <Input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} />
        </div>
        <div>
          <label>Notes</label>
          <Input.TextArea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>

        <div style={{ position: 'relative' }}>
          <label>Add Items</label>
          <Input placeholder="Search product..." value={productSearch}
            onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true) }}
            onFocus={() => setShowProductDropdown(true)}
            onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)} />
          {showProductDropdown && products.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d9d9d9', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
              {products.map(p => (
                <div key={p.id} onMouseDown={() => addItem(p)}
                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
                  {p.name} <span style={{ color: '#999' }}>(stock: {p.currentStock} {p.unitOfMeasureAbbr})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <Table dataSource={items.map((item, idx) => ({ ...item, key: idx }))} columns={itemColumns} pagination={false} size="small" />
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>Create PO</Button>
          <Button onClick={() => navigate('/purchase-orders')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

export default PurchaseOrderForm
