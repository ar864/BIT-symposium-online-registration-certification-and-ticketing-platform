import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLoginModal from './components/AdminLoginModal';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import DigitalTicketPage from './pages/DigitalTicketPage';
import AdminDashboard from './pages/AdminDashboard';
import ThemeSwitcher from './components/ThemeSwitcher';
import { initializeStorage, isUserAdminLoggedIn, setAdminLoggedIn } from './utils/storage';
import { initTheme } from './utils/theme';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [preselectedEvent, setPreselectedEvent] = useState('');
  const [adminVerifyTicketId, setAdminVerifyTicketId] = useState('');
  const [adminInitialTab, setAdminInitialTab] = useState('dashboard');

  // Initialize storage with sample data and theme on first load
  useEffect(() => {
    initializeStorage();
    initTheme();
    setIsAdmin(isUserAdminLoggedIn());

    const handleAuthChange = () => {
      setIsAdmin(isUserAdminLoggedIn());
    };

    window.addEventListener('bit_auth_changed', handleAuthChange);
    return () => window.removeEventListener('bit_auth_changed', handleAuthChange);
  }, []);

  // Navigation router handler
  const handleNavigate = (view) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'admin') {
      if (isAdmin) {
        setAdminInitialTab('dashboard');
        setAdminVerifyTicketId('');
        setActiveView('admin');
      } else {
        setIsLoginModalOpen(true);
      }
    } else {
      setActiveView(view);
    }
  };

  // Event Register Trigger
  const handleRegisterEvent = (eventName) => {
    setPreselectedEvent(eventName);
    setActiveView('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Registration Completed Callback (routes to Payment for paid events, or Ticket for free)
  const handleRegistrationComplete = (participant, requiresPayment) => {
    setCurrentParticipant(participant);
    if (requiresPayment) {
      setActiveView('payment');
    } else {
      setActiveView('ticket');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Payment Completed Callback
  const handlePaymentSuccess = (updatedParticipant) => {
    setCurrentParticipant(updatedParticipant);
    setActiveView('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Go to Payment from Ticket or elsewhere
  const handleGoToPayment = (participant) => {
    setCurrentParticipant(participant);
    setActiveView('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View Ticket Callback (from Admin or anywhere)
  const handleViewTicket = (participant) => {
    setCurrentParticipant(participant);
    setActiveView('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct shortcut from ticket to Admin Verification
  const handleGoToVerify = (ticketId) => {
    setAdminVerifyTicketId(ticketId);
    setAdminInitialTab('verify');
    if (isAdmin) {
      setActiveView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Admin Login Success
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setIsAdmin(true);
    setActiveView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Logout
  const handleLogout = () => {
    setAdminLoggedIn(false);
    setIsAdmin(false);
    setActiveView('home');
  };

  return (
    <div className="app-container">
      {/* Navbar (Hidden in Print Mode) */}
      <div className="no-print">
        <Navbar 
          activeView={activeView}
          onNavigate={handleNavigate}
          isAdmin={isAdmin}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Pages */}
      <main className="main-content">
        {activeView === 'home' && (
          <HomePage 
            onNavigate={handleNavigate}
            onRegisterEvent={handleRegisterEvent}
          />
        )}

        {activeView === 'events' && (
          <EventsPage 
            onRegisterEvent={handleRegisterEvent}
          />
        )}

        {activeView === 'register' && (
          <RegisterPage 
            preselectedEvent={preselectedEvent}
            onRegistrationComplete={handleRegistrationComplete}
            onNavigate={handleNavigate}
            onViewExistingTicket={handleViewTicket}
          />
        )}

        {activeView === 'payment' && (
          <PaymentPage 
            participant={currentParticipant}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={() => setActiveView('home')}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'ticket' && (
          <DigitalTicketPage 
            participant={currentParticipant}
            onNavigate={handleNavigate}
            onGoToVerify={handleGoToVerify}
            onGoToPayment={handleGoToPayment}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard 
            initialTab={adminInitialTab}
            initialVerifyTicketId={adminVerifyTicketId}
            onLogout={handleLogout}
            onViewTicket={handleViewTicket}
          />
        )}
      </main>

      {/* Footer (Hidden on Admin and in Print Mode) */}
      {activeView !== 'admin' && (
        <Footer 
          onNavigate={handleNavigate}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* Admin Login Modal Dialog */}
      <AdminLoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Floating Theme Customizer Widget (Visible on all pages) */}
      <ThemeSwitcher variant="floating" />
    </div>
  );
}
