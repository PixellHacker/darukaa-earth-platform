import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Zap } from 'lucide-react';
import { authService } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isRegister) {
        res = await authService.register(email, password, fullName);
      } else {
        res = await authService.login(email, password);
      }
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authService.login('admin@darukaa.earth', 'AdminPass123!');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError('Demo login failed. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={18} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f0fdf4' }}>
              {isRegister ? 'Register Account' : 'Sign In to Darukaa'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Quick 1-Click Demo Login for Reviewers */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px dashed rgba(16, 185, 129, 0.35)',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Quick Demo Access
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Login immediately as Administrator
            </div>
          </div>
          <button
            type="button"
            onClick={quickDemoLogin}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            1-Click Login
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <div>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Dr. Jane Doe"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="analyst@darukaa.earth"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In with JWT'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
          {isRegister ? 'Already have credentials? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 600, cursor: 'pointer' }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
