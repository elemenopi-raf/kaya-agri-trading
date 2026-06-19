import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ProductList from './pages/ProductList'
import ProductForm from './pages/ProductForm'
import StockMovementList from './pages/StockMovementList'
import StockMovementForm from './pages/StockMovementForm'
import SupplierList from './pages/SupplierList'
import SupplierForm from './pages/SupplierForm'
import PurchaseOrderList from './pages/PurchaseOrderList'
import PurchaseOrderDetail from './pages/PurchaseOrderDetail'
import CustomerList from './pages/CustomerList'
import SaleList from './pages/SaleList'
import SaleDetail from './pages/SaleDetail'

function App() {
  return (
    <ConfigProvider theme={{
      token: { colorPrimary: '#2d6a4f' },
    }}>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/:id/edit" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}><ProductForm /></ProtectedRoute>
              } />
              <Route path="stock-movements" element={<StockMovementList />} />
              <Route path="stock-movements/new" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}><StockMovementForm /></ProtectedRoute>
              } />
              <Route path="suppliers" element={<SupplierList />} />
              <Route path="suppliers/:id/edit" element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}><SupplierForm /></ProtectedRoute>
              } />
              <Route path="purchase-orders" element={<PurchaseOrderList />} />
              <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="sales" element={<SaleList />} />
              <Route path="sales/:id" element={<SaleDetail />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
      <style>{`
        .ant-card-hoverable:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        .ant-card-bordered { border-color: #e8e8e8 !important; }
        .ant-layout-sider-dark .ant-layout-sider-children { background: inherit !important; }
        .ant-menu-dark { background: transparent !important; }
        .ant-menu-item:hover { background-color: rgba(255,255,255,0.15) !important; }
        .ant-menu-item-selected { background-color: rgba(255,255,255,0.25) !important; }
      `}</style>
    </ConfigProvider>
  )
}

export default App
