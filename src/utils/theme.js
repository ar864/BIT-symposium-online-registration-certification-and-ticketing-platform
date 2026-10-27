/**
 * Master Color Theme Manager for BIT Symposium 2026
 * Controls full-site vibrant color themes, backgrounds, gradients, and UI/UX styles.
 */

export const APP_THEMES = [
  {
    id: 'sapphire',
    name: 'Royal Sapphire',
    tagline: 'Vibrant Institutional Blue & Electric Cyan',
    swatch: '#2563eb',
    primary: '#2563eb',
    primaryDark: '#1e3a8a',
    primaryLight: '#dbeafe',
    accent: '#06b6d4',
    secondary: '#0ea5e9',
    laserColor: '#00f2fe',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    sidebarBg: '#0f172a',
    headerGradient: 'linear-gradient(135deg, #0b132b 0%, #1e3a8a 50%, #2563eb 100%)',
    heroGradient: 'linear-gradient(135deg, #081228 0%, #0f2759 45%, #1d4ed8 75%, #0284c7 100%)',
    textGradient: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #a78bfa 100%)',
    accentGradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
    bgMain: '#f8fafc',
    badge: '#dbeafe',
    badgeText: '#1e40af',
    isDark: false
  },
  {
    id: 'cyberpunk',
    name: 'Cosmic Cyber',
    tagline: 'Deep Cosmic Purple & Neon Pink Flare',
    swatch: '#8b5cf6',
    primary: '#8b5cf6',
    primaryDark: '#5b21b6',
    primaryLight: '#ede9fe',
    accent: '#ec4899',
    secondary: '#d946ef',
    laserColor: '#d946ef',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    sidebarBg: '#1e1035',
    headerGradient: 'linear-gradient(135deg, #18032e 0%, #4c1d95 50%, #7c3aed 100%)',
    heroGradient: 'linear-gradient(135deg, #120724 0%, #2e1065 40%, #581c87 70%, #831843 100%)',
    textGradient: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #38bdf8 100%)',
    accentGradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    bgMain: '#faf5ff',
    badge: '#f3e8ff',
    badgeText: '#6b21a8',
    isDark: false
  },
  {
    id: 'ocean',
    name: 'Electric Ocean',
    tagline: 'Radiant Caribbean Azure & Seafoam Teal',
    swatch: '#0284c7',
    primary: '#0284c7',
    primaryDark: '#0369a1',
    primaryLight: '#e0f2fe',
    accent: '#14b8a6',
    secondary: '#06b6d4',
    laserColor: '#00f5d4',
    glowColor: 'rgba(2, 132, 199, 0.4)',
    sidebarBg: '#052132',
    headerGradient: 'linear-gradient(135deg, #031c2e 0%, #0369a1 50%, #0284c7 100%)',
    heroGradient: 'linear-gradient(135deg, #021a2d 0%, #075985 45%, #0284c7 75%, #0d9488 100%)',
    textGradient: 'linear-gradient(135deg, #38bdf8 0%, #2dd4bf 50%, #7dd3fc 100%)',
    accentGradient: 'linear-gradient(135deg, #0284c7 0%, #14b8a6 100%)',
    bgMain: '#f0fdfa',
    badge: '#ccfbf1',
    badgeText: '#0f766e',
    isDark: false
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    tagline: 'Futuristic Cyber Green & Solar Gold',
    swatch: '#10b981',
    primary: '#059669',
    primaryDark: '#064e3b',
    primaryLight: '#d1fae5',
    accent: '#f59e0b',
    secondary: '#10b981',
    laserColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    sidebarBg: '#022c22',
    headerGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #059669 100%)',
    heroGradient: 'linear-gradient(135deg, #022018 0%, #064e3b 45%, #047857 75%, #15803d 100%)',
    textGradient: 'linear-gradient(135deg, #34d399 0%, #6ee7b7 50%, #facc15 100%)',
    accentGradient: 'linear-gradient(135deg, #059669 0%, #10b981 60%, #eab308 100%)',
    bgMain: '#f0fdf4',
    badge: '#d1fae5',
    badgeText: '#065f46',
    isDark: false
  },
  {
    id: 'sunset',
    name: 'Sunset Flare',
    tagline: 'Fiery Crimson Ruby & Sunset Coral',
    swatch: '#f43f5e',
    primary: '#e11d48',
    primaryDark: '#9f1239',
    primaryLight: '#ffe4e6',
    accent: '#f97316',
    secondary: '#fb7185',
    laserColor: '#f43f5e',
    glowColor: 'rgba(225, 29, 72, 0.4)',
    sidebarBg: '#2a0611',
    headerGradient: 'linear-gradient(135deg, #31030e 0%, #881337 50%, #e11d48 100%)',
    heroGradient: 'linear-gradient(135deg, #260613 0%, #881337 45%, #be123c 75%, #ea580c 100%)',
    textGradient: 'linear-gradient(135deg, #fb7185 0%, #fda4af 50%, #f97316 100%)',
    accentGradient: 'linear-gradient(135deg, #e11d48 0%, #f97316 100%)',
    bgMain: '#fff5f5',
    badge: '#ffe4e6',
    badgeText: '#9f1239',
    isDark: false
  },
  {
    id: 'midnight',
    name: 'Midnight Cyber Dark',
    tagline: 'High-Tech OLED Dark Mode with Neon Aurora',
    swatch: '#0f172a',
    primary: '#38bdf8',
    primaryDark: '#0284c7',
    primaryLight: '#1e293b',
    accent: '#c084fc',
    secondary: '#f472b6',
    laserColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    sidebarBg: '#090d16',
    headerGradient: 'linear-gradient(135deg, #050811 0%, #0f172a 50%, #1e1b4b 100%)',
    heroGradient: 'linear-gradient(135deg, #050811 0%, #0f172a 45%, #1e1b4b 80%, #111827 100%)',
    textGradient: 'linear-gradient(135deg, #38bdf8 0%, #c084fc 50%, #f472b6 100%)',
    accentGradient: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 50%, #db2777 100%)',
    bgMain: '#090d16',
    badge: '#1e293b',
    badgeText: '#38bdf8',
    isDark: true
  }
];

// Backwards compatibility alias
export const ADMIN_THEMES = APP_THEMES;

const THEME_STORAGE_KEY = 'bit_active_color_theme';

export function applyThemeToDom(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-theme', theme.id);
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-dark', theme.primaryDark);
  root.style.setProperty('--primary-light', theme.primaryLight);
  root.style.setProperty('--primary-accent', theme.accent);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--theme-glow', theme.glowColor);
  root.style.setProperty('--theme-gradient', theme.accentGradient);
  root.style.setProperty('--theme-hero-gradient', theme.heroGradient);
  root.style.setProperty('--theme-text-gradient', theme.textGradient);
  root.style.setProperty('--theme-laser', theme.laserColor);
  root.style.setProperty('--theme-swatch', theme.swatch);

  if (theme.isDark) {
    root.style.setProperty('--bg-main', '#090d16');
    root.style.setProperty('--bg-card', '#111827');
    root.style.setProperty('--bg-card-subtle', '#1e293b');
    root.style.setProperty('--text-main', '#f8fafc');
    root.style.setProperty('--text-muted', '#cbd5e1');
    root.style.setProperty('--text-light', '#94a3b8');
    root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.12)');
    root.style.setProperty('--primary-navy', '#f8fafc');
    document.body.classList.add('dark-mode');
  } else {
    root.style.setProperty('--bg-main', theme.bgMain || '#f8fafc');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--bg-card-subtle', '#f1f5f9');
    root.style.setProperty('--text-main', '#0f172a');
    root.style.setProperty('--text-muted', '#475569');
    root.style.setProperty('--text-light', '#64748b');
    root.style.setProperty('--border-color', '#e2e8f0');
    root.style.setProperty('--primary-navy', '#0f172a');
    document.body.classList.remove('dark-mode');
  }
}

export function getActiveTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('bit_admin_color_theme');
    if (saved) {
      const found = APP_THEMES.find(t => t.id === saved);
      if (found) return found;
    }
  } catch (err) {
    console.error('Error reading active theme:', err);
  }
  return APP_THEMES[0]; // Default: Sapphire
}

export function setActiveTheme(themeId) {
  const found = APP_THEMES.find(t => t.id === themeId) || APP_THEMES[0];
  try {
    localStorage.setItem(THEME_STORAGE_KEY, found.id);
    localStorage.setItem('bit_admin_color_theme', found.id); // sync admin theme
    applyThemeToDom(found);
    window.dispatchEvent(new CustomEvent('bit_theme_changed', { detail: found }));
    window.dispatchEvent(new CustomEvent('bit_admin_theme_changed', { detail: found }));
  } catch (err) {
    console.error('Error saving theme:', err);
  }
  return found;
}

// Aliases for admin dashboard compatibility
export const getActiveAdminTheme = getActiveTheme;
export const setActiveAdminTheme = setActiveTheme;

export function initTheme() {
  const current = getActiveTheme();
  applyThemeToDom(current);
  return current;
}
