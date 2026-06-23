import { useEffect, useState } from 'react'
import { Modal, Input, Button, message } from 'antd'
import api from '../services/api'
import type { Product } from '../types'

interface Props {
  product: Product | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function QuickRestockModal({ product, open, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && product) {
      setQuantity(String(product.reorderLevel || 1))
    }
  }, [open, product])

  async function handleSubmit() {
    if (!product) return
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) { message.error('Quantity must be positive'); return }

    try {
      setSubmitting(true)
      await api.post('/stock-movements', {
        productId: product.id,
        movementType: 'IN',
        quantity,
        notes: 'Quick restock from dashboard',
      })
      message.success('Stock updated')
      onSuccess()
      onClose()
    } catch (err: any) {
      message.error(err.message || 'Failed to record movement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Quick Restock" open={open} onCancel={onClose}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting}>Add Stock</Button>
        </div>
      } width={400} destroyOnClose>
      {product && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0 }}><strong>{product.name}</strong></p>
          <p style={{ margin: 0, color: '#856404' }}>
            Current stock: {product.currentStock} {product.unitOfMeasureAbbr} &nbsp;|&nbsp;
            Reorder at: {product.reorderLevel} {product.unitOfMeasureAbbr}
          </p>
          <div>
            <label>Quantity to add</label>
            <Input type="number" step="0.01" min="0.01" value={quantity}
              onChange={e => setQuantity(e.target.value)} />
          </div>
        </div>
      )}
    </Modal>
  )
}

export default QuickRestockModal
