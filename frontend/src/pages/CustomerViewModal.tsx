import { Modal, Descriptions, Tag, Button } from 'antd'
import type { Customer } from '../types'

interface Props {
  customer: Customer | null
  open: boolean
  onClose: () => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

function CustomerViewModal({ customer, open, onClose, onEdit, onDelete }: Props) {
  if (!customer) return null

  return (
    <Modal title="Customer Details" open={open} onCancel={onClose} width={600}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button size="small" onClick={onClose}>Close</Button>
          <Button size="small" onClick={() => { onClose(); onEdit(customer) }}>Edit</Button>
          <Button size="small" danger onClick={() => { onClose(); onDelete(customer) }}>Delete</Button>
        </div>
      }>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Name" span={2}>{customer.name}</Descriptions.Item>
        <Descriptions.Item label="Phone">{customer.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Active">{customer.active ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>}</Descriptions.Item>
        <Descriptions.Item label="Email" span={2}>{customer.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>{customer.address || '-'}</Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}

export default CustomerViewModal
