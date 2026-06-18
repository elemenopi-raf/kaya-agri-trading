import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Button, Typography, Spin, message } from 'antd'
import api from '../services/api'
import type { Product, Category, UnitOfMeasure } from '../types'

function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([])
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([])
  const [loading, setLoading] = useState(isEdit)
  const categoryId = Form.useWatch('categoryId', form)

  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories).catch(() => {})
    api.get<UnitOfMeasure[]>('/uoms').then(setUoms).catch(() => {})
  }, [])

  useEffect(() => {
    if (categoryId) {
      api.get<{ id: number; name: string }[]>(`/categories/${categoryId}/subcategories`)
        .then(setSubcategories)
        .catch(() => setSubcategories([]))
    } else {
      setSubcategories([])
    }
  }, [categoryId])

  useEffect(() => {
    if (isEdit && id) {
      api.get<Product>(`/products/${id}`)
        .then(p => {
          form.setFieldsValue({
            name: p.name, sku: p.sku, description: p.description,
            categoryId: p.categoryId, subcategoryId: p.subcategoryId,
            unitOfMeasureId: p.unitOfMeasureId,
            unitPrice: p.unitPrice, reorderLevel: p.reorderLevel,
          })
          setSubcategories([])
        })
        .catch(() => navigate('/products'))
        .finally(() => setLoading(false))
    }
  }, [isEdit, id])

  async function handleSubmit(values: any) {
    const body = {
      subcategoryId: values.subcategoryId,
      name: values.name.trim(),
      sku: values.sku?.trim() || undefined,
      description: values.description?.trim() || undefined,
      unitOfMeasureId: values.unitOfMeasureId,
      unitPrice: String(values.unitPrice || ''),
      reorderLevel: String(values.reorderLevel || ''),
    }
    try {
      if (isEdit) { await api.put(`/products/${id}`, body) }
      else { await api.post('/products', body) }
      message.success(isEdit ? 'Product updated' : 'Product created')
      navigate('/products')
    } catch (err: any) {
      message.error(err.message || 'Failed to save product')
    }
  }

  if (loading) return <Spin />

  return (
    <div style={{ maxWidth: 600 }}>
      <Typography.Title level={3}>{isEdit ? 'Edit Product' : 'New Product'}</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="sku" label="SKU">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: 'Select a category' }]}>
          <Select placeholder="Select category"
            options={categories.map(c => ({ label: c.name, value: c.id }))} />
        </Form.Item>
        <Form.Item name="subcategoryId" label="Subcategory" rules={[{ required: true, message: 'Select a subcategory' }]}>
          <Select placeholder="Select subcategory"
            options={subcategories.map(s => ({ label: s.name, value: s.id }))} />
        </Form.Item>
        <Form.Item name="unitOfMeasureId" label="Unit of Measure" rules={[{ required: true, message: 'Select a UOM' }]}>
          <Select placeholder="Select UOM"
            options={uoms.map(u => ({ label: `${u.name} (${u.abbreviation})`, value: u.id }))} />
        </Form.Item>
        <Form.Item name="unitPrice" label="Unit Price">
          <Input type="number" step="0.01" />
        </Form.Item>
        <Form.Item name="reorderLevel" label="Reorder Level">
          <Input type="number" step="0.01" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{isEdit ? 'Update' : 'Create'}</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/products')}>Cancel</Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default ProductForm
