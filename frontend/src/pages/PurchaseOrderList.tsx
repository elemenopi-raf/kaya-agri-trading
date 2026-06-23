import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, Select, Button, Typography, Tag, Modal, message } from 'antd'
import { PlusOutlined, EyeOutlined, CloseCircleOutlined, CloseOutlined } from '@ant-design/icons'
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<PurchaseOrder>>(`/purchase-orders?${params}`)
      .then(data => { setOrders(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [statusFilter, page, location.state?.refresh])

  function handleBulkCancel() {
    const selected = orders.filter(o => selectedRowKeys.includes(o.id) && o.status !== 'RECEIVED' && o.status !== 'CANCELLED')
    if (selected.length === 0) {
      message.warning('No cancellable POs selected')
      return
    }
    Modal.confirm({
      title: 'Cancel Purchase Orders',
      content: `Are you sure you want to cancel ${selected.length} PO(s)?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          for (const o of selected) {
            await api.put(`/purchase-orders/${o.id}/status`, { status: 'CANCELLED' })
          }
          message.success(`${selected.length} PO(s) cancelled`)
          setSelectedRowKeys([])
          fetch()
        } catch (err: any) {
          message.error(err.message || 'Failed to cancel POs')
        }
      },
    })
  }

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

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (r: PurchaseOrder) => ({ disabled: r.status === 'RECEIVED' || r.status === 'CANCELLED' }),
  }

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

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
          {selectedRowKeys.length === 1 && (
            <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => {
              const o = orders.find(o => o.id === selectedRowKeys[0])
              if (o) navigate(`/purchase-orders/${o.id}`)
            }}>View</Button>
          )}
          <Button size="small" danger icon={<CloseCircleOutlined />} onClick={handleBulkCancel}>Cancel Selected</Button>
          <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      <div className="table-container">
        <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} rowSelection={rowSelection} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }}
          onRow={r => ({ onClick: () => navigate(`/purchase-orders/${r.id}`), style: { cursor: 'pointer' } })} />
      </div>
      <PurchaseOrderCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default PurchaseOrderList
