import { Form, Input, Button, Typography, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(values: { username: string; password: string }) {
    try {
      await login(values.username, values.password)
      navigate('/')
    } catch {
      message.error('Invalid username or password')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img src="/kaya-login-brand.png" alt="Kaya Agri Trading" style={{ maxWidth: '100%', height: 'auto', maxHeight: 220 }} />
        </div>
        <Typography.Title level={5} style={{ textAlign: 'center' }}>
          Sign In
        </Typography.Title>
        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: 'Enter your username' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Login</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
