import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0f0d',
          color: '#f0fdf4',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px'
          }}>
            <AlertTriangle size={48} color="#f43f5e" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              Application Render Notice
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred while rendering the map components.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ margin: '0 auto' }}
            >
              <RefreshCw size={16} /> Reload Platform
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
