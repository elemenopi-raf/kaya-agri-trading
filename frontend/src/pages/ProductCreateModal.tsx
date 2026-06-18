import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Form, Input, Select, Button, message } from 'antd'
import api from '../services/api'
import type { Category, UnitOfMeasure } from '../types'

interface Props {
  open: boolean
  onClose: () => void
}

function ProductCreateModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([])
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const categoryId = Form.useWatch('categoryId', form)

  useEffect(() => {
    if (open) {
      form.resetFields()
      setSuccess(false)
      api.get<Category[]>('/categories').then(setCategories).catch(() => {})
      api.get<UnitOfMeasure[]>('/uoms').then(setUoms).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (categoryId) {
      api.get<{ id: number; name: string }[]>(`/categories/${categoryId}/subcategories`)
        .then(setSubcategories)
        .catch(() => setSubcategories([]))
    } else {
      setSubcategories([])
    }
  }, [categoryId])

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
      setSubmitting(true)
      await api.post('/products', body)
      setSuccess(true)
    } catch (err: any) {
      message.error(err.message || 'Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Modal title="New Product" open={open && !success} onCancel={onClose} footer={null} destroyOnClose width={520}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Create</Button>
          </div>
        </Form>
      </Modal>
      <Modal title="Success" open={open && success} closable={false} footer={
        <Button type="primary" onClick={() => { onClose(); navigate('/products') }}>OK</Button>
      }>
        <p>Product created successfully!</p>
      </Modal>
    </>
  )
}

export default ProductCreateModal
