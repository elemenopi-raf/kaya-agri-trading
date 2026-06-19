import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, Input, Button, Typography, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import api from '../services/api'
import type { Customer, PagedResponse } from '../types'
import CustomerCreateModal from './CustomerCreateModal'

function CustomerList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(page - 1))
    params.set('pageSize', '20')
    api.get<PagedResponse<Customer>>(`/customers?${params}`)
      .then(data => { setCustomers(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [search, page, location.state?.refresh])

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v || '-' },
    { title: 'Address', dataIndex: 'address', key: 'address', render: (v: string) => v || '-' },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Customers</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Customer</Button>
      </div>
      <Input.Search placeholder="Search customers..." allowClear style={{ width: 300, marginBottom: 16 }}
        onSearch={v => { setSearch(v); setPage(1) }}
        onChange={e => { if (!e.target.value) { setSearch(''); setPage(1) } }} />
      <Table dataSource={customers} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: p => setPage(p) }}
        onRow={r => ({ onClick: () => navigate(`/customers/${r.id}/edit`), style: { cursor: 'pointer' } })} />
      <CustomerCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default CustomerList
