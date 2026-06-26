import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Descriptions, Table, Tag, Button, Typography, Modal, Divider, Skeleton, Alert } from 'antd'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import dayjs from 'dayjs'
import api from '../services/api'
import type { Sale } from '../types'
import InvoicePDF from '../components/InvoicePDF'
import AddPaymentModal from './AddPaymentModal'
import ReturnModal from './ReturnModal'
import SaleCancelModal from './SaleCancelModal'

const statusColors: Record<string, string> = {
  PENDING: '#d97706', COMPLETED: 'green', CANCELLED: 'red',
}

const paymentMethodColors: Record<string, string> = {
  CASH: 'green', TRANSFER: 'blue', GCASH: 'purple', CHECK: 'orange', OTHER: 'default',
}

function SaleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [sale, setSale] = useState<Sale | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  useEffect(() => {
    if (id) api.get<Sale>(`/sales/${id}`).then(setSale).catch(() => navigate('/sales'))
  }, [id])

  useEffect(() => {
    if (sale && location.state?.openInvoice) setInvoiceModalOpen(true)
    if (sale && location.state?.openReturn) setReturnModalOpen(true)
  }, [sale, location.state])

  function addPayment(updated: Sale) {
    setSale(updated)
    setPaymentModalOpen(false)
  }

  function handleCancel() {
    setCancelModalOpen(true)
  }

  if (!sale) return <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 4 }} /></div>

  const itemColumns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'SKU', dataIndex: 'productSku', key: 'productSku', render: (v: string) => v || '-' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'right' as const,
      render: (v: number, r: any) => `${v} ${r.productUomAbbr}` },
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right' as const,
      render: (v: number) => v.toFixed(2) },
    { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', align: 'right' as const,
      render: (v: number) => v.toFixed(2) },
  ]

  const paymentColumns = [
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' as const,
      render: (v: number) => v.toFixed(2) },
    { title: 'Method', dataIndex: 'paymentMethod', key: 'paymentMethod',
      render: (v: string) => <Tag color={paymentMethodColors[v]}>{v}</Tag> },
    { title: 'Reference', dataIndex: 'referenceNo', key: 'referenceNo', render: (v: string) => v || '-' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (v: string) => v || '-' },
    { title: 'Received By', dataIndex: 'createdBy', key: 'createdBy', render: (v: string) => v || '-' },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleString() },
  ]

  return (
    <div>
      <Typography.Title level={3}>Sale #{sale.id}</Typography.Title>

      <Descriptions column={3} size="small" bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Customer">{sale.customerName}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusColors[sale.status]}>{sale.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Date">{sale.saleDate ? dayjs(sale.saleDate).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Total Amount">{sale.totalAmount.toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label="Paid Amount">{sale.paidAmount.toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label="Balance">{(sale.totalAmount - sale.paidAmount).toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label="Created By">{sale.createdBy || '-'}</Descriptions.Item>
      </Descriptions>

      {sale.notes && <Typography.Paragraph><strong>Notes:</strong> {sale.notes}</Typography.Paragraph>}

      {sale.status === 'CANCELLED' && sale.cancelReason && (
        <Alert type="error" showIcon style={{ marginBottom: 16 }}
          message="Cancel Reason" description={sale.cancelReason} />
      )}

      <Typography.Title level={5}>Items</Typography.Title>
      <Table dataSource={sale.items} columns={itemColumns} rowKey="id" pagination={false} size="small"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={4} align="right"><strong>Total:</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right"><strong>{sale.totalAmount.toFixed(2)}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )} />

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>Payments</Typography.Title>
        {sale.status === 'PENDING' && (
          <Button type="primary" onClick={() => setPaymentModalOpen(true)}>Add Payment</Button>
        )}
      </div>
      <Table dataSource={sale.payments} columns={paymentColumns} rowKey="id" pagination={false} size="small"
        style={{ marginTop: 8 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} align="right"><strong>Total Paid:</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1}><strong>{sale.paidAmount.toFixed(2)}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={2} colSpan={4} />
          </Table.Summary.Row>
        )} />

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {sale.status === 'PENDING' && (
          <>
            <Button danger onClick={handleCancel}>Cancel Sale</Button>
            <Button onClick={() => setInvoiceModalOpen(true)}>Invoice</Button>
          </>
        )}
        {sale.status === 'COMPLETED' && (
          <>
            <Button type="primary" onClick={() => setInvoiceModalOpen(true)}>Invoice</Button>
            <Button onClick={() => setReturnModalOpen(true)}>Return Items</Button>
          </>
        )}
        <Button onClick={() => navigate('/sales')}>Back to List</Button>
      </div>

      <AddPaymentModal open={paymentModalOpen} saleId={sale.id} onSuccess={addPayment}
        onClose={() => setPaymentModalOpen(false)} />
      <ReturnModal sale={sale} open={returnModalOpen}
        onSuccess={updated => { setSale(updated); setReturnModalOpen(false) }}
        onClose={() => setReturnModalOpen(false)} />
      <Modal title="Invoice" open={invoiceModalOpen} onCancel={() => setInvoiceModalOpen(false)}
        width={800} footer={
          <PDFDownloadLink document={<InvoicePDF sale={sale} />} fileName={`invoice-${sale.id}.pdf`}>
            {({ loading }) => <Button type="primary" loading={loading}>Download PDF</Button>}
          </PDFDownloadLink>
        }>
        <div style={{ height: 500 }}>
          <PDFViewer style={{ width: '100%', height: '100%' }}>
            <InvoicePDF sale={sale} />
          </PDFViewer>
        </div>
      </Modal>
      <SaleCancelModal saleId={sale.id} open={cancelModalOpen}
        onSuccess={() => { setCancelModalOpen(false); api.get<Sale>(`/sales/${id}`).then(setSale) }}
        onClose={() => setCancelModalOpen(false)} />
    </div>
  )
}

export default SaleDetail
