import { Modal, Descriptions, Tag, Button } from 'antd'
import type { Product } from '../types'

interface Props {
  product: Product | null
  open: boolean
  onClose: () => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

function ProductViewModal({ product, open, onClose, onEdit, onDelete }: Props) {
  if (!product) return null

  return (
    <Modal title="Product Details" open={open} onCancel={onClose} width={600}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button size="small" onClick={onClose}>Close</Button>
          <Button size="small" onClick={() => { onClose(); onEdit(product) }}>Edit</Button>
          <Button size="small" danger onClick={() => { onClose(); onDelete(product) }}>Delete</Button>
        </div>
      }>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Name" span={2}>{product.name}</Descriptions.Item>
        <Descriptions.Item label="SKU">{product.sku || '-'}</Descriptions.Item>
        <Descriptions.Item label="Active">{product.active ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>}</Descriptions.Item>
        <Descriptions.Item label="Category">{product.categoryName}</Descriptions.Item>
        <Descriptions.Item label="Subcategory">{product.subcategoryName}</Descriptions.Item>
        <Descriptions.Item label="UOM">{product.unitOfMeasureName} ({product.unitOfMeasureAbbr})</Descriptions.Item>
        <Descriptions.Item label="Unit Price">{product.unitPrice.toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label="Current Stock">{product.currentStock}</Descriptions.Item>
        <Descriptions.Item label="Reorder Level">{product.reorderLevel}</Descriptions.Item>
        {product.description && <Descriptions.Item label="Description" span={2}>{product.description}</Descriptions.Item>}
      </Descriptions>
    </Modal>
  )
}

export default ProductViewModal
