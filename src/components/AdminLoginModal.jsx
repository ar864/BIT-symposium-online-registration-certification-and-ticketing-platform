import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, X, CheckCircle2, Eye, EyeOff, Sparkles, KeyRound, Palette } from 'lucide-react';
import { setAdminLoggedIn } from '../utils/storage';
import { ADMIN_THEMES, getActiveAdminTheme, setActiveAdminTheme } from '../utils/theme';

export default function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState(getActiveAdminTheme);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setActiveTheme(e.detail || getActiveAdminTheme());
    };
    window.addEventListener('bit_admin_theme_changed', handleThemeChange);
    return () => window.removeEventListener('bit_admin_theme_changed', handleThemeChange);
  }, []);

  if (!isOpen) return null;

  const handleSelectTheme = (themeId) => {
    const newTheme = setActiveAdminTheme(themeId);
    setActiveTheme(newTheme);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Check credentials
      if (username.trim() === 'admin' && password === 'admin123') {
        setAdminLoggedIn(true);
        setUsername('');
        setPassword('');
        setLoading(false);
        onSuccess();
      } else {
        setError('Invalid username or password. Please use admin / admin123 for demo evaluation.');
        setLoading(false);
      }
    }, 300);
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="login-card" onClick={(e) => e.stopPropagation()} style={{
        boxShadow: `0 20px 45px ${activeTheme.glowColor || 'rgba(0,0,0,0.25)'}`,
        border: `1px solid ${activeTheme.primary}40`
      }}>
        {/* Header with Dynamic Theme Gradient */}
        <div className="login-card-header" style={{
          background: activeTheme.headerGradient,
          position: 'relative',
          padding: '2rem 2rem 1.6rem',
          transition: 'background 0.3s ease'
        }}>
          <button className="login-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>

          {/* Theme Palette Quick Switcher Dots */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(6px)',
            padding: '0.3rem 0.65rem',
            borderRadius: '9999px',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <Palette size={12} style={{ color: '#ffffff', opacity: 0.8 }} />
            <span style={{ fontSize: '0.68rem', color: '#e2e8f0', fontWeight: 600, marginRight: '0.2rem' }}>
              Theme:
            </span>
            {ADMIN_THEMES.map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: theme.swatch,
                  border: activeTheme.id === theme.id ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: 0,
                  transform: activeTheme.id === theme.id ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTheme.id === theme.id ? `0 0 8px ${theme.swatch}` : 'none'
                }}
                title={theme.name + ' (' + theme.tagline + ')'}
              />
            ))}
          </div>

          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            color: '#ffffff',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <ShieldCheck size={30} />
          </div>
          <h3 style={{ color: '#ffffff', fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Faculty & Admin Portal
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.8rem', maxWidth: '320px', margin: '0 auto' }}>
            Bannari Amman Institute of Technology • Symposium 2026 Control Center
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="login-card-body">
          {/* Demo Helper Badge */}
          <div className="demo-credentials-pill" style={{
            background: '#eef2ff',
            border: '1px dashed #6366f1',
            borderRadius: '10px',
            padding: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 800, color: '#3730a3', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🔑 Review Demo Credentials
              </span>
              <button 
                type="button" 
                onClick={handleQuickFill}
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Auto-Fill
              </button>
            </div>
            <div style={{ fontSize: '0.825rem', color: '#312e81' }}>
              Username: <code style={{ fontWeight: 700, background: '#ffffff', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>admin</code> &nbsp;|&nbsp; 
              Password: <code style={{ fontWeight: 700, background: '#ffffff', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>admin123</code>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#b91c1c',
              fontSize: '0.825rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Admin Username
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="e.g. admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.2rem'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              width: '100%', 
              marginTop: '0.5rem', 
              padding: '0.85rem',
              background: `linear-gradient(135deg, ${activeTheme.primaryDark} 0%, ${activeTheme.primary} 100%)`,
              boxShadow: `0 4px 14px ${activeTheme.glowColor || 'rgba(37, 99, 235, 0.35)'}`,
              fontWeight: 700 
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0' }}>
            🔒 Demonstration Prototype • Client-side authentication via localStorage
          </p>
        </form>
      </div>
    </div>
  );
}
