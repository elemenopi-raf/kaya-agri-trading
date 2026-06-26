import { useState } from 'react'
import { Modal, InputNumber, Table, Typography, message } from 'antd'
import api from '../services/api'
import type { Sale, SaleItem } from '../types'

interface Props {
  sale: Sale
  open: boolean
  onSuccess: (updated: Sale) => void
  onClose: () => void
}

function ReturnModal({ sale, open, onSuccess, onClose }: Props) {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(sale.items.map(i => [i.id, i.quantity]))
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    const items = sale.items
      .filter(i => (quantities[i.id] ?? 0) > 0)
      .map(i => ({ productId: i.productId, quantity: String(quantities[i.id]) }))

    if (items.length === 0) {
      message.warning('At least one item with a positive quantity is required')
      return
    }

    setLoading(true)
    try {
      const updated = await api.post<Sale>(`/sales/${sale.id}/return`, { items })
      message.success('Return processed')
      onSuccess(updated)
    } catch (err: any) {
      message.error(err.message || 'Return failed')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Sold Qty', dataIndex: 'quantity', key: 'quantity', align: 'right' as const,
      render: (v: number, r: SaleItem) => `${v} ${r.productUomAbbr}` },
    { title: 'Return Qty', key: 'returnQty', align: 'right' as const,
      render: (_: any, r: SaleItem) => (
        <InputNumber min={0} max={r.quantity} value={quantities[r.id]}
          onChange={v => setQuantities(q => ({ ...q, [r.id]: v ?? 0 }))} />
      ) },
  ]

  return (
    <Modal title={`Return Items — Sale #${sale.id}`} open={open} onCancel={onClose}
      okText="Process Return" confirmLoading={loading} onOk={handleSubmit} width={600}>
      <Typography.Paragraph type="secondary">
        Set the quantities to return for each item. Stock will be added back to inventory.
      </Typography.Paragraph>
      <Table dataSource={sale.items} columns={columns} rowKey="id" pagination={false} size="small" />
    </Modal>
  )
}

export default ReturnModal
