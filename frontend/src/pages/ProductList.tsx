import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Table, Select, Input, Button, Typography, Tag, Modal, message, Dropdown } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, CloseOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Product, PagedResponse, Category } from '../types'
import ProductCreateModal from './ProductCreateModal'
import ProductViewModal from './ProductViewModal'
import ProductEditModal from './ProductEditModal'

function ProductList() {
  const location = useLocation()
  const { user } = useAuth()
  const canWrite = user?.roles?.some(r => r === 'ADMIN' || r === 'MANAGER')
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([])
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (categoryId) {
      api.get<{ id: number; name: string }[]>(`/categories/${categoryId}/subcategories`)
        .then(setSubcategories)
        .catch(() => setSubcategories([]))
    } else {
      setSubcategories([])
      setSubcategoryId(undefined)
    }
  }, [categoryId])

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId) params.set('categoryId', String(categoryId))
    if (subcategoryId) params.set('subcategoryId', String(subcategoryId))
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<Product>>(`/products?${params}`)
      .then(data => { setProducts(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [search, categoryId, subcategoryId, page, location.state?.refresh])

  function handleView(product: Product) {
    setViewingProduct(product)
    setViewModalOpen(true)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setEditModalOpen(true)
  }

  function handleDelete(product: Product) {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${product.name}"?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/products/${product.id}`)
          message.success('Product deleted')
          fetch()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete product')
        }
      },
    })
  }

  function handleBulkDelete() {
    const selected = products.filter(p => selectedRowKeys.includes(p.id))
    Modal.confirm({
      title: 'Delete Products',
      content: `Are you sure you want to delete ${selected.length} product(s)?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          for (const p of selected) {
            await api.delete(`/products/${p.id}`)
          }
          message.success(`${selected.length} product(s) deleted`)
          setSelectedRowKeys([])
          fetch()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete products')
        }
      },
    })
  }

  const columns = [
    { title: '#', key: 'rowNum', width: 50, render: (_: any, __: any, i: number) => (page - 1) * 10 + i + 1 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'Subcategory', dataIndex: 'subcategoryName', key: 'subcategoryName' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v: string) => v || '-' },
    { title: 'Price', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => v.toFixed(2) },
    {
      title: 'Stock', dataIndex: 'currentStock', key: 'currentStock',
      render: (v: number, r: Product) => {
        const low = r.active && r.reorderLevel > 0 && v <= r.reorderLevel
        return <span style={{ fontWeight: low ? 'bold' : undefined, color: v === 0 ? '#dc3545' : low ? '#856404' : undefined }}>{v}</span>
      },
    },
    { title: 'UOM', dataIndex: 'unitOfMeasureAbbr', key: 'unitOfMeasureAbbr' },
    {
      title: 'Active', dataIndex: 'active', key: 'active',
      render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
    },
    {
      title: '', key: 'actions', width: 48,
      render: (_: any, record: Product) => {
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
        <Typography.Title level={3} style={{ margin: 0 }}>Products</Typography.Title>
        {canWrite && <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Product</Button>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Input.Search placeholder="Search products..." allowClear
          onSearch={v => { setSearch(v); setPage(1) }}
          onChange={e => { if (!e.target.value) { setSearch(''); setPage(1) } }}
          style={{ width: 300 }} />
        <Select placeholder="All Categories" allowClear style={{ width: 200 }}
          value={categoryId} onChange={v => { setCategoryId(v); setSubcategoryId(undefined); setPage(1) }}
          options={categories.map(c => ({ label: c.name, value: c.id }))} />
        <Select placeholder="All Subcategories" allowClear style={{ width: 200 }} disabled={!categoryId}
          value={subcategoryId} onChange={v => { setSubcategoryId(v); setPage(1) }}
          options={subcategories.map(s => ({ label: s.name, value: s.id }))} />
      </div>

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
          {canWrite && selectedRowKeys.length === 1 && (
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => {
              const p = products.find(p => p.id === selectedRowKeys[0])
              if (p) handleEdit(p)
            }}>Edit</Button>
          )}
          {canWrite && (
            <Button size="small" danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>Delete ({selectedRowKeys.length})</Button>
          )}
          <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      <div className="table-container">
        <Table dataSource={products} columns={columns} rowKey="id" loading={loading} rowSelection={rowSelection} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }} />
      </div>
      <ProductCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ProductViewModal product={viewingProduct} open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete} />
      <ProductEditModal product={editingProduct} open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingProduct(null) }}
        onSuccess={fetch} />
    </div>
  )
}

export default ProductList
