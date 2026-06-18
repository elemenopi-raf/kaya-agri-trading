import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#888', fontSize: 14 }}>{this.state.error?.message}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
            style={{ marginTop: 16, padding: '8px 24px', cursor: 'pointer' }}>
            Go Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
