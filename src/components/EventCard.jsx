import React from 'react';
import { 
  FileText, 
  Cpu, 
  HelpCircle, 
  Code2, 
  Terminal, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const ICON_MAP = {
  FileText: FileText,
  Cpu: Cpu,
  HelpCircle: HelpCircle,
  Code2: Code2,
  Terminal: Terminal
};

export default function EventCard({ event, onRegister, onSelectEvent }) {
  const IconComponent = ICON_MAP[event.icon] || FileText;

  return (
    <div className="event-card">
      <div className="event-card-header">
        <div 
          className="event-icon-box"
          style={{ 
            background: `linear-gradient(135deg, ${event.color} 0%, #0f172a 100%)` 
          }}
        >
          <IconComponent size={24} />
        </div>
        <div className={`event-fee-badge ${event.fee.toLowerCase() === 'free' ? 'free' : ''}`}>
          {event.fee === 'Free' ? 'FREE ENTRY' : `Fee: ${event.fee}`}
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-title">{event.name}</h3>
        
        <div className="event-meta-list">
          <div className="event-meta-item">
            <Calendar size={15} style={{ color: '#64748b' }} />
            <span>{event.date}</span>
          </div>
          {event.venue && (
            <div className="event-meta-item">
              <MapPin size={15} style={{ color: '#64748b' }} />
              <span>{event.venue}</span>
            </div>
          )}
        </div>

        <p className="event-desc">{event.description}</p>
      </div>

      <div className="event-card-footer">
        <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748b' }}>
          {event.category}
        </span>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onRegister(event.name)}
        >
          <span>Register</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
