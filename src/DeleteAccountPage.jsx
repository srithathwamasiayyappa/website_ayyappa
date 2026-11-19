import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

const Tag = ({ children }) => <span className="tag">{children}</span>;

function PageHeading({ eyebrow, title, desc }) {
  return (
    <div className="page-header">
      <Tag>{eyebrow}</Tag>
      <h1 style={{ color: '#b91c1c' }}>{title}</h1>
      <p>{desc}</p>
      <span className="title-rule">✦ &nbsp; ━━━━━ &nbsp; ❀ &nbsp; ━━━━━ &nbsp; ✦</span>
    </div>
  );
}

export default function DeleteAccountPage({ profile, notify, onDeleted }) {
  const navigate = useNavigate();

  const [step, setStep] = useState('INIT'); // 'INIT' | 'OTP_SENT' | 'DELETING'
  const [otp, setOtp] = useState('');
  const [reason, setReason] = useState('No longer using this account');
  const [customReason, setCustomReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract clean registered mobile number
  const rawPhone = profile?.phoneNumber || profile?.mobile || '';
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Step 1: Send OTP for account deletion
  const handleRequestOtp = async () => {
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('No registered mobile number found in your profile.');
      return;
    }

    try {
      setSendingOtp(true);
      setErrorMsg('');

      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          type: 'delete_account',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('OTP_SENT');
        setCooldown(60);
        notify?.('Verification OTP sent to your registered mobile number.');
      } else {
        setErrorMsg(data.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error while requesting verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and permanently delete account
  const handleConfirmDeletion = async (e) => {
    e?.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit OTP received on your mobile.');
      return;
    }
    if (!confirmed) {
      setErrorMsg('Please tick the confirmation checkbox to proceed.');
      return;
    }

    const finalReason = reason === 'Other' ? customReason.trim() : reason;

    try {
      setDeleting(true);
      setErrorMsg('');

      const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id,
          phoneNumber: cleanPhone,
          otp: otp.trim(),
          reason: finalReason || 'Account deletion requested by user with OTP',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Clear all persistent user storage
        localStorage.removeItem('sa-logged');
        localStorage.removeItem('sa-profile');
        localStorage.removeItem('sa-token');
        localStorage.removeItem('sa-favorites');

        // Trigger parent state logout
        onDeleted?.();

        // Show prominent toast notification
        notify?.('Your account has been deleted successfully.');

        // Redirect to login page - user is logged out and no need to login again
        navigate('/login', { replace: true });
      } else {
        setErrorMsg(data.message || 'Verification failed. Please check the entered OTP.');
      }
    } catch (err) {
      setErrorMsg('Error processing account deletion. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '10px 0 40px' }}>
      <PageHeading
        eyebrow="SECURITY & DEVOTIONAL PROFILE"
        title="Delete Devotee Account"
        desc="Permanent deactivation and expunging of your devotee records."
      />

      <div className="rich-card" style={{
        border: '1.5px solid #fca5a5',
        background: '#fffbfb',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 8px 30px rgba(185, 28, 28, 0.08)',
      }}>
        {/* Warning Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          background: '#fef2f2',
          border: '1px solid #f87171',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <div style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }}>
            <Icon name="TriangleAlert" size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px', color: '#991b1b', fontSize: '16px' }}>
              Important: This action is permanent and irreversible
            </h3>
            <p style={{ margin: 0, color: '#7f1d1d', fontSize: '13px', lineHeight: 1.5 }}>
              Once your account is deleted, your registered mobile number will be deactivated, and your saved prayers, mandir trustee associations, and devotional preferences will be expunged. You will not be able to log in with this account again.
            </p>
          </div>
        </div>

        {/* Registered Devotee Info */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
              Registered Mobile Number
            </span>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginTop: '2px' }}>
              +91 {cleanPhone || 'Not available'}
            </div>
          </div>
          <span style={{
            background: '#fee2e2',
            color: '#991b1b',
            fontSize: '12px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '16px',
          }}>
            Account Deletion
          </span>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Icon name="CircleAlert" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Request OTP */}
        {step === 'INIT' && (
          <div>
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '18px', lineHeight: 1.6 }}>
              To ensure the security of your devotional account, we require real-time <b>OTP verification</b> sent to your registered mobile number before performing account deletion.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={sendingOtp || !cleanPhone}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: sendingOtp ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                }}
              >
                <Icon name={sendingOtp ? "Loader2" : "Send"} size={17} />
                <span>{sendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                style={{
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel & Return to Profile
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Enter OTP & Confirm Permanent Deletion */}
        {step === 'OTP_SENT' && (
          <form onSubmit={handleConfirmDeletion}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                Enter 6-digit Verification Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  padding: '12px 16px',
                  fontSize: '22px',
                  letterSpacing: '0.3em',
                  fontWeight: '700',
                  textAlign: 'center',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#111827',
                  outline: 'none',
                }}
                autoFocus
              />
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
                {cooldown > 0 ? (
                  <span>Resend OTP available in <b>{cooldown}s</b></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={sendingOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b91c1c',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '13px',
                      textDecoration: 'underline',
                    }}
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </div>

            {/* Optional Reason Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Reason for deleting account (optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  background: '#ffffff',
                }}
              >
                <option value="No longer using this account">No longer using this account</option>
                <option value="Privacy / data concerns">Privacy / data concerns</option>
                <option value="Switching to a different mobile number">Switching to a different mobile number</option>
                <option value="Other">Other</option>
              </select>

              {reason === 'Other' && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify reason"
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                  }}
                />
              )}
            </div>

            {/* Mandatory Confirmation Checkbox */}
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '24px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#991b1b',
                fontWeight: '600',
                margin: 0,
              }}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#dc2626', cursor: 'pointer' }}
                />
                <span>I confirm that I want to permanently delete my account and log out.</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={deleting || otp.length < 4 || !confirmed}
                style={{
                  background: deleting || otp.length < 4 || !confirmed
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: deleting || otp.length < 4 || !confirmed ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(185, 28, 28, 0.35)',
                }}
              >
                <Icon name={deleting ? "Loader2" : "Trash2"} size={18} />
                <span>{deleting ? 'Deleting Account...' : 'Verify OTP & Delete Account Permanently'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                disabled={deleting}
                style={{
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '14px 22px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
