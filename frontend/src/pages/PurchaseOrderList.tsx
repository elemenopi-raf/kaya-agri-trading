import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, Select, Button, Typography, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import api from '../services/api'
import type { PurchaseOrder, PagedResponse } from '../types'
import PurchaseOrderCreateModal from './PurchaseOrderCreateModal'

const statusColors: Record<string, string> = {
  PENDING: 'orange', APPROVED: 'green', RECEIVED: 'blue', CANCELLED: 'red',
}

function PurchaseOrderList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    params.set('page', String(page - 1))
    params.set('pageSize', '20')
    api.get<PagedResponse<PurchaseOrder>>(`/purchase-orders?${params}`)
      .then(data => { setOrders(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [statusFilter, page, location.state?.refresh])

  const columns = [
    { title: 'PO Number', dataIndex: 'poNumber', key: 'poNumber' },
    { title: 'Supplier', dataIndex: 'supplierName', key: 'supplierName' },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
    { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate' },
    { title: 'Expected', dataIndex: 'expectedDate', key: 'expectedDate', render: (v: string) => v || '-' },
    { title: 'Items', key: 'items', render: (_: any, r: PurchaseOrder) => r.items?.length || 0 },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', render: (v: string) => v || '-' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Purchase Orders</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New PO</Button>
      </div>

      <Select placeholder="All Statuses" allowClear style={{ width: 200, marginBottom: 16 }}
        value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1) }}
        options={[
          { label: 'PENDING', value: 'PENDING' },
          { label: 'APPROVED', value: 'APPROVED' },
          { label: 'RECEIVED', value: 'RECEIVED' },
          { label: 'CANCELLED', value: 'CANCELLED' },
        ]} />

      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: p => setPage(p) }}
        onRow={r => ({ onClick: () => navigate(`/purchase-orders/${r.id}`), style: { cursor: 'pointer' } })} />
      <PurchaseOrderCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default PurchaseOrderList
