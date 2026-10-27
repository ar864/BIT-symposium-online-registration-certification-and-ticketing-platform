import React from 'react';
import { 
  Printer, 
  Home, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  User, 
  School, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Download,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getEvents } from '../utils/storage';

export default function DigitalTicketPage({ 
  participant, 
  onNavigate, 
  onGoToVerify,
  onGoToPayment 
}) {
  if (!participant) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>No Ticket Selected</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Please register for an event or select a ticket to view.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('register')}>
          Go to Registration
        </button>
      </div>
    );
  }

  const eventsList = getEvents();
  const matchedEvent = eventsList.find(e => e.name === participant.event) || {
    name: participant.event,
    date: "September 15-19, 2026",
    venue: "Main Campus, BIT",
    fee: "Paid",
    feeAmount: 100
  };

  const handlePrint = () => {
    window.print();
  };

  const isPaid = participant.paymentStatus === 'Paid' || participant.event === 'Coding Challenge' || participant.paymentAmount === 0;

  // Construct QR Payload (JSON with Ticket ID, Name, Event, Payment Status)
  const qrPayload = JSON.stringify({
    ticketId: participant.ticketId,
    name: participant.name,
    event: participant.event,
    paymentStatus: participant.paymentStatus || (isPaid ? 'Paid' : 'Pending'),
    symposium: "BIT-2026"
  });

  return (
    <div className="ticket-page-container">
      <div className="container">
        
        {/* Status Notification Banner on Web Screen */}
        <div style={{
          maxWidth: '580px',
          margin: '0 auto 1.5rem',
          background: isPaid ? '#ecfdf5' : '#fffbeb',
          border: '1px solid',
          borderColor: isPaid ? '#a7f3d0' : '#fde68a',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: isPaid ? '#065f46' : '#92400e'
        }} className="no-print">
          {isPaid ? (
            <CheckCircle2 size={22} style={{ flexShrink: 0, color: '#10b981' }} />
          ) : (
            <AlertCircle size={22} style={{ flexShrink: 0, color: '#f59e0b' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>
              {isPaid ? 'Registration & Pass Confirmed!' : 'Registration Completed — Payment Pending'}
            </div>
            <div style={{ fontSize: '0.8rem', color: isPaid ? '#047857' : '#78350f' }}>
              {isPaid 
                ? 'Your digital entry pass is active. Present this QR code at the entrance verification desk.' 
                : 'Please complete the event registration fee via Google Pay / UPI to ensure entry approval.'}
            </div>
          </div>
          {!isPaid && onGoToPayment && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onGoToPayment(participant)}
            >
              Pay Now
            </button>
          )}
        </div>

        {/* Real Digital Ticket Card */}
        <div className="ticket-wrapper">
          <div className="digital-ticket-card">
            {/* Top Brand Banner */}
            <div className="ticket-top-banner">
              <div className="ticket-brand">
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="ticket-symposium-name">BIT Symposium 2026</div>
                  <div className="ticket-tagline">Official Digital Entry Pass</div>
                </div>
              </div>

              <div className="ticket-badge-pill">
                PASS: {participant.attendanceStatus === 'Attended' ? 'ATTENDED' : 'REGISTERED'}
              </div>
            </div>

            {/* Ticket Body */}
            <div className="ticket-content-body">
              {/* Unique Ticket ID Highlighting */}
              <div className="ticket-id-display">
                <div>
                  <div className="ticket-id-label">Official Ticket ID</div>
                  <div className="ticket-id-code">{participant.ticketId}</div>
                </div>
                <div style={{
                  background: participant.attendanceStatus === 'Attended' ? '#ecfdf5' : '#dbeafe',
                  color: participant.attendanceStatus === 'Attended' ? '#065f46' : '#1e40af',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {participant.attendanceStatus === 'Attended' ? '✓ Attended' : 'Status: REGISTERED'}
                </div>
              </div>

              {/* Participant & Event Details Grid */}
              <div className="ticket-grid-details">
                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Participant Name</span>
                  <span className="ticket-detail-val">{participant.name}</span>
                </div>

                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Event Name</span>
                  <span className="ticket-detail-val" style={{ color: '#1e40af' }}>{participant.event}</span>
                </div>

                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">College</span>
                  <span className="ticket-detail-val" style={{ fontSize: '0.85rem' }}>{participant.college}</span>
                </div>

                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Department / Year</span>
                  <span className="ticket-detail-val" style={{ fontSize: '0.85rem' }}>
                    {participant.department} ({participant.year})
                  </span>
                </div>

                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Event Date</span>
                  <span className="ticket-detail-val">{matchedEvent.date}</span>
                </div>

                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Venue</span>
                  <span className="ticket-detail-val" style={{ fontSize: '0.85rem' }}>{matchedEvent.venue}</span>
                </div>

                {/* Payment Status Grid Items */}
                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Payment Status</span>
                  <span className="ticket-detail-val">
                    <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                      {isPaid 
                        ? `PAID (${participant.paymentAmount !== undefined ? (participant.paymentAmount === 0 ? 'Free' : `₹${participant.paymentAmount}`) : matchedEvent.fee})` 
                        : `PENDING (${participant.paymentAmount !== undefined ? `₹${participant.paymentAmount}` : matchedEvent.fee})`}
                    </span>
                  </span>
                </div>

                <div className="ticket-detail-item">
                  <span className="ticket-detail-label">Payment Reference</span>
                  <span className="ticket-detail-val" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {participant.paymentRef || (isPaid ? 'VERIFIED' : 'Pending Payment')}
                  </span>
                </div>
              </div>

              {/* Perforated Divider Line */}
              <div className="ticket-divider-line">
                <div className="ticket-dashed-border"></div>
              </div>

              {/* QR Code & Barcode Section */}
              <div className="ticket-qr-section">
                <div className="ticket-qr-box">
                  <QRCodeSVG 
                    value={qrPayload}
                    size={105}
                    level="H"
                    includeMargin={true}
                  />
                  <span className="ticket-qr-hint">Scan at Desk</span>
                </div>

                <div className="ticket-status-box">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                    Bannari Amman Institute of Technology
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Present this digital ticket at the entrance verification desk. Entry is granted upon valid payment and attendance check.
                  </div>
                  <div className="ticket-barcode-visual" title={participant.ticketId}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar (Hidden on Print) */}
        <div className="ticket-actions-bar no-print">
          <button className="btn btn-primary btn-lg" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print Ticket</span>
          </button>

          {!isPaid && onGoToPayment && (
            <button className="btn btn-success btn-lg" onClick={() => onGoToPayment(participant)}>
              <CreditCard size={18} />
              <span>Complete Payment</span>
            </button>
          )}

          <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('home')}>
            <Home size={18} />
            <span>Back to Home</span>
          </button>

          <button 
            className="btn btn-outline btn-lg" 
            onClick={() => onGoToVerify(participant.ticketId)}
            title="Open Admin Verification with this Ticket ID"
          >
            <ShieldCheck size={18} />
            <span>Verify Ticket (Admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
