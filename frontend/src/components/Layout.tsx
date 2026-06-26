import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Modal, Tag, theme } from 'antd'
import {
  DashboardOutlined, ShoppingOutlined, SwapOutlined,
  ShoppingCartOutlined, TeamOutlined, LogoutOutlined,
  UserOutlined, DollarOutlined, SettingOutlined,
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const { Sider, Content } = AntLayout

const roleColors: Record<string, string> = {
  ADMIN: 'red', MANAGER: 'blue', CASHIER: 'green',
}

interface MenuItem {
  key: string
  icon: React.ReactNode
  label: string
  roles: string[]
}

const allMenuItems: MenuItem[] = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard', roles: [] },
  { key: '/sales', icon: <DollarOutlined />, label: 'Sales', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { key: '/customers', icon: <UserOutlined />, label: 'Customers', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { key: '/products', icon: <ShoppingOutlined />, label: 'Products', roles: [] },
  { key: '/stock-movements', icon: <SwapOutlined />, label: 'Stock Movements', roles: [] },
  { key: '/purchase-orders', icon: <ShoppingCartOutlined />, label: 'Purchase Orders', roles: ['ADMIN', 'MANAGER'] },
  { key: '/suppliers', icon: <TeamOutlined />, label: 'Suppliers', roles: ['ADMIN', 'MANAGER'] },
  { key: '/users', icon: <SettingOutlined />, label: 'Users', roles: ['ADMIN'] },
]

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

  const selectedKey = '/' + location.pathname.split('/').filter(Boolean)[0]

  const menuItems = allMenuItems
    .filter(item => !item.roles.length || item.roles.some(r => user?.roles?.includes(r)))
    .map(({ roles, ...rest }) => rest)

  function handleLogout() {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to log out?',
      okText: 'Logout',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => logout(),
    })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sider
        theme="dark"
        width={220}
        style={{
          background: 'linear-gradient(180deg, #1a3a2a 0%, #0f2419 100%)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/kaya-side-nav-logo.png" alt="Kaya Agri Trading" style={{ width: 44, height: 44, flexShrink: 0, objectFit: 'cover', borderRadius: '50%' }} />
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 1.2 }}>Kaya Agri<br/>Trading</span>
        </div>
        <div style={{ padding: '0 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
              {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.displayName}</div>
              <div style={{ marginTop: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {user?.roles?.map(r => (
                  <Tag key={r} color={roleColors[r] || 'default'} style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>{r}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, overflow: 'auto', borderRight: 0 }}
        />
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button type="text" block danger icon={<LogoutOutlined />} onClick={handleLogout}
            style={{ justifyContent: 'flex-start', color: '#ff4d4f' }}>
            Logout
          </Button>
        </div>
      </Sider>
      <Content style={{ flex: 1, overflow: 'auto', background: '#f5f5f5' }}>
        <div style={{ padding: 24 }}>
          <div style={{ padding: 24, minHeight: 'calc(100vh - 96px)', background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </div>
      </Content>
    </div>
  )
}

export default Layout
