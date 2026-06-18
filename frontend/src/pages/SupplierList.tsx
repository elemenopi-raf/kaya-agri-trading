import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Input, Button, Typography, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import api from '../services/api'
import type { Supplier, PagedResponse } from '../types'
import SupplierCreateModal from './SupplierCreateModal'

function SupplierList() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
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
    api.get<PagedResponse<Supplier>>(`/suppliers?${params}`)
      .then(data => { setSuppliers(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [search, page])

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact', dataIndex: 'contactPerson', key: 'contactPerson', render: (v: string) => v || '-' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v || '-' },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Suppliers</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Supplier</Button>
      </div>
      <Input.Search placeholder="Search suppliers..." allowClear style={{ width: 300, marginBottom: 16 }}
        onSearch={v => { setSearch(v); setPage(1) }}
        onChange={e => { if (!e.target.value) { setSearch(''); setPage(1) } }} />
      <Table dataSource={suppliers} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: p => setPage(p) }}
        onRow={r => ({ onClick: () => navigate(`/suppliers/${r.id}/edit`), style: { cursor: 'pointer' } })} />
      <SupplierCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default SupplierList
