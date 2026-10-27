import React, { useState, useEffect } from 'react';
import { 
  User, 
  School, 
  BookOpen, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  FileCheck2,
  Layers,
  Check,
  Sparkles,
  CreditCard,
  QrCode
} from 'lucide-react';
import { getEvents, addParticipant, checkDuplicateRegistration } from '../utils/storage';

export default function RegisterPage({ preselectedEvent, onRegistrationComplete, onNavigate, onViewExistingTicket }) {
  const [eventsList, setEventsList] = useState(getEvents);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    department: '',
    email: '',
    phone: '',
    year: '3rd Year',
    event: preselectedEvent || 'Paper Presentation'
  });

  const [errors, setErrors] = useState({});
  const [duplicateParticipant, setDuplicateParticipant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleEventsUpdate = () => setEventsList(getEvents());
    window.addEventListener('bit_events_updated', handleEventsUpdate);
    return () => window.removeEventListener('bit_events_updated', handleEventsUpdate);
  }, []);

  useEffect(() => {
    if (preselectedEvent) {
      setFormData(prev => ({ ...prev, event: preselectedEvent }));
    }
  }, [preselectedEvent]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full Name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Please enter a valid name';
    }

    if (!formData.college.trim()) {
      errs.college = 'College Name is required';
    }

    if (!formData.department.trim()) {
      errs.department = 'Department is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone Number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim().replace(/\D/g, ''))) {
      errs.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    if (!formData.year) {
      errs.year = 'Please select Year of Study';
    }

    if (!formData.event) {
      errs.event = 'Please select an Event';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDuplicateParticipant(null);
    if (!validate()) return;

    // Check duplicate registration
    const existing = checkDuplicateRegistration(formData.email, formData.event);
    if (existing) {
      setDuplicateParticipant(existing);
      return;
    }

    setIsSubmitting(true);

    const currentEv = eventsList.find(ev => ev.name === formData.event) || eventsList[0] || { fee: '₹100', feeAmount: 100 };
    const isFree = currentEv.fee === 'Free' || currentEv.feeAmount === 0;

    // Save to localStorage via helper
    const newParticipant = addParticipant({
      name: formData.name,
      college: formData.college,
      department: formData.department,
      email: formData.email,
      phone: formData.phone,
      year: formData.year,
      event: formData.event,
      paymentAmount: currentEv.feeAmount,
      paymentStatus: isFree ? 'Paid' : 'Pending',
      isFree: isFree,
      registrationStatus: 'Registered',
      attendanceStatus: 'Not Attended'
    });

    // Brief smooth transition, then redirect to Payment (if paid) or Digital Ticket (if free)
    setTimeout(() => {
      setIsSubmitting(false);
      onRegistrationComplete(newParticipant, !isFree);
    }, 400);
  };

  // Find current selected event metadata
  const currentEvent = eventsList.find(ev => ev.name === formData.event) || eventsList[0] || { fee: '₹100', feeAmount: 100, date: '', venue: '' };

  return (
    <div className="form-page-container">
      <div className="container">
        <div className="form-wrapper-card">
          {/* Header */}
          <div className="form-header-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa'
              }}>
                <FileCheck2 size={22} />
              </div>
              <div>
                <h1 className="form-header-title">Student Event Registration</h1>
                <p className="form-header-desc">BIT Department Symposium 2026 • Official Digital Pass</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="form-body" noValidate>
            {/* Duplicate Registration Detected Alert */}
            {duplicateParticipant && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                color: '#92400e'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Already Registered!</strong>
                    <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0', color: '#78350f' }}>
                      A registration for <strong>{duplicateParticipant.event}</strong> already exists with email <strong>{duplicateParticipant.email}</strong>.
                      Your existing Ticket ID is: <code>{duplicateParticipant.ticketId}</code>.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (onViewExistingTicket) {
                        onViewExistingTicket(duplicateParticipant);
                      } else {
                        onNavigate('ticket');
                      }
                    }}
                  >
                    <span>View Existing Ticket</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDuplicateParticipant(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Selected Event Preview Banner */}
            <div className="selected-event-pill">
              <div className="selected-event-info">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                  Selected Event
                </span>
                <span className="selected-event-name">{currentEvent.name}</span>
                <span className="selected-event-date">
                  📅 {currentEvent.date} &nbsp;•&nbsp; 📍 {currentEvent.venue}
                </span>
              </div>
              <span className={`badge ${currentEvent.fee === 'Free' ? 'badge-success' : 'badge-primary'}`}>
                {currentEvent.fee === 'Free' ? 'FREE' : currentEvent.fee}
              </span>
            </div>

            {/* Event Selection dropdown */}
            <div className="form-group">
              <label className="form-label" htmlFor="event">
                Select Event <span className="required-star">*</span>
              </label>
              <select
                id="event"
                name="event"
                className={`form-select ${errors.event ? 'input-error' : ''}`}
                value={formData.event}
                onChange={handleChange}
              >
                {eventsList.map(ev => (
                  <option key={ev.id} value={ev.name}>
                    {ev.name} ({ev.fee} - {ev.date})
                  </option>
                ))}
              </select>
              {errors.event && <span className="form-error-msg">{errors.event}</span>}
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name <span className="required-star">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g. Arun Kumar"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.name}
                  onChange={handleChange}
                />
                <User size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            {/* College Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="college">
                College Name <span className="required-star">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="college"
                  name="college"
                  placeholder="e.g. Bannari Amman Institute of Technology"
                  className={`form-input ${errors.college ? 'input-error' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.college}
                  onChange={handleChange}
                />
                <School size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
              {errors.college && <span className="form-error-msg">{errors.college}</span>}
            </div>

            {/* Department and Year */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="department">
                  Department <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    placeholder="e.g. Computer Science & Engg"
                    className={`form-input ${errors.department ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.department}
                    onChange={handleChange}
                  />
                  <BookOpen size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
                {errors.department && <span className="form-error-msg">{errors.department}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="year">
                  Year of Study <span className="required-star">*</span>
                </label>
                <select
                  id="year"
                  name="year"
                  className={`form-select ${errors.year ? 'input-error' : ''}`}
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                {errors.year && <span className="form-error-msg">{errors.year}</span>}
              </div>
            </div>

            {/* Email and Phone */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="student@example.com"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <Mail size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
                {errors.email && <span className="form-error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="10-digit mobile number"
                    className={`form-input ${errors.phone ? 'input-error' : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <Phone size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
                {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
              </div>
            </div>

            {/* Submit CTA */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '0.9rem' }}
              >
                {isSubmitting ? (
                  <span>Generating Digital Ticket...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                🔒 Your digital ticket and QR code pass will be generated instantly upon submission.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
