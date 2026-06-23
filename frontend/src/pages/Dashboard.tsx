import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Typography, Spin } from 'antd'
import { PlusOutlined, ShoppingOutlined, SwapOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { PagedResponse, Product } from '../types'
import ProductCreateModal from './ProductCreateModal'
import PurchaseOrderCreateModal from './PurchaseOrderCreateModal'
import StockMovementCreateModal from './StockMovementCreateModal'
import QuickRestockModal from './QuickRestockModal'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading...')
  const [lowStockItems, setLowStockItems] = useState<Product[]>([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [poModalOpen, setPoModalOpen] = useState(false)
  const [movementModalOpen, setMovementModalOpen] = useState(false)
  const [restockProduct, setRestockProduct] = useState<Product | null>(null)
  const [restockModalOpen, setRestockModalOpen] = useState(false)

  const canWrite = user?.roles?.some(r => r === 'ADMIN' || r === 'MANAGER')

  function fetchLowStock() {
    return api.get<PagedResponse<Product>>('/products/low-stock?pageSize=5')
      .then(data => { setLowStockItems(data.items); setLowStockCount(data.totalCount) })
      .catch(() => {})
  }

  useEffect(() => {
    api.get<{ status: string }>('/health')
      .then(data => setStatus(data.status))
      .catch(err => setStatus(`error: ${err.message}`))

    fetchLowStock()
    .finally(() => setLoading(false))
  }, [])

  const columns = [
    { title: 'Product', dataIndex: 'name', key: 'name' },
    {
      title: 'Stock', dataIndex: 'currentStock', key: 'currentStock',
      render: (v: number, r: Product) => (
        <span style={{ fontWeight: 'bold', color: v === 0 ? '#dc3545' : '#856404' }}>
          {v} {r.unitOfMeasureAbbr}
        </span>
      ),
    },
    { title: 'Reorder At', dataIndex: 'reorderLevel', key: 'reorderLevel',
      render: (v: number, r: Product) => `${v} ${r.unitOfMeasureAbbr}`,
    },
  ]

  return (
    <div>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Typography.Text type="secondary">Backend status: {status}</Typography.Text>

      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        {canWrite && <Col span={4}><Card hoverable onClick={() => setProductModalOpen(true)}>
          <PlusOutlined /> New Product
        </Card></Col>}
        {canWrite && <Col span={4}><Card hoverable onClick={() => setMovementModalOpen(true)}>
          <SwapOutlined /> Record Movement
        </Card></Col>}
        <Col span={4}><Card hoverable onClick={() => navigate('/products')}>
          <ShoppingOutlined /> View Products
        </Card></Col>
        <Col span={4}><Card hoverable onClick={() => navigate('/stock-movements')}>
          <SwapOutlined /> View Movements
        </Card></Col>
        {canWrite && <Col span={4}><Card hoverable onClick={() => setPoModalOpen(true)}>
          <ShoppingCartOutlined /> New PO
        </Card></Col>}
      </Row>

      {loading ? <Spin /> : lowStockCount > 0 && (
        <Card title={<span style={{ color: '#856404' }}>⚠ Low Stock Alert ({lowStockCount})</span>}
          style={{ background: '#fff3cd', borderColor: '#ffc107' }}>
          <Table dataSource={lowStockItems} columns={columns} rowKey="id" pagination={false} size="small"
            onRow={r => canWrite ? ({ onClick: () => { setRestockProduct(r); setRestockModalOpen(true) }, style: { cursor: 'pointer' } }) : {}} />
        </Card>
      )}

      <ProductCreateModal open={productModalOpen} onClose={() => setProductModalOpen(false)} />
      <PurchaseOrderCreateModal open={poModalOpen} onClose={() => setPoModalOpen(false)} />
      <StockMovementCreateModal open={movementModalOpen} onClose={() => setMovementModalOpen(false)} />
      <QuickRestockModal product={restockProduct} open={restockModalOpen}
        onClose={() => setRestockModalOpen(false)} onSuccess={fetchLowStock} />
    </div>
  )
}

export default Dashboard
