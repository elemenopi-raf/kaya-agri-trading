import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Table, Input, Button, Typography, Tag, Modal, message } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons'
import api from '../services/api'
import type { Customer, PagedResponse } from '../types'
import CustomerCreateModal from './CustomerCreateModal'
import CustomerViewModal from './CustomerViewModal'
import CustomerEditModal from './CustomerEditModal'

function CustomerList() {
  const location = useLocation()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<Customer>>(`/customers?${params}`)
      .then(data => { setCustomers(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [search, page, location.state?.refresh])

  function handleView(customer: Customer) {
    setViewingCustomer(customer)
    setViewModalOpen(true)
  }

  function handleEdit(customer: Customer) {
    setEditingCustomer(customer)
    setEditModalOpen(true)
  }

  function handleDelete(customer: Customer) {
    Modal.confirm({
      title: 'Delete Customer',
      content: `Are you sure you want to delete "${customer.name}"?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/customers/${customer.id}`)
          message.success('Customer deleted')
          fetch()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete customer')
        }
      },
    })
  }

  function handleBulkDelete() {
    const selected = customers.filter(c => selectedRowKeys.includes(c.id))
    Modal.confirm({
      title: 'Delete Customers',
      content: `Are you sure you want to delete ${selected.length} customer(s)?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          for (const c of selected) {
            await api.delete(`/customers/${c.id}`)
          }
          message.success(`${selected.length} customer(s) deleted`)
          setSelectedRowKeys([])
          fetch()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete customers')
        }
      },
    })
  }

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v || '-' },
    { title: 'Address', dataIndex: 'address', key: 'address', render: (v: string) => v || '-' },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Customers</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Customer</Button>
      </div>
      <Input.Search placeholder="Search customers..." allowClear style={{ width: 300, marginBottom: 16 }}
        onSearch={v => { setSearch(v); setPage(1) }}
        onChange={e => { if (!e.target.value) { setSearch(''); setPage(1) } }} />

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
          {selectedRowKeys.length === 1 && (
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => {
              const c = customers.find(c => c.id === selectedRowKeys[0])
              if (c) handleEdit(c)
            }}>Edit</Button>
          )}
          <Button size="small" danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>Delete ({selectedRowKeys.length})</Button>
          <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      <div className="table-container">
        <Table dataSource={customers} columns={columns} rowKey="id" loading={loading} rowSelection={rowSelection} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }}
          onRow={r => ({ onClick: () => handleView(r), style: { cursor: 'pointer' } })} />
      </div>
      <CustomerCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <CustomerViewModal customer={viewingCustomer} open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete} />
      <CustomerEditModal customer={editingCustomer} open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingCustomer(null) }}
        onSuccess={fetch} />
    </div>
  )
}

export default CustomerList
