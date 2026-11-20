import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FirebaseWebAuth } from './firebaseWebAuth';
import { API_BASE_URL } from './apiConfig';
import { useLanguage } from './LanguageContext';
import './authPage.css';

export default function AuthPage({
  initialMode = 'login',
  profile,
  setProfile,
  phone,
  setPhone,
  notify
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');

  useEffect(() => {
    setIsRegister(initialMode === 'register');
  }, [initialMode]);

  const [localName, setLocalName] = useState(
    profile?.name && profile.name !== 'Ayyappa Devotee' ? profile.name : ''
  );
  // Pick role seamlessly from navigation state or profile
  const [selectedRole, setSelectedRole] = useState(location.state?.role || profile?.role || 'CUSTOMER');
  const [templeName, setTempleName] = useState(profile?.templeName || '');
  const [templeTrustName, setTempleTrustName] = useState(profile?.templeTrustName || '');
  const [templeCity, setTempleCity] = useState(profile?.templeCity || '');

  const handleModeSwitch = (registerMode) => {
    setIsRegister(registerMode);
    navigate(registerMode ? '/auth-register' : '/auth-login', { replace: true, state: { role: selectedRole } });
  };

  const handlePhoneChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      if (!localName.trim()) {
        return notify('Please enter your full name');
      }
      if (selectedRole === 'DHARMA_KARTHA' && !templeName.trim()) {
        return notify('Please enter your temple name');
      }
      setProfile({
        ...profile,
        name: localName.trim(),
        role: selectedRole,
        templeName: templeName.trim(),
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return notify('Please enter a valid 10-digit mobile number');
    }

    setIsSubmitting(true);
    try {
      // 1. Strict Database Verification: Check whether user is registered or not for the SELECTED ROLE
      const checkPayload = { 
        phoneNumber: phone,
        intent: isRegister ? 'REGISTER' : 'LOGIN',
        role: selectedRole
      };
      if (selectedRole === 'DHARMA_KARTHA') {
        checkPayload.fullName = localName.trim();
        checkPayload.templeName = templeName.trim();
      }

      const checkRes = await fetch(`${API_BASE_URL}/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkPayload),
      });

      if (!checkRes.ok) {
        let errMessage = 'Database verification service unavailable. Please try again.';
        try {
          const errData = await checkRes.json();
          errMessage = errData.message || errMessage;
        } catch {}
        setIsSubmitting(false);
        return notify(errMessage, 'error');
      }

      const checkData = await checkRes.json();

      // Case 1: Devotee account is suspended
      if (checkData.isSuspended) {
        setIsSubmitting(false);
        return notify(checkData.message || 'Your devotee account is currently suspended. Please contact temple administration.', 'error');
      }

      // Case 2: Devotee tries to LOGIN, but mobile is NOT registered in database
      if (!isRegister && !checkData.isRegistered) {
        setIsSubmitting(false);
        notify(checkData.message || 'This mobile number is not registered yet. Please create your account first.', 'error');
        setIsRegister(true);
        navigate('/auth-register', { 
          replace: true, 
          state: { role: selectedRole, mode: 'register' } 
        });
        return;
      }

      // Case 3: Devotee tries to REGISTER, but mobile IS ALREADY registered in database
      if (isRegister && checkData.isRegistered) {
        setIsSubmitting(false);
        notify(checkData.message || 'This mobile number is already registered in our database. Please login to your account.', 'error');
        setIsRegister(false);
        navigate('/auth-login', { 
          replace: true, 
          state: { role: selectedRole, mode: 'login' } 
        });
        return;
      }

      // 2. Dispatch OTP via Firebase only after genuine backend verification passes
      const result = await FirebaseWebAuth.sendOtp(phone, isRegister ? 'register' : 'login');
      if (result.success) {
        notify(result.message, 'success');
        navigate('/otp', { 
          state: { 
            isRegister, 
            name: localName,
            role: selectedRole,
            templeName,
          } 
        });
      } else {
        notify(result.error || 'Failed to send OTP. Please check mobile number.', 'error');
      }
    } catch (err) {
      notify(err.message || 'Network error verifying account with server. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setIsSubmitting(true);
    try {
      if (typeof window !== 'undefined' && window.firebase) {
        const firebase = window.firebase;
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');

        const userCredential = await firebase.auth().signInWithPopup(provider);
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        // Send verified Google token to backend API
        const res = await fetch(`${API_BASE_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            email: user.email,
            fullName: user.displayName || 'Devotee',
            googleId: user.uid,
          }),
        });

        const data = await res.json();
        if (res.ok && (data.token || data.user)) {
          setProfile(prev => ({
            ...prev,
            name: data.user?.fullName || user.displayName || prev.name,
            email: data.user?.email || user.email || prev.email,
            mobile: data.user?.phoneNumber || prev.mobile,
          }));
          notify(data.message || 'Successfully signed in with Google!');
          navigate('/choose-language');
        } else {
          notify(data.message || 'Google authentication failed on server');
        }
      } else {
        notify('Firebase SDK is not available');
      }
    } catch (err) {
      console.error('Google Sign In error:', err);
      notify(err.message || 'Google sign-in cancelled or failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleClick = async () => {
    setIsSubmitting(true);
    try {
      if (typeof window !== 'undefined' && window.firebase) {
        const firebase = window.firebase;
        const provider = new firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');

        const userCredential = await firebase.auth().signInWithPopup(provider);
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        const res = await fetch(`${API_BASE_URL}/auth/apple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identityToken: idToken,
            email: user.email,
            fullName: user.displayName || 'Devotee',
            appleId: user.uid,
          }),
        });

        const data = await res.json();
        if (res.ok && (data.token || data.user)) {
          setProfile(prev => ({
            ...prev,
            name: data.user?.fullName || user.displayName || prev.name,
            email: data.user?.email || user.email || prev.email,
          }));
          notify(data.message || 'Successfully signed in with Apple!');
          navigate('/choose-language');
        } else {
          notify(data.message || 'Apple authentication failed');
        }
      } else if (typeof window !== 'undefined' && window.AppleID) {
        const response = await window.AppleID.auth.signIn();
        if (response && response.authorization) {
          const res = await fetch(`${API_BASE_URL}/auth/apple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identityToken: response.authorization.id_token,
              authorizationCode: response.authorization.code,
              user: response.user,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setProfile(prev => ({
              ...prev,
              name: data.user?.fullName || prev.name,
              email: data.user?.email || prev.email,
            }));
            notify('Apple Sign In successful');
            navigate('/choose-language');
          } else {
            notify(data.message || 'Apple authentication failed');
          }
        }
      } else {
        notify('Apple Sign-In is initializing. Please try again.');
      }
    } catch (err) {
      console.error('Apple Sign In error:', err);
      notify(err.message || 'Apple sign-in was cancelled or failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sa-auth-page">
      {/* Decorative Background Elements */}
      <div className="sa-auth-bg-decor" aria-hidden="true">
        <div className="decor-mandala-tl" />
        <div className="decor-mandala-tr" />
        <div className="decor-hill-left" />
        <div className="decor-hill-right" />
      </div>

      <div className="sa-auth-layout">
        {/* LEFT DEVOTIONAL TEMPLE CARD */}
        <div className="sa-auth-temple-card">
          <img
            src={`${import.meta.env.BASE_URL}images/auth/saranam-ayyappa-login-temple.png`}
            alt="Sabarimala Temple"
            className="sa-auth-temple-img"
          />

          <div className="sa-auth-temple-content">
            <div className="sa-auth-om-line">
              <span className="sa-auth-om">ॐ</span>
              <div className="sa-auth-om-divider" />
            </div>

            <h1 className="sa-auth-temple-title">
              <span>Begin your</span>
              <span>sacred journey.</span>
            </h1>

            <p className="sa-auth-temple-subtitle">
              Swamiye Saranam Ayyappa!
            </p>

            <div className="sa-auth-lotus-divider" aria-hidden="true">
              <div className="lotus-line" />
              <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12 2 13.5 6.5 15.5 8C17.5 9.5 21 9 21 9C21 9 18 12.5 15.5 13C13 13.5 12 17 12 17C12 17 11 13.5 8.5 13C6 12.5 3 9 3 9C3 9 6.5 9.5 8.5 8C10.5 6.5 12 2 12 2Z" fill="currentColor" />
                <path d="M12 7C12 7 13 9.5 14.5 10.5C16 11.5 18 11.5 18 11.5C18 11.5 16 13.5 14.5 14C13 14.5 12 16.5 12 16.5C12 16.5 11 14.5 9.5 14C8 13.5 6 11.5 6 11.5C6 11.5 8 11.5 9.5 10.5C11 9.5 12 7 12 7Z" fill="#ffdf99" opacity="0.6" />
              </svg>
              <div className="lotus-line reverse" />
            </div>
          </div>
        </div>

        {/* RIGHT AUTHENTICATION CARD */}
        <div className="sa-auth-form-card">
          {/* Subtle Decorative Flourishes */}
          <svg className="sa-auth-flourish tl" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 35C4 17.8792 17.8792 4 35 4" stroke="#cfa652" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 35C12 22.2975 22.2975 12 35 12" stroke="#cfa652" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="35" cy="4" r="2.5" fill="#cfa652" />
            <circle cx="4" cy="35" r="2.5" fill="#cfa652" />
          </svg>
          <svg className="sa-auth-flourish tr" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M56 35C56 17.8792 42.1208 4 25 4" stroke="#cfa652" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M48 35C48 22.2975 37.7025 12 25 12" stroke="#cfa652" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="25" cy="4" r="2.5" fill="#cfa652" />
            <circle cx="56" cy="35" r="2.5" fill="#cfa652" />
          </svg>

          {/* Deity Avatar */}
          <div className="sa-auth-deity-wrap">
            <div className="sa-auth-deity-circle">
              <img
                src={`${import.meta.env.BASE_URL}images/auth/ayyappa-avatar-auth.png`}
                alt="Lord Ayyappa"
                onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}images/ayyappa-icon.jpg`; }}
              />
            </div>
          </div>

          {/* Header */}
          <div className="sa-auth-header">
            <h2 className="sa-auth-title">Saranam Ayyappa</h2>
            <div className="sa-auth-head-lotus" aria-hidden="true">
              <div className="hl-line" />
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1C10 1 11.2 4.5 12.8 5.8C14.4 7 17 6.6 17 6.6C17 6.6 14.8 9.2 12.8 9.6C10.8 10 10 12.8 10 12.8C10 12.8 9.2 10 7.2 9.6C5.2 9.2 3 6.6 3 6.6C3 6.6 5.6 7 7.2 5.8C8.8 4.5 10 1 10 1Z" fill="#caa049" />
              </svg>
              <div className="hl-line reverse" />
            </div>
            <p className="sa-auth-subtitle">
              {isRegister ? t('registerSubtitle', 'Create your devotional account') : t('loginSubtitle', 'Sign in to your devotional account')}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="sa-auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegister}
              className={`sa-auth-tab-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => handleModeSwitch(false)}
            >
              {t('loginWithOtp', 'Login with OTP')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegister}
              className={`sa-auth-tab-btn ${isRegister ? 'active' : ''}`}
              onClick={() => handleModeSwitch(true)}
            >
              {t('registerWithOtp', 'Register with OTP')}
            </button>
          </div>

          {/* Auth Form */}
          <form className="sa-auth-form" onSubmit={handleSubmit} noValidate>
            {/* Dynamic Role Selection for both Login & Registration */}
            <div className="sa-auth-field">
              <label>{t('selectRole', 'Select Your Profile Role')}</label>
              <div className="sa-auth-role-tabs">
                <button
                  type="button"
                  className={`sa-auth-role-btn ${selectedRole === 'CUSTOMER' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('CUSTOMER')}
                >
                  <span className="sa-auth-role-badge">🙏</span>
                  <span>{t('roleCustomer', 'Devotee (Customer)')}</span>
                </button>
                <button
                  type="button"
                  className={`sa-auth-role-btn ${selectedRole === 'DHARMA_KARTHA' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('DHARMA_KARTHA')}
                >
                  <span className="sa-auth-role-badge">🛕</span>
                  <span>{t('roleDharmaKartha', 'Dharma Kartha (Temple Founder)')}</span>
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="sa-auth-field">
                <label htmlFor="auth-full-name">
                  {selectedRole === 'DHARMA_KARTHA' ? 'Dharma Kartha / Trustee Full Name *' : 'Devotee Full Name *'}
                </label>
                <input
                  id="auth-full-name"
                  type="text"
                  className="sa-auth-input"
                  placeholder={selectedRole === 'DHARMA_KARTHA' ? 'Enter trustee/owner name' : 'Enter your full name'}
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Dharma Kartha Temple Specific Fields */}
            {isRegister && selectedRole === 'DHARMA_KARTHA' && (
              <div className="sa-auth-field">
                <label htmlFor="auth-temple-name">Temple / Mandir Name *</label>
                <input
                  id="auth-temple-name"
                  type="text"
                  className="sa-auth-input"
                  placeholder="e.g. Sri Dharma Sastha Temple"
                  value={templeName}
                  onChange={(e) => setTempleName(e.target.value)}
                />
              </div>
            )}

            <div className="sa-auth-field">
              <label htmlFor="auth-mobile-number">Mobile Number *</label>
              <div className="sa-auth-phone-wrap">
                <span className="sa-auth-phone-prefix">
                  +91
                </span>
                <input
                  id="auth-mobile-number"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className="sa-auth-phone-input"
                  placeholder="6302759527"
                  value={phone}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                />
              </div>
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#687766' }}>
                <span>Default Test Mobile:</span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#b8860b', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  onClick={() => setPhone('6302759527')}
                >
                  6302759527 (OTP: 123456)
                </button>
              </div>
            </div>

            {/* Diagnostic visible reCAPTCHA widget container */}
            <div id="recaptcha-container" style={{ margin: '14px 0', display: 'flex', justifyContent: 'center' }}></div>

            <button
              type="submit"
              className="sa-auth-submit-btn"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Sending ...' : isRegister ? 'Send Verification OTP' : 'Send Login OTP'} &rarr;
            </button>
          </form>

          {/* Social Sign-in (Side by Side) */}
          <div className="sa-auth-divider">
            <span>or continue with</span>
          </div>

          <div className="sa-auth-social-row">
            <button
              type="button"
              className="sa-auth-social-btn google"
              onClick={handleGoogleClick}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="sa-auth-social-btn apple"
              onClick={handleAppleClick}
            >
              <svg viewBox="0 0 170 170" width="16" height="16" fill="#ffffff" style={{ flexShrink: 0 }}>
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.33-8.26-9.63-17.65-12.9-28.17-3.27-10.52-4.9-20.47-4.9-29.85 0-12.44 3.07-23.01 9.21-31.7 6.14-8.69 14.07-13.19 23.79-13.5 4.58 0 9.77 1.25 15.57 3.75 5.8 2.5 9.72 3.84 11.75 4.02 2.72-.44 6.84-1.9 12.37-4.38 5.53-2.49 10.36-3.61 14.49-3.37 16.32 1.07 28.53 7.6 36.63 19.59-14.58 8.82-21.72 20.89-21.43 36.21.29 11.96 4.67 21.94 13.14 29.93 3.88 3.72 8.39 6.53 13.52 8.42-.99 3.06-2.11 6.17-3.37 9.35zM119.22 33.15c0-7.39 2.66-14.28 7.97-20.67 5.31-6.39 11.76-10.3 19.35-11.73.55 1.5.82 3.1.82 4.8 0 7.39-2.82 14.61-8.46 21.66-5.64 7.05-12.39 11.08-20.25 12.09-.44-2.07-.66-4.14-.66-6.15z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Delicate Bottom Lotus Ornament */}
          <div className="sa-auth-bottom-lotus" aria-hidden="true">
            <img
              src={`${import.meta.env.BASE_URL}images/auth/bottom-lotus-auth.png`}
              alt=""
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

