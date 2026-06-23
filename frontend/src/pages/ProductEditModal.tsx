import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import api from '../services/api'
import type { Product, Category, UnitOfMeasure } from '../types'

interface Props {
  product: Product | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function ProductEditModal({ product, open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([])
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([])
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
    if (product && open) {
      form.setFieldsValue({
        name: product.name,
        sku: product.sku || '',
        description: product.description || '',
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        unitOfMeasureId: product.unitOfMeasureId,
        unitPrice: product.unitPrice,
        reorderLevel: product.reorderLevel,
      })
    }
  }, [product, open, form])

  async function handleSubmit() {
    if (!product) return
    try {
      setLoading(true)
      const values = await form.validateFields()
      await api.put(`/products/${product.id}`, {
        subcategoryId: values.subcategoryId,
        name: values.name.trim(),
        sku: values.sku?.trim() || undefined,
        description: values.description?.trim() || undefined,
        unitOfMeasureId: values.unitOfMeasureId,
        unitPrice: String(values.unitPrice || ''),
        reorderLevel: String(values.reorderLevel || ''),
      })
      message.success('Product updated')
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err.message) message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Edit Product" open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={loading}
      width={600} destroyOnClose>
      <Form form={form} layout="vertical">
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
      </Form>
    </Modal>
  )
}

export default ProductEditModal
