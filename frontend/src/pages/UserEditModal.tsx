import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, message } from 'antd'
import api from '../services/api'
import type { User } from '../types'

const ALL_ROLES = ['ADMIN', 'MANAGER', 'CASHIER']

interface Props {
  user: User | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function UserEditModal({ user, open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        displayName: user.displayName,
        email: user.email || '',
        password: '',
        confirmPassword: '',
        roles: user.roles,
        active: user.active,
      })
    }
  }, [user, open, form])

  async function handleSubmit() {
    if (!user) return
    try {
      setLoading(true)
      const values = await form.validateFields()
      const body: any = {
        displayName: values.displayName.trim(),
        email: values.email?.trim() || undefined,
        roles: values.roles || [],
        active: values.active ?? true,
      }
      if (values.password) body.password = values.password
      await api.put(`/users/${user.id}`, body)
      message.success('User updated')
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err.message) message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Edit User" open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={loading} destroyOnClose width={480}>
      <Form form={form} layout="vertical">
        <Form.Item label="Username">
          <Input value={user?.username} disabled />
        </Form.Item>
        <Form.Item name="displayName" label="Display Name" rules={[{ required: true, message: 'Display name is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" help="Leave blank to keep current password"
          rules={[
            { validator: (_, value) => {
              if (!value) return Promise.resolve()
              if (value.length < 6) return Promise.reject(new Error('Password must be at least 6 characters'))
              return Promise.resolve()
            }}
          ]}>
          <Input.Password placeholder="Leave blank to keep current" />
        </Form.Item>
        <Form.Item name="confirmPassword" label="Confirm New Password"
          dependencies={['password']}
          rules={[
            { validator: (_, value) => {
              const password = form.getFieldValue('password')
              if (!password) return Promise.resolve()
              if (!value) return Promise.reject(new Error('Please confirm your new password'))
              if (value !== password) return Promise.reject(new Error('Passwords do not match'))
              return Promise.resolve()
            }}
          ]}>
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>
        <Form.Item name="roles" label="Roles">
          <Select mode="multiple" placeholder="Select roles" options={ALL_ROLES.map(r => ({ label: r, value: r }))} />
        </Form.Item>
        <Form.Item name="active" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserEditModal
