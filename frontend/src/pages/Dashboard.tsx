import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Spin, Tag, InputNumber, Button } from 'antd'
import {
  PlusOutlined, SwapOutlined, ShoppingCartOutlined,
  EyeOutlined, FileTextOutlined, AppstoreOutlined, WarningOutlined,
} from '@ant-design/icons'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { PagedResponse, Product, DashboardResponse, SalesTrendPoint, TopProduct } from '../types'
import ProductCreateModal from './ProductCreateModal'
import PurchaseOrderCreateModal from './PurchaseOrderCreateModal'
import StockMovementCreateModal from './StockMovementCreateModal'
import QuickRestockModal from './QuickRestockModal'

const statusColors: Record<string, string> = {
  PENDING: '#d97706', COMPLETED: 'green', CANCELLED: 'red',
}

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading...')
  const [dash, setDash] = useState<DashboardResponse | null>(null)
  const [lowStockItems, setLowStockItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [poModalOpen, setPoModalOpen] = useState(false)
  const [movementModalOpen, setMovementModalOpen] = useState(false)
  const [restockProduct, setRestockProduct] = useState<Product | null>(null)
  const [restockModalOpen, setRestockModalOpen] = useState(false)

  const [trendDays, setTrendDays] = useState<7 | 30>(7)
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const thresholdStr = localStorage.getItem('lowStockThreshold') || '0'
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(parseInt(thresholdStr, 10) || 0)

  const canWrite = user?.roles?.some(r => r === 'ADMIN' || r === 'MANAGER')
  const isAdmin = user?.roles?.includes('ADMIN')

  const fetchDashboard = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get<{ status: string }>('/health'),
      api.get<DashboardResponse>('/dashboard'),
      api.get<PagedResponse<Product>>(`/products/low-stock?pageSize=5&threshold=${lowStockThreshold}`),
      api.get<SalesTrendPoint[]>(`/dashboard/sales-trend?days=${trendDays}`),
      api.get<TopProduct[]>('/dashboard/top-products?limit=5'),
    ])
      .then(([health, dashboard, lowStock, trend, top]) => {
        setStatus(health.status)
        setDash(dashboard)
        setLowStockItems(lowStock.items)
        setSalesTrend(trend)
        setTopProducts(top)
      })
      .catch(err => setStatus(`error: ${err.message}`))
      .finally(() => setLoading(false))
  }, [trendDays, lowStockThreshold])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const handleThresholdChange = (val: number | null) => {
    const v = val ?? 0
    setLowStockThreshold(v)
    localStorage.setItem('lowStockThreshold', String(v))
  }

  const todayCompleted = dash?.todayCompletedSales ?? 0
  const todayPending = dash?.todayPendingSales ?? 0
  const todayTotal = dash?.todaySalesTotal ?? 0

  const lowStockNames = lowStockItems.slice(0, 3).map(p => p.name).join(', ')

  const maxQty = topProducts.length > 0 ? Math.max(...topProducts.map(p => p.totalQty)) : 1

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Dashboard</Typography.Title>
        {isAdmin && <Typography.Text type="secondary">Backend: {status}</Typography.Text>}
      </div>

      {loading ? <Spin style={{ display: 'block', marginTop: 48 }} /> : (
        <>
          {/* Stat Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Today's Sales */}
            <Col xs={12} sm={6}>
              <div style={{
                background: '#fff', borderRadius: 12, padding: '20px 20px 16px',
                borderLeft: '4px solid #2d6a4f', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(0,0,0,0.45)' }}>
                    Today's Sales
                  </span>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(45,106,79,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EyeOutlined style={{ color: '#2d6a4f', fontSize: 16 }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(0,0,0,0.85)', marginBottom: 4 }}>
                  ₱{todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', lineHeight: 1.5 }}>
                  {dash?.todaySalesCount || 0} orders
                  {todayTotal > 0 && (
                    <> · <span style={{ color: '#2d6a4f', fontWeight: 500 }}>₱{todayCompleted.toFixed(2)}</span> completed
                      · <span style={{ color: '#d97706', fontWeight: 500 }}>₱{todayPending.toFixed(2)}</span> pending</>
                  )}
                </div>
              </div>
            </Col>

            {/* Pending POs */}
            <Col xs={12} sm={6}>
              <div style={{
                background: '#fff', borderRadius: 12, padding: '20px 20px 16px',
                borderLeft: '4px solid #1890ff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(0,0,0,0.45)' }}>
                    Pending POs
                  </span>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(24,144,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileTextOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(0,0,0,0.85)', marginBottom: 4 }}>
                  {dash?.pendingPOCount || 0}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
                  Purchase orders awaiting approval
                </div>
              </div>
            </Col>

            {/* Active Products */}
            <Col xs={12} sm={6}>
              <div
                onClick={() => navigate('/products')}
                style={{
                  background: '#fff', borderRadius: 12, padding: '20px 20px 16px',
                  borderLeft: '4px solid #52c41a', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  cursor: 'pointer', transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(0,0,0,0.45)' }}>
                    Active Products
                  </span>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(82,196,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AppstoreOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'rgba(0,0,0,0.85)', marginBottom: 4 }}>
                  {dash?.totalProducts || 0}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
                  SKUs currently in catalog
                </div>
              </div>
            </Col>

            {/* Low Stock Items */}
            <Col xs={12} sm={6}>
              <div
                onClick={() => navigate('/products')}
                style={{
                  background: '#fff', borderRadius: 12, padding: '20px 20px 16px',
                  borderLeft: '4px solid #faad14', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  cursor: 'pointer', transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(0,0,0,0.45)' }}>
                    Low Stock Items
                  </span>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(250,173,20,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: (dash?.lowStockCount || 0) > 0 ? '#d97706' : 'rgba(0,0,0,0.85)', marginBottom: 4 }}>
                  {dash?.lowStockCount || 0}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lowStockNames || 'All stock levels OK'}
                </div>
              </div>
            </Col>
          </Row>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {canWrite && (
              <Button icon={<PlusOutlined />} onClick={() => setProductModalOpen(true)}>
                New Product
              </Button>
            )}
            {canWrite && (
              <Button icon={<SwapOutlined />} onClick={() => setMovementModalOpen(true)}>
                Record Movement
              </Button>
            )}
            <Button icon={<AppstoreOutlined />} onClick={() => navigate('/products')}>
              View Products
            </Button>
            <Button icon={<SwapOutlined />} onClick={() => navigate('/stock-movements')}>
              View Movements
            </Button>
            {canWrite && (
              <Button icon={<ShoppingCartOutlined />} onClick={() => setPoModalOpen(true)}>
                New PO
              </Button>
            )}
          </div>

          {/* Charts Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Sales Trend */}
            <Col xs={24} lg={16}>
              <Card style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>Sales Trend</div>
                    <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Last {trendDays} days</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="small" type={trendDays === 7 ? 'primary' : 'default'} onClick={() => setTrendDays(7)}>7 days</Button>
                    <Button size="small" type={trendDays === 30 ? 'primary' : 'default'} onClick={() => setTrendDays(30)}>30 days</Button>
                  </div>
                </div>
                {salesTrend.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={salesTrend}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2d6a4f" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#2d6a4f" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} tickFormatter={v => `₱${v}`} />
                        <Tooltip formatter={(v: any) => `₱${Number(v).toFixed(2)}`} />
                        <Area type="monotone" dataKey="total" stroke="#2d6a4f" strokeWidth={2} fill="url(#salesGradient)" dot={{ r: 3, fill: '#2d6a4f' }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                      {salesTrend.slice(-7).map((point, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>{point.date}</div>
                          <div style={{ fontWeight: 600, color: 'rgba(0,0,0,0.65)' }}>₱{point.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 48, color: 'rgba(0,0,0,0.25)' }}>No sales data</div>
                )}
              </Card>
            </Col>

            {/* Top Products by Movement */}
            <Col xs={24} lg={8}>
              <Card style={{ borderRadius: 12, height: '100%' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>Top Products by Movement</div>
                  <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Total units moved this period</div>
                </div>
                {topProducts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {topProducts.map((p, i) => (
                      <div key={p.productId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.45)', width: 16, flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', width: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {p.productName}
                        </span>
                        <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 4, background: '#2d6a4f',
                            width: `${(p.totalQty / maxQty) * 100}%`,
                            transition: 'width 0.3s',
                          }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.65)', width: 28, flexShrink: 0 }}>
                          {p.totalQty}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 32, color: 'rgba(0,0,0,0.25)' }}>No product data</div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Low Stock Alert */}
          {(dash?.lowStockCount || 0) > 0 && (
            <Card
              title={
                <span style={{ color: '#d97706', fontWeight: 600 }}>
                  <WarningOutlined /> Low Stock Alert — {dash?.lowStockCount} items below threshold
                </span>
              }
              extra={
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                  Threshold: <InputNumber size="small" min={0} max={9999} value={lowStockThreshold}
                    onChange={handleThresholdChange} style={{ width: 70 }} />
                </span>
              }
              style={{ background: '#fff8e6', borderColor: '#ffd666', marginBottom: 24, borderRadius: 12 }}
            >
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {lowStockItems.map(p => (
                  <div
                    key={p.id}
                    onClick={() => canWrite ? (setRestockProduct(p), setRestockModalOpen(true)) : undefined}
                    style={{
                      border: '1px solid #ffd666', borderRadius: 8, padding: '12px 16px',
                      background: '#fff', minWidth: 180, flex: '1 1 auto', maxWidth: 280,
                      cursor: canWrite ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(217,119,6,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.85)', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: '#d97706', fontWeight: 500 }}>
                      {p.currentStock} {p.unitOfMeasureAbbr} remaining
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Sales */}
          {dash?.recentSales && dash.recentSales.length > 0 && (
            <Card title="Recent Sales" style={{ marginBottom: 24, borderRadius: 12 }}>
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#edf2ed' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>#</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Total</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Date / Time</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dash.recentSales.map((sale, i) => (
                      <tr
                        key={sale.id}
                        onClick={() => navigate(`/sales/${sale.id}`)}
                        style={{
                          cursor: 'pointer',
                          background: i % 2 === 1 ? '#f9fafb' : '#fff',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#eef5ee')}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? '#f9fafb' : '#fff')}
                      >
                        <td style={{ padding: '10px 12px' }}>{i + 1}</td>
                        <td style={{ padding: '10px 12px' }}>{sale.customerName}</td>
                        <td style={{ padding: '10px 12px' }}>₱{sale.totalAmount.toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', color: 'rgba(0,0,0,0.45)' }}>
                          {sale.createdAt ? sale.createdAt.replace('T', ' ').split('.')[0] : '-'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <Tag color={statusColors[sale.status]}>{sale.status}</Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      <ProductCreateModal open={productModalOpen} onClose={() => setProductModalOpen(false)} />
      <PurchaseOrderCreateModal open={poModalOpen} onClose={() => setPoModalOpen(false)} />
      <StockMovementCreateModal open={movementModalOpen} onClose={() => setMovementModalOpen(false)} />
      <QuickRestockModal product={restockProduct} open={restockModalOpen}
        onClose={() => setRestockModalOpen(false)} onSuccess={fetchDashboard} />
    </div>
  )
}

export default Dashboard
