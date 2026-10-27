import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { getEvents } from '../utils/storage';
import EventCard from '../components/EventCard';

export default function EventsPage({ onRegisterEvent }) {
  const [eventsList, setEventsList] = useState(getEvents);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const handleEventsUpdate = () => setEventsList(getEvents());
    window.addEventListener('bit_events_updated', handleEventsUpdate);
    return () => window.removeEventListener('bit_events_updated', handleEventsUpdate);
  }, []);

  const categories = ['All', 'Technical', 'Hardware & Software', 'Brainstorming', 'Hands-on Workshop', 'Competitive Coding'];

  const filteredEvents = selectedCategory === 'All' 
    ? eventsList 
    : eventsList.filter(e => e.category === selectedCategory);

  return (
    <div className="events-page" style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Academic Competitions & Workshops</span>
          <h1 className="section-title">Symposium Events Schedule</h1>
          <p className="section-subtitle">
            Explore the 5 official events organized for BIT Symposium 2026. Register early to secure your digital pass!
          </p>
        </div>

        {/* Category Filter Pills */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '2.5rem'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border-color)',
                background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                boxShadow: selectedCategory === cat ? '0 4px 12px var(--theme-glow, rgba(37,99,235,0.25))' : 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Events */}
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <EventCard 
                event={event}
                onRegister={(name) => onRegisterEvent(name)}
              />
              
              {/* Detailed Guidelines Box under each card in Events view */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderTop: 'none',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                padding: '1rem 1.25rem',
                marginTop: '-8px',
                fontSize: '0.8rem',
                color: '#64748b'
              }}>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Info size={14} style={{ color: '#3b82f6' }} />
                  <span>Key Rules & Faculty In-Charge:</span>
                </div>
                <ul style={{ paddingLeft: '1.2rem', margin: '0 0 0.5rem' }}>
                  {event.rules.map((rule, idx) => (
                    <li key={idx} style={{ marginBottom: '0.15rem' }}>{rule}</li>
                  ))}
                </ul>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>
                  Faculty In-Charge: {event.coordinator}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
