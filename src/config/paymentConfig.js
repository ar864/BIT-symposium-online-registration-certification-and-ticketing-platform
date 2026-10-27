const UPI_STORAGE_KEY = "bit_symposium_upi_config";

export const PAYMENT_CONFIG = {
  // Default official symposium organizer UPI virtual payment address (VPA)
  UPI_ID: "bitsymposium2026@upi",
  
  // Payee legal / organization display name
  PAYEE_NAME: "BIT Department Symposium 2026",
  
  // Merchant Category Code (Academic / College Events)
  MERCHANT_CODE: "8220",
  
  // Currency
  CURRENCY: "INR",
  
  // Supported UPI payment applications
  METHODS: [
    {
      id: "gpay",
      name: "Google Pay",
      tagline: "Scan & Pay via GPay UPI",
      badgeColor: "#4285F4",
      vpaHint: "@okaxis / @oksbi / @okhdfcbank"
    },
    {
      id: "phonepe",
      name: "PhonePe",
      tagline: "Pay using PhonePe UPI",
      badgeColor: "#5f259f",
      vpaHint: "@ybl / @ibl / @axl"
    },
    {
      id: "paytm",
      name: "Paytm UPI",
      tagline: "Pay using Paytm Wallet/UPI",
      badgeColor: "#00b9f5",
      vpaHint: "@paytm"
    },
    {
      id: "bhim",
      name: "BHIM / Any UPI",
      tagline: "Supported across all UPI apps",
      badgeColor: "#00796B",
      vpaHint: "@upi"
    }
  ],

  // Academic symposium help desk contact for payment queries
  HELP_DESK: {
    email: "symposium.payments@bitsathy.ac.in",
    phone: "+91 4295 226000",
    venue: "Registration & Accounts Desk, Academic Block A, BIT Campus"
  }
};

/**
 * Retrieve the active live Google Pay / UPI account linked to the system
 */
export function getLinkedPaymentConfig() {
  try {
    const raw = localStorage.getItem(UPI_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.upiId) {
        return {
          upiId: parsed.upiId.trim(),
          payeeName: parsed.payeeName?.trim() || PAYMENT_CONFIG.PAYEE_NAME,
          isCustom: true,
          updatedAt: parsed.updatedAt
        };
      }
    }
  } catch (err) {
    console.error("Error reading linked payment config:", err);
  }

  return {
    upiId: PAYMENT_CONFIG.UPI_ID,
    payeeName: PAYMENT_CONFIG.PAYEE_NAME,
    isCustom: false,
    updatedAt: null
  };
}

/**
 * Save / link a new live Google Pay / UPI account to the system
 */
export function saveLinkedPaymentConfig({ upiId, payeeName }) {
  if (!upiId || !upiId.trim()) return false;
  
  const payload = {
    upiId: upiId.trim(),
    payeeName: payeeName?.trim() || PAYMENT_CONFIG.PAYEE_NAME,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(UPI_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("bit_upi_config_updated", { detail: payload }));
    return true;
  } catch (err) {
    console.error("Failed to save linked UPI config:", err);
    return false;
  }
}

/**
 * Reset back to the default institutional symposium UPI ID
 */
export function resetLinkedPaymentConfig() {
  try {
    localStorage.removeItem(UPI_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("bit_upi_config_updated", { 
      detail: { upiId: PAYMENT_CONFIG.UPI_ID, payeeName: PAYMENT_CONFIG.PAYEE_NAME, isCustom: false } 
    }));
    return true;
  } catch (err) {
    console.error("Failed to reset UPI config:", err);
    return false;
  }
}

/**
 * Generate a standard UPI payment URI for QR code generation and mobile app intent
 * Format: upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR&tn={transactionNote}
 */
export function generateUpiUri({ upiId, payeeName, amount, transactionNote }) {
  const active = getLinkedPaymentConfig();
  const vpa = (upiId || active.upiId).trim();
  const name = (payeeName || active.payeeName).trim();
  const amt = Number(amount || 0).toFixed(2);
  const note = transactionNote || "BIT Symposium 2026 Registration";

  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: amt,
    cu: "INR",
    tn: note
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Generate Google Pay (Tez) deep link specifically for Android Google Pay
 */
export function generateGPayDeepLink({ upiId, payeeName, amount, transactionNote }) {
  const uri = generateUpiUri({ upiId, payeeName, amount, transactionNote });
  return uri.replace("upi://pay", "tez://upi/pay");
}
