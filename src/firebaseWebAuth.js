/**
 * Saranam Ayyappa - Real-Time Dynamic Firebase Phone Authentication Service
 * Enterprise-grade client integration supporting:
 * 1. Clean RecaptchaVerifier lifecycle management
 * 2. Real-time carrier SMS dispatch via Firebase Phone Auth
 * 3. 6-digit confirmation & ID Token retrieval
 * 4. Backend verification against NestJS / MariaDB via POST /api/v1/auth/firebase-phone
 */
import { API_BASE_URL } from './apiConfig.js';

class FirebaseWebAuthClass {
  constructor() {
    this.verifier = null;
    this.confirmationResult = null;
    this.isSending = false;
  }

  async getVerifier(containerId = 'recaptcha-container') {
    if (typeof window === 'undefined' || !window.firebase?.apps?.length) {
      throw new Error('Firebase SDK has not been initialized');
    }

    if (this.verifier) {
      return this.verifier;
    }

    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    // Diagnostic configuration: normal visible mode for clear verification verification
    const verifier = new window.firebase.auth.RecaptchaVerifier(containerId, {
      size: 'normal',
      callback: () => {
        console.info('reCAPTCHA challenge completed successfully');
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA challenge expired');
      },
    });

    this.verifier = verifier;

    try {
      await verifier.render();
      return verifier;
    } catch (error) {
      await this.resetVerifier();
      throw error;
    }
  }

  async resetVerifier() {
    if (this.verifier) {
      try {
        this.verifier.clear();
      } catch (error) {
        console.warn('Verifier cleanup warning:', error);
      }
    }
    this.verifier = null;
  }

  /**
   * Request dynamic real-time carrier SMS OTP strictly via Firebase Phone Auth
   */
  async sendOtp(phoneNumber, type = 'login') {
    if (this.isSending) {
      return { success: false, error: 'An OTP request is already in progress. Please wait.' };
    }

    const digits = String(phoneNumber).replace(/\D/g, '');
    const nationalNumber = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;

    if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    this.isSending = true;

    try {
      const verifier = await this.getVerifier();
      const phoneE164 = `+91${nationalNumber}`;

      const confirmation = await window.firebase.auth().signInWithPhoneNumber(phoneE164, verifier);
      this.confirmationResult = confirmation;

      return {
        success: true,
        isFirebase: true,
        message: `OTP sent successfully to +91 ${nationalNumber}`,
        confirmationResult: confirmation,
      };
    } catch (error) {
      console.error('Phone authentication failed:', { code: error.code, message: error.message });
      await this.resetVerifier();
      return {
        success: false,
        code: error.code,
        error: error.message || 'Failed to dispatch real-time OTP via Firebase.',
      };
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Verify entered 6-digit OTP code strictly via Firebase Confirmation Result
   */
  async confirmOtp(params) {
    const { phoneNumber, otp, fullName, preferredLang, intent, role, templeName } = params;
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);

    if (!this.confirmationResult) {
      return {
        success: false,
        error: 'No active Firebase SMS verification session found. Please request a new OTP.',
      };
    }

    try {
      const userCredential = await this.confirmationResult.confirm(otp.trim());
      const idToken = await userCredential.user.getIdToken();

      // Submit cryptographically verified token to NestJS backend for session creation
      const res = await fetch(`${API_BASE_URL}/auth/firebase-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          intent,
          fullName: fullName || 'Ayyappa Devotee',
          preferredLang: preferredLang || 'en',
          role: role || 'CUSTOMER',
          templeName,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let backendData = {};
      if (contentType.includes('application/json')) {
        backendData = await res.json();
      } else {
        const text = await res.text();
        console.warn('Backend returned non-JSON response:', text);
        backendData = { message: 'Authentication verified. Welcome to Saranam Ayyappa!' };
      }

      if (!res.ok) {
        throw new Error(backendData.message || 'Backend verification failed');
      }

      this.confirmationResult = null;
      return {
        success: true,
        user: backendData.user,
        message: backendData.message || 'Authenticated successfully with Firebase Phone.',
      };
    } catch (err) {
      console.error('confirmOtp error:', err);
      let userFriendlyError = 'Invalid verification code. Please check and re-enter the OTP.';
      const rawError = err?.message || err?.code || '';
      
      if (rawError.includes('auth/invalid-verification-code') || rawError.includes('invalid-verification-code')) {
        userFriendlyError = 'Incorrect OTP code. Please enter the valid 6-digit OTP sent to your phone.';
      } else if (rawError.includes('auth/code-expired') || rawError.includes('code-expired')) {
        userFriendlyError = 'OTP has expired. Please go back and request a new code.';
      } else if (rawError.includes('auth/session-expired')) {
        userFriendlyError = 'Verification session expired. Please request a new OTP.';
      } else if (rawError.includes('auth/too-many-requests')) {
        userFriendlyError = 'Too many attempts. Please try again after a few minutes.';
      } else if (err?.message && !err.message.includes('Firebase:')) {
        userFriendlyError = err.message;
      }

      return {
        success: false,
        error: userFriendlyError,
      };
    }
  }
}

export const FirebaseWebAuth = new FirebaseWebAuthClass();
