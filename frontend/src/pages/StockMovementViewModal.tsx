import { Modal, Descriptions, Tag, Button } from 'antd'
import type { StockMovement } from '../types'

const typeColors: Record<string, string> = { IN: 'green', OUT: 'red', ADJUSTMENT: 'orange' }

interface Props {
  movement: StockMovement | null
  open: boolean
  onClose: () => void
}

function StockMovementViewModal({ movement, open, onClose }: Props) {
  if (!movement) return null

  return (
    <Modal title="Stock Movement Details" open={open} onCancel={onClose} width={600}
      footer={<Button size="small" onClick={onClose}>Close</Button>}>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Date">{new Date(movement.createdAt).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Type">
          <Tag color={typeColors[movement.movementType]}>{movement.movementType}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Product" span={2}>{movement.productName} ({movement.productSku || '-'})</Descriptions.Item>
        <Descriptions.Item label="Quantity">{movement.quantity} {movement.productUomAbbr}</Descriptions.Item>
        <Descriptions.Item label="Batch">{movement.batchCode || '-'}</Descriptions.Item>
        <Descriptions.Item label="Notes" span={2}>{movement.notes || '-'}</Descriptions.Item>
        <Descriptions.Item label="Created By">{movement.createdBy || '-'}</Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}

export default StockMovementViewModal
