/**
 * 💡 WHAT THIS FILE DOES:
 * This file is like a temporary "safety deposit box" in our server's memory.
 * When a user requests a Login code (OTP), we generate it and put it in this box along with their email
 * and a 5-minute expiration timer. When they type the code in, we look in this box to verify it.
 * If the 5 minutes pass, the code expires and is automatically deleted.
 */

interface OtpData {
  otp: string;
  expiresAt: number;
}

// In-memory map storing email -> OTP details
const otpStore = new Map<string, OtpData>();

/**
 * Saves a verification code for a specific email, setting it to expire after 5 minutes.
 */
export function saveOtp(email: string, otp: string) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now
  otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });
}

/**
 * Checks if the verification code matches the saved one and is still valid.
 */
export function verifyOtp(email: string, otp: string): boolean {
  const cleanEmail = email.toLowerCase().trim();
  const data = otpStore.get(cleanEmail);
  
  if (!data) return false;
  
  if (Date.now() > data.expiresAt) {
    otpStore.delete(cleanEmail); // Clean up expired code
    return false;
  }
  
  if (data.otp === otp) {
    otpStore.delete(cleanEmail); // Clear code once it is successfully used
    return true;
  }
  
  return false;
}
