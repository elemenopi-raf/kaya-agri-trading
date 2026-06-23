import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, Button, Typography, Tag, Select, Space, Modal, message } from 'antd'
import { PlusOutlined, EyeOutlined, CloseCircleOutlined, CloseOutlined } from '@ant-design/icons'
import api from '../services/api'
import type { Sale, PagedResponse } from '../types'
import SaleCreateModal from './SaleCreateModal'

const statusColors: Record<string, string> = {
  PENDING: 'orange', COMPLETED: 'green', CANCELLED: 'red',
}

function SaleList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sales, setSales] = useState<Sale[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<Sale>>(`/sales?${params}`)
      .then(data => { setSales(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [status, page, location.state?.refresh])

  function handleBulkCancel() {
    const selected = sales.filter(s => selectedRowKeys.includes(s.id) && s.status === 'PENDING')
    if (selected.length === 0) {
      message.warning('No pending sales selected')
      return
    }
    Modal.confirm({
      title: 'Cancel Sales',
      content: `Are you sure you want to cancel ${selected.length} pending sale(s)? Stock will be restored.`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          for (const s of selected) {
            await api.put(`/sales/${s.id}/cancel`, {})
          }
          message.success(`${selected.length} sale(s) cancelled`)
          setSelectedRowKeys([])
          fetch()
        } catch (err: any) {
          message.error(err.message || 'Failed to cancel sales')
        }
      },
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Date', dataIndex: 'saleDate', key: 'saleDate' },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', align: 'right' as const,
      render: (v: number) => v.toFixed(2) },
    { title: 'Paid', dataIndex: 'paidAmount', key: 'paidAmount', align: 'right' as const,
      render: (v: number) => v.toFixed(2) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', render: (v: string) => v || '-' },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (r: Sale) => ({ disabled: r.status === 'CANCELLED' }),
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Sales</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Sale</Button>
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Select value={status} onChange={v => { setStatus(v); setPage(1) }} style={{ width: 160 }}
          options={[
            { label: 'All Statuses', value: '' },
            { label: 'PENDING', value: 'PENDING' },
            { label: 'COMPLETED', value: 'COMPLETED' },
            { label: 'CANCELLED', value: 'CANCELLED' },
          ]} />
      </Space>

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
          {selectedRowKeys.length === 1 && (
            <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => {
              const s = sales.find(s => s.id === selectedRowKeys[0])
              if (s) navigate(`/sales/${s.id}`)
            }}>View</Button>
          )}
          <Button size="small" danger icon={<CloseCircleOutlined />} onClick={handleBulkCancel}>Cancel Selected</Button>
          <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      <div className="table-container">
        <Table dataSource={sales} columns={columns} rowKey="id" loading={loading} rowSelection={rowSelection} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }}
          onRow={r => ({ onClick: () => navigate(`/sales/${r.id}`), style: { cursor: 'pointer' } })} />
      </div>
      <SaleCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default SaleList
