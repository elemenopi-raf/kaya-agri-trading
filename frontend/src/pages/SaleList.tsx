import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, Button, Typography, Tag, Select, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
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

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('page', String(page - 1))
    params.set('pageSize', '20')
    api.get<PagedResponse<Sale>>(`/sales?${params}`)
      .then(data => { setSales(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [status, page, location.state?.refresh])

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
      <Table dataSource={sales} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: p => setPage(p) }}
        onRow={r => ({ onClick: () => navigate(`/sales/${r.id}`), style: { cursor: 'pointer' } })} />
      <SaleCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default SaleList
