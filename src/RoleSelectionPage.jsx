import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { useLanguage } from './LanguageContext';
import './roleSelection.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function RoleSelectionPage({ profile, setProfile, onSelectRole }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic emblem/logo, title, tagline fetched from database
  const [brand, setBrand] = useState({
    logoUrl: '/images/saranam-ayyappa-official-emblem.jpg',
    title: 'Saranam Ayyappa',
    tagline: 'Connect.. Pray.. Serve..',
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/home/logo`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setBrand({
            logoUrl: data.logoUrl || '/images/saranam-ayyappa-official-emblem.jpg',
            title: data.title || 'Saranam Ayyappa',
            tagline: data.tagline || 'Connect.. Pray.. Serve..',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Determine intent (login vs register) passed via state, query, or path
  const searchParams = new URLSearchParams(location.search);
  const targetMode = location.state?.mode || searchParams.get('mode') || (location.pathname === '/register' ? 'register' : 'login');

  // Default selection is Customer matching Image 1
  const [selectedRole, setSelectedRole] = useState(profile?.role || 'CUSTOMER');

  const handleContinue = () => {
    // Update local profile state with chosen role
    if (setProfile) {
      setProfile((prev) => ({
        ...prev,
        role: selectedRole,
      }));
    }
    if (onSelectRole) {
      onSelectRole(selectedRole);
    }

    // Direct dynamic navigation: Customer goes to /auth-login, Dharma Kartha goes to /auth-register with role preselected
    const destination = selectedRole === 'DHARMA_KARTHA' ? '/auth-register' : '/auth-login';
    navigate(destination, {
      state: {
        role: selectedRole,
        mode: selectedRole === 'DHARMA_KARTHA' ? 'register' : 'login',
      },
    });
  };

  return (
    <main className="sa-role-page" role="main" aria-label="Saranam Ayyappa Role Selection">
      {/* 1. TOP BRANDING AREA (Official Sacred Emblem from DB + Title + Tagline) */}
      <header className="sa-role-brand">
        <div className="sa-role-brand__art-wrap">
          <img
            src={brand.logoUrl}
            alt={brand.title}
            className="sa-role-brand__art"
            fetchpriority="high"
            onError={(e) => { e.target.src = '/images/saranam-ayyappa-official-emblem.jpg'; }}
          />
        </div>

        <h1 className="sa-role-brand__title">{brand.title}</h1>

        <div className="sa-role-brand__divider" aria-hidden="true">
          <span className="sa-role-brand__divider-line" />
          <span className="sa-role-brand__lotus">🪷</span>
          <span className="sa-role-brand__divider-line" />
        </div>

        <p className="sa-role-brand__tagline">{brand.tagline}</p>
      </header>

      {/* 2. LARGE IVORY ROLE-SELECTION PANEL */}
      <section className="sa-role-panel" aria-label="Select your devotional role">
        <div className="sa-role-panel-header">
          <div className="sa-role-heading-wrap" aria-hidden="true">
            <span className="sa-role-heading-line" />
            <span className="sa-role-heading-diamond">◆</span>
            <h2 className="sa-role-heading-title">{t('continueWithRole', 'Continue with Your Role')}</h2>
            <span className="sa-role-heading-diamond">◆</span>
            <span className="sa-role-heading-line" />
          </div>
          <p className="sa-role-heading-desc">
            {t('chooseRoleDesc', 'Choose how you would like to use the app')}
          </p>
        </div>

        {/* 3. TWO ROLE SELECTION CARDS (Images 4 & 5) */}
        <div className="sa-role-cards-grid" role="radiogroup" aria-label="Available Account Roles">
          {/* A. CUSTOMER CARD (Image 4) */}
          <div
            role="radio"
            tabIndex={0}
            aria-checked={selectedRole === 'CUSTOMER'}
            className={`sa-role-card customer-card ${selectedRole === 'CUSTOMER' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('CUSTOMER')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedRole('CUSTOMER');
              }
            }}
          >
            {/* Top-Right Radio / Checkmark Badge */}
            <div className="sa-role-card-badge" aria-hidden="true">
              {selectedRole === 'CUSTOMER' && <Icon name="Check" size={15} color="#FFFFFF" strokeWidth={3} />}
            </div>

            {/* Devotee Photograph (Image 4) */}
            <div className="sa-role-card-img-wrap">
              <img
                src="/images/auth/customer-devotee.png"
                alt="Ayyappa Devotee in Prayer"
                className="sa-role-card-img"
              />
              <div className="sa-role-card-img-overlay" />
            </div>

            {/* Devotee Outline Icon */}
            <div className="sa-role-card-icon" aria-hidden="true">
              <Icon name="Users" size={26} />
            </div>

            <h3 className="sa-role-card-title">{t('iAmDevotee', 'I am Devotee')}</h3>
            <p className="sa-role-card-desc">{t('forDevotees', 'For Ayyappa Devotees')}</p>
          </div>

          {/* B. DHARMA KARTHAS CARD (Image 5) */}
          <div
            role="radio"
            tabIndex={0}
            aria-checked={selectedRole === 'DHARMA_KARTHA'}
            className={`sa-role-card dharma-kartha-card ${selectedRole === 'DHARMA_KARTHA' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('DHARMA_KARTHA')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedRole('DHARMA_KARTHA');
              }
            }}
          >
            {/* Top-Right Radio / Checkmark Badge */}
            <div className="sa-role-card-badge" aria-hidden="true">
              {selectedRole === 'DHARMA_KARTHA' && <Icon name="Check" size={15} color="#FFFFFF" strokeWidth={3} />}
            </div>

            {/* Golden Temple Photograph (Image 5) */}
            <div className="sa-role-card-img-wrap">
              <img
                src="/images/auth/dharma-karthas-temple.png"
                alt="Golden Temple Mandir with Traditional Architecture"
                className="sa-role-card-img"
              />
              <div className="sa-role-card-img-overlay" />
            </div>

            {/* Temple Outline Icon */}
            <div className="sa-role-card-icon" aria-hidden="true">
              <img
                src="/images/auth/temple-mandir-icon-hd.svg"
                alt="Temple Icon"
                className="sa-temple-icon-img"
              />
            </div>

            <h3 className="sa-role-card-title">{t('iAmDharmaKartha', 'I am Dharma Kartha')}</h3>
            <span className="sa-role-card-subtitle">({t('templeFounder', 'Temple Founder')})</span>
            <p className="sa-role-card-desc">
              {t('forTempleManagement', 'For Temple Management, Events & Devotional Services')}
            </p>
          </div>
        </div>

        {/* 4. CONTINUE BUTTON */}
        <button
          type="button"
          className="sa-role-continue-btn"
          onClick={handleContinue}
          aria-label="Continue to authentication with selected role"
        >
          <span>{t('continue', 'Continue')}</span>
          <Icon name="ArrowRight" size={20} />
        </button>
      </section>
    </main>
  );
}
