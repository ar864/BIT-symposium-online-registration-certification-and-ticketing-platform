# BIT Symposium 2026 – Review 2 Platform

**Full Project Title:** BIT Department Symposium Event Registration, Digital Ticketing, Google Pay / UPI Payment, and Certificate Generation Platform  
**Academic Stage:** Second Review (Mini Project Demo)  
**Department:** Computer Science & Engineering  
**Institution:** Bannari Amman Institute of Technology (BIT), Sathyamangalam  
**Technology Stack:** React 18, Vite, JavaScript (ES6+), CSS3, Lucide React, QRCodeSVG, localStorage  

---

## 🌟 Executive Summary & Second Review Enhancements

This web application provides a full-featured, academic-grade frontend event management platform for the college symposium. It operates **100% on the client-side** using `localStorage` for complete state persistence, without requiring external database setups, cloud credentials, or backend servers.

### 🚀 Key Additions for Review 2:
1. **Google Pay & UPI Payment Checkout**:
   - Dynamic UPI QR Code generator (`upi://pay?pa=...`) for Google Pay, PhonePe, Paytm, and BHIM apps.
   - Configurable UPI ID (`bitsymposium2026@upi`) and Payee Name (`BIT Department Symposium 2026`).
   - Deep-link button to open installed UPI payment apps on mobile devices.
   - Support for payment states: `Paid`, `Pending`, and `Failed`.
   - **Demo Presentation Mode**: Allows faculty evaluators and students to simulate successful/failed Google Pay transactions or enter manual 12-digit UTR numbers.
   - Free event handling (e.g. *Coding Challenge* at ₹0) with instant pass activation.
2. **Duplicate Registration Prevention**:
   - Server-side/client validation checking if the same student email is already registered for an event.
   - Helpful alert banner with direct link to view their existing ticket pass.
3. **Enhanced Admin Dashboard & Financial Analytics**:
   - Total Verified Fee Collection counter (₹).
   - Event-wise registration and revenue breakdown grid.
   - Payment status filter (`Paid`, `Pending`, `Failed`).
   - One-click **Export to CSV** feature for downloading full participant records.
   - Ability to toggle or approve payments directly from the admin verification desk.
4. **Attendance & Certificate Eligibility Enforcement**:
   - Gate verification desk checks both **Ticket Validity** and **Payment Clearance** before recording attendance.
   - Prevents duplicate attendance logging.
   - Participation certificates are verified and issued only when attendance is recorded (`Present/Attended`).
5. **Modernized UI Theme**:
   - Professional academic palette combining deep navy (`#0b132b`), purple/indigo (`#4f46e5`, `#7c3aed`), and crisp white card containers.
   - Password visibility toggle on the Admin Login portal.

---

## 🔄 Complete End-to-End Demonstration Workflow

```
1. HOME PAGE
   └── Browse 5 official events, live statistics, and 4-step workflow

2. EVENT REGISTRATION
   └── Fill student credentials (Name, College, Dept, Email, Phone, Year, Event)
   └── Validates fields & prevents duplicate email registration for the same event
   └── Generates unique Ticket ID (e.g. BIT2026-4821)

3. GOOGLE PAY / UPI PAYMENT CHECKOUT
   └── Fee breakdown (₹50, ₹100, ₹150, or Free)
   └── Dynamic UPI QR Code (Scan using Google Pay / PhonePe on phone)
   └── Deep-link: "Open Google Pay / UPI App"
   └── Demo Mode: Simulate instant GPay success or submit 12-digit UTR
   └── Free events (₹0) bypass payment with instant confirmation

4. DIGITAL TICKET PASS
   └── Official pass with perforated edge design and scannable QR Code
   └── Displays Participant details, Event, Venue, Date, and Payment Status (PAID / FREE)
   └── Print-optimized layout via `window.print()`

5. ADMIN & GATE VERIFICATION DESK
   └── Login credentials: username `admin`, password `admin123`
   └── Fast "Auto-Fill" and password visibility toggle
   └── Dashboard metrics: Total Registrations, Revenue (₹), Paid vs Pending, Attendance Rate %
   └── Participants directory with search, event filter, payment filter, and CSV Export
   └── Gate Verification: checks Ticket Validity + Payment clearance -> Marks "Present"

6. CERTIFICATE OF PARTICIPATION
   └── Eligibility verification: requires recorded attendance
   └── A4 landscape layout with ornate borders, gold seal, Faculty & HOD signature blocks
   └── Print / Download Certificate button
```

---

## ⚙️ Payment Configuration

UPI settings are managed centrally in [`src/config/paymentConfig.js`](src/config/paymentConfig.js):

```javascript
export const PAYMENT_CONFIG = {
  UPI_ID: "bitsymposium2026@upi",               // Configurable Organizer UPI VPA
  PAYEE_NAME: "BIT Department Symposium 2026",   // Institutional Payee Name
  MERCHANT_CODE: "8220",                         // Academic Category Code
  CURRENCY: "INR"
};
```

> **Review Committee Transparency Note:** In this frontend prototype, payments are simulated and persisted to `localStorage`. In a future production release, a server-side webhook endpoint connected to a payment gateway (e.g., Razorpay/Cashfree) can verify bank settlements server-side before activating tickets.

---

## 🚀 How to Run the Application

In your terminal or PowerShell inside the project directory:

```bash
# 1. Navigate to the project directory
cd "c:\Users\Dhinakaran\OneDrive\Desktop\all folder\bit-symposium-2026"

# 2. Start the Vite development server
npm run dev
```

Open the local preview URL displayed in the terminal:  
👉 **http://localhost:5173/**

---

## 🔑 Demo Access Credentials

* **Admin Portal Username:** `admin`
* **Admin Portal Password:** `admin123`  
*(Or click the **Auto-Fill** button on the login modal)*

### Pre-loaded Sample Participants:
1. **Arun** (`BIT2026-1001`) — Paper Presentation • **Paid (₹100)** • **Attended**
2. **Ragul** (`BIT2026-1002`) — Project Expo • **Pending (₹100)** • **Not Attended**
3. **Nisar** (`BIT2026-1003`) — Technical Quiz • **Paid (₹50)** • **Attended**
