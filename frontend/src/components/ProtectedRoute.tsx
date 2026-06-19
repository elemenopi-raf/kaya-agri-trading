import { Navigate } from 'react-router-dom'
import { Result } from 'antd'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.some(r => user.roles?.includes(r))) {
    return <Result status="403" title="403" subTitle="You don't have permission to access this page." />
  }

  return <>{children}</>
}

export default ProtectedRoute
