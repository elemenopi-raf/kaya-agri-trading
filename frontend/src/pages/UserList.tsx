import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Table, Input, Button, Typography, Tag, Modal, message, Dropdown } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, CloseOutlined, MoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { User, PagedResponse } from '../types'
import UserCreateModal from './UserCreateModal'
import UserEditModal from './UserEditModal'

function UserList() {
  const { user: currentUser } = useAuth()
  const location = useLocation()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const adminCount = users.filter(u => u.roles?.includes('ADMIN')).length

  function fetchUsers() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<User>>(`/users?${params}`)
      .then(data => { setUsers(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [search, page, location.state?.refresh])

  function handleEdit(user: User) {
    setEditingUser(user)
    setEditModalOpen(true)
  }

  function handleDelete(user: User) {
    const isSelf = user.id === currentUser?.id
    const isLastAdmin = user.roles?.includes('ADMIN') && adminCount <= 1

    if (isSelf) {
      message.warning('You cannot delete your own account')
      return
    }

    let content = `Are you sure you want to delete "${user.displayName}"?`
    if (isLastAdmin) {
      content = `Warning: "${user.displayName}" is the last admin account. Deleting them will lock out all admin access. Are you sure?`
    }

    Modal.confirm({
      title: 'Delete User',
      icon: isLastAdmin ? <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> : undefined,
      content,
      okText: isLastAdmin ? 'Yes, delete last admin' : 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/users/${user.id}`)
          message.success('User deleted')
          fetchUsers()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete user')
        }
      },
    })
  }

  function handleBulkDelete() {
    const selected = users.filter(u => selectedRowKeys.includes(u.id))
    const selfInSelection = selected.some(u => u.id === currentUser?.id)
    if (selfInSelection) {
      message.warning('Cannot delete your own account. Remove it from selection first.')
      return
    }
    Modal.confirm({
      title: 'Delete Users',
      content: `Are you sure you want to delete ${selected.length} user(s)?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          for (const u of selected) {
            await api.delete(`/users/${u.id}`)
          }
          message.success(`${selected.length} user(s) deleted`)
          setSelectedRowKeys([])
          fetchUsers()
        } catch (err: any) {
          message.error(err.message || 'Failed to delete users')
        }
      },
    })
  }

  const columns = [
    { title: '#', key: 'rowNum', width: 50, render: (_: any, __: any, i: number) => (page - 1) * 10 + i + 1 },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Display Name', dataIndex: 'displayName', key: 'displayName' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v || '-' },
    { title: 'Roles', dataIndex: 'roles', key: 'roles',
      render: (v: string[]) => v?.map(r => <Tag key={r} color={r === 'ADMIN' ? 'red' : r === 'MANAGER' ? 'blue' : 'default'}>{r}</Tag>) },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    {
      title: '', key: 'actions', width: 48,
      render: (_: any, record: User) => {
        if (selectedRowKeys.length > 0) return null
        const isSelf = record.id === currentUser?.id
        const items: MenuProps['items'] = [
          { key: 'edit', icon: <EditOutlined />, label: 'Edit', onClick: () => handleEdit(record) },
        ]
        if (!isSelf) {
          items.push({ type: 'divider' })
          items.push({ key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => handleDelete(record) })
        }
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button size="small" type="text" icon={<MoreOutlined />} onClick={e => e.stopPropagation()} />
          </Dropdown>
        )
      },
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (r: User) => ({ disabled: r.id === currentUser?.id }),
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Users</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>New User</Button>
      </div>
      <Input.Search placeholder="Search users..." allowClear style={{ width: 300, marginBottom: 16 }}
        onSearch={v => { setSearch(v); setPage(1) }}
        onChange={e => { if (!e.target.value) { setSearch(''); setPage(1) } }} />

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
          {selectedRowKeys.length === 1 && (
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => {
              const u = users.find(u => u.id === selectedRowKeys[0])
              if (u) handleEdit(u)
            }}>Edit</Button>
          )}
          <Button size="small" danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>Delete ({selectedRowKeys.length})</Button>
          <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      <div className="table-container">
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} rowSelection={rowSelection} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }} />
      </div>
      <UserCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <UserEditModal user={editingUser} open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingUser(null) }}
        onSuccess={fetchUsers} />
    </div>
  )
}

export default UserList
