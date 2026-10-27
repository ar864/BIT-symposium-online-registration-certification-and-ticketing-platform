import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  UserPlus, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar({ activeView, onNavigate, isAdmin, onOpenLogin, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <div className="nav-brand" onClick={() => handleNav('home')}>
          <div className="brand-icon-wrapper">
            <GraduationCap size={24} />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">BIT Symposium 2026</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="nav-links">
          <button 
            className={`nav-link ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            Home
          </button>
          
          <button 
            className={`nav-link ${activeView === 'events' ? 'active' : ''}`}
            onClick={() => handleNav('events')}
          >
            Events
          </button>

          <button 
            className={`nav-link ${activeView === 'register' ? 'active' : ''}`}
            onClick={() => handleNav('register')}
          >
            Register
          </button>

          <button 
            className={`nav-link ${activeView === 'ticket' ? 'active' : ''}`}
            onClick={() => handleNav('ticket')}
          >
            My Ticket
          </button>

          {/* Global Theme Switcher */}
          <ThemeSwitcher variant="dropdown" />

          {isAdmin ? (
            <button 
              className={`nav-admin-btn ${activeView === 'admin' ? 'nav-admin-active' : ''}`}
              onClick={() => handleNav('admin')}
            >
              <LayoutDashboard size={16} />
              <span>Admin Dashboard</span>
            </button>
          ) : (
            <button 
              className="nav-admin-btn"
              onClick={onOpenLogin}
            >
              <ShieldCheck size={16} />
              <span>Admin Login</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button 
            className={`nav-link ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
            style={{ textAlign: 'left', width: '100%' }}
          >
            Home
          </button>
          <button 
            className={`nav-link ${activeView === 'events' ? 'active' : ''}`}
            onClick={() => handleNav('events')}
            style={{ textAlign: 'left', width: '100%' }}
          >
            Events
          </button>
          <button 
            className={`nav-link ${activeView === 'register' ? 'active' : ''}`}
            onClick={() => handleNav('register')}
            style={{ textAlign: 'left', width: '100%' }}
          >
            Register
          </button>
          <button 
            className={`nav-link ${activeView === 'ticket' ? 'active' : ''}`}
            onClick={() => handleNav('ticket')}
            style={{ textAlign: 'left', width: '100%' }}
          >
            My Ticket
          </button>

          <div style={{ padding: '0.4rem 0' }}>
            <ThemeSwitcher variant="dropdown" />
          </div>

          {isAdmin ? (
            <button 
              className="nav-admin-btn"
              onClick={() => handleNav('admin')}
              style={{ justifyContent: 'center' }}
            >
              <LayoutDashboard size={16} />
              <span>Admin Dashboard</span>
            </button>
          ) : (
            <button 
              className="nav-admin-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              style={{ justifyContent: 'center' }}
            >
              <ShieldCheck size={16} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
