import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Table, Input, Button, Typography, Tag, Modal, message, Dropdown } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, CloseOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Supplier, PagedResponse } from '../types'
import SupplierCreateModal from './SupplierCreateModal'
import SupplierViewModal from './SupplierViewModal'
import SupplierEditModal from './SupplierEditModal'

function SupplierList() {
  const location = useLocation()
  const { user } = useAuth()
  const canWrite = user?.roles?.some(r => r === 'ADMIN' || r === 'MANAGER')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<Supplier>>(`/suppliers?${params}`)
      .then(data => { setSuppliers(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [search, page, location.state?.refresh])

  function handleView(supplier: Supplier) {
    setViewingSupplier(supplier)
    setViewModalOpen(true)
  }

  function handleEdit(supplier: Supplier) {
    setEditingSupplier(supplier)
    setEditModalOpen(true)
  }

  function handleDelete(supplier: Supplier) {
    Modal.confirm({
      title: 'Delete Supplier',
      content: `Are you sure you want to delete "${supplier.name}"?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/suppliers/${supplier.id}`)
          message.success('Supplier deleted')
          fetch()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete supplier')
        }
      },
    })
  }

  function handleBulkDelete() {
    const selected = suppliers.filter(s => selectedRowKeys.includes(s.id))
    Modal.confirm({
      title: 'Delete Suppliers',
      content: `Are you sure you want to delete ${selected.length} supplier(s)?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          for (const s of selected) {
            await api.delete(`/suppliers/${s.id}`)
          }
          message.success(`${selected.length} supplier(s) deleted`)
          setSelectedRowKeys([])
          fetch()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete suppliers')
        }
      },
    })
  }

  const columns = [
    { title: '#', key: 'rowNum', width: 50, render: (_: any, __: any, i: number) => (page - 1) * 10 + i + 1 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact', dataIndex: 'contactPerson', key: 'contactPerson', render: (v: string) => v || '-' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v || '-' },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    {
      title: '', key: 'actions', width: 48,
      render: (_: any, record: Supplier) => {
        const items: MenuProps['items'] = [
          { key: 'view', icon: <EyeOutlined />, label: 'View', onClick: () => handleView(record) },
        ]
        if (canWrite) {
          items.push({ key: 'edit', icon: <EditOutlined />, label: 'Edit', onClick: () => handleEdit(record) })
          items.push({ type: 'divider' })
          items.push({ key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => handleDelete(record) })
        }
        return selectedRowKeys.length > 0 ? null : (
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
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Suppliers</Typography.Title>
        {canWrite && <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Supplier</Button>}
      </div>
      <Input.Search placeholder="Search suppliers..." allowClear style={{ width: 300, marginBottom: 16 }}
        onSearch={v => { setSearch(v); setPage(1) }}
        onChange={e => { if (!e.target.value) { setSearch(''); setPage(1) } }} />

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
          {canWrite && selectedRowKeys.length === 1 && (
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => {
              const s = suppliers.find(s => s.id === selectedRowKeys[0])
              if (s) handleEdit(s)
            }}>Edit</Button>
          )}
          {canWrite && (
            <Button size="small" danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>Delete ({selectedRowKeys.length})</Button>
          )}
          <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      <div className="table-container">
        <Table dataSource={suppliers} columns={columns} rowKey="id" loading={loading} rowSelection={rowSelection} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }} />
      </div>
      <SupplierCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <SupplierViewModal supplier={viewingSupplier} open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete} />
      <SupplierEditModal supplier={editingSupplier} open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingSupplier(null) }}
        onSuccess={fetch} />
    </div>
  )
}

export default SupplierList
