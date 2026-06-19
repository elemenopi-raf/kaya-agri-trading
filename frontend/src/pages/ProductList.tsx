import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, Select, Input, Button, Typography, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Product, PagedResponse, Category } from '../types'
import ProductCreateModal from './ProductCreateModal'

function ProductList() {
  const navigate = useNavigate()
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
    params.set('pageSize', '20')
    api.get<PagedResponse<Product>>(`/products?${params}`)
      .then(data => { setProducts(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [search, categoryId, subcategoryId, page, location.state?.refresh])

  const columns = [
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
  ]

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

      <Table dataSource={products} columns={columns} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: p => setPage(p) }}
        onRow={r => ({ onClick: () => navigate(`/products/${r.id}/edit`), style: { cursor: 'pointer' } })} />
      <ProductCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default ProductList
