import { EVENTS } from '../data/events';

const STORAGE_KEY = "bit_symposium_participants_2026";
const EVENTS_STORAGE_KEY = "bit_symposium_events_2026";
const ADMIN_AUTH_KEY = "bit_symposium_admin_auth";

export const INITIAL_PARTICIPANTS = [
  {
    id: "p_1001",
    name: "Arun",
    college: "Bannari Amman Institute of Technology",
    department: "Computer Science and Engineering",
    email: "arun.cs23@bitsathy.ac.in",
    phone: "9876543210",
    year: "3rd Year",
    event: "Paper Presentation",
    ticketId: "BIT2026-1001",
    registeredAt: "2026-08-20T10:30:00Z",
    registrationStatus: "Registered",
    attendanceStatus: "Attended",
    attendedAt: "2026-09-15T09:45:00Z",
    paymentStatus: "Paid",
    paymentAmount: 100,
    paymentRef: "UPI/GPAY/2026/1001",
    paymentMethod: "Google Pay",
    paidAt: "2026-08-20T10:32:15Z"
  },
  {
    id: "p_1002",
    name: "Ragul",
    college: "PSG College of Technology",
    department: "Information Technology",
    email: "ragul.it@psgtech.ac.in",
    phone: "9843210987",
    year: "2nd Year",
    event: "Project Expo",
    ticketId: "BIT2026-1002",
    registeredAt: "2026-08-21T14:15:00Z",
    registrationStatus: "Registered",
    attendanceStatus: "Not Attended",
    attendedAt: null,
    paymentStatus: "Pending",
    paymentAmount: 100,
    paymentRef: null,
    paymentMethod: null,
    paidAt: null
  },
  {
    id: "p_1003",
    name: "Nisar",
    college: "Coimbatore Institute of Technology",
    department: "Electronics & Communication Engg",
    email: "nisar.ece@cit.edu.in",
    phone: "9765432109",
    year: "4th Year",
    event: "Technical Quiz",
    ticketId: "BIT2026-1003",
    registeredAt: "2026-08-22T09:45:00Z",
    registrationStatus: "Registered",
    attendanceStatus: "Attended",
    attendedAt: "2026-09-17T10:50:00Z",
    paymentStatus: "Paid",
    paymentAmount: 50,
    paymentRef: "UPI/GPAY/2026/1003",
    paymentMethod: "PhonePe UPI",
    paidAt: "2026-08-22T09:48:10Z"
  }
];

/**
 * Initialize storage with default sample participants if not present.
 * If data already exists, preserve it safely.
 */
export function initializeStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
    return INITIAL_PARTICIPANTS;
  }
  try {
    const parsed = JSON.parse(existing);
    // Ensure existing records have paymentStatus fallback
    const migrated = parsed.map(p => ({
      ...p,
      paymentStatus: p.paymentStatus || (p.event === "Coding Challenge" ? "Paid" : "Pending"),
      paymentAmount: p.paymentAmount !== undefined ? p.paymentAmount : (p.event === "Coding Challenge" ? 0 : 100)
    }));
    return migrated;
  } catch (e) {
    console.error("Error parsing participants from localStorage", e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
    return INITIAL_PARTICIPANTS;
  }
}

/**
 * Get all participants from localStorage
 */
export function getParticipants() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return initializeStorage();
  }
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) ? list : initializeStorage();
  } catch (e) {
    console.error("Error parsing participants", e);
    return initializeStorage();
  }
}

/**
 * Save participant array to localStorage
 */
export function saveParticipants(participants) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
  window.dispatchEvent(new Event("bit_participants_updated"));
}

/**
 * Check if a participant with same email already registered for the same event
 */
export function checkDuplicateRegistration(email, eventName) {
  if (!email || !eventName) return null;
  const cleanEmail = email.trim().toLowerCase();
  const cleanEvent = eventName.trim().toLowerCase();
  const participants = getParticipants();
  return participants.find(p => 
    p.email?.trim().toLowerCase() === cleanEmail && 
    p.event?.trim().toLowerCase() === cleanEvent
  ) || null;
}

/**
 * Add a new participant
 */
export function addParticipant(participantData) {
  const participants = getParticipants();
  
  // Generate ticket ID if not supplied
  const ticketId = participantData.ticketId || generateTicketId(participants);
  
  const isFree = participantData.isFree || participantData.event === "Coding Challenge" || participantData.paymentAmount === 0;

  const newParticipant = {
    id: participantData.id || "p_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    name: participantData.name?.trim() || "",
    college: participantData.college?.trim() || "",
    department: participantData.department?.trim() || "",
    email: participantData.email?.trim() || "",
    phone: participantData.phone?.trim() || "",
    year: participantData.year || "3rd Year",
    event: participantData.event || "Paper Presentation",
    ticketId: ticketId,
    registeredAt: participantData.registeredAt || new Date().toISOString(),
    registrationStatus: participantData.registrationStatus || "Registered",
    attendanceStatus: participantData.attendanceStatus || "Not Attended",
    attendedAt: participantData.attendedAt || null,
    // Payment Fields
    paymentStatus: participantData.paymentStatus || (isFree ? "Paid" : "Pending"),
    paymentAmount: participantData.paymentAmount !== undefined ? participantData.paymentAmount : (isFree ? 0 : 100),
    paymentRef: participantData.paymentRef || (isFree ? "FREE-PASS" : null),
    paymentMethod: participantData.paymentMethod || (isFree ? "Free Event" : null),
    paidAt: isFree ? new Date().toISOString() : (participantData.paidAt || null)
  };

  const updated = [newParticipant, ...participants];
  saveParticipants(updated);
  return newParticipant;
}

/**
 * Update an existing participant by id or ticketId
 */
export function updateParticipant(id, updatedFields) {
  const participants = getParticipants();
  const index = participants.findIndex(p => p.id === id || p.ticketId === id);
  if (index === -1) return null;

  participants[index] = {
    ...participants[index],
    ...updatedFields
  };

  saveParticipants(participants);
  return participants[index];
}

/**
 * Event Fee and Catalog Management Helpers
 */
export function getEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return EVENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : EVENTS;
  } catch (err) {
    console.error("Failed to parse events from storage:", err);
    return EVENTS;
  }
}

export function saveEvents(events) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event("bit_events_updated"));
  } catch (err) {
    console.error("Failed to save events to storage:", err);
  }
}

export function updateEventFee(eventId, newFeeAmount) {
  const events = getEvents();
  const numericAmount = Math.max(0, Number(newFeeAmount) || 0);
  const updatedEvents = events.map(ev => {
    if (ev.id === eventId || ev.name.toLowerCase() === String(eventId).toLowerCase()) {
      return {
        ...ev,
        feeAmount: numericAmount,
        fee: numericAmount === 0 ? "Free" : `₹${numericAmount}`
      };
    }
    return ev;
  });
  saveEvents(updatedEvents);
  return updatedEvents;
}

export function resetEventsToDefault() {
  localStorage.removeItem(EVENTS_STORAGE_KEY);
  window.dispatchEvent(new Event("bit_events_updated"));
  return EVENTS;
}

/**
 * Update payment status and transaction details for a participant
 */
export function updatePaymentStatus(ticketId, { status, paymentRef, paymentMethod, amount }) {
  const participant = getParticipantByTicketId(ticketId);
  if (!participant) return { success: false, error: "Participant not found" };

  const parsedAmount = amount !== undefined ? Math.max(0, Number(amount)) : participant.paymentAmount;

  const updated = updateParticipant(participant.id, {
    paymentStatus: status, // "Paid" | "Pending" | "Failed"
    paymentRef: paymentRef !== undefined ? paymentRef : participant.paymentRef,
    paymentMethod: paymentMethod || participant.paymentMethod || "Google Pay (UPI)",
    paymentAmount: parsedAmount,
    paidAt: status === "Paid" ? (participant.paidAt || new Date().toISOString()) : (status === "Pending" ? null : participant.paidAt)
  });

  return { success: true, participant: updated };
}

/**
 * Update full transaction details for any participant (Admin desk & management)
 */
export function updateParticipantTransaction(idOrTicketId, { paymentAmount, paymentStatus, paymentRef, paymentMethod }) {
  const participants = getParticipants();
  const participant = participants.find(p => p.id === idOrTicketId || p.ticketId === idOrTicketId);
  if (!participant) return { success: false, error: "Participant not found" };

  const parsedAmount = paymentAmount !== undefined ? Math.max(0, Number(paymentAmount)) : (participant.paymentAmount || 0);
  const status = paymentStatus || participant.paymentStatus || "Paid";

  const updated = updateParticipant(participant.id, {
    paymentAmount: parsedAmount,
    paymentStatus: status,
    paymentRef: paymentRef !== undefined ? paymentRef : participant.paymentRef,
    paymentMethod: paymentMethod || participant.paymentMethod || "Google Pay",
    paidAt: status === "Paid" ? (participant.paidAt || new Date().toISOString()) : (status === "Pending" ? null : participant.paidAt)
  });

  return { success: true, participant: updated };
}

/**
 * Delete a participant by id or ticketId
 */
export function deleteParticipant(id) {
  const participants = getParticipants();
  const updated = participants.filter(p => p.id !== id && p.ticketId !== id);
  saveParticipants(updated);
  return updated;
}

/**
 * Find participant by ticket ID (case-insensitive & trimmed)
 */
export function getParticipantByTicketId(ticketId) {
  if (!ticketId) return null;
  const cleanId = ticketId.trim().toUpperCase();
  const participants = getParticipants();
  return participants.find(p => p.ticketId.trim().toUpperCase() === cleanId) || null;
}

/**
 * Mark attendance for a ticket ID
 */
export function markAttendance(ticketId) {
  const participant = getParticipantByTicketId(ticketId);
  if (!participant) return { success: false, error: "Ticket ID not found" };

  // If already attended, prevent duplicate counting
  if (participant.attendanceStatus === "Attended") {
    return { 
      success: true, 
      alreadyMarked: true, 
      participant, 
      message: "Attendance was already recorded for this participant." 
    };
  }

  const updated = updateParticipant(participant.id, {
    attendanceStatus: "Attended",
    attendedAt: new Date().toISOString()
  });

  return { success: true, alreadyMarked: false, participant: updated };
}

/**
 * Calculate payment and financial summary statistics
 */
export function getPaymentStats() {
  const participants = getParticipants();
  let totalRevenue = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  let freeCount = 0;

  participants.forEach(p => {
    if (p.paymentStatus === "Paid") {
      paidCount++;
      totalRevenue += Number(p.paymentAmount || 0);
      if (p.paymentAmount === 0 || p.event === "Coding Challenge") {
        freeCount++;
      }
    } else if (p.paymentStatus === "Failed") {
      failedCount++;
    } else {
      pendingCount++;
    }
  });

  return {
    totalRevenue,
    paidCount,
    pendingCount,
    failedCount,
    freeCount,
    totalRegistrations: participants.length
  };
}

/**
 * Helper to generate a unique Ticket ID: e.g. BIT2026-4821
 */
export function generateTicketId(existingParticipants = []) {
  let unique = false;
  let candidate = "";
  const existingIds = new Set(existingParticipants.map(p => p.ticketId?.toUpperCase()));

  while (!unique) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number (1000 - 9999)
    candidate = `BIT2026-${randomDigits}`;
    if (!existingIds.has(candidate)) {
      unique = true;
    }
  }
  return candidate;
}

/**
 * Reset localStorage to initial 3 demo participants
 */
export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
  window.dispatchEvent(new Event("bit_participants_updated"));
  return INITIAL_PARTICIPANTS;
}

/**
 * Admin Authentication Helpers
 */
export function isUserAdminLoggedIn() {
  return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function setAdminLoggedIn(status) {
  if (status) {
    localStorage.setItem(ADMIN_AUTH_KEY, "true");
  } else {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
  window.dispatchEvent(new Event("bit_auth_changed"));
}
