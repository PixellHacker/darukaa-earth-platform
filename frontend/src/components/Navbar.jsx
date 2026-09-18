import React from 'react';
import { Globe2, Plus, Layers, LogIn, LogOut, ShieldCheck, Activity } from 'lucide-react';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenNewProject, 
  summary,
  drawingMode,
  onToggleDrawingMode
}) {
  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(8, 13, 11, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
        }}>
          <Globe2 size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#f0fdf4' }}>
              Darukaa<span style={{ color: '#10b981' }}>.Earth</span>
            </h1>
            <span style={{
              fontSize: '0.65rem',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}>
              GEO-ANALYTICS v1.0
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
            Carbon & Biodiversity Geospatial Platform
          </p>
        </div>
      </div>

      {/* Global Quick Stats */}
      {summary && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '6px 18px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Protected Area</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
              {summary.total_protected_hectares?.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>ha</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carbon Stock</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
              {summary.total_carbon_credits_tco2e?.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>tCO₂e</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg NDVI</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a7f3d0' }}>
              {summary.average_ndvi}
            </div>
          </div>
        </div>
      )}

      {/* Actions & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Draw Polygon Toggle Button */}
        <button
          onClick={onToggleDrawingMode}
          className={drawingMode ? 'btn-primary' : 'btn-secondary'}
          style={{
            background: drawingMode ? '#059669' : undefined,
            borderColor: drawingMode ? '#34d399' : undefined
          }}
          title="Click to activate polygon drawing on the map"
        >
          <Layers size={16} />
          {drawingMode ? 'Drawing Mode Active' : 'Draw New Site'}
        </button>

        {/* New Project Button */}
        <button onClick={onOpenNewProject} className="btn-primary">
          <Plus size={16} />
          New Project
        </button>

        {/* User Auth state */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <ShieldCheck size={16} color="#34d399" />
              <div style={{ fontSize: '0.8rem', textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#f0fdf4' }}>{user.full_name}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{user.email}</div>
              </div>
            </div>
            <button onClick={onLogout} className="btn-secondary" title="Sign Out" style={{ padding: '8px' }}>
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn-secondary">
            <LogIn size={16} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
