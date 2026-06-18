import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, theme } from 'antd'
import {
  DashboardOutlined, ShoppingOutlined, SwapOutlined,
  ShoppingCartOutlined, TeamOutlined, LogoutOutlined,
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const { Sider, Content } = AntLayout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/products', icon: <ShoppingOutlined />, label: 'Products' },
  { key: '/stock-movements', icon: <SwapOutlined />, label: 'Stock Movements' },
  { key: '/purchase-orders', icon: <ShoppingCartOutlined />, label: 'Purchase Orders' },
  { key: '/suppliers', icon: <TeamOutlined />, label: 'Suppliers' },
]

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

  const selectedKey = '/' + location.pathname.split('/').filter(Boolean)[0]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220} style={{ background: '#1e293b' }}>
        <div style={{ padding: '16px 24px', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          Kaya Agri
        </div>
        <div style={{ padding: '0 24px 16px', color: '#aaa', fontSize: 13 }}>
          {user?.displayName} ({user?.roles?.join(', ')})
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ padding: 24, marginTop: 'auto' }}>
          <Button block icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </div>
      </Sider>
      <Content style={{ margin: 24 }}>
        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          <Outlet />
        </div>
      </Content>
    </AntLayout>
  )
}

export default Layout
