import { useState } from 'react'
import { Modal, Input, Select, Typography } from 'antd'

const REASON_OPTIONS = [
  'Customer changed mind',
  'Stock issue',
  'Pricing error',
  'Duplicate order',
  'Order no longer needed',
  'Other',
]

interface Props {
  saleId: number
  open: boolean
  onSuccess: () => void
  onClose: () => void
}

function SaleCancelModal({ saleId, open, onSuccess, onClose }: Props) {
  const [selectedReason, setSelectedReason] = useState<string | undefined>()
  const [customReason, setCustomReason] = useState('')
  const [loading, setLoading] = useState(false)

  const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason || ''
  const canSubmit = finalReason.length > 0

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sales/${saleId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason: finalReason }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Cancel failed')
      }
      setSelectedReason(undefined)
      setCustomReason('')
      onSuccess()
    } catch (err: any) {
      const { message } = await import('antd')
      message.error(err.message || 'Failed to cancel sale')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setSelectedReason(undefined)
    setCustomReason('')
    onClose()
  }

  return (
    <Modal
      title={`Cancel Sale #${saleId}`}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Confirm Cancel"
      okButtonProps={{ danger: true, disabled: !canSubmit, loading }}
      cancelText="Go Back"
      width={480}
    >
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        Please select a reason for cancelling this sale. Stock will be restored to inventory.
      </Typography.Paragraph>
      <Select
        placeholder="Select a reason..."
        style={{ width: '100%' }}
        value={selectedReason}
        onChange={val => { setSelectedReason(val); if (val !== 'Other') setCustomReason('') }}
        options={REASON_OPTIONS.map(r => ({ label: r, value: r }))}
      />
      {selectedReason === 'Other' && (
        <Input.TextArea
          rows={3}
          placeholder="Enter cancellation reason..."
          value={customReason}
          onChange={e => setCustomReason(e.target.value)}
          style={{ marginTop: 12, resize: 'none' }}
        />
      )}
    </Modal>
  )
}

export default SaleCancelModal
