import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Users, 
  QrCode, 
  Award, 
  FileCheck2, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getEvents } from '../utils/storage';
import EventCard from '../components/EventCard';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function HomePage({ onNavigate, onRegisterEvent }) {
  const [eventsList, setEventsList] = useState(getEvents);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const handleEventsUpdate = () => setEventsList(getEvents());
    window.addEventListener('bit_events_updated', handleEventsUpdate);
    return () => window.removeEventListener('bit_events_updated', handleEventsUpdate);
  }, []);
  const scrollToEvents = () => {
    const el = document.getElementById('events-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('events');
    }
  };

  return (
    <div className="home-page">
      {/* 1. HERO SECTION WITH AMBIENT GLOW & THEME STRIP */}
      <section className="hero-section">
        {/* Floating Ambient Glowing Orbs */}
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />

        <div className="container hero-content">
          <div className="hero-badge-pill">
            <Sparkles size={15} />
            <span>National Level Technical Symposium • BIT 2026</span>
          </div>

          <h1 className="hero-title">
            BIT Department <span>Symposium 2026</span>
          </h1>

          <p className="hero-subtitle">
            Register. Participate. Get Certified.
          </p>

          <p className="hero-desc">
            Welcome to the premier annual technical confluence of Bannari Amman Institute of Technology. 
            Showcase your technical prowess, compete with the brightest minds, and earn verified digital credentials.
          </p>

          {/* Quick Feature Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap',
            marginBottom: '1.75rem'
          }}>
            <span className="hero-feature-tag">🔥 5 Flagship Tech Events</span>
            <span className="hero-feature-tag">⚡ Fast QR Gate Entry</span>
            <span className="hero-feature-tag">📜 Verified Digital Credentials</span>
            <span className="hero-feature-tag">💳 Live Google Pay / UPI</span>
          </div>

          {/* Direct Interactive Theme Picker Strip */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <ThemeSwitcher variant="strip" />
          </div>

          <div className="hero-actions">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('register')}
            >
              <span>Register Now</span>
              <ArrowRight size={18} />
            </button>

            <button 
              className="btn btn-secondary btn-lg"
              onClick={scrollToEvents}
            >
              <Calendar size={18} />
              <span>Explore Events</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATISTICS CARDS */}
      <div className="container stats-banner">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#dbeafe', color: '#1e40af' }}>
              <Layers size={26} />
            </div>
            <div className="stat-info">
              <span className="stat-number">5 Events</span>
              <span className="stat-label">Technical & Coding</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#047857' }}>
              <Users size={26} />
            </div>
            <div className="stat-info">
              <span className="stat-number">100+ Participants</span>
              <span className="stat-label">From Top Colleges</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>
              <QrCode size={26} />
            </div>
            <div className="stat-info">
              <span className="stat-number">Digital Tickets</span>
              <span className="stat-label">Instant QR Entry</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
              <Award size={26} />
            </div>
            <div className="stat-info">
              <span className="stat-number">Instant Certificates</span>
              <span className="stat-label">Verified Participation</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EVENTS SECTION WITH CATEGORY FILTER */}
      <section id="events-section" className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Featured Competitions & Workshops</span>
            <h2 className="section-title">Explore Symposium Events</h2>
            <p className="section-subtitle">
              Choose from 5 carefully curated events designed to test research, software development, technical knowledge, and problem-solving skills.
            </p>

            {/* Interactive Category Filter Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginTop: '1.5rem'
            }}>
              {['All', 'Technical', 'Coding', 'Web', 'Quiz'].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      boxShadow: isActive ? '0 4px 12px var(--theme-glow, rgba(37,99,235,0.25))' : 'var(--shadow-sm)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="events-grid">
            {eventsList
              .filter(event => {
                if (selectedCategory === 'All') return true;
                return (
                  event.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                  event.name?.toLowerCase().includes(selectedCategory.toLowerCase())
                );
              })
              .map((event) => (
                <EventCard 
                  key={event.id}
                  event={event}
                  onRegister={(eventName) => onRegisterEvent(eventName)}
                />
              ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="section how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Seamless Academic Workflow</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Experience end-to-end digital event management from registration to verified certificate issuance.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon-wrapper">
                <FileCheck2 size={28} />
              </div>
              <h3 className="step-title">Register for Event</h3>
              <p className="step-desc">
                Fill in your student credentials, college name, department, and pick your preferred event.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>
                <QrCode size={28} />
              </div>
              <h3 className="step-title">Pay via UPI & Get Pass</h3>
              <p className="step-desc">
                Quick Google Pay / UPI QR checkout to instantly activate your digital ticket with scannable QR pass.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon-wrapper" style={{ background: '#ecfdf5', color: '#047857' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 className="step-title">Verify Attendance</h3>
              <p className="step-desc">
                Faculty coordinators verify your ticket ID at the registration desk and mark attendance.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                <Award size={28} />
              </div>
              <h3 className="step-title">Get Certificate</h3>
              <p className="step-desc">
                Receive and download an authenticated Certificate of Participation with official credentials.
              </p>
            </div>
          </div>

          {/* Quick CTA */}
          <div style={{
            marginTop: '3.5rem',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            borderRadius: '16px',
            padding: '2.5rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                Ready to participate in BIT Symposium 2026?
              </h3>
              <p style={{ color: '#93c5fd', fontSize: '0.925rem', margin: 0 }}>
                Join hundreds of engineering students and showcase your technical innovation.
              </p>
            </div>
            <button 
              className="btn btn-primary"
              style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}
              onClick={() => onNavigate('register')}
            >
              <span>Register Now</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
