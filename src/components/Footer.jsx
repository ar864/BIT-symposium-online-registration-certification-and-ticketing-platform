import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, ExternalLink, Shield } from 'lucide-react';

export default function Footer({ onNavigate, onOpenLogin }) {
  return (
    <footer className="footer no-print">
      <div className="container">
        <div className="footer-top">
          {/* Brand Col */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
                <GraduationCap size={20} />
              </div>
              <h4 style={{ margin: 0, color: '#ffffff' }}>BIT Symposium 2026</h4>
            </div>
            <p className="footer-desc">
              National Level Technical Symposium organized by Bannari Amman Institute of Technology (BIT). 
              A premier platform for students to innovate, present, and showcase their technical excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h5>Navigation</h5>
            <ul className="footer-links">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Home</a></li>
              <li><a href="#events" onClick={(e) => { e.preventDefault(); onNavigate('events'); }}>Events List</a></li>
              <li><a href="#register" onClick={(e) => { e.preventDefault(); onNavigate('register'); }}>Student Registration</a></li>
              <li><a href="#admin" onClick={(e) => { e.preventDefault(); onOpenLogin(); }}>Admin Portal</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="footer-col">
            <h5>Event Help Desk</h5>
            <ul className="footer-links">
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={15} style={{ color: '#60a5fa' }} />
                <span>BIT Campus, Sathyamangalam</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} style={{ color: '#60a5fa' }} />
                <span>symposium2026@bitsathy.ac.in</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} style={{ color: '#60a5fa' }} />
                <span>+91 4295 226000 / 221289</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Academic Notice */}
        <div className="footer-bottom">
          <p className="footer-academic-notice">
            Prototype developed for academic project demonstration.
          </p>
          <p>© 2026 BIT Department Symposium Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
