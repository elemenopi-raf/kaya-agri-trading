import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Input, Button, Table, Select } from 'antd'
import api from '../services/api'
import type { Product, Customer, PagedResponse } from '../types'

interface Props {
  open: boolean
  onClose: () => void
}

function SaleCreateModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [customerId, setCustomerId] = useState<number | undefined>()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [saleDate, setSaleDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<{ productId: number; productName: string; quantity: string; unitPrice: string; currentStock: number }[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      setCustomerId(undefined)
      setCustomerSearch('')
      setSaleDate('')
      setNotes('')
      setItems([])
      setError('')
      setSuccess(false)
    }
  }, [open])

  useEffect(() => {
    if (customerSearch.length >= 1) {
      api.get<Customer[]>(`/customers/search?q=${encodeURIComponent(customerSearch)}`)
        .then(data => setCustomers(data))
        .catch(() => setCustomers([]))
    } else { setCustomers([]) }
  }, [customerSearch])

  useEffect(() => {
    if (productSearch.length >= 1) {
      api.get<PagedResponse<Product>>(`/products?search=${encodeURIComponent(productSearch)}&pageSize=10`)
        .then(data => setProducts(data.items))
        .catch(() => setProducts([]))
    } else { setProducts([]) }
  }, [productSearch])

  function addItem(p: Product) {
    if (items.some(i => i.productId === p.id)) return
    setItems([...items, { productId: p.id, productName: p.name, quantity: '1', unitPrice: String(p.unitPrice || 0), currentStock: p.currentStock }])
    setProductSearch('')
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: string, value: string) {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  function stockErrors(): string[] {
    const errors: string[] = []
    for (const item of items) {
      const qty = parseFloat(item.quantity || '0')
      if (qty > item.currentStock) {
        errors.push(`${item.productName}: requested ${qty}, only ${item.currentStock} in stock`)
      }
    }
    return errors
  }

  async function handleSubmit() {
    setError('')
    if (items.length === 0) { setError('Add at least one item'); return }
    const se = stockErrors()
    if (se.length > 0) { setError('Insufficient stock:\n' + se.join('\n')); return }

    try {
      setSubmitting(true)
      const body = {
        customerId: customerId || undefined,
        saleDate: saleDate || undefined,
        notes: notes.trim() || undefined,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
      }
      await api.post('/sales', body)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create sale')
    } finally {
      setSubmitting(false)
    }
  }

  const total = items.reduce((sum, i) => sum + (parseFloat(i.quantity || '0') * parseFloat(i.unitPrice || '0')), 0)

  const itemColumns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Qty', key: 'quantity', render: (_: any, __: any, idx: number) => {
      const item = items[idx]
      const qty = parseFloat(item?.quantity || '0')
      const exceeds = qty > item?.currentStock
      return (
        <div>
          <Input type="number" step="0.01" min="0.01" value={item?.quantity}
            onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ width: 80 }} />
          {exceeds && <div style={{ color: 'red', fontSize: 11, lineHeight: '14px' }}>Only {item.currentStock} in stock</div>}
        </div>
      )
    }},
    { title: 'Unit Price', key: 'unitPrice', render: (_: any, __: any, idx: number) => (
      <Input type="number" step="0.01" min="0" value={items[idx]?.unitPrice}
        onChange={e => updateItem(idx, 'unitPrice', e.target.value)} style={{ width: 100 }} />
    )},
    { title: 'Total', key: 'total', render: (_: any, __: any, idx: number) => {
      const item = items[idx]
      return (parseFloat(item?.quantity || '0') * parseFloat(item?.unitPrice || '0')).toFixed(2)
    }},
    { title: '', key: 'action', render: (_: any, __: any, idx: number) => (
      <Button type="link" danger onClick={() => removeItem(idx)}>Remove</Button>
    )},
  ]

  return (
    <>
      <Modal title="New Sale" open={open && !success} onCancel={onClose}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>Create Sale</Button>
          </div>
        } width={640} destroyOnClose
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label>Customer</label>
            <div style={{ position: 'relative' }}>
              <Input placeholder="Search customer (optional - walk-in)" value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true) }}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)} />
              {showCustomerDropdown && customers.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d9d9d9', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                  {customers.map(c => (
                    <div key={c.id} onMouseDown={() => { setCustomerId(c.id); setCustomerSearch(c.name); setShowCustomerDropdown(false) }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
                      {c.name} {c.phone ? <span style={{ color: '#999' }}>({c.phone})</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label>Sale Date</label>
            <Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} />
          </div>
          <div>
            <label>Notes</label>
            <Input.TextArea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          <div>
            <label>Add Items</label>
            <Select showSearch placeholder="Search product..." filterOption={false}
              onSearch={v => setProductSearch(v)}
              onSelect={(_, option) => {
                const p = products.find(p => p.id === Number((option as any).value))
                if (p) addItem(p)
              }}
              notFoundContent={null}
              value={undefined}
              options={products.map(p => ({
                label: `${p.name} (stock: ${p.currentStock} ${p.unitOfMeasureAbbr})`,
                value: p.id,
              }))}
              style={{ width: '100%' }} />
          </div>

          {items.length > 0 && (
            <>
              <Table dataSource={items.map((item, idx) => ({ ...item, key: idx }))} columns={itemColumns} pagination={false} size="small" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {stockErrors().length > 0 && (
                  <span style={{ color: 'red', fontSize: 13 }}>⚠ Some items exceed available stock</span>
                )}
                <div style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 'auto' }}>
                  Total: {total.toFixed(2)}
                </div>
              </div>
            </>
          )}

          {error && <p style={{ color: 'red', margin: 0, whiteSpace: 'pre-line' }}>{error}</p>}
        </div>
      </Modal>
      <Modal title="Success" open={open && success} closable={false} footer={
        <Button type="primary" onClick={() => { onClose(); navigate('/sales', { state: { refresh: Date.now() } }) }}>OK</Button>
      }>
        <p>Sale created successfully!</p>
      </Modal>
    </>
  )
}

export default SaleCreateModal
