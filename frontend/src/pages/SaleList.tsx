import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Table, Button, Typography, Tag, Select, Space, Progress, message, DatePicker, Input, Dropdown } from 'antd'
import { PlusOutlined, EyeOutlined, CloseCircleOutlined, CloseOutlined, MoreOutlined, FileTextOutlined, RollbackOutlined, DownloadOutlined } from '@ant-design/icons'
import { pdf } from '@react-pdf/renderer'
import type { MenuProps } from 'antd'
import dayjs from 'dayjs'
import api from '../services/api'
import { downloadCsv } from '../utils/csv'
import { useAuth } from '../context/AuthContext'
import type { Sale, PagedResponse } from '../types'
import SaleCreateModal from './SaleCreateModal'
import SaleCancelModal from './SaleCancelModal'
import InvoicePDF from '../components/InvoicePDF'
import ReturnModal from './ReturnModal'

const { RangePicker } = DatePicker

const statusColors: Record<string, string> = {
  PENDING: '#d97706', COMPLETED: 'green', CANCELLED: 'red',
}

function SaleList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const canWrite = user?.roles?.some(r => r === 'ADMIN' || r === 'MANAGER' || r === 'CASHIER')
  const [sales, setSales] = useState<Sale[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [returnSale, setReturnSale] = useState<Sale | null>(null)
  const [cancelSaleId, setCancelSaleId] = useState<number | null>(null)

  async function handleInvoice(sale: Sale) {
    try {
      const full = await api.get<Sale>(`/sales/${sale.id}`)
      const blob = await pdf(<InvoicePDF sale={full} />).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch {
      message.error('Failed to generate invoice')
    }
  }

  function fetch() {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (search) params.set('search', search)
    if (dateRange?.[0]) params.set('from', dateRange[0].format('YYYY-MM-DD'))
    if (dateRange?.[1]) params.set('to', dateRange[1].format('YYYY-MM-DD'))
    params.set('page', String(page - 1))
    params.set('pageSize', '10')
    api.get<PagedResponse<Sale>>(`/sales?${params}`)
      .then(data => { setSales(data.items); setTotal(data.totalCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [status, dateRange, search, page, location.state?.refresh])

  function handleExport() {
    let url = '/sales/export'
    const params = new URLSearchParams()
    if (dateRange?.[0]) params.set('from', dateRange[0].format('YYYY-MM-DD'))
    if (dateRange?.[1]) params.set('to', dateRange[1].format('YYYY-MM-DD'))
    const qs = params.toString()
    if (qs) url += '?' + qs
    downloadCsv(url, 'sales.csv')
  }

  function handleBulkCancel() {
    const selected = sales.filter(s => selectedRowKeys.includes(s.id) && s.status === 'PENDING')
    if (selected.length === 0) {
      message.warning('No pending sales selected')
      return
    }
    if (selected.length === 1) {
      setCancelSaleId(selected[0].id)
      return
    }
    setCancelSaleId(selected[0].id)
  }

  const columns = [
    { title: '#', key: 'rowNum', width: 50, render: (_: any, __: any, i: number) => (page - 1) * 10 + i + 1 },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Date', dataIndex: 'saleDate', key: 'saleDate',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount',
      render: (v: number) => v.toFixed(2) },
    { title: 'Payment', key: 'payment', render: (_: any, record: Sale) => {
      const pct = record.totalAmount > 0 ? Math.min((record.paidAmount / record.totalAmount) * 100, 100) : 0
      const color = statusColors[record.status] || '#d97706'
      return (
        <div>
          <span style={{ fontSize: 12 }}>₱{record.paidAmount.toFixed(2)} / ₱{record.totalAmount.toFixed(2)}</span>
          <Progress percent={Math.round(pct)} strokeColor={color} showInfo={false} size={[0, 4]} style={{ marginTop: 0 }} />
        </div>
      )
    }},
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
    {
      title: '', key: 'actions', width: 48,
      render: (_: any, record: Sale) => {
        if (selectedRowKeys.length > 0) return null
        const items: MenuProps['items'] = [
          { key: 'view', icon: <EyeOutlined />, label: 'View', onClick: () => navigate(`/sales/${record.id}`) },
        ]
        if (record.status === 'COMPLETED') {
          items.push({ key: 'invoice', icon: <FileTextOutlined />, label: 'Invoice', onClick: () => handleInvoice(record) })
          items.push({ key: 'return', icon: <RollbackOutlined />, label: 'Return Items', onClick: () => setReturnSale(record) })
        }
        if (record.status === 'PENDING' && canWrite) {
          items.push({ type: 'divider' })
          items.push({ key: 'cancel', icon: <CloseCircleOutlined />, label: 'Cancel', danger: true, onClick: () => setCancelSaleId(record.id) })
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
    getCheckboxProps: (r: Sale) => ({ disabled: r.status === 'CANCELLED' }),
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Sales</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export CSV</Button>
          {canWrite && <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>New Sale</Button>}
        </Space>
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Search customer..." allowClear style={{ width: 220 }}
          onSearch={v => { setSearch(v); setPage(1) }}
          onChange={e => { if (!e.target.value) { setSearch(''); setPage(1) } }} />
        <RangePicker value={dateRange} onChange={dates => { setDateRange(dates as any); setPage(1) }} />
        <Select value={status} onChange={v => { setStatus(v); setPage(1) }} style={{ width: 160 }}
          options={[
            { label: 'All Statuses', value: '' },
            { label: 'PENDING', value: 'PENDING' },
            { label: 'COMPLETED', value: 'COMPLETED' },
            { label: 'CANCELLED', value: 'CANCELLED' },
          ]} />
      </Space>

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f4ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
          {selectedRowKeys.length === 1 && (
            <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => {
              const s = sales.find(s => s.id === selectedRowKeys[0])
              if (s) navigate(`/sales/${s.id}`)
            }}>View</Button>
          )}
          {canWrite && <Button size="small" danger icon={<CloseCircleOutlined />} onClick={handleBulkCancel}>Cancel Selected</Button>}
          <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      <div className="table-container">
        <Table dataSource={sales} columns={columns} rowKey="id" loading={loading} rowSelection={rowSelection} rowClassName="table-striped"
          pagination={{ current: page, pageSize: 10, total, onChange: p => setPage(p), showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, showSizeChanger: false }} />
      </div>
      <SaleCreateModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {returnSale && (
        <ReturnModal sale={returnSale} open={!!returnSale}
          onSuccess={() => { setReturnSale(null); fetch() }}
          onClose={() => setReturnSale(null)} />
      )}
      {cancelSaleId !== null && (
        <SaleCancelModal saleId={cancelSaleId} open={cancelSaleId !== null}
          onSuccess={() => { setCancelSaleId(null); fetch() }}
          onClose={() => setCancelSaleId(null)} />
      )}
    </div>
  )
}

export default SaleList
