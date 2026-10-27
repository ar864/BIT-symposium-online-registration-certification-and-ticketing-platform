import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink, 
  HelpCircle, 
  RefreshCw,
  QrCode,
  Calendar,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  PAYMENT_CONFIG, 
  generateUpiUri, 
  generateGPayDeepLink, 
  getLinkedPaymentConfig, 
  saveLinkedPaymentConfig, 
  resetLinkedPaymentConfig 
} from '../config/paymentConfig';
import { updatePaymentStatus, getEvents } from '../utils/storage';

export default function PaymentPage({ 
  participant, 
  onPaymentSuccess, 
  onPaymentCancel, 
  onNavigate 
}) {
  const [selectedMethod, setSelectedMethod] = useState('gpay');
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [paymentState, setPaymentState] = useState(participant?.paymentStatus || 'Pending'); // 'Pending' | 'Paid' | 'Failed'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!participant) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>No Registration Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Please complete event registration first.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('register')}>
          Go to Registration
        </button>
      </div>
    );
  }

  const eventsList = getEvents();
  const matchedEvent = eventsList.find(e => e.name === participant.event) || {
    name: participant.event,
    fee: "₹100",
    feeAmount: 100,
    date: "September 15-19, 2026",
    venue: "BIT Campus"
  };

  const initialAmount = participant.paymentAmount !== undefined ? Number(participant.paymentAmount) : (matchedEvent.feeAmount || 0);
  const isFreeEvent = matchedEvent.fee.toLowerCase() === 'free' || initialAmount === 0;

  const currentLinked = getLinkedPaymentConfig();
  const [activeUpiId, setActiveUpiId] = useState(currentLinked.upiId);
  const [activePayeeName, setActivePayeeName] = useState(currentLinked.payeeName);
  const [isCustomLinked, setIsCustomLinked] = useState(currentLinked.isCustom);
  const [activeAmount, setActiveAmount] = useState(initialAmount);
  const [showLiveSettings, setShowLiveSettings] = useState(false);
  const [customUpiInput, setCustomUpiInput] = useState(currentLinked.upiId);
  const [customPayeeInput, setCustomPayeeInput] = useState(currentLinked.payeeName);
  const [customAmtInput, setCustomAmtInput] = useState(initialAmount || 100);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sync when global UPI config updates
  useEffect(() => {
    const handleUpiConfigUpdated = (e) => {
      const cfg = e.detail || getLinkedPaymentConfig();
      setActiveUpiId(cfg.upiId);
      setActivePayeeName(cfg.payeeName);
      setIsCustomLinked(cfg.isCustom);
      setCustomUpiInput(cfg.upiId);
      setCustomPayeeInput(cfg.payeeName);
    };
    window.addEventListener('bit_upi_config_updated', handleUpiConfigUpdated);
    return () => window.removeEventListener('bit_upi_config_updated', handleUpiConfigUpdated);
  }, []);

  const amount = activeAmount;

  // Generate dynamic UPI URI for QR code & mobile intent with live customizable parameters
  const upiUri = generateUpiUri({
    upiId: activeUpiId,
    payeeName: activePayeeName,
    amount: activeAmount,
    transactionNote: `BIT2026-${participant.ticketId}`
  });

  const gpayDeepLink = generateGPayDeepLink({
    upiId: activeUpiId,
    payeeName: activePayeeName,
    amount: activeAmount,
    transactionNote: `BIT2026-${participant.ticketId}`
  });

  const handleApplyLiveSettings = (e) => {
    e.preventDefault();
    if (customUpiInput.trim()) {
      const saved = saveLinkedPaymentConfig({
        upiId: customUpiInput.trim(),
        payeeName: customPayeeInput.trim() || PAYMENT_CONFIG.PAYEE_NAME
      });
      if (saved) {
        setActiveUpiId(customUpiInput.trim());
        setActivePayeeName(customPayeeInput.trim() || PAYMENT_CONFIG.PAYEE_NAME);
        setIsCustomLinked(true);
      }
    }
    if (Number(customAmtInput) >= 0) {
      setActiveAmount(Number(customAmtInput));
      // Also update participant in storage if amount changed
      if (Number(customAmtInput) !== participant.paymentAmount) {
        updatePaymentStatus(participant.ticketId, {
          status: participant.paymentStatus || 'Pending',
          amount: Number(customAmtInput)
        });
      }
    }
    setSaveSuccessMsg('Live Google Pay account & amount updated and saved!');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setShowLiveSettings(false);
    }, 1500);
  };

  const handleResetDefaultAccount = () => {
    resetLinkedPaymentConfig();
    setActiveUpiId(PAYMENT_CONFIG.UPI_ID);
    setActivePayeeName(PAYMENT_CONFIG.PAYEE_NAME);
    setIsCustomLinked(false);
    setCustomUpiInput(PAYMENT_CONFIG.UPI_ID);
    setCustomPayeeInput(PAYMENT_CONFIG.PAYEE_NAME);
  };

  const handleAppendUpiHandle = (handle) => {
    let clean = customUpiInput.split('@')[0] || '';
    if (!clean) clean = 'mygooglepay';
    setCustomUpiInput(`${clean}${handle}`);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Free Event Instant Confirmation
  const handleFreeEventConfirm = () => {
    setIsProcessing(true);
    const result = updatePaymentStatus(participant.ticketId, {
      status: 'Paid',
      paymentRef: 'FREE-ENTRY-PASS',
      paymentMethod: 'Free Registration',
      amount: 0
    });

    setTimeout(() => {
      setIsProcessing(false);
      if (result.success) {
        onPaymentSuccess(result.participant);
      }
    }, 400);
  };

  // Handle Manual UTR Submission
  const handleUtrSubmit = (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setUtrError('Please enter the 12-digit UPI UTR / Transaction Reference number');
      return;
    }
    if (utrNumber.trim().length < 8) {
      setUtrError('Please enter a valid reference ID (min 8 characters)');
      return;
    }

    setUtrError('');
    setIsProcessing(true);

    const ref = `UTR-${utrNumber.trim()}`;
    const result = updatePaymentStatus(participant.ticketId, {
      status: 'Paid',
      paymentRef: ref,
      paymentMethod: 'UPI App (Manual UTR)',
      amount: amount
    });

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentState('Paid');
      if (result.success) {
        onPaymentSuccess(result.participant);
      }
    }, 600);
  };

  // Demo Presentation Mode: Simulate GPay Success
  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setErrorMessage('');
    const randomRef = 'UPI/GPAY/' + Math.floor(100000000000 + Math.random() * 900000000000);

    const result = updatePaymentStatus(participant.ticketId, {
      status: 'Paid',
      paymentRef: randomRef,
      paymentMethod: 'Google Pay (UPI)',
      amount: amount
    });

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentState('Paid');
      if (result.success) {
        onPaymentSuccess(result.participant);
      }
    }, 700);
  };

  // Demo Presentation Mode: Simulate Payment Failure
  const handleSimulateFailure = () => {
    setIsProcessing(true);
    updatePaymentStatus(participant.ticketId, {
      status: 'Failed',
      paymentRef: null,
      paymentMethod: 'Google Pay (UPI)',
      amount: amount
    });

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentState('Failed');
      setErrorMessage('Payment failed or cancelled by user in UPI app. Please retry.');
    }, 500);
  };

  return (
    <div className="payment-page-container" style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Header Title */}
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <span className="section-tag">Secure Event Registration Checkout</span>
          <h1 className="section-title">Google Pay & UPI Payment</h1>
          <p className="section-subtitle">
            Complete your registration fee to instantly activate your digital symposium entry pass.
          </p>
        </div>

        {/* Free Event Special View */}
        {isFreeEvent ? (
          <div style={{
            background: '#ffffff',
            border: '2px solid #a7f3d0',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.65rem', color: '#065f46', marginBottom: '0.5rem' }}>
              Free Event Registration!
            </h2>
            <p style={{ color: '#475569', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              <strong>{matchedEvent.name}</strong> is completely free of charge. No payment is required.
              Click the button below to issue your official digital entry ticket.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              maxWidth: '480px',
              margin: '0 auto 2rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Participant:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{participant.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Ticket ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{participant.ticketId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Registration Fee:</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>FREE (₹0)</span>
              </div>
            </div>

            <button 
              className="btn btn-success btn-lg"
              onClick={handleFreeEventConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Issuing Digital Ticket...' : 'Confirm Free Registration & Issue Ticket'}
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* Paid Event View */
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem' }}>
            
            {/* Left Column: QR Code & UPI Scan */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>Scan & Pay via UPI</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Google Pay • PhonePe • Paytm • BHIM</span>
                </div>
              </div>

              {/* Supported App Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {PAYMENT_CONFIG.METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: selectedMethod === m.id ? '#4f46e5' : '#e2e8f0',
                      background: selectedMethod === m.id ? '#eef2ff' : '#f8fafc',
                      color: selectedMethod === m.id ? '#4338ca' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {/* QR Code Container */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <QRCodeSVG
                  value={upiUri}
                  size={210}
                  level="H"
                  includeMargin={true}
                />
                <div style={{ marginTop: '0.65rem', fontSize: '0.9rem', fontWeight: 800, color: '#1e3a8a' }}>
                  Live Google Pay Amount: ₹{activeAmount}.00
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Event: {matchedEvent.name}
                </div>
              </div>

              {/* Active Linked Google Pay / UPI Account Display */}
              <div style={{
                marginTop: '1.25rem',
                width: '100%',
                background: isCustomLinked ? '#f0fdf4' : '#f8fafc',
                border: '1px solid',
                borderColor: isCustomLinked ? '#86efac' : '#e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCustomLinked ? '#16a34a' : '#2563eb', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.72rem', color: isCustomLinked ? '#15803d' : '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.03em' }}>
                      {isCustomLinked ? 'Live Linked Google Pay Account' : 'Institutional Symposium Account'}
                    </span>
                  </div>
                  <code style={{ fontSize: '0.92rem', color: isCustomLinked ? '#166534' : '#1e40af', fontWeight: 800 }}>
                    {activeUpiId}
                  </code>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Payee: <strong>{activePayeeName}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeUpiId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    title="Copy UPI ID"
                  >
                    {copied ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLiveSettings(!showLiveSettings)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    <span>{showLiveSettings ? 'Close' : '🔗 Link Account'}</span>
                  </button>
                </div>
              </div>

              {/* Live Google Pay Account Linking & Amount Customization Panel */}
              {showLiveSettings && (
                <form onSubmit={handleApplyLiveSettings} style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  background: '#f8fafc',
                  border: '1.5px solid #6366f1',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  boxShadow: 'var(--shadow-md)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 800, color: '#1e1b4b', fontSize: '0.85rem' }}>
                      🔗 Link Your Live Google Pay / UPI Account
                    </div>
                    {isCustomLinked && (
                      <button
                        type="button"
                        onClick={handleResetDefaultAccount}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                    Link your real Google Pay ID so anyone scanning this QR code with their phone camera or Google Pay app will transfer directly to your account.
                  </p>

                  {/* VPA Quick Append Shortcuts */}
                  <div style={{ marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Quick Google Pay Bank Handles:
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {['@okaxis', '@oksbi', '@okhdfcbank', '@paytm', '@ybl'].map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => handleAppendUpiHandle(h)}
                          style={{
                            background: '#e0e7ff',
                            border: '1px solid #c7d2fe',
                            borderRadius: '4px',
                            padding: '0.15rem 0.45rem',
                            fontSize: '0.7rem',
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                        Google Pay UPI VPA (ID):
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                        placeholder="e.g. yourname@okaxis or 9876543210@paytm"
                        value={customUpiInput}
                        onChange={(e) => setCustomUpiInput(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                          Payee Display Name:
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                          placeholder="e.g. Dhinakaran / BIT"
                          value={customPayeeInput}
                          onChange={(e) => setCustomPayeeInput(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                          Amount (₹):
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem', fontWeight: 700 }}
                          placeholder="Amount"
                          value={customAmtInput}
                          onChange={(e) => setCustomAmtInput(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {saveSuccessMsg && (
                    <div style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      ✓ {saveSuccessMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      Save & Update Live QR Code
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowLiveSettings(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Mobile Deep Link Buttons */}
              <div style={{ width: '100%', marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a
                  href={gpayDeepLink}
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)'
                  }}
                >
                  <ExternalLink size={16} />
                  <span>Launch Google Pay App (Tez)</span>
                </a>

                <a
                  href={upiUri}
                  className="btn btn-outline"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  <ExternalLink size={15} />
                  <span>Pay via Any UPI App (PhonePe / BHIM)</span>
                </a>
              </div>
            </div>

            {/* Right Column: Order Summary & Verification */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Order Summary Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-md)'
              }}>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Registration Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Participant Name:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{participant.name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Selected Event:</span>
                    <span style={{ fontWeight: 700, color: '#1e40af' }}>{participant.event}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>College:</span>
                    <span style={{ fontWeight: 500, color: '#334155', maxWidth: '200px', textAlign: 'right' }}>
                      {participant.college}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Allocated Ticket ID:</span>
                    <code style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700, color: '#2563eb' }}>
                      {participant.ticketId}
                    </code>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '0.5rem 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Event Entry Fee:</span>
                    <span>₹{amount}.00</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Convenience Fee:</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>₹0.00 (Waived)</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '0.65rem',
                    borderTop: '2px solid #e2e8f0',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    <span>Total Amount:</span>
                    <span style={{ color: '#1e40af' }}>₹{amount}.00</span>
                  </div>
                </div>
              </div>

              {/* Manual UTR Reference Input Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Paid on phone? Submit UPI Reference ID:
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                  Enter the 12-digit UTR number or UPI transaction reference from your payment confirmation screen.
                </p>

                <form onSubmit={handleUtrSubmit} style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 423981729012"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                      {isProcessing ? 'Verifying...' : 'Submit'}
                    </button>
                  </div>
                  {utrError && <span className="form-error-msg">{utrError}</span>}
                </form>
              </div>

              {/* Demo Mode Presentation Panel */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                border: '1px solid #c7d2fe',
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={18} style={{ color: '#4f46e5' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3730a3', textTransform: 'uppercase' }}>
                    [Demo / Presentation Mode]
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#4338ca', marginBottom: '1rem' }}>
                  For college project evaluation, you can simulate instantaneous Google Pay / UPI checkout scenarios:
                </p>

                {errorMessage && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#b91c1c',
                    fontSize: '0.825rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <AlertCircle size={15} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ flex: 1, padding: '0.65rem 1rem' }}
                    onClick={handleSimulateSuccess}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 size={16} />
                    <span>Simulate GPay Payment (Success)</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: '0.65rem 1rem' }}
                    onClick={handleSimulateFailure}
                    disabled={isProcessing}
                  >
                    <XCircle size={16} />
                    <span>Simulate Failed Payment</span>
                  </button>
                </div>
              </div>

              {/* Technical Architecture Disclosure for Viva / Faculty */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.78rem',
                color: '#64748b',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <Info size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Review Committee Note:</strong> In this frontend prototype, payments are simulated and saved to <code>localStorage</code>. 
                  In production, real UPI webhook callbacks (e.g. Razorpay/Cashfree Webhooks) verify bank settlements server-side before activating tickets.
                </span>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
