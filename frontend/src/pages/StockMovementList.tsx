import { useEffect, useState } from 'react'
import { Table, Select, Input, Tag, Typography, Button, DatePicker } from 'antd'
import { ExportOutlined, LinkOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import api from '../services/api'
import { downloadCsv } from '../utils/csv'
import type { StockMovement, PagedResponse, Product } from '../types'

const { RangePicker } = DatePicker

const typeColors: Record<string, string> = { IN: 'green', OUT: 'red', ADJUSTMENT: 'orange' }

function StockMovementList() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [productSearch, setProductSearch] = useState('')
  const [productId, setProductId] = useState<number | undefined>()
  const [movementType, setMovementType] = useState<string | undefined>()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
    if (dateRange?.[0]) params.set('from', dateRange[0].format('YYYY-MM-DD'))
    if (dateRange?.[1]) params.set('to', dateRange[1].format('YYYY-MM-DD'))
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<StockMovement>>(`/stock-movements?${params}`)
      .then(data => { setMovements(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [productId, movementType, dateRange, page])

  function handleExport() {
    const params = new URLSearchParams()
    if (productId) params.set('productId', String(productId))
    if (movementType) params.set('movementType', movementType)
    if (dateRange?.[0]) params.set('from', dateRange[0].format('YYYY-MM-DD'))
    if (dateRange?.[1]) params.set('to', dateRange[1].format('YYYY-MM-DD'))
    downloadCsv(`/stock-movements/export?${params}`, 'stock-movements.csv')
  }

  function getSourceLink(refType?: string, refId?: number) {
    if (!refType || !refId) return null
    const path = refType === 'SALE' || refType === 'SALE_RETURN' ? `/sales/${refId}` : `/purchase-orders/${refId}`
    const label = refType === 'SALE' ? `Sale #${refId}` : refType === 'SALE_RETURN' ? `Sale #${refId} (Return)` : `PO #${refId}`
    return (
      <a onClick={(e) => { e.stopPropagation(); navigate(path) }}
        style={{ cursor: 'pointer', color: '#2d6a4f', fontWeight: 500 }}>
        <LinkOutlined style={{ marginRight: 4 }} />{label}
      </a>
    )
  }

  const columns = [
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'Type', dataIndex: 'movementType', key: 'movementType',
      render: (v: string) => <Tag color={typeColors[v]}>{v}</Tag> },
    { title: 'Product', dataIndex: 'productName', key: 'productName',
      render: (v: string, r: StockMovement) => `${v} (${r.productSku || '-'})` },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity',
      render: (v: number, r: StockMovement) => `${v} ${r.productUomAbbr}` },
    { title: 'Batch', dataIndex: 'batchCode', key: 'batchCode', render: (v: string) => v || '-' },
    { title: 'Source', key: 'source',
      render: (_: unknown, r: StockMovement) => getSourceLink(r.referenceType, r.referenceId) || '-' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (v: string) => v || '-' },
    { title: 'By', dataIndex: 'createdBy', key: 'createdBy', render: (v: string) => v || '-' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Stock Movements</Typography.Title>
        <Button icon={<ExportOutlined />} onClick={handleExport}>Export CSV</Button>
      </div>

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
        <RangePicker value={dateRange} onChange={dates => { setDateRange(dates as any); setPage(1) }} />
        <Select placeholder="All Types" allowClear style={{ width: 160 }}
          value={movementType} onChange={v => { setMovementType(v); setPage(1) }}
          options={[{ label: 'IN', value: 'IN' }, { label: 'OUT', value: 'OUT' }, { label: 'ADJUSTMENT', value: 'ADJUSTMENT' }]} />
        {productId && <Button onClick={() => { setProductId(undefined); setProductSearch(''); setPage(1) }}>Clear</Button>}
      </div>

      <div className="table-container">
        <Table dataSource={movements} columns={columns} rowKey="id" loading={loading} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }} />
      </div>
    </div>
  )
}

export default StockMovementList
