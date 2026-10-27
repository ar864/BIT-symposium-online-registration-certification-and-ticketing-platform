import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sparkles, ChevronDown, Shuffle, Moon, Sun } from 'lucide-react';
import { APP_THEMES, getActiveTheme, setActiveTheme } from '../utils/theme';

export default function ThemeSwitcher({ variant = 'dropdown' }) {
  const [activeTheme, setActiveThemeState] = useState(getActiveTheme);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail) {
        setActiveThemeState(e.detail);
      }
    };
    window.addEventListener('bit_theme_changed', handleThemeChange);
    return () => window.removeEventListener('bit_theme_changed', handleThemeChange);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (themeId) => {
    const updated = setActiveTheme(themeId);
    setActiveThemeState(updated);
    setIsOpen(false);
  };

  const handleRandomize = () => {
    const others = APP_THEMES.filter(t => t.id !== activeTheme.id);
    const random = others[Math.floor(Math.random() * others.length)];
    handleSelect(random.id);
  };

  // --- Variant 1: Horizontal Quick Strip (Hero / Banner) ---
  if (variant === 'strip') {
    return (
      <div className="theme-strip-container" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '9999px',
        padding: '0.35rem 0.85rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#93c5fd', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Palette size={14} />
          <span>Theme:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {APP_THEMES.map((t) => {
            const isCurrent = t.id === activeTheme.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelect(t.id)}
                title={`${t.name} - ${t.tagline}`}
                style={{
                  width: isCurrent ? '26px' : '20px',
                  height: isCurrent ? '26px' : '20px',
                  borderRadius: '50%',
                  background: t.accentGradient || t.swatch,
                  border: isCurrent ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isCurrent ? `0 0 10px ${t.swatch}` : 'none',
                  cursor: 'pointer',
                  transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  padding: 0
                }}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          title="Surprise me with a random colorful theme"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#e2e8f0',
            borderRadius: '9999px',
            padding: '0.2rem 0.5rem',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <Shuffle size={11} />
          <span>Random</span>
        </button>
      </div>
    );
  }

  // --- Variant 2: Floating Action Button (FAB) at bottom-right ---
  if (variant === 'floating') {
    return (
      <div 
        ref={dropdownRef}
        className="no-print floating-theme-widget"
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          zIndex: 999
        }}
      >
        {/* Floating Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'var(--theme-gradient, linear-gradient(135deg, #2563eb, #06b6d4))',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '9999px',
            padding: '0.65rem 1.15rem',
            boxShadow: '0 8px 24px var(--theme-glow, rgba(37, 99, 235, 0.45)), 0 2px 6px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="theme-fab-btn"
        >
          <Palette size={17} style={{ animation: 'spinSlow 12s linear infinite' }} />
          <span>Themes</span>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#ffffff',
            display: 'inline-block',
            boxShadow: '0 0 6px #ffffff'
          }} />
        </button>

        {/* Floating Popup Menu */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: '120%',
            right: 0,
            width: '290px',
            background: activeTheme.isDark ? '#0f172a' : '#ffffff',
            border: activeTheme.isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 20px 35px -5px rgba(0,0,0,0.25), 0 0 15px var(--theme-glow, rgba(0,0,0,0.1))',
            padding: '1.15rem',
            color: activeTheme.isDark ? '#f8fafc' : '#0f172a',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={16} style={{ color: activeTheme.primary }} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Choose Theme</span>
              </div>
              <button
                type="button"
                onClick={handleRandomize}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeTheme.primary,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Shuffle size={12} />
                <span>Shuffle</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {APP_THEMES.map((theme) => {
                const isSelected = theme.id === activeTheme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelect(theme.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      background: isSelected 
                        ? (activeTheme.isDark ? '#1e293b' : '#f1f5f9')
                        : 'transparent',
                      border: isSelected 
                        ? `2px solid ${theme.primary}` 
                        : '1px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: theme.accentGradient || theme.swatch,
                        display: 'inline-block',
                        boxShadow: `0 2px 8px ${theme.glowColor || 'rgba(0,0,0,0.2)'}`,
                        flexShrink: 0
                      }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.825rem', color: activeTheme.isDark ? '#f8fafc' : '#0f172a' }}>
                          {theme.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: activeTheme.isDark ? '#94a3b8' : '#64748b' }}>
                          {theme.tagline}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={16} style={{ color: theme.primary, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Variant 3: Dropdown Button in Navbar ---
  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.825rem',
          fontWeight: 700,
          background: 'var(--bg-card-subtle, #f1f5f9)',
          border: '1px solid var(--border-color, #e2e8f0)',
          color: 'var(--text-main, #0f172a)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow-sm)'
        }}
        className="nav-theme-btn"
        title="Change website color theme"
      >
        <span style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: activeTheme.accentGradient || activeTheme.swatch,
          display: 'inline-block',
          boxShadow: `0 0 6px ${activeTheme.primary}`
        }} />
        <Palette size={14} style={{ color: 'var(--primary)' }} />
        <span>Theme</span>
        <ChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '280px',
          background: activeTheme.isDark ? '#0f172a' : '#ffffff',
          border: activeTheme.isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          borderRadius: '14px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.18)',
          padding: '0.85rem',
          zIndex: 100,
          animation: 'fadeIn 0.15s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <span style={{ fontWeight: 800, fontSize: '0.825rem', color: activeTheme.isDark ? '#f8fafc' : '#0f172a' }}>
              Select Color Theme
            </span>
            <button
              type="button"
              onClick={handleRandomize}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTheme.primary,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              <Shuffle size={11} />
              <span>Surprise</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {APP_THEMES.map((theme) => {
              const isSelected = theme.id === activeTheme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelect(theme.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    background: isSelected 
                      ? (activeTheme.isDark ? '#1e293b' : '#f1f5f9')
                      : 'transparent',
                    border: isSelected 
                      ? `1.5px solid ${theme.primary}` 
                      : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: theme.accentGradient || theme.swatch,
                      display: 'inline-block',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: activeTheme.isDark ? '#f8fafc' : '#0f172a' }}>
                        {theme.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: activeTheme.isDark ? '#94a3b8' : '#64748b' }}>
                        {theme.tagline}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={14} style={{ color: theme.primary }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
