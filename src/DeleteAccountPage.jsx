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

const DELETION_REASONS = [
  'I no longer use this devotional account',
  'Privacy and personal data concerns',
  'Too many notifications / SMS alerts',
  'Created duplicate or temporary account',
  'Switching to a different mobile number',
  'Other reason',
];

export default function DeleteAccountPage({ profile, notify, onDeleted }) {
  const navigate = useNavigate();

  // Extract phone number from profile if logged in
  const initialPhone = (profile?.phoneNumber || profile?.mobile || '').replace(/\D/g, '').slice(-10);

  const [inputPhone, setInputPhone] = useState(initialPhone);
  const [selectedReason, setSelectedReason] = useState(DELETION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [step, setStep] = useState('REASON'); // 'REASON' | 'OTP' | 'SUCCESS'
  const [otp, setOtp] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Sync initial phone when profile loads
  useEffect(() => {
    if (!inputPhone && initialPhone) {
      setInputPhone(initialPhone);
    }
  }, [initialPhone]);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const cleanPhone = (inputPhone || '').replace(/\D/g, '').slice(-10);
  const finalReasonText = selectedReason === 'Other reason'
    ? (customReason.trim() ? `Other: ${customReason.trim()}` : 'Other reason')
    : (customReason.trim() ? `${selectedReason} - ${customReason.trim()}` : selectedReason);

  // Step 1: Send real-time OTP to mobile number
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit registered mobile number.');
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
        setStep('OTP');
        setCooldown(60);
        notify?.(`Verification OTP sent to +91 ${cleanPhone}`);
      } else {
        setErrorMsg(data.message || 'Failed to send verification code. Please check your mobile number.');
      }
    } catch (err) {
      setErrorMsg('Network error while requesting verification OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and submit account deletion request
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
          reason: finalReasonText,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Clear all persistent user credentials and session storage
        localStorage.removeItem('sa-logged');
        localStorage.removeItem('sa-profile');
        localStorage.removeItem('sa-token');
        localStorage.removeItem('sa-favorites');
        sessionStorage.clear();

        // Notify parent state
        onDeleted?.();

        setSuccessInfo({
          phone: cleanPhone,
          reason: finalReasonText,
          date: new Date().toLocaleString(),
        });
        setStep('SUCCESS');
        notify?.('Account deletion request submitted and verified successfully.');
      } else {
        setErrorMsg(data.message || 'Invalid or expired OTP. Please try again.');
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
            <h3 style={{ margin: '0 0 6px', color: '#991b1b', fontSize: '16px', fontWeight: '700' }}>
              Important: This action will deactivate your devotional account
            </h3>
            <p style={{ margin: 0, color: '#7f1d1d', fontSize: '13px', lineHeight: 1.5 }}>
              Deleting your account revokes access to your saved poojas, sacred bookmarks, and profile details.
              For user safety and compliance, we require real-time OTP verification on your registered mobile number before submitting the deletion request to the administrator.
            </p>
          </div>
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

        {/* STEP 1: Ask Reason (res) & Mobile Number */}
        {step === 'REASON' && (
          <form onSubmit={handleSendOtp}>
            {/* Reason Selection */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                1. Select Reason for Account Deletion *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DELETION_REASONS.map((r) => {
                  const isSelected = selectedReason === r;
                  return (
                    <label
                      key={r}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #dc2626' : '1px solid #e5e7eb',
                        background: isSelected ? '#fee2e2' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="deletionReason"
                        checked={isSelected}
                        onChange={() => setSelectedReason(r)}
                        style={{ accentColor: '#dc2626', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px', color: isSelected ? '#991b1b' : '#374151', fontWeight: isSelected ? '700' : '500' }}>
                        {r}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Custom comments / details */}
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                  Additional Comments or Feedback (optional)
                </label>
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Tell us what we could improve (optional)..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                    background: '#ffffff',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Mobile Number Verification */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                2. Registered Mobile Number *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '360px' }}>
                <span style={{
                  padding: '12px 14px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#374151',
                }}>
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #d1d5db',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#111827',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6b7280' }}>
                We will send an OTP to this number to verify account ownership.
              </p>
            </div>

            {/* Submit & Cancel Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={sendingOtp || cleanPhone.length < 10}
                style={{
                  background: cleanPhone.length < 10 ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px 26px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: sendingOtp || cleanPhone.length < 10 ? 'not-allowed' : 'pointer',
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
                onClick={() => navigate('/home')}
                style={{
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '13px 22px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel & Return to Home
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP & Verify */}
        {step === 'OTP' && (
          <form onSubmit={handleConfirmDeletion}>
            {/* Target Phone info */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                  OTP Sent To
                </span>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginTop: '2px' }}>
                  +91 {cleanPhone}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setStep('REASON'); setOtp(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Change Number
              </button>
            </div>

            {/* OTP input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                Enter 6-digit Verification Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
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
                  <span>Resend OTP in <b>{cooldown}s</b></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
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

            {/* Reason Summary Preview */}
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
            }}>
              <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                Recorded Reason (res):
              </span>
              <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                {finalReasonText}
              </p>
            </div>

            {/* Confirmation Checkbox */}
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
                <span>I confirm that I want to delete my devotee account and clear all session data.</span>
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
                <span>{deleting ? 'Verifying...' : 'Verify OTP & Delete Account'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('REASON')}
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
                Back
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <Icon name="CheckCircle2" size={36} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 10px' }}>
              Account Deletion Verified &amp; Submitted
            </h2>

            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 24px' }}>
              Swamiye Saranam Ayyappa. Your registered mobile number <b>+91 {successInfo?.phone}</b> has been verified with OTP, and your account deletion request has been submitted to the administration.
            </p>

            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '460px',
              margin: '0 auto 24px',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Submission Timestamp:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>{successInfo?.date}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Reason:</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>{successInfo?.reason}</div>
            </div>

            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Icon name="Home" size={18} />
              <span>Return to Saranam Ayyappa Home</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
