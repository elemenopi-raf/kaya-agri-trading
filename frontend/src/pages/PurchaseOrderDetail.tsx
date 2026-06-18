import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Descriptions, Table, Tag, Button, Typography, Spin, Modal, message } from 'antd'
import api from '../services/api'
import type { PurchaseOrder } from '../types'

const statusColors: Record<string, string> = {
  PENDING: 'orange', APPROVED: 'green', RECEIVED: 'blue', CANCELLED: 'red',
}

function PurchaseOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) api.get<PurchaseOrder>(`/purchase-orders/${id}`).then(setPo).catch(() => navigate('/purchase-orders'))
  }, [id])

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    try {
      const updated = await api.put<PurchaseOrder>(`/purchase-orders/${id}/status`, { status: newStatus })
      setPo(updated)
      message.success(`PO ${updated.poNumber} ${newStatus.toLowerCase()}`)
    } catch (err: any) {
      message.error(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  function confirmAction(newStatus: string, title: string, content: string) {
    Modal.confirm({ title, content, onOk: () => updateStatus(newStatus), okButtonProps: { danger: newStatus === 'CANCELLED' } })
  }

  if (!po) return <Spin style={{ display: 'block', marginTop: 48 }} />

  const totalAmount = po.items.reduce((sum, item) => sum + item.totalPrice, 0)

  const itemColumns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'SKU', dataIndex: 'productSku', key: 'productSku', render: (v: string) => v || '-' },
    { title: 'Qty Ordered', dataIndex: 'qtyOrdered', key: 'qtyOrdered', align: 'right' as const,
      render: (v: number, r: any) => `${v} ${r.productUomAbbr}` },
    { title: 'Qty Received', dataIndex: 'qtyReceived', key: 'qtyReceived', align: 'right' as const,
      render: (v: number, r: any) => `${v} ${r.productUomAbbr}` },
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right' as const,
      render: (v: number) => v.toFixed(2) },
    { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', align: 'right' as const,
      render: (v: number) => v.toFixed(2) },
  ]

  return (
    <div>
      <Typography.Title level={3}>Purchase Order {po.poNumber}</Typography.Title>

      <Descriptions column={4} size="small" bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Supplier">{po.supplierName}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusColors[po.status]}>{po.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Order Date">{po.orderDate}</Descriptions.Item>
        <Descriptions.Item label="Expected">{po.expectedDate || '-'}</Descriptions.Item>
        <Descriptions.Item label="Created By">{po.createdBy || '-'}</Descriptions.Item>
      </Descriptions>

      {po.notes && <Typography.Paragraph><strong>Notes:</strong> {po.notes}</Typography.Paragraph>}

      <Table dataSource={po.items} columns={itemColumns} rowKey="id" pagination={false} size="small"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={5} align="right"><strong>Total:</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="right"><strong>{totalAmount.toFixed(2)}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )} />

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {po.status === 'PENDING' && (
          <>
            <Button type="primary" loading={updating}
              onClick={() => confirmAction('APPROVED', 'Approve PO', 'Are you sure you want to approve this purchase order?')}>Approve</Button>
            <Button danger loading={updating}
              onClick={() => confirmAction('CANCELLED', 'Cancel PO', 'Are you sure you want to cancel this purchase order?')}>Cancel</Button>
          </>
        )}
        {po.status === 'APPROVED' && (
          <>
            <Button type="primary" loading={updating}
              onClick={() => confirmAction('RECEIVED', 'Receive PO', 'This will mark items as received and update stock levels. Continue?')}>Receive (Add to Stock)</Button>
            <Button danger loading={updating}
              onClick={() => confirmAction('CANCELLED', 'Cancel PO', 'Are you sure you want to cancel this purchase order?')}>Cancel</Button>
          </>
        )}
        <Button onClick={() => navigate('/purchase-orders')}>Back to List</Button>
      </div>
    </div>
  )
}

export default PurchaseOrderDetail
