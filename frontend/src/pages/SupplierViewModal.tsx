import { Modal, Descriptions, Tag, Button } from 'antd'
import type { Supplier } from '../types'

interface Props {
  supplier: Supplier | null
  open: boolean
  onClose: () => void
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
}

function SupplierViewModal({ supplier, open, onClose, onEdit, onDelete }: Props) {
  if (!supplier) return null

  return (
    <Modal title="Supplier Details" open={open} onCancel={onClose} width={600}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button size="small" onClick={onClose}>Close</Button>
          <Button size="small" onClick={() => { onClose(); onEdit(supplier) }}>Edit</Button>
          <Button size="small" danger onClick={() => { onClose(); onDelete(supplier) }}>Delete</Button>
        </div>
      }>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Name" span={2}>{supplier.name}</Descriptions.Item>
        <Descriptions.Item label="Contact Person">{supplier.contactPerson || '-'}</Descriptions.Item>
        <Descriptions.Item label="Active">{supplier.active ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>}</Descriptions.Item>
        <Descriptions.Item label="Phone">{supplier.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">{supplier.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>{supplier.address || '-'}</Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}

export default SupplierViewModal
