import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Award, 
  LogOut, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  RefreshCw, 
  ArrowRight, 
  Eye, 
  Calendar, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  School, 
  FileText, 
  Clock, 
  Layers,
  Download,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Lock,
  Palette,
  Camera,
  Edit3,
  Settings,
  Save,
  X,
  Sliders,
  QrCode
} from 'lucide-react';
import { 
  getParticipants, 
  deleteParticipant, 
  markAttendance, 
  resetToDemoData, 
  getParticipantByTicketId, 
  updatePaymentStatus,
  getPaymentStats,
  setAdminLoggedIn,
  getEvents,
  updateEventFee,
  updateParticipantTransaction,
  resetEventsToDefault
} from '../utils/storage';
import { 
  getLinkedPaymentConfig, 
  saveLinkedPaymentConfig, 
  resetLinkedPaymentConfig 
} from '../config/paymentConfig';
import { 
  ADMIN_THEMES, 
  getActiveAdminTheme, 
  setActiveAdminTheme 
} from '../utils/theme';
import GateQrScanner from '../components/GateQrScanner';

export default function AdminDashboard({ 
  initialTab = 'dashboard', 
  initialVerifyTicketId = '', 
  onLogout, 
  onViewTicket 
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [participants, setParticipants] = useState([]);
  const [eventsList, setEventsList] = useState(getEvents);
  const [activeTheme, setActiveTheme] = useState(getActiveAdminTheme);
  const [linkedUpi, setLinkedUpi] = useState(getLinkedPaymentConfig);
  
  // Participants search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('All');
  const [filterAttendance, setFilterAttendance] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');

  // Ticket Verification state
  const [verifyInput, setVerifyInput] = useState(initialVerifyTicketId);
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null); // 'valid' | 'invalid' | null
  const [verifyMessage, setVerifyMessage] = useState('');

  // Certificate Generator state
  const [selectedCertParticipantId, setSelectedCertParticipantId] = useState('');
  const [activeCertificate, setActiveCertificate] = useState(null);

  // Edit Transaction / Amount Modal State
  const [editTxModal, setEditTxModal] = useState({
    isOpen: false,
    participant: null,
    amount: 100,
    status: 'Paid',
    ref: '',
    method: 'Google Pay (UPI)'
  });

  // Edit Event Fee State
  const [editingFeeEventId, setEditingFeeEventId] = useState(null);
  const [tempFeeInput, setTempFeeInput] = useState(100);

  // Google Pay Account Linking Modal State
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiInputVal, setUpiInputVal] = useState(linkedUpi.upiId);
  const [payeeInputVal, setPayeeInputVal] = useState(linkedUpi.payeeName);
  const [upiSaveMsg, setUpiSaveMsg] = useState('');

  // Load participants data
  const reloadData = () => {
    const list = getParticipants();
    setParticipants(list);
    setEventsList(getEvents());
    setLinkedUpi(getLinkedPaymentConfig());
    
    // Auto-select first participant for certificate if none selected
    if (list.length > 0 && !selectedCertParticipantId) {
      setSelectedCertParticipantId(list[0].id);
    }
  };

  useEffect(() => {
    reloadData();

    // Listen to cross-component updates
    const handleUpdate = () => reloadData();
    const handleThemeUpdate = (e) => setActiveTheme(e.detail || getActiveAdminTheme());
    const handleUpiUpdate = (e) => {
      const cfg = e.detail || getLinkedPaymentConfig();
      setLinkedUpi(cfg);
      setUpiInputVal(cfg.upiId);
      setPayeeInputVal(cfg.payeeName);
    };

    window.addEventListener('bit_participants_updated', handleUpdate);
    window.addEventListener('bit_events_updated', handleUpdate);
    window.addEventListener('bit_admin_theme_changed', handleThemeUpdate);
    window.addEventListener('bit_upi_config_updated', handleUpiUpdate);

    return () => {
      window.removeEventListener('bit_participants_updated', handleUpdate);
      window.removeEventListener('bit_events_updated', handleUpdate);
      window.removeEventListener('bit_admin_theme_changed', handleThemeUpdate);
      window.removeEventListener('bit_upi_config_updated', handleUpiUpdate);
    };
  }, []);

  const handleSelectTheme = (themeId) => {
    const newTheme = setActiveAdminTheme(themeId);
    setActiveTheme(newTheme);
  };

  // If navigated with a pre-filled ticket to verify
  useEffect(() => {
    if (initialVerifyTicketId) {
      setVerifyInput(initialVerifyTicketId);
      setActiveTab('verify');
      handleVerify(initialVerifyTicketId);
    }
  }, [initialVerifyTicketId]);

  // Financial & Registration Statistics calculation
  const totalEvents = eventsList.length;
  const totalParticipants = participants.length;
  const paymentStats = getPaymentStats();
  const attendedCount = participants.filter(p => p.attendanceStatus === 'Attended').length;
  const attendanceRate = totalParticipants > 0 ? Math.round((attendedCount / totalParticipants) * 100) : 0;

  // Filtered Participants List
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEvent = filterEvent === 'All' || p.event === filterEvent;
    const matchesAttendance = filterAttendance === 'All' || p.attendanceStatus === filterAttendance;
    const matchesPayment = filterPayment === 'All' || (p.paymentStatus || 'Pending') === filterPayment;

    return matchesSearch && matchesEvent && matchesAttendance && matchesPayment;
  });

  // Handle Delete Participant
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete participant "${name}"?`)) {
      deleteParticipant(id);
      reloadData();
      if (verifiedResult && verifiedResult.id === id) {
        setVerifiedResult(null);
        setVerifyStatus(null);
      }
      if (activeCertificate && activeCertificate.id === id) {
        setActiveCertificate(null);
      }
    }
  };

  // Handle Reset to Demo Data
  const handleResetDemo = () => {
    if (window.confirm('Reset participants back to the 3 default demo participants (Arun, Ragul, Nisar)?')) {
      resetToDemoData();
      reloadData();
      setVerifyStatus(null);
      setVerifiedResult(null);
      setActiveCertificate(null);
    }
  };

  // Handle Ticket Verification
  const handleVerify = (ticketIdToTest) => {
    const idToSearch = (ticketIdToTest || verifyInput || '').trim();
    if (!idToSearch) {
      setVerifyStatus('invalid');
      setVerifyMessage('Please enter a Ticket ID');
      setVerifiedResult(null);
      return;
    }

    const participant = getParticipantByTicketId(idToSearch);
    if (participant) {
      setVerifiedResult(participant);
      setVerifyStatus('valid');
      setVerifyMessage('Ticket verified successfully!');
    } else {
      setVerifiedResult(null);
      setVerifyStatus('invalid');
      setVerifyMessage(`No participant found with Ticket ID "${idToSearch}". Please check the ID and try again.`);
    }
  };

  // Handle Mark Attendance
  const handleMarkAttendance = (ticketId) => {
    const res = markAttendance(ticketId);
    if (res.success) {
      setVerifiedResult(res.participant);
      reloadData();
    }
  };

  // Handle Payment Toggle (Demo Presentation Mode)
  const handleTogglePaymentDemo = (ticketId, currentStatus) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    const nextRef = nextStatus === 'Paid' ? ('UPI/DESK/' + Math.floor(100000000000 + Math.random() * 900000000000)) : null;
    const res = updatePaymentStatus(ticketId, {
      status: nextStatus,
      paymentRef: nextRef,
      paymentMethod: nextStatus === 'Paid' ? 'Google Pay / Desk Counter' : null
    });
    if (res.success) {
      if (verifiedResult && verifiedResult.ticketId === ticketId) {
        setVerifiedResult(res.participant);
      }
      reloadData();
    }
  };

  // Handle Open Transaction Editor (desk or table)
  const handleOpenEditTx = (participant) => {
    setEditTxModal({
      isOpen: true,
      participant: participant,
      amount: participant.paymentAmount !== undefined ? participant.paymentAmount : 100,
      status: participant.paymentStatus || 'Paid',
      ref: participant.paymentRef || ('UPI/GPAY/' + Math.floor(100000000000 + Math.random() * 900000000000)),
      method: participant.paymentMethod || 'Google Pay (UPI)'
    });
  };

  // Handle Save Transaction Edit
  const handleSaveEditTx = (e) => {
    if (e) e.preventDefault();
    if (!editTxModal.participant) return;

    const res = updateParticipantTransaction(editTxModal.participant.id, {
      paymentAmount: Number(editTxModal.amount),
      paymentStatus: editTxModal.status,
      paymentRef: editTxModal.ref,
      paymentMethod: editTxModal.method
    });

    if (res.success) {
      if (verifiedResult && verifiedResult.id === editTxModal.participant.id) {
        setVerifiedResult(res.participant);
      }
      reloadData();
      setEditTxModal({ isOpen: false, participant: null, amount: 0, status: 'Paid', ref: '', method: '' });
    }
  };

  // Handle Update Event Fee
  const handleSaveEventFee = (eventId) => {
    const numeric = Math.max(0, Number(tempFeeInput) || 0);
    updateEventFee(eventId, numeric);
    setEditingFeeEventId(null);
    reloadData();
  };

  // Handle Save Linked Google Pay Account
  const handleSaveUpiModal = (e) => {
    if (e) e.preventDefault();
    if (!upiInputVal.trim()) return;

    saveLinkedPaymentConfig({
      upiId: upiInputVal.trim(),
      payeeName: payeeInputVal.trim() || 'BIT Department Symposium 2026'
    });
    setUpiSaveMsg('Live Google Pay account linked successfully!');
    setTimeout(() => {
      setUpiSaveMsg('');
      setShowUpiModal(false);
    }, 1200);
  };

  // Export Participants Report to CSV
  const handleExportCSV = () => {
    const headers = [
      "Ticket ID",
      "Full Name",
      "College Name",
      "Department",
      "Year",
      "Email Address",
      "Phone",
      "Event Name",
      "Payment Status",
      "Fee Amount (INR)",
      "Payment Reference",
      "Attendance Status",
      "Registered At"
    ];

    const rows = participants.map(p => [
      `"${p.ticketId}"`,
      `"${p.name}"`,
      `"${p.college}"`,
      `"${p.department}"`,
      `"${p.year}"`,
      `"${p.email}"`,
      `"${p.phone}"`,
      `"${p.event}"`,
      `"${p.paymentStatus || 'Pending'}"`,
      `"${p.paymentAmount || 0}"`,
      `"${p.paymentRef || ''}"`,
      `"${p.attendanceStatus}"`,
      `"${p.registeredAt || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bit_symposium_participants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Certificate Generation
  const handleGenerateCertificate = () => {
    const participant = participants.find(p => p.id === selectedCertParticipantId);
    if (participant) {
      setActiveCertificate(participant);
    }
  };

  // Handle quick certificate launch from table
  const handleQuickCertFromTable = (participant) => {
    setSelectedCertParticipantId(participant.id);
    setActiveCertificate(participant);
    setActiveTab('certificate');
  };

  // Selected participant object for cert dropdown
  const selectedCertParticipant = participants.find(p => p.id === selectedCertParticipantId) || participants[0];

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar no-print" style={{
        borderRight: `1px solid ${activeTheme.primary}25`
      }}>
        <div>
          {/* Admin Header with Theme Accent */}
          <div style={{
            padding: '0.85rem',
            background: activeTheme.headerGradient,
            borderRadius: '12px',
            color: '#ffffff',
            marginBottom: '1.25rem',
            boxShadow: `0 4px 14px ${activeTheme.glowColor || 'rgba(0,0,0,0.2)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <ShieldCheck size={18} />
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>BIT Admin Portal</span>
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
              Symposium 2026 Control Center
            </div>
          </div>

          <div className="admin-nav-title">Management Modules</div>
          <div className="admin-nav-group">
            <button 
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={activeTab === 'dashboard' ? {
                background: activeTheme.headerGradient,
                color: '#ffffff',
                boxShadow: `0 4px 12px ${activeTheme.glowColor || 'rgba(0,0,0,0.15)'}`
              } : {}}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard Overview</span>
            </button>

            <button 
              className={`admin-nav-item ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
              style={activeTab === 'participants' ? {
                background: activeTheme.headerGradient,
                color: '#ffffff',
                boxShadow: `0 4px 12px ${activeTheme.glowColor || 'rgba(0,0,0,0.15)'}`
              } : {}}
            >
              <Users size={18} />
              <span>Participants ({totalParticipants})</span>
            </button>

            <button 
              className={`admin-nav-item ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveTab('verify')}
              style={activeTab === 'verify' ? {
                background: activeTheme.headerGradient,
                color: '#ffffff',
                boxShadow: `0 4px 12px ${activeTheme.glowColor || 'rgba(0,0,0,0.15)'}`
              } : {}}
            >
              <Camera size={18} />
              <span>Gate Entrance Scanner</span>
              <span className="badge" style={{
                marginLeft: 'auto',
                fontSize: '0.62rem',
                padding: '0.15rem 0.4rem',
                background: activeTheme.accent,
                color: '#ffffff',
                fontWeight: 800
              }}>
                LIVE
              </span>
            </button>

            <button 
              className={`admin-nav-item ${activeTab === 'certificate' ? 'active' : ''}`}
              onClick={() => setActiveTab('certificate')}
              style={activeTab === 'certificate' ? {
                background: activeTheme.headerGradient,
                color: '#ffffff',
                boxShadow: `0 4px 12px ${activeTheme.glowColor || 'rgba(0,0,0,0.15)'}`
              } : {}}
            >
              <Award size={18} />
              <span>Certificate Generator</span>
            </button>
          </div>

          {/* Linked Google Pay Quick Card in Sidebar */}
          <div style={{
            marginTop: '1.25rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.75rem',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                💳 Google Pay Account
              </span>
              <button
                type="button"
                onClick={() => setShowUpiModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTheme.primary,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Configure
              </button>
            </div>
            <code style={{ fontSize: '0.75rem', color: activeTheme.primary, fontWeight: 700, wordBreak: 'break-all', display: 'block' }}>
              {linkedUpi.upiId}
            </code>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>
              {linkedUpi.isCustom ? '🟢 Live Account Linked' : '🏛️ Institutional Default'}
            </div>
          </div>

          {/* Theme Switcher in Sidebar */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Palette size={14} style={{ color: activeTheme.primary }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase' }}>
                Color Theme ({activeTheme.name})
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              {ADMIN_THEMES.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  style={{
                    flex: 1,
                    height: '24px',
                    borderRadius: '6px',
                    background: theme.swatch,
                    border: activeTheme.id === theme.id ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    padding: 0,
                    transform: activeTheme.id === theme.id ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: activeTheme.id === theme.id ? `0 0 8px ${theme.swatch}` : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={theme.name + ' - ' + theme.tagline}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '0 0.5rem 0.5rem' }}>
            Logged in as <strong>Faculty Admin</strong>
          </div>
          <button 
            className="admin-nav-item" 
            onClick={onLogout}
            style={{ color: '#ef4444' }}
          >
            <LogOut size={18} />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Panel */}
      <main className="admin-main-panel">
        
        {/* Top Header Bar with Live Info & Theme Bar */}
        <div className="admin-header-bar no-print" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1rem 1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div className="admin-title-block">
            <h1 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800, color: '#0f172a' }}>
              {activeTab === 'dashboard' && 'Symposium Overview & Analytics'}
              {activeTab === 'participants' && 'Participant Records & Gate Desk'}
              {activeTab === 'verify' && 'College Gate Scanner & Entrance Desk'}
              {activeTab === 'certificate' && 'Official Certificate Generator'}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              BIT Department Symposium 2026 • Real-time localStorage Sync
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Live GPay status badge */}
            <button
              type="button"
              onClick={() => setShowUpiModal(true)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                border: '1px solid',
                borderColor: linkedUpi.isCustom ? '#86efac' : '#cbd5e1',
                background: linkedUpi.isCustom ? '#f0fdf4' : '#ffffff'
              }}
              title="Click to change live Google Pay account"
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: linkedUpi.isCustom ? '#16a34a' : '#3b82f6', display: 'inline-block' }} />
              <span>GPay: <strong>{linkedUpi.upiId.split('@')[0]}</strong></span>
              <Settings size={12} style={{ color: '#64748b' }} />
            </button>

            {/* Theme Swatches in Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: '#f1f5f9',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px'
            }}>
              <Palette size={12} style={{ color: '#64748b' }} />
              {ADMIN_THEMES.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: theme.swatch,
                    border: activeTheme.id === theme.id ? '2px solid #0f172a' : 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title={'Theme: ' + theme.name}
                />
              ))}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Export participants to CSV file">
              <Download size={13} />
              <span>CSV</span>
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleResetDemo} title="Restore original 3 sample participants">
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && (
          <div>

            {/* Dashboard Statistics Cards Grid */}
            <div className="admin-stats-grid">
              {/* Stat 1: Total Registrations */}
              <div className="admin-stat-card">
                <div>
                  <div className="admin-stat-lbl">Total Registrations</div>
                  <div className="admin-stat-val">{totalParticipants}</div>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={22} />
                </div>
              </div>

              {/* Stat 2: Verified Fee Collection */}
              <div className="admin-stat-card">
                <div>
                  <div className="admin-stat-lbl">Verified Collection</div>
                  <div className="admin-stat-val" style={{ color: '#047857' }}>₹{paymentStats.totalRevenue}</div>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={22} />
                </div>
              </div>

              {/* Stat 3: Paid vs Pending */}
              <div className="admin-stat-card">
                <div>
                  <div className="admin-stat-lbl">Paid / Pending</div>
                  <div className="admin-stat-val" style={{ fontSize: '1.45rem' }}>
                    <span style={{ color: '#059669' }}>{paymentStats.paidCount}</span>
                    <span style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0.35rem' }}>/</span>
                    <span style={{ color: '#d97706' }}>{paymentStats.pendingCount}</span>
                  </div>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={22} />
                </div>
              </div>

              {/* Stat 4: Attendance Recorded */}
              <div className="admin-stat-card">
                <div>
                  <div className="admin-stat-lbl">Attended ({attendanceRate}%)</div>
                  <div className="admin-stat-val" style={{ color: '#2563eb' }}>{attendedCount}</div>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            {/* Event-wise Distribution & Fee Management Cards */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} style={{ color: activeTheme.primary }} />
                  <span>Event Pricing & Revenue Analytics</span>
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (window.confirm('Reset all event entry fees to standard default prices?')) {
                        resetEventsToDefault();
                        reloadData();
                      }
                    }}
                    style={{ fontSize: '0.75rem' }}
                    title="Restore default event prices"
                  >
                    <RefreshCw size={12} />
                    <span>Reset Default Fees</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                {eventsList.map(ev => {
                  const evParticipants = participants.filter(p => p.event === ev.name);
                  const evPaid = evParticipants.filter(p => p.paymentStatus === 'Paid').length;
                  const evRevenue = evParticipants.reduce((sum, p) => sum + (p.paymentStatus === 'Paid' ? (Number(p.paymentAmount) || 0) : 0), 0);
                  const isEditingThis = editingFeeEventId === ev.id;

                  return (
                    <div key={ev.id} style={{
                      background: '#f8fafc',
                      border: '1px solid',
                      borderColor: isEditingThis ? activeTheme.primary : '#e2e8f0',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isEditingThis ? `0 0 10px ${activeTheme.glowColor || 'rgba(0,0,0,0.1)'}` : 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                          {ev.name}
                        </div>

                        {/* Fee Display or Edit Box */}
                        {isEditingThis ? (
                          <div style={{ marginTop: '0.35rem', background: '#ffffff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                              New Entry Fee (₹):
                            </label>
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                              <input
                                type="number"
                                className="form-input"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.8rem', width: '80px' }}
                                value={tempFeeInput}
                                onChange={(e) => setTempFeeInput(e.target.value)}
                                min="0"
                                autoFocus
                              />
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={() => handleSaveEventFee(ev.id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                                onClick={() => setEditingFeeEventId(null)}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Fee: <strong style={{ color: ev.feeAmount === 0 ? '#059669' : '#0f172a' }}>{ev.fee}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFeeEventId(ev.id);
                                setTempFeeInput(ev.feeAmount);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTheme.primary,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.1rem 0.3rem'
                              }}
                              title="Click to edit registration fee for this event"
                            >
                              <Edit3 size={11} />
                              <span>Edit Fee</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                            {evParticipants.length}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Registered ({evPaid} Paid)</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>
                            ₹{evRevenue}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Collected</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: '#2563eb' }} />
                  <span>Entrance Verification Counter</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Scan or enter attendee Ticket IDs at the gate to verify valid payments and record presence.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('verify')}>
                  <span>Open Verification Desk</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} style={{ color: '#d97706' }} />
                  <span>Certificate Issuance Portal</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Issue official authenticated Certificates of Participation for verified symposium attendees.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('certificate')}>
                  <span>Launch Certificate Portal</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="table-card">
              <div className="table-toolbar">
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                  Recent Registrations & Payment Status
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab('participants')}
                >
                  <span>View All ({totalParticipants})</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Event</th>
                      <th>Ticket ID</th>
                      <th>Payment</th>
                      <th>Attendance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.slice(0, 4).map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.college}</div>
                        </td>
                        <td>{p.event}</td>
                        <td>
                          <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                            {p.ticketId}
                          </code>
                        </td>
                        <td>
                          <span className={`badge ${p.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                            {p.paymentStatus === 'Paid' ? `Paid (₹${p.paymentAmount || 100})` : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${p.attendanceStatus === 'Attended' ? 'badge-success' : 'badge-warning'}`}>
                            {p.attendanceStatus === 'Attended' ? '✓ Attended' : 'Not Attended'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => onViewTicket(p)}
                              title="View Digital Ticket"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleQuickCertFromTable(p)}
                              title="Generate Certificate"
                            >
                              <Award size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PARTICIPANTS TABLE ================= */}
        {activeTab === 'participants' && (
          <div>
            <div className="admin-header-bar no-print">
              <div className="admin-title-block">
                <h1>Participants Directory & Records</h1>
                <p>Manage, search, filter, export, and track payment & attendance status ({participants.length} total)</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={handleExportCSV} title="Export all participants to CSV">
                  <Download size={14} />
                  <span>Export to CSV</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleResetDemo} title="Restore original 3 demo records">
                  <RefreshCw size={14} />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>

            <div className="table-card">
              {/* Search and Filters Toolbar */}
              <div className="table-toolbar">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-input-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search name, college, email, or ticket ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Filter by Event */}
                  <select 
                    className="form-select" 
                    style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                  >
                    <option value="All">All Events ({participants.length})</option>
                    {eventsList.map(ev => (
                      <option key={ev.id} value={ev.name}>{ev.name}</option>
                    ))}
                  </select>

                  {/* Filter by Payment */}
                  <select 
                    className="form-select" 
                    style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                  >
                    <option value="All">All Payment Statuses</option>
                    <option value="Paid">Paid ({paymentStats.paidCount})</option>
                    <option value="Pending">Pending ({paymentStats.pendingCount})</option>
                    <option value="Failed">Failed ({paymentStats.failedCount})</option>
                  </select>

                  {/* Filter by Attendance */}
                  <select 
                    className="form-select" 
                    style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                    value={filterAttendance}
                    onChange={(e) => setFilterAttendance(e.target.value)}
                  >
                    <option value="All">All Attendance</option>
                    <option value="Attended">Attended ({attendedCount})</option>
                    <option value="Not Attended">Not Attended ({totalParticipants - attendedCount})</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="table-responsive">
                {filteredParticipants.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600 }}>No participants found matching your criteria</p>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ marginTop: '0.75rem' }}
                      onClick={() => { setSearchTerm(''); setFilterEvent('All'); setFilterAttendance('All'); setFilterPayment('All'); }}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Participant Name</th>
                        <th>College & Dept</th>
                        <th>Event</th>
                        <th>Ticket ID</th>
                        <th>Payment Status</th>
                        <th>Attendance</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParticipants.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email} • {p.phone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#334155' }}>{p.college}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.department} ({p.year})</div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1e40af' }}>{p.event}</span>
                          </td>
                          <td>
                            <code style={{ 
                              background: '#f1f5f9', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '4px', 
                              fontWeight: 700,
                              color: '#0f172a',
                              fontFamily: 'monospace'
                            }}>
                              {p.ticketId}
                            </code>
                          </td>
                          <td>
                            <button
                              onClick={() => handleTogglePaymentDemo(p.ticketId, p.paymentStatus)}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                              title="Click to toggle Payment Status (Demo Mode)"
                            >
                              <span className={`badge ${p.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                {p.paymentStatus === 'Paid' ? `Paid (₹${p.paymentAmount || 100})` : 'Pending'}
                              </span>
                            </button>
                            {p.paymentRef && (
                              <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                                {p.paymentRef}
                              </div>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                if (p.attendanceStatus === 'Not Attended') {
                                  handleMarkAttendance(p.ticketId);
                                }
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                padding: 0,
                                cursor: p.attendanceStatus === 'Not Attended' ? 'pointer' : 'default'
                              }}
                              title={p.attendanceStatus === 'Not Attended' ? 'Click to mark Attended' : 'Attended'}
                            >
                              <span className={`badge ${p.attendanceStatus === 'Attended' ? 'badge-success' : 'badge-warning'}`}>
                                {p.attendanceStatus === 'Attended' ? '✓ Attended' : 'Not Attended'}
                              </span>
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => onViewTicket(p)}
                                title="View Digital Pass"
                              >
                                <Eye size={14} />
                              </button>

                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEditTx(p)}
                                title="Change Amount & Transaction Details"
                                style={{ color: activeTheme.primary }}
                              >
                                <Edit3 size={14} />
                              </button>

                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleQuickCertFromTable(p)}
                                title="Generate Certificate"
                              >
                                <Award size={14} />
                              </button>

                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(p.id, p.name)}
                                title="Delete Participant"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: TICKET VERIFICATION & ATTENDANCE ================= */}
        {activeTab === 'verify' && (
          <div className="verify-card-container">
            <div className="admin-header-bar no-print" style={{ justifyContent: 'center', textAlign: 'center' }}>
              <div className="admin-title-block">
                <h1>College Entrance Verification Desk</h1>
                <p>Verify attendee Ticket ID, check fee payment clearance, and confirm gate attendance</p>
              </div>
            </div>

            {/* Real-time Gate QR Camera & Scanner Widget */}
            <GateQrScanner
              participants={participants}
              onTicketScanned={(id) => {
                setVerifyInput(id);
                handleVerify(id);
              }}
              activeTheme={activeTheme}
            />

            {/* Input Card */}
            <div className="verify-input-card no-print">
              <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  Enter Ticket ID
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. BIT2026-1001"
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <ShieldCheck size={18} />
                    <span>Verify Ticket</span>
                  </button>
                </div>
              </form>

              {/* Clickable Quick Sample Ticket Chips for Evaluators / Viva */}
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Quick Test Demo Tickets:
                </div>
                <div className="sample-tickets-bar">
                  {participants.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className="sample-ticket-chip"
                      onClick={() => {
                        setVerifyInput(p.ticketId);
                        handleVerify(p.ticketId);
                      }}
                    >
                      {p.ticketId} ({p.name} • {p.paymentStatus || 'Pending'} • {p.attendanceStatus})
                    </button>
                  ))}
                  <button
                    type="button"
                    className="sample-ticket-chip"
                    style={{ color: '#ef4444', borderColor: '#fecaca', background: '#fef2f2' }}
                    onClick={() => {
                      setVerifyInput('BIT2026-9999');
                      handleVerify('BIT2026-9999');
                    }}
                  >
                    BIT2026-9999 (Invalid Sample)
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Result Card: VALID */}
            {verifyStatus === 'valid' && verifiedResult && (
              <div className="verify-result-card">
                <div className="verify-status-banner valid">
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800 }}>✓ VALID TICKET</h3>
                    <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                      Official Participant Record Confirmed
                    </span>
                  </div>
                </div>

                {/* Participant Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      Participant Name
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {verifiedResult.name}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      Ticket ID
                    </span>
                    <div>
                      <code style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb' }}>
                        {verifiedResult.ticketId}
                      </code>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      Event Name
                    </span>
                    <div style={{ fontWeight: 700, color: '#1e3a8a' }}>
                      {verifiedResult.event}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      College & Dept
                    </span>
                    <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                      {verifiedResult.college} ({verifiedResult.department})
                    </div>
                  </div>
                </div>

                {/* Payment Clearance Verification Box */}
                <div style={{
                  background: verifiedResult.paymentStatus === 'Paid' ? '#ecfdf5' : '#fffbeb',
                  border: '1px solid',
                  borderColor: verifiedResult.paymentStatus === 'Paid' ? '#a7f3d0' : '#fde68a',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: verifiedResult.paymentStatus === 'Paid' ? '#065f46' : '#92400e' }}>
                      Payment Clearance Status:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span className={`badge ${verifiedResult.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {verifiedResult.paymentStatus === 'Paid' ? `PAID (₹${verifiedResult.paymentAmount || 100})` : 'PAYMENT PENDING'}
                      </span>
                      {verifiedResult.paymentRef && (
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
                          Ref: {verifiedResult.paymentRef}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEditTx(verifiedResult)}
                      style={{ fontSize: '0.78rem' }}
                      title="Adjust or change registration fee amount or status"
                    >
                      <Edit3 size={13} style={{ color: activeTheme.primary }} />
                      <span>✏️ Change / Adjust Amount</span>
                    </button>

                    {verifiedResult.paymentStatus !== 'Paid' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleTogglePaymentDemo(verifiedResult.ticketId, 'Pending')}
                        style={{ fontSize: '0.78rem' }}
                      >
                        <CreditCard size={13} />
                        <span>Quick Approve (Demo)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Attendance Status & Action Button */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      Gate Attendance Status
                    </div>
                    <div style={{ marginTop: '0.25rem' }}>
                      <span className={`badge ${verifiedResult.attendanceStatus === 'Attended' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                        {verifiedResult.attendanceStatus === 'Attended' ? '✓ ATTENDED (PRESENT)' : 'NOT ATTENDED'}
                      </span>
                    </div>
                  </div>

                  {verifiedResult.attendanceStatus === 'Not Attended' ? (
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleMarkAttendance(verifiedResult.ticketId)}
                    >
                      <Check size={18} />
                      <span>Mark Attendance (Present)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleQuickCertFromTable(verifiedResult)}
                    >
                      <Award size={18} />
                      <span>Generate Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Verification Result Card: INVALID */}
            {verifyStatus === 'invalid' && (
              <div className="verify-result-card invalid">
                <div className="verify-status-banner invalid">
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#fef2f2',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <XCircle size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800 }}>✗ INVALID TICKET</h3>
                    <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>
                      Verification Failed
                    </span>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  {verifyMessage || 'The entered Ticket ID is not registered in the system.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: CERTIFICATE GENERATOR ================= */}
        {activeTab === 'certificate' && (
          <div>
            <div className="admin-header-bar no-print">
              <div className="admin-title-block">
                <h1>Certificate of Participation Generator</h1>
                <p>Generate, verify eligibility, and print authenticated symposium participation certificates</p>
              </div>
            </div>

            {/* Control Panel */}
            <div className="cert-control-panel no-print">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.25rem', alignItems: 'flex-end' }}>
                <div className="form-group">
                  <label className="form-label">
                    Select Participant
                  </label>
                  <select
                    className="form-select"
                    value={selectedCertParticipantId}
                    onChange={(e) => setSelectedCertParticipantId(e.target.value)}
                  >
                    {participants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.event} ({p.ticketId} • {p.paymentStatus || 'Pending'} • {p.attendanceStatus})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Registered Event (Auto-populated)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedCertParticipant ? selectedCertParticipant.event : ''}
                    readOnly
                    style={{ background: '#f8fafc', fontWeight: 600, color: '#1e3a8a' }}
                  />
                </div>

                <div>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleGenerateCertificate}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Award size={18} />
                    <span>Generate Certificate</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Certificate Document Preview */}
            {(activeCertificate || selectedCertParticipant) && (() => {
              const certUser = activeCertificate || selectedCertParticipant;
              const certId = `CERT-BIT2026-${certUser.ticketId.replace('BIT2026-', '')}`;
              const isEligible = certUser.attendanceStatus === 'Attended';

              return (
                <div>
                  {/* Eligibility Notice Banner */}
                  {!isEligible && (
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#92400e'
                    }} className="no-print">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <AlertTriangle size={20} style={{ color: '#d97706' }} />
                        <div>
                          <strong>Attendance Verification Required:</strong>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>
                            Participation certificates are officially issued after the student attends the symposium event.
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAttendance(certUser.ticketId)}
                      >
                        <Check size={14} />
                        <span>Confirm Attendance (Present)</span>
                      </button>
                    </div>
                  )}

                  {/* Print Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="no-print">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${isEligible ? 'badge-success' : 'badge-warning'}`}>
                        {isEligible ? '✓ ELIGIBLE FOR CERTIFICATION' : 'ATTENDANCE PENDING'}
                      </span>
                    </div>

                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => window.print()}
                    >
                      <Printer size={18} />
                      <span>Print / Download Certificate</span>
                    </button>
                  </div>

                  {/* Certificate Preview Frame */}
                  <div className="cert-preview-container">
                    <div className="certificate-frame" id="certificate-print-area">
                      <div className="cert-outer-border">
                        <div className="cert-inner-border">
                          {/* Corner Ornaments */}
                          <div className="cert-corner-ornament cert-corner-tl"></div>
                          <div className="cert-corner-ornament cert-corner-tr"></div>
                          <div className="cert-corner-ornament cert-corner-bl"></div>
                          <div className="cert-corner-ornament cert-corner-br"></div>

                          {/* Header Section */}
                          <div className="cert-header">
                            <div className="cert-college-title">
                              Bannari Amman Institute of Technology
                            </div>
                            <div className="cert-symposium-badge">
                              Department of Computer Science & Engineering • Symposium 2026
                            </div>

                            <div className="cert-main-title">
                              Certificate of Participation
                            </div>

                            <div className="cert-subtext-lead">
                              This certificate is proudly presented to
                            </div>

                            <div className="cert-recipient-name">
                              {certUser.name}
                            </div>

                            <div className="cert-college-dept">
                              of {certUser.college}, Department of {certUser.department}
                            </div>

                            <div className="cert-event-statement">
                              For successfully participating in <strong>{certUser.event}</strong> at the 
                              <strong> BIT Department Symposium 2026</strong> held on September 15-19, 2026.
                            </div>
                          </div>

                          {/* Signatures & Seal */}
                          <div className="cert-footer-grid">
                            {/* Faculty Coordinator Sig */}
                            <div className="cert-sig-block">
                              <div className="cert-sig-script">K. Senthil Kumar</div>
                              <div className="cert-sig-line">
                                <div className="cert-sig-name">Dr. K. Senthil Kumar</div>
                                <div className="cert-sig-title">Faculty Coordinator</div>
                              </div>
                            </div>

                            {/* Official Gold Seal Stamp */}
                            <div className="cert-seal-badge">
                              <Sparkles size={18} />
                              <div className="cert-seal-text">
                                BIT 2026<br />OFFICIAL
                              </div>
                            </div>

                            {/* HOD Sig */}
                            <div className="cert-sig-block">
                              <div className="cert-sig-script">C. Ramesh</div>
                              <div className="cert-sig-line">
                                <div className="cert-sig-name">Dr. C. Ramesh</div>
                                <div className="cert-sig-title">Head of Department</div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Credentials Footer */}
                          <div className="cert-meta-tag">
                            <span>Certificate ID: {certId}</span>
                            <span>Ticket ID: {certUser.ticketId}</span>
                            <span>Date: September 19, 2026</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* ================= MODAL: EDIT TRANSACTION AMOUNT & STATUS ================= */}
      {editTxModal.isOpen && editTxModal.participant && (
        <div className="modal-backdrop" onClick={() => setEditTxModal({ ...editTxModal, isOpen: false })}>
          <div className="login-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="login-card-header" style={{ background: activeTheme.headerGradient, padding: '1.5rem' }}>
              <button 
                className="login-close-btn" 
                onClick={() => setEditTxModal({ ...editTxModal, isOpen: false })}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                <Edit3 size={20} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Adjust Transaction Fee</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>
                {editTxModal.participant.name} • {editTxModal.participant.ticketId}
              </p>
            </div>

            <form onSubmit={handleSaveEditTx} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Event Name</label>
                <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.9rem' }}>
                  {editTxModal.participant.event}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Fee Amount (INR ₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontWeight: 700, fontSize: '1.05rem', color: '#059669' }}
                  value={editTxModal.amount}
                  onChange={(e) => setEditTxModal({ ...editTxModal, amount: e.target.value })}
                  min="0"
                  required
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                  Enter custom amount for discounts, spot registration, or waiver (0 for Free).
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Payment Clearance Status</label>
                <select
                  className="form-select"
                  value={editTxModal.status}
                  onChange={(e) => setEditTxModal({ ...editTxModal, status: e.target.value })}
                >
                  <option value="Paid">Paid (Approved & Cleared)</option>
                  <option value="Pending">Pending (Payment Awaited)</option>
                  <option value="Failed">Failed (Payment Rejected)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Payment Reference / UTR Number</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={editTxModal.ref}
                  onChange={(e) => setEditTxModal({ ...editTxModal, ref: e.target.value })}
                  placeholder="e.g. UPI/GPAY/2026/1001 or CASH-DESK-01"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Payment Method</label>
                <select
                  className="form-select"
                  value={editTxModal.method}
                  onChange={(e) => setEditTxModal({ ...editTxModal, method: e.target.value })}
                >
                  <option value="Google Pay (UPI)">Google Pay (UPI)</option>
                  <option value="PhonePe (UPI)">PhonePe (UPI)</option>
                  <option value="Paytm (UPI)">Paytm (UPI)</option>
                  <option value="Desk Counter Cash">Desk Counter Cash</option>
                  <option value="Fee Waiver">Fee Waiver / Free</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>Save Transaction</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setEditTxModal({ ...editTxModal, isOpen: false })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LINK LIVE GOOGLE PAY / UPI ACCOUNT ================= */}
      {showUpiModal && (
        <div className="modal-backdrop" onClick={() => setShowUpiModal(false)}>
          <div className="login-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="login-card-header" style={{ background: activeTheme.headerGradient, padding: '1.5rem' }}>
              <button className="login-close-btn" onClick={() => setShowUpiModal(false)} aria-label="Close">
                <X size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                <CreditCard size={20} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Link Live Google Pay Account</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>
                Connect your real UPI account for live student payments & QR codes
              </p>
            </div>

            <form onSubmit={handleSaveUpiModal} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                  Quick Google Pay Bank Handles:
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['@okaxis', '@oksbi', '@okhdfcbank', '@paytm', '@ybl'].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        let clean = (upiInputVal || '').split('@')[0] || 'myupi';
                        setUpiInputVal(`${clean}${h}`);
                      }}
                      style={{
                        background: '#e0e7ff',
                        border: '1px solid #c7d2fe',
                        borderRadius: '4px',
                        padding: '0.2rem 0.45rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#3730a3',
                        cursor: 'pointer'
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Google Pay UPI ID (VPA) *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: '#1e40af' }}
                  value={upiInputVal}
                  onChange={(e) => setUpiInputVal(e.target.value)}
                  placeholder="e.g. yourname@okaxis or 9876543210@paytm"
                  required
                  autoFocus
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                  This UPI address will be embedded in all checkout QR codes for instant live scanning.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Payee / College Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={payeeInputVal}
                  onChange={(e) => setPayeeInputVal(e.target.value)}
                  placeholder="e.g. BIT Department Symposium 2026"
                />
              </div>

              {upiSaveMsg && (
                <div style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 700 }}>
                  ✓ {upiSaveMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>Save & Link Account</span>
                </button>
                {linkedUpi.isCustom && (
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm" 
                    onClick={() => {
                      resetLinkedPaymentConfig();
                      reloadData();
                      setShowUpiModal(false);
                    }}
                  >
                    Reset Default
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpiModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
