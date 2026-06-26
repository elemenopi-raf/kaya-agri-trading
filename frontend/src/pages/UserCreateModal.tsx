import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Form, Input, Select, Switch, Button, message } from 'antd'
import api from '../services/api'

const ALL_ROLES = ['ADMIN', 'MANAGER', 'CASHIER']

interface Props {
  open: boolean
  onClose: () => void
}

function UserCreateModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      form.resetFields()
      setSuccess(false)
    }
  }, [open])

  async function handleSubmit(values: any) {
    const body = {
      username: values.username.trim(),
      displayName: values.displayName.trim(),
      email: values.email?.trim() || undefined,
      password: values.password,
      roles: values.roles || [],
      active: values.active ?? true,
    }
    try {
      setSubmitting(true)
      await api.post('/users', body)
      setSuccess(true)
    } catch (err: any) {
      message.error(err.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Modal title="New User" open={open && !success} onCancel={onClose} footer={null} destroyOnClose width={480}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ active: true, roles: [] }}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="displayName" label="Display Name" rules={[{ required: true, message: 'Display name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[
            { required: true, message: 'Password is required' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="roles" label="Roles">
            <Select mode="multiple" placeholder="Select roles" options={ALL_ROLES.map(r => ({ label: r, value: r }))} />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Create</Button>
          </div>
        </Form>
      </Modal>
      <Modal title="Success" open={open && success} closable={false} footer={
        <Button type="primary" onClick={() => { onClose(); navigate('/users', { state: { refresh: Date.now() } }) }}>OK</Button>
      }>
        <p>User created successfully!</p>
      </Modal>
    </>
  )
}

export default UserCreateModal
