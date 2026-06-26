import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, Select, Button, Typography, Tag, Modal, message, Space, Input, Dropdown } from 'antd'
import { PlusOutlined, EyeOutlined, CloseCircleOutlined, CloseOutlined, MoreOutlined, CheckCircleOutlined, InboxOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import api from '../services/api'
import dayjs from 'dayjs'
import { useAuth } from '../context/AuthContext'
import type { PurchaseOrder, PagedResponse } from '../types'
import PurchaseOrderCreateModal from './PurchaseOrderCreateModal'

const statusColors: Record<string, string> = {
  PENDING: '#d97706', APPROVED: 'green', RECEIVED: 'blue', CANCELLED: 'red',
}

function PurchaseOrderList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const canWrite = user?.roles?.some(r => r === 'ADMIN' || r === 'MANAGER')
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<PurchaseOrder>>(`/purchase-orders?${params}`)
      .then(data => { setOrders(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [statusFilter, search, page, location.state?.refresh])

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

  async function updateStatus(po: PurchaseOrder, newStatus: string) {
    try {
      await api.put(`/purchase-orders/${po.id}/status`, { status: newStatus })
      message.success(`PO ${po.poNumber} ${newStatus.toLowerCase()}`)
      fetch()
    } catch (err: any) {
      message.error(err.message || 'Failed to update status')
    }
  }

  const columns = [
    { title: '#', key: 'rowNum', width: 50, render: (_: any, __: any, i: number) => (page - 1) * 10 + i + 1 },
    { title: 'PO Number', dataIndex: 'poNumber', key: 'poNumber' },
    { title: 'Supplier', dataIndex: 'supplierName', key: 'supplierName' },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
    { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'Expected', dataIndex: 'expectedDate', key: 'expectedDate',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'Items', key: 'items', render: (_: any, r: PurchaseOrder) => r.items?.length || 0 },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', render: (v: string) => v || '-' },
    {
      title: '', key: 'actions', width: 48,
      render: (_: any, record: PurchaseOrder) => {
        if (selectedRowKeys.length > 0) return null
        const items: MenuProps['items'] = [
          { key: 'view', icon: <EyeOutlined />, label: 'View', onClick: () => navigate(`/purchase-orders/${record.id}`) },
        ]
        if (record.status === 'PENDING' && canWrite) {
          items.push({ type: 'divider' })
          items.push({ key: 'approve', icon: <CheckCircleOutlined />, label: 'Approve',
            onClick: () => Modal.confirm({
              title: 'Approve PO',
              content: `Are you sure you want to approve ${record.poNumber}?`,
              onOk: () => updateStatus(record, 'APPROVED'),
            }) })
          items.push({ key: 'cancel', icon: <CloseCircleOutlined />, label: 'Cancel', danger: true,
            onClick: () => Modal.confirm({
              title: 'Cancel PO',
              content: `Are you sure you want to cancel ${record.poNumber}?`,
              okButtonProps: { danger: true },
              onOk: () => updateStatus(record, 'CANCELLED'),
            }) })
        }
        if (record.status === 'APPROVED' && canWrite) {
          items.push({ type: 'divider' })
          items.push({ key: 'receive', icon: <InboxOutlined />, label: 'Receive (Add to Stock)',
            onClick: () => Modal.confirm({
              title: 'Receive PO',
              content: `This will mark items as received and update stock levels for ${record.poNumber}. Continue?`,
              onOk: () => updateStatus(record, 'RECEIVED'),
            }) })
          items.push({ key: 'cancel', icon: <CloseCircleOutlined />, label: 'Cancel', danger: true,
            onClick: () => Modal.confirm({
              title: 'Cancel PO',
              content: `Are you sure you want to cancel ${record.poNumber}?`,
              okButtonProps: { danger: true },
              onOk: () => updateStatus(record, 'CANCELLED'),
            }) })
        }
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button size="small" type="text" icon={<MoreOutlined />} onClick={e => e.stopPropagation()} />
          </Dropdown>
        )
      },
    },
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
        {canWrite && <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New PO</Button>}
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Search PO # or supplier..." allowClear style={{ width: 240 }}
          onSearch={v => { setSearch(v); setPage(1) }}
          onChange={e => { if (!e.target.value) { setSearch(''); setPage(1) } }} />
        <Select placeholder="All Statuses" allowClear style={{ width: 200 }}
          value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1) }}
          options={[
            { label: 'PENDING', value: 'PENDING' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'RECEIVED', value: 'RECEIVED' },
            { label: 'CANCELLED', value: 'CANCELLED' },
          ]} />
      </Space>

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
          {selectedRowKeys.length === 1 && (
            <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => {
              const o = orders.find(o => o.id === selectedRowKeys[0])
              if (o) navigate(`/purchase-orders/${o.id}`)
            }}>View</Button>
          )}
          {canWrite && <Button size="small" danger icon={<CloseCircleOutlined />} onClick={handleBulkCancel}>Cancel Selected</Button>}
          <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      <div className="table-container">
        <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} rowSelection={rowSelection} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }}
        />
      </div>
      <PurchaseOrderCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default PurchaseOrderList
