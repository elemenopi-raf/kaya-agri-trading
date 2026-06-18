import { useEffect, useState } from 'react'
import { Table, Select, Input, Tag, Typography, Button } from 'antd'
import api from '../services/api'
import type { StockMovement, PagedResponse, Product } from '../types'

const typeColors: Record<string, string> = { IN: 'green', OUT: 'red', ADJUSTMENT: 'orange' }

function StockMovementList() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [productSearch, setProductSearch] = useState('')
  const [productId, setProductId] = useState<number | undefined>()
  const [movementType, setMovementType] = useState<string | undefined>()
  const [products, setProducts] = useState<Product[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productSearch.length >= 1) {
      api.get<PagedResponse<Product>>(`/products?search=${encodeURIComponent(productSearch)}&pageSize=10`)
        .then(data => setProducts(data.items))
        .catch(() => setProducts([]))
    } else { setProducts([]) }
  }, [productSearch])

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (productId) params.set('productId', String(productId))
    if (movementType) params.set('movementType', movementType)
    params.set('page', String(page - 1))
    params.set('pageSize', '20')
    api.get<PagedResponse<StockMovement>>(`/stock-movements?${params}`)
      .then(data => { setMovements(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [productId, movementType, page])

  const columns = [
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString() },
    { title: 'Type', dataIndex: 'movementType', key: 'movementType',
      render: (v: string) => <Tag color={typeColors[v]}>{v}</Tag> },
    { title: 'Product', dataIndex: 'productName', key: 'productName',
      render: (v: string, r: StockMovement) => `${v} (${r.productSku || '-'})` },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity',
      render: (v: number, r: StockMovement) => `${v} ${r.productUomAbbr}` },
    { title: 'Batch', dataIndex: 'batchCode', key: 'batchCode', render: (v: string) => v || '-' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (v: string) => v || '-' },
    { title: 'By', dataIndex: 'createdBy', key: 'createdBy', render: (v: string) => v || '-' },
  ]

  return (
    <div>
      <Typography.Title level={3}>Stock Movements</Typography.Title>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <Input placeholder="Search product..." value={productSearch}
            onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); setProductId(undefined) }}
            onFocus={() => setShowProductDropdown(true)}
            onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
            style={{ width: 250 }} />
          {showProductDropdown && products.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d9d9d9', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
              {products.map(p => (
                <div key={p.id} onMouseDown={() => {
                  setProductId(p.id); setProductSearch(`${p.name} (${p.sku || 'no sku'})`); setShowProductDropdown(false); setPage(1)
                }} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
                  {p.name} <span style={{ color: '#999' }}>({p.sku || 'no sku'})</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Select placeholder="All Types" allowClear style={{ width: 160 }}
          value={movementType} onChange={v => { setMovementType(v); setPage(1) }}
          options={[{ label: 'IN', value: 'IN' }, { label: 'OUT', value: 'OUT' }, { label: 'ADJUSTMENT', value: 'ADJUSTMENT' }]} />
        {productId && <Button onClick={() => { setProductId(undefined); setProductSearch(''); setPage(1) }}>Clear</Button>}
      </div>

      <Table dataSource={movements} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: p => setPage(p) }} />
    </div>
  )
}

export default StockMovementList
