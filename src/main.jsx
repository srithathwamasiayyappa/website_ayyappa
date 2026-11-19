import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { nav, services, deities, languages, poojas, stotras, tracks, temples, notices, routes, image } from './data';
import HomePage from './HomePage';
import CategoriesPage from './CategoriesPage';
import TemplesPage from './TemplesPage';
import DonationsPage from './DonationsPage';
import PoojaListingPage from './PoojaListingPage';
import LiveStreamsPage from './LiveStreamsPage';
import NotificationsPage from './NotificationsPage';
import PanchangamPage from './PanchangamPage';
import AuthPage from './AuthPage';
import RoleSelectionPage from './RoleSelectionPage';
import ContactPage from './ContactPage';
import AboutPage from './AboutPage';
import TermsPage from './TermsPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import RefundPolicyPage from './RefundPolicyPage';
import AccountDeletionPage from './AccountDeletionPage';
import DeleteAccountPage from './DeleteAccountPage';
import BookmarksPage from './BookmarksPage';
import AddMandirPage from './AddMandirPage';
import TempleDetailPage from './TempleDetailPage';
import DharmaKarthaDashboard from './DharmaKarthaDashboard';
import DharmaKarthaMyTemples from './DharmaKarthaMyTemples';
import DharmaKarthaAddTemple from './DharmaKarthaAddTemple';
import DharmaKarthaEditTemple from './DharmaKarthaEditTemple';
import DharmaKarthaFestivalsPage from './DharmaKarthaFestivalsPage';
import DharmaKarthaEventsPage from './DharmaKarthaEventsPage';
import DharmaKarthaGalleryPage from './DharmaKarthaGalleryPage';
import DharmaKarthaNotificationsPage from './DharmaKarthaNotificationsPage';
import FestivalsPage from './FestivalsPage';
import DharmaKarthaPendingModule from './DharmaKarthaPendingModule';
import ProfilePortalLayout from './ProfilePortalLayout';
import Footer from './Footer';
import { FirebaseWebAuth } from './firebaseWebAuth';
import { API_BASE_URL } from './apiConfig';
import { LanguageProvider, useLanguage, LanguageSelector } from './LanguageContext';
import './theme.css'; import './styles.css'; import './profileRole.css';
const Icon = ({ name = 'Sparkles', size = 20, ...props }) => { const Component = L[name] || L.Sparkles; return <Component size={size} strokeWidth={1.9} {...props} /> };
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } };
const Button = ({ children, onClick, to, variant = 'primary', icon, disabled = false, ...rest }) => to ? <Link className={`btn ${variant}`} to={to} {...rest}>{icon && <Icon name={icon} size={17} />} {children}</Link> : <button className={`btn ${variant}`} type="button" disabled={disabled} onClick={onClick} {...rest}>{icon && <Icon name={icon} size={17} />} {children}</button>;
const Tag = ({ children }) => <span className="tag">{children}</span>;
function App() {
  const location = useLocation(), navigate = useNavigate();
  const path = decodeURI(location.pathname);
  const { currentLanguage: language, setLanguage, t, languages: dbLanguages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [god, setGod] = useState(read('sa-god', 'Lord Ayyappa'));
  const [profile, setProfile] = useState(read('sa-profile', null));
  const [logged, setLogged] = useState(read('sa-logged', false));
  const [profileLoading, setProfileLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [songTab, setSongTab] = useState('Bhajans');
  const [detailTab, setDetailTab] = useState('Overview');
  const [templeTab, setTempleTab] = useState('About');
  const [favorites, setFavorites] = useState(read('sa-favorites', []));
  const [unread, setUnread] = useState(3);
  const [reg, setReg] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showAppDownloadModal, setShowAppDownloadModal] = useState(false);

  // Dynamic Branding (Logo, Title, Tagline, Store Links) fetched from MySQL via API
  const [appBrand, setAppBrand] = useState({
    logoUrl: '/images/saranam-ayyappa-official-emblem.jpg',
    title: 'Saranam Ayyappa',
    appName: 'Saranam Ayyappa App',
    tagline: 'Connect.. Pray.. Serve..',
    storeSubtext: 'Available on iOS & Android',
    footerAppDesc: 'Experience daily darshan, audio bhajans, Panchangam alerts & sacred pooja vidhanam on your mobile.',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
    appStoreUrl: 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/home/logo`)
      .then(res => res.json())
      .then(data => {
        if (data?.success) {
          const rawLogo = data.logoUrl;
          let resolvedLogo = '/images/saranam-ayyappa-official-emblem.jpg';
          if (rawLogo) {
            if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:')) {
              resolvedLogo = rawLogo;
            } else if (rawLogo.startsWith('/')) {
              resolvedLogo = rawLogo;
            } else {
              resolvedLogo = `/${rawLogo}`;
            }
          }

          setAppBrand({
            logoUrl: resolvedLogo,
            title: data.title || 'Saranam Ayyappa',
            appName: data.appName || `${data.title || 'Saranam Ayyappa'} App`,
            tagline: data.tagline || 'Connect.. Pray.. Serve..',
            storeSubtext: data.storeSubtext || 'Available on iOS & Android',
            footerAppDesc: data.footerAppDesc || 'Experience daily darshan, audio bhajans, Panchangam alerts & sacred pooja vidhanam on your mobile.',
            playStoreUrl: data.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
            appStoreUrl: data.appStoreUrl || 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowAppDownloadModal(false);
    };
    const handleClickOutside = (e) => {
      if (!e.target.closest('.header-app-download-wrap')) {
        setShowAppDownloadModal(false);
      }
    };
    if (showAppDownloadModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAppDownloadModal]);

  // Dynamically fetch devotee profile from MySQL Database whenever user is logged in
  useEffect(() => {
    const savedPhone = profile?.phoneNumber || profile?.mobile || phone;
    const savedId = profile?.id;
    if (logged && (savedPhone || savedId)) {
      const activeRole = profile?.role || 'CUSTOMER';
      const param = savedId
        ? `userId=${savedId}&role=${encodeURIComponent(activeRole)}`
        : `phone=${savedPhone}&role=${encodeURIComponent(activeRole)}`;
      fetch(`${API_BASE_URL}/auth/profile?${param}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.user) {
            setProfile(prev => {
              const currentRole = prev?.role || activeRole;
              return {
                ...prev,
                ...data.user,
                // STRICT: Always maintain user's selected active session role!
                role: currentRole,
                hasDkAccount: data.hasDkAccount || data.user.hasDkAccount || Boolean(data.user.templeName),
                name: data.user.fullName || prev?.name,
                mobile: data.user.phoneNumber || prev?.mobile,
              };
            });
          }
        })
        .catch(err => console.warn('Could not fetch DB profile:', err));
    }
  }, [logged, phone]);

  // Dynamic Dharma Kartha profile data fetched live from MySQL DB via API responses (ONLY when role is DHARMA_KARTHA)
  const [dkFestivals, setDkFestivals] = useState([]);
  const [dkEvents, setDkEvents] = useState([]);
  const [dkGallery, setDkGallery] = useState([]);
  const [dkTemples, setDkTemples] = useState([]);
  const [dkLoading, setDkLoading] = useState(false);

  const availableTemples = (dkTemples && dkTemples.length > 0)
    ? dkTemples
    : [{ id: 1, name: profile?.templeName || 'Sri Dharma Sastha Temple', city: profile?.templeCity || profile?.city || 'Sabarimala' }];

  const [showAddFestModal, setShowAddFestModal] = useState(false);
  const [newFestModalForm, setNewFestModalForm] = useState({
    templeId: '',
    name: '',
    period: '',
    description: '',
    specialPoojaInfo: '',
  });
  const [submittingFestModal, setSubmittingFestModal] = useState(false);

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventModalForm, setNewEventModalForm] = useState({
    templeId: '',
    title: '',
    startDate: '',
    location: '',
    description: '',
  });
  const [submittingEventModal, setSubmittingEventModal] = useState(false);

  const mediaCategories = [
    'Temple Exterior',
    'Sanctum Sanctorum',
    'Main Entrance & Gopuram',
    'Deity & Devotional Artwork',
    'Festival Celebrations',
    'Daily Seva & Abhishekam',
    'Temple Premises & Mandapam',
    'Annadanam Hall',
  ];
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [newMediaModalForm, setNewMediaModalForm] = useState({
    templeId: '',
    title: '',
    category: 'Temple Exterior',
    mediaUrl: '/images/temple-hero.jpg',
    caption: '',
    type: 'Photo',
  });
  const [submittingMediaModal, setSubmittingMediaModal] = useState(false);

  const handleCreateMediaModal = async (e) => {
    e.preventDefault();
    if (!newMediaModalForm.title.trim() || !newMediaModalForm.mediaUrl.trim()) {
      notify('Title and image URL are required', 'error');
      return;
    }
    setSubmittingMediaModal(true);
    try {
      const uid = profile?.id || 1;
      const templeId = Number(newMediaModalForm.templeId) || availableTemples[0]?.id || 1;
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(uid) },
        body: JSON.stringify({
          ...newMediaModalForm,
          templeId,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        notify('Temple media submitted for approval! 🙏');
        setShowAddMediaModal(false);
        setNewMediaModalForm({ templeId: '', title: '', category: 'Temple Exterior', mediaUrl: '/images/temple-hero.jpg', caption: '', type: 'Photo' });
        fetch(`${API_BASE_URL}/dharma-kartha/media?userId=${uid}`)
          .then(r => r.json())
          .then(mData => { if (mData?.media) setDkGallery(mData.media); });
      } else {
        notify(data?.message || 'Failed to upload media', 'error');
      }
    } catch {
      notify('Media submitted in offline mode.');
      setShowAddMediaModal(false);
    } finally {
      setSubmittingMediaModal(false);
    }
  };

  const handleCreateEventModal = async (e) => {
    e.preventDefault();
    if (!newEventModalForm.title.trim() || !newEventModalForm.startDate.trim()) {
      notify('Event title and date/time are required', 'error');
      return;
    }
    setSubmittingEventModal(true);
    try {
      const uid = profile?.id || 1;
      const templeId = Number(newEventModalForm.templeId) || availableTemples[0]?.id || 1;
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(uid) },
        body: JSON.stringify({
          ...newEventModalForm,
          templeId,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        notify('Temple event published successfully! 🙏');
        setShowAddEventModal(false);
        setNewEventModalForm({ templeId: '', title: '', startDate: '', location: '', description: '' });
        fetch(`${API_BASE_URL}/dharma-kartha/events?userId=${uid}`)
          .then(r => r.json())
          .then(eData => { if (eData?.events) setDkEvents(eData.events); });
      } else {
        notify(data?.message || 'Failed to create event', 'error');
      }
    } catch {
      notify('Event created in offline mode.');
      setShowAddEventModal(false);
    } finally {
      setSubmittingEventModal(false);
    }
  };

  const handleCreateFestModal = async (e) => {
    e.preventDefault();
    if (!newFestModalForm.name.trim() || !newFestModalForm.period.trim()) {
      notify('Festival name and period are required', 'error');
      return;
    }
    setSubmittingFestModal(true);
    try {
      const uid = profile?.id || 1;
      const templeId = Number(newFestModalForm.templeId) || availableTemples[0]?.id || 1;
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/festivals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(uid) },
        body: JSON.stringify({ ...newFestModalForm, templeId }),
      });
      const data = await res.json();
      if (data?.success) {
        notify('Temple festival submitted successfully! 🙏');
        setShowAddFestModal(false);
        setNewFestModalForm({ templeId: '', name: '', period: '', description: '', specialPoojaInfo: '' });
        fetch(`${API_BASE_URL}/dharma-kartha/festivals?userId=${uid}`)
          .then(r => r.json())
          .then(fData => { if (fData?.festivals) setDkFestivals(fData.festivals); });
      } else {
        notify(data?.message || 'Failed to submit festival', 'error');
      }
    } catch {
      notify('Festival submitted in offline mode.');
      setShowAddFestModal(false);
    } finally {
      setSubmittingFestModal(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'DHARMA_KARTHA') {
      const uid = profile?.id || 1;
      setDkLoading(true);
      Promise.all([
        fetch(`${API_BASE_URL}/dharma-kartha/festivals?userId=${uid}`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE_URL}/dharma-kartha/events?userId=${uid}`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE_URL}/dharma-kartha/media?userId=${uid}`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE_URL}/dharma-kartha/temples?userId=${uid}`).then(r => r.json()).catch(() => null),
      ]).then(([festData, evtData, mediaData, templeData]) => {
        if (festData?.festivals) setDkFestivals(festData.festivals);
        if (evtData?.events) setDkEvents(evtData.events);
        if (mediaData?.media) setDkGallery(mediaData.media);
        if (templeData?.temples) setDkTemples(templeData.temples);
      }).finally(() => setDkLoading(false));
    }
  }, [profile?.role, path]);

  useEffect(() => { localStorage.setItem('sa-god', JSON.stringify(god)) }, [god]); useEffect(() => { localStorage.setItem('sa-language', JSON.stringify(language)) }, [language]); useEffect(() => { localStorage.setItem('sa-profile', JSON.stringify(profile)) }, [profile]); useEffect(() => { localStorage.setItem('sa-logged', JSON.stringify(logged)) }, [logged]); useEffect(() => { localStorage.setItem('sa-favorites', JSON.stringify(favorites)) }, [favorites]); useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); setSearch('') }, [path]); useEffect(() => { if (!toast) return; let id = setTimeout(() => setToast(null), 4000); return () => clearTimeout(id) }, [toast]);
  const notify = (msg, type = 'success') => {
    if (typeof msg === 'string') {
      const isError = type === 'error' || /fail|invalid|incorrect|error|wrong|suspended|not registered|already registered/i.test(msg);
      const isWarning = type === 'warning' || /required|caution|without adding|must add|cannot create/i.test(msg);
      const effectiveType = isError ? 'error' : isWarning ? 'warning' : type;
      setToast({
        title: isError ? 'Action Failed' : isWarning ? 'Mandir Required' : 'Success',
        message: msg,
        text: msg,
        type: effectiveType,
      });
    } else if (msg && typeof msg === 'object') {
      setToast({
        title: msg.title || (msg.type === 'warning' ? 'Mandir Required' : msg.type === 'error' ? 'Error' : 'Notice'),
        message: msg.message || msg.text || '',
        text: msg.message || msg.text || '',
        type: msg.type || 'success',
      });
    }
  };
  const toggleFav = (v) => { setFavorites(old => old.includes(v) ? old.filter(x => x !== v) : [...old, v]); notify('Saved items updated') };
  const pageTitle = routes.find(r => r[1] === path)?.[0] || 'Saranam Ayyappa'; const onboarding = ['/choose-god', '/choose-language', '/role-select', '/login', '/register', '/auth-login', '/auth-register', '/otp', '/complete-profile'].includes(path);
  if (path === '/') { return <Navigate to="/home" replace />; }
  const isRolePage = ['/role-select', '/login', '/register'].includes(path);
  return <>
    <header className="site-header">
      <div className="header-inner">
        <Link to="/home" className="brand">
          <img src={appBrand.logoUrl} alt="" aria-hidden="true" className="brand-logo-img" onError={(e) => { if (!e.target.dataset.tried1) { e.target.dataset.tried1 = 'true'; e.target.src = '/images/saranam-ayyappa-official-emblem.jpg'; } else if (!e.target.dataset.tried2) { e.target.dataset.tried2 = 'true'; e.target.src = '/images/ayyappa-icon.jpg'; } else { e.target.style.display = 'none'; } }} />
          <span className="brand-text-wrap">
            <span className="brand-title-line">
              <span>{appBrand.title || 'Saranam Ayyappa'}</span>
            </span>
            <small>{appBrand.tagline || 'Connect.. Pray.. Serve..'}</small>
          </span>
        </Link>

        <nav className="desktop-nav">
          <Link to="/home" className={path === '/home' ? 'active' : ''}>{t('navSannidhi', 'Sannidhi')}</Link>
          <Link to="/categories" className={path === '/categories' ? 'active' : ''}>{t('navServices', 'Devotional Services')}</Link>
          <Link to="/festivals" className={path === '/festivals' ? 'active' : ''}>{t('navFestivals', 'Festivals')}</Link>
          <Link to="/live-streams" className={path === '/live-streams' ? 'active' : ''}>{t('navEvents', 'Events')}</Link>
          <Link to="/panchangam" className={path === '/panchangam' ? 'active' : ''}>{t('navPanchangam', 'Panchangam')}</Link>
        </nav>

        <div className="header-actions">
          {/* Public API-Backed Dynamic Language Selector */}
          <LanguageSelector variant="header" />

          <button className="icon-btn header-search" onClick={() => navigate('/categories')} aria-label={t('navSearch', 'Search')} title={t('navSearch', 'Search')}>
            <Icon name="Search" />
          </button>

          <Link className="icon-btn" to="/donations" title={t('navDonations', 'Donations / Annadanam')} aria-label={t('navDonations', 'Donations')}>
            <Icon name="Soup" size={20} />
          </Link>

          <div className="header-app-download-wrap">
            <button 
              type="button"
              className="icon-btn app-download-btn" 
              onClick={() => setShowAppDownloadModal(prev => !prev)} 
              title={t('navDownloadApp', 'Download Saranam Ayyappa App')} 
              aria-label={t('navDownloadApp', 'Download App')}
              aria-expanded={showAppDownloadModal}
            >
              <Icon name="Download" size={20} />
            </button>

            {showAppDownloadModal && (
              <div className="header-app-popover" role="dialog" aria-label="Download Saranam Ayyappa App">
                <div className="popover-header">
                  <img 
                    src={appBrand.logoUrl} 
                    alt={appBrand.title} 
                    className="popover-app-icon"
                    onError={(e) => { e.target.src = '/images/saranam-ayyappa-official-emblem.jpg'; }}
                  />
                  <div className="popover-title-wrap">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <h4>{appBrand.appName || `${appBrand.title} App`}</h4>
                      <span className="popover-blink-badge" title="Live App" />
                    </div>
                    <small>{appBrand.storeSubtext || 'Available on iOS & Android'}</small>
                  </div>
                  <button 
                    type="button" 
                    className="popover-close-btn"
                    onClick={() => setShowAppDownloadModal(false)}
                    aria-label="Close"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>

                <div className="popover-badges">
                  {/* Apple App Store Badge */}
                  <button
                    type="button"
                    className="app-store-badge popover-badge"
                    onClick={() => {
                      if (appBrand.appStoreUrl && appBrand.appStoreUrl.startsWith('http')) {
                        window.open(appBrand.appStoreUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        notify('Saranam Ayyappa for iOS: Pre-registration open! App coming soon.');
                      }
                    }}
                    aria-label="Download on the Apple App Store"
                  >
                    <svg width="20" height="24" viewBox="0 0 170 170" fill="currentColor">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.37-2.73-7.24-7.39-11.6-13.98-6.19-9.37-11.05-20.2-14.58-32.48-3.53-12.28-5.3-23.77-5.3-34.46 0-14.34 3.73-26.17 11.19-35.49 7.46-9.33 16.71-14.07 27.76-14.23 4.8 0 10.37 1.34 16.71 4.02 6.34 2.68 10.39 4.07 12.14 4.18 1.48-.11 5.75-1.55 12.82-4.34 7.07-2.79 12.85-4.04 17.34-3.76 13.06.66 23.32 5.56 30.78 14.7-11.45 6.94-17.06 16.5-16.83 28.69.23 9.49 3.86 17.51 10.9 24.08 7.04 6.57 15.34 10.22 24.9 10.95-1.92 6.07-4.22 12.33-6.9 18.77zm-38.31-105.74c0-7.25 2.61-14.02 7.84-20.31 5.23-6.29 11.69-10.42 19.38-12.39.22 1.48.33 2.85.33 4.1 0 7.37-2.82 14.41-8.46 21.11-5.64 6.7-12.44 10.74-20.4 12.13-.33-1.63-.5-3.08-.5-4.35z" />
                    </svg>
                    <div className="badge-text">
                      <small>Download on the</small>
                      <strong>App Store</strong>
                    </div>
                  </button>

                  {/* Google Play Store Badge */}
                  <button
                    type="button"
                    className="app-store-badge play-store popover-badge"
                    onClick={() => {
                      if (appBrand.playStoreUrl && appBrand.playStoreUrl.startsWith('http')) {
                        window.open(appBrand.playStoreUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        notify('Saranam Ayyappa for Android: Pre-registration open! App coming soon.');
                      }
                    }}
                    aria-label="Get it on Google Play"
                  >
                    <svg width="20" height="22" viewBox="0 0 512 512">
                      <path d="M325.3 234.3L104.6 13l280 280-59.3-58.7z" fill="#00E676" />
                      <path d="M47 36.1C47 23.3 54.4 11.7 66.2 6.5c11.8-5.1 25.6-3.2 35.6 4.9L325.3 234.3 104.6 455.1c-10 8.1-23.8 10-35.6 4.9C54.4 454.8 47 443.2 47 430.4V36.1z" fill="#00B0FF" />
                      <path d="M325.3 277.7l-220.7 221c10 8.1 23.8 10 35.6 4.9L408.4 345l-83.1-67.3z" fill="#FF3D00" />
                      <path d="M433.8 247.9c0-17.6-9.7-33.8-25.2-42.7L104.6 13 325.3 234.3l82.2 47.1c4-3 7.1-6.8 9.6-11.1 11.1-6.4 16.7-14.8 16.7-22.4z" fill="#FFC400" />
                    </svg>
                    <div className="badge-text">
                      <small>GET IT ON</small>
                      <strong>Google Play</strong>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link className="icon-btn notice-icon" to="/notifications" aria-label={t('navNotifications', 'Notifications')}>
            <Icon name="Bell" />{unread > 0 && <span className="notice-dot" />}
          </Link>

          {logged && <Link className="avatar-link" to="/profile" title={t('navProfile', 'Profile')}><Icon name="UserRound" size={20} /></Link>}
          {!logged && <Button to="/login" variant="gold small">{t('navLoginRegister', 'Login / Register')}</Button>}

          {/* Mobile & Tablet Hamburger Navigation Trigger */}
          <button 
            type="button" 
            className="hamburger-btn" 
            onClick={() => setMobileMenuOpen(prev => !prev)} 
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <aside className="mobile-nav-drawer" role="dialog" aria-label="Mobile Navigation">
            <div className="drawer-header">
              <Link to="/home" className="drawer-brand" onClick={() => setMobileMenuOpen(false)}>
                <img src={appBrand.logoUrl} alt="" />
                <div className="drawer-brand-text">
                  <h4>{appBrand.title || 'Saranam Ayyappa'}</h4>
                  <small>{appBrand.tagline || 'Connect.. Pray.. Serve..'}</small>
                </div>
              </Link>
              <button type="button" className="drawer-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div>
                <div className="drawer-section-title">భాష / Choose Language</div>
                <LanguageSelector variant="pills" onSelect={() => setMobileMenuOpen(false)} />
              </div>

              <div>
                <div className="drawer-section-title">నావిగేషన్ / Navigation</div>
                <div className="drawer-nav-list">
                  <Link to="/home" className={`drawer-nav-link ${path === '/home' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="House" size={18} /> {t('navSannidhi', 'Sannidhi')}
                  </Link>
                  <Link to="/categories" className={`drawer-nav-link ${path === '/categories' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Grid2X2" size={18} /> {t('navServices', 'Devotional Services')}
                  </Link>
                  <Link to="/subcategories" className={`drawer-nav-link ${path === '/subcategories' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Flame" size={18} /> Pooja Vidhanam
                  </Link>
                  <Link to="/festivals" className={`drawer-nav-link ${path === '/festivals' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Sparkles" size={18} /> {t('navFestivals', 'Festivals')}
                  </Link>
                  <Link to="/live-streams" className={`drawer-nav-link ${path === '/live-streams' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Video" size={18} /> {t('navEvents', 'Events & Live')}
                  </Link>
                  <Link to="/panchangam" className={`drawer-nav-link ${path === '/panchangam' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="CalendarDays" size={18} /> {t('navPanchangam', 'Panchangam')}
                  </Link>
                  <Link to="/temples" className={`drawer-nav-link ${path === '/temples' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Landmark" size={18} /> {t('navTemples', 'Temples')}
                  </Link>
                  <Link to="/donations" className={`drawer-nav-link ${path === '/donations' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Soup" size={18} /> {t('navDonations', 'Annadanam / Seva')}
                  </Link>
                  <Link to="/food-donations" className={`drawer-nav-link ${path === '/food-donations' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="MapPin" size={18} /> {t('navFoodDonations', 'Food Donation Today')}
                  </Link>
                  <Link to="/about" className={`drawer-nav-link ${path === '/about' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Info" size={18} /> About Platform
                  </Link>
                  <Link to="/contact" className={`drawer-nav-link ${path === '/contact' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Headphones" size={18} /> Contact Devotee Seva
                  </Link>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              {logged ? (
                <Link to="/profile" className="btn gold" onClick={() => setMobileMenuOpen(false)}>
                  <Icon name="UserRound" size={17} /> {t('navProfile', 'My Profile')}
                </Link>
              ) : (
                <Link to="/login" className="btn gold" onClick={() => setMobileMenuOpen(false)}>
                  <Icon name="LogIn" size={17} /> {t('navLoginRegister', 'Login / Register')}
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </header>
    {toast && (
      <div className={`toast toast-${toast.type || 'success'}`} role="alert">
        <Icon
          name={toast.type === 'error' ? 'AlertCircle' : toast.type === 'warning' ? 'AlertTriangle' : 'CheckCircle2'}
          size={24}
          className="toast-main-icon"
        />
        <div className="toast-content">
          {toast.title && <strong className="toast-title">{toast.title}</strong>}
          <span className="toast-msg">{toast.message || toast.text}</span>
        </div>
        <button
          type="button"
          className="toast-close-btn"
          onClick={() => setToast(null)}
          aria-label="Dismiss notification"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    )}
    <main className={isRolePage ? 'role-fullscreen-page' : ['/auth-login', '/auth-register'].includes(path) ? 'auth-fullscreen-page' : onboarding ? 'onboarding-page' : 'main-page'} key={path}>
      {path === '/choose-god' && <section className="container wizard"><Progress step={1} /><div className="centered-heading"><Tag>PERSONALIZE YOUR DEVOTION</Tag><h1>Choose Your Divine Deity</h1><p>Select the deity you wish to follow to see devotional content personalized for you.</p></div><div className="deity-grid">{deities.map(([name, img]) => <button className={`deity-option ${god === name ? 'selected' : ''}`} key={name} onClick={() => setGod(name)}><img src={image(img)} alt="" /><span>{name}</span>{god === name && <Icon name="CheckCircle2" className="choice-check" size={23} />}</button>)}</div><div className="wizard-actions"><Button to="/" variant="outline">Back</Button><Button to="/choose-language">Continue <Icon name="ArrowRight" size={18} /></Button></div></section>}
      {path === '/choose-language' && <section className="container wizard narrow"><Progress step={2} /><div className="centered-heading"><Tag>FIND DEVOTION IN YOUR LANGUAGE</Tag><h1>Choose Your Language</h1><p>Explore prayers and sacred knowledge in the language closest to your heart.</p></div><div className="language-list">{languages.map(([name, script, code]) => <button key={code} className={`language-row ${language === code ? 'selected' : ''}`} onClick={() => setLanguage(code)}><span className="language-symbol"><Icon name="Languages" /></span><span><strong>{name}</strong><small>{script}</small></span><span className={`radio-dot ${language === code ? 'on' : ''}`} /></button>)}</div><div className="wizard-actions"><Button to="/choose-god" variant="outline">Back</Button><Button to="/login">Continue <Icon name="ArrowRight" size={18} /></Button></div></section>}
      {path === '/role-select' && <RoleSelectionPage profile={profile} setProfile={setProfile} />}
      {path === '/login' && <RoleSelectionPage profile={profile} setProfile={setProfile} />}
      {path === '/register' && <RoleSelectionPage profile={profile} setProfile={setProfile} />}
      {path === '/auth-login' && <AuthPage initialMode="login" profile={profile} setProfile={setProfile} phone={phone} setPhone={setPhone} notify={notify} />}
      {path === '/auth-register' && <AuthPage initialMode="register" profile={profile} setProfile={setProfile} phone={phone} setPhone={setPhone} notify={notify} />}
      {path === '/otp' && <section className="auth-single container"><div className="auth-card"><div className="centered-heading compact"><div className="shield-circle"><Icon name="ShieldCheck" size={32} /></div><h1>Verify Mobile Number</h1><p>Enter the 6-digit real-time OTP sent to +91 {phone || '••••••••••'}</p></div><div className="otp-row">{[...Array(6)].map((_, i) => <input aria-label={`OTP digit ${i + 1}`} key={i} maxLength={1} inputMode="numeric" value={otp[i] || ''} onChange={e => { let v = e.target.value.replace(/\D/g, ''); setOtp(old => (old.slice(0, i) + v + old.slice(i + 1)).slice(0, 6)); if (v) e.target.nextElementSibling?.focus() }} />)}</div><p className="otp-caption">Real-time OTP via Firebase Carrier SMS</p><Button onClick={async () => {
        if (otp.length !== 6) return notify('Enter all 6 OTP digits');
        try {
          const isReg = location.state?.isRegister || reg;
          const role = location.state?.role || profile?.role || 'CUSTOMER';
          const templeName = location.state?.templeName || profile?.templeName || '';

          const res = await FirebaseWebAuth.confirmOtp({
            phoneNumber: phone,
            otp,
            fullName: profile?.fullName || profile?.name || location.state?.name || (role === 'DHARMA_KARTHA' ? 'Temple Founder' : 'Ayyappa Devotee'),
            preferredLang: language,
            intent: isReg ? 'REGISTER' : 'LOGIN',
            role,
            templeName,
          });
          if (res.success) {
            setLogged(true);
            const chosenRole = location.state?.role || role || 'CUSTOMER';
            const templeName = location.state?.templeName || profile?.templeName || '';

            // If registered as Dharma Kartha, persist to backend profile immediately
            if (isReg && chosenRole === 'DHARMA_KARTHA' && res.user?.id) {
              try {
                fetch(`${API_BASE_URL}/auth/profile`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: res.user.id,
                    phoneNumber: phone,
                    role: 'DHARMA_KARTHA',
                    templeName,
                  }),
                }).catch(console.warn);
              } catch (e) { }
            }

            if (res.user) {
              setProfile(prev => ({
                ...prev,
                ...res.user,
                name: res.user.fullName || prev?.name || (chosenRole === 'DHARMA_KARTHA' ? 'Temple Founder' : 'Ayyappa Devotee'),
                mobile: res.user.phoneNumber || phone,
                email: res.user.email || prev?.email,
                role: chosenRole,
                hasDkAccount: Boolean(res.user?.templeName || chosenRole === 'DHARMA_KARTHA'),
                templeName: res.user.templeName || templeName,
              }));
            }
            notify(res.message, 'success');
            navigate(chosenRole === 'DHARMA_KARTHA' ? '/dharma-kartha/dashboard' : '/home', { replace: true });
          } else {
            notify(res.error, 'error');
          }
        } catch (err) {
          notify(err?.message || 'OTP verification error', 'error');
        }
      }}>Verify & Continue <Icon name="ArrowRight" size={18} /></Button><Button variant="text" to="/login">Change mobile number</Button></div></section>}
      {path === '/complete-profile' && <section className="container profile-form-wrap"><div className="page-header"><Tag>YOUR DEVOTIONAL IDENTITY</Tag><h1>Complete Your Profile</h1><p>Help us personalize your sacred devotional experience.</p></div><ProfileForm profile={profile} setProfile={setProfile} onSave={() => { if (!profile.name.trim()) return notify('Full name is required'); notify('Profile saved successfully'); navigate('/home') }} action="Save & Continue" /></section>}
      {path === '/home' && <HomePage />}
      {path === '/categories' && <CategoriesPage />}
      {path === '/subcategories' && <PoojaListingPage />}
      {path === '/pooja-detail' && <section className="container section-block"><Breadcrumb items={['Home', 'Pooja Vidhanam', 'Ayyappa Pooja Vidhanam']} /><PageHeading eyebrow="SACRED POOJA GUIDE" title="Ayyappa Pooja Vidhanam" desc="A devotional reference for daily worship of Lord Ayyappa." /><div className="detail-layout"><div><div className="large-image"><img src={image('pooja-altar')} alt="Ayyappa ritual worship" /><span className="image-overlay-tag">Sacred Ritual Guide</span></div><div className="detail-tabs">{['Overview', 'Procedure', 'Materials', 'Mantras', 'Benefits'].map(t => <button onClick={() => setDetailTab(t)} className={detailTab === t ? 'active' : ''} key={t}>{t}</button>)}</div><article className="rich-card"><h2>{detailTab}</h2>{detailTab === 'Overview' ? <p>Ayyappa Pooja is a worship tradition centered on prayer, purity and devotion. This guide presents sample sections for a complete pooja experience. Consult traditional sources for precise rituals.</p> : detailTab === 'Procedure' ? <ol><li>Prepare a clean and quiet space for worship.</li><li>Light a traditional lamp and offer flowers.</li><li>Recite the prayer with devotion.</li><li>Conclude with a respectful harathi and offering.</li></ol> : detailTab === 'Materials' ? <p>Deepam, flowers, clean water, incense, kumkum, turmeric, fruits and other items traditionally used by the family.</p> : detailTab === 'Mantras' ? <p>Swamiye Saranam Ayyappa — repeat mindfully while performing the worship.</p> : <p>Devotees traditionally practice pooja for inner peace, reflection and spiritual discipline.</p>}</article></div><aside className="rich-card side-details"><h3>In This Pooja</h3>{['Required Materials', 'Step-by-Step Procedure', 'Mantras & Slokas', 'Benefits', 'Important Notes'].map(t => <div key={t}><Icon name="CheckCircle2" size={16} />{t}</div>)}<Button onClick={() => notify('Sample guide: PDF not included in static demo')} variant="gold">Download Guide <Icon name="Download" size={16} /></Button></aside></div></section>}
      {path === '/stotras' && <PoojaListingPage category="stotras" />}
      {path === '/slokas' && <PoojaListingPage category="slokas" />}
      {path === '/sloka-detail' && <section className="container section-block"><Breadcrumb items={['Home', 'Devotional Services', 'Sri Ayyappa Slokas']} /><PageHeading eyebrow="DIVINE VERSES" title="Sri Ayyappa Slokas" desc="Sacred verses to read, understand and revisit." /><div className="content-with-aside"><aside className="devotional-side"><img src={image('deity')} alt="Ayyappa deity" /><h3>Divine Inspiration</h3><p>Ancient wisdom for the modern devotee.</p></aside><div className="rich-card verse-card"><span className="lotus-decor">ॐ</span><h2>Swamiye Saranam Ayyappa</h2><div className="verse-script">స్వామియే శరణం అయ్యప్ప</div><p>A devotional invocation expressing surrender and faith in Lord Ayyappa.</p><div className="verse-tools"><Button variant="outline" onClick={() => toggleFav('Sri Ayyappa Slokas')} icon="Bookmark">Save</Button><Button variant="outline" onClick={() => { navigator.clipboard?.writeText('Swamiye Saranam Ayyappa'); notify('Prayer copied') }} icon="Copy">Copy</Button><Button variant="outline" onClick={() => notify('Audio is not connected in static demo')} icon="Volume2">Listen</Button></div></div></div></section>}
      {path === '/songs' && <PoojaListingPage category="songs" />}
      {path === '/songs-detail' && <section className="container section-block"><Breadcrumb items={['Home', 'Devotional Services', 'Bhajans & Songs']} /><PageHeading eyebrow="MUSIC OF DEVOTION" title="Bhajans, Harathis & Songs" desc="Explore soulful devotional melodies, divine chants and traditional harathis." /><div className="media-feature"><img src={image('music-art')} alt="Devotional music" /><div><Tag>DEVOTIONAL COLLECTION</Tag><h2>Music for Every Sacred Moment</h2><p>Choose your favorite devotional music category below.</p></div></div><div className="detail-tabs space-above">{['Bhajans', 'Harathis', 'Songs'].map(t => <button className={songTab === t ? 'active' : ''} onClick={() => setSongTab(t)} key={t}>{t}</button>)}</div><div className="list-stack media-list">{tracks.filter(t => t[1] === songTab).map(([name, cat, dur]) => <div className="listing-row" key={name}><span className="list-icon"><Icon name="Music2" size={24} /></span><span className="list-copy"><strong>{name}</strong><small>{cat} • {dur}</small></span><button className="icon-btn" aria-label="Save" onClick={() => toggleFav(name)}><Icon name={favorites.includes(name) ? 'HeartHandshake' : 'Heart'} size={20} /></button><button className="play-circle" onClick={() => notify('Audio preview not included in static demo')} aria-label="Play sample"><Icon name="Play" size={18} /></button></div>)}</div></section>}
      {path === '/live-streams' && <LiveStreamsPage notify={notify} />}
      {path === '/panchangam' && <PanchangamPage notify={notify} language={language} />}
      {path === '/festivals' && <FestivalsPage notify={notify} language={language} />}
      {path === '/temples' && <TemplesPage />}
      {path === '/temple-detail' && <TempleDetailPage notify={notify} favorites={favorites} toggleFav={toggleFav} />}
      {path === '/donations' && <DonationsPage notify={notify} />}
      {path === '/food-donations' && <section className="container section-block"><PageHeading eyebrow="ANNADANAM NEAR YOU" title="Today’s Food Donation Locations" desc="A layout for verified annadanam distribution schedules and location maps." /><div className="rich-card info-banner"><Icon name="Info" /><p>The following are illustrative entries, not confirmed events occurring today. A real-time admin/API feed is required before public launch.</p></div><div className="list-stack food-list">{[['Sabarimala — Annadanam', 'Sannidhanam, Kerala', 'Schedule to be confirmed'], ['Pampa — Devotee Meal Seva', 'Pampa, Kerala', 'Schedule to be confirmed'], ['Nilakkal — Annadanam', 'Nilakkal, Kerala', 'Schedule to be confirmed']].map(([a, b, c]) => <div className="listing-row" key={a}><span className="list-icon"><Icon name="MapPin" size={25} /></span><span className="list-copy"><strong>{a}</strong><small>{b}</small><em>{c}</em></span><a className="btn outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b)}`} rel="noreferrer" target="_blank">Directions <Icon name="ExternalLink" size={15} /></a></div>)}</div></section>}
      {path === '/dharma-kartha/dashboard' && <DharmaKarthaDashboard notify={notify} profile={profile} />}
      {path === '/dharma-kartha' && <DharmaKarthaDashboard notify={notify} profile={profile} />}
      {path === '/dharma-kartha/temples' && <DharmaKarthaMyTemples notify={notify} profile={profile} />}
      {path === '/dharma-kartha/temples/new' && <DharmaKarthaAddTemple notify={notify} profile={profile} />}
      {path.startsWith('/dharma-kartha/temples/') && path.endsWith('/edit') && <DharmaKarthaEditTemple notify={notify} profile={profile} />}
      {path === '/dharma-kartha/events' && <DharmaKarthaEventsPage notify={notify} profile={profile} />}
      {path === '/dharma-kartha/festivals' && <DharmaKarthaFestivalsPage notify={notify} profile={profile} />}
      {path === '/dharma-kartha/gallery' && <DharmaKarthaGalleryPage notify={notify} profile={profile} />}
      {path === '/dharma-kartha/notifications' && <DharmaKarthaNotificationsPage notify={notify} profile={profile} />}
      {path === '/notifications' && (
        <ProfilePortalLayout profile={profile} god={god}>
          <NotificationsPage notify={notify} onUnreadChange={setUnread} />
        </ProfilePortalLayout>
      )}
      {path === '/profile' && (
        <ProfilePortalLayout profile={profile} god={god}>
          <PageHeading eyebrow="YOUR DEVOTIONAL ACCOUNT" title="My Profile" desc="Manage your personal information, saved prayers and website preferences." />

          {/* Seamless Role Switcher for users with registered temple / dual access */}
          {(profile?.hasDkAccount || profile?.templeName) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fdfbf6',
              border: '1px solid #e8d9b5',
              padding: '10px 18px',
              borderRadius: '10px',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#5c4a3a' }}>
                <span>{profile?.role === 'DHARMA_KARTHA' ? '🛕 Currently viewing as Dharma Kartha (Temple Founder)' : '🙏 Currently viewing as Customer (Devotee)'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextRole = profile?.role === 'DHARMA_KARTHA' ? 'CUSTOMER' : 'DHARMA_KARTHA';
                  const updated = { ...(profile || {}), role: nextRole };
                  setProfile(updated);
                  localStorage.setItem('sa-profile', JSON.stringify(updated));
                  notify(`Switched to ${nextRole === 'DHARMA_KARTHA' ? 'Dharma Kartha' : 'Customer'} view`);
                }}
                style={{
                  background: '#0b3d2b',
                  color: '#f6cd86',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {profile?.role === 'DHARMA_KARTHA' ? 'Switch to Devotee View 🙏' : 'Switch to Dharma Kartha View 🛕'}
              </button>
            </div>
          )}

          {/* Dynamic Profile View based on Role */}
          {profile?.role === 'DHARMA_KARTHA' ? (
            /* DHARMA KARTHA (TEMPLE FOUNDER) PROFILE VIEW */
            <>
              <div className="trust-overview-card">
                <div className="trust-overview-header">
                  <div className="trust-badge-icon">🛕</div>
                  <div className="trust-overview-title">
                    <h3>{profile?.templeName || 'Mandir Trustee Portal'}</h3>
                    <p>{profile?.templeTrustName ? `Managed by ${profile.templeTrustName}` : 'Temple Administration & Trust Management'}</p>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#5C4A3A', margin: '0 0 12px 0' }}>
                  Welcome, Dharma Kartha <strong>{profile?.fullName || profile?.name}</strong>. From your sacred trustee dashboard, you can manage mandir darshan timings, update daily sevas, oversee voluntary devotee contributions, and publish festival schedules.
                </p>
                <div className="trust-quick-stats">
                  <div className="trust-stat-box">
                    <b>{dkTemples.length || 1}</b>
                    <span>Registered Mandir</span>
                  </div>
                  <div className="trust-stat-box">
                    <b>{dkFestivals.length}</b>
                    <span>Temple Festivals (DB)</span>
                  </div>
                  <div className="trust-stat-box">
                    <b>{dkEvents.length}</b>
                    <span>Devotional Events (DB)</span>
                  </div>
                  <div className="trust-stat-box">
                    <b>{dkGallery.length}</b>
                    <span>Sacred Photos (DB)</span>
                  </div>
                </div>
                <div className="dharma-kartha-actions">
                  <Button to="/dharma-kartha/temples/new" variant="gold">
                    <Icon name="PlusCircle" size={17} /> Add / Update Mandir
                  </Button>
                  <Button to="/dharma-kartha/festivals" variant="outline">
                    <Icon name="Flame" size={17} /> Manage Festivals
                  </Button>
                  <Button to="/dharma-kartha/events" variant="outline">
                    <Icon name="CalendarDays" size={17} /> Manage Events
                  </Button>
                  <Button to="/dharma-kartha/gallery" variant="outline">
                    <Icon name="Image" size={17} /> Sacred Gallery
                  </Button>
                </div>
              </div>

              {/* Dynamic Temple Festivals Section from DB */}
              <div className="rich-card space-above">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span role="img" aria-label="lotus">🪷</span> Temple Festivals ({dkFestivals.length})
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                      Annual brahmotsavams and sacred celebrations for your registered shrines.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn gold"
                      onClick={() => setShowAddFestModal(true)}
                      style={{ padding: '6px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Icon name="Plus" size={15} /> Add Temple Festival
                    </button>
                    <Button to="/dharma-kartha/festivals" variant="outline small">
                      Manage All
                    </Button>
                  </div>
                </div>

                {dkLoading ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>Loading festivals from database...</p>
                ) : dkFestivals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#fdfbf7', borderRadius: '10px', border: '1px dashed #d4a753' }}>
                    <p style={{ margin: '0 0 10px', color: '#666' }}>No temple festivals added yet.</p>
                    <button type="button" className="btn gold small" onClick={() => setShowAddFestModal(true)}>
                      Add First Festival
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {dkFestivals.map((f) => (
                      <div key={f.id} style={{ background: '#fff', border: '1px solid #e2ece5', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0b3d2b', background: '#eaf4ee', padding: '3px 8px', borderRadius: '4px' }}>
                            {f.category || 'MAHOTSAVAM'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                            🛕 {f.temple?.name || dkTemples.find(t => t.id === f.templeId)?.name || profile?.templeName || 'Registered Mandir'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#2e7d32', background: '#e8f5e9', padding: '2px 8px', borderRadius: '10px' }}>
                            {f.status || 'PUBLISHED'}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0b3d2b', fontFamily: "'Cinzel', serif" }}>{f.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#d4a753', fontWeight: 600, marginBottom: '8px' }}>
                          <Icon name="Calendar" size={13} />
                          <span>{f.period}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.5 }}>
                          {f.description}
                        </p>
                        {f.specialPoojaInfo && (
                          <div style={{ marginTop: '10px', fontSize: '12px', color: '#855b14', background: '#fef9ee', padding: '6px 10px', borderRadius: '6px' }}>
                            <strong>Special Seva / Pooja:</strong> {f.specialPoojaInfo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exact Add Temple Festival Modal on Profile */}
              {showAddFestModal && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '16px'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    maxWidth: '540px',
                    width: '100%',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
                    border: '1px solid #eef2eb'
                  }}>
                    <h2 style={{
                      color: '#0b3d2b',
                      fontSize: '24px',
                      fontWeight: 800,
                      textAlign: 'center',
                      margin: '0 0 6px',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      Add Temple Festival
                    </h2>
                    <p style={{
                      color: '#556b62',
                      fontSize: '14px',
                      textAlign: 'center',
                      margin: '0 0 24px'
                    }}>
                      Enter the details of the annual celebration or festival for this shrine.
                    </p>

                    <form onSubmit={handleCreateFestModal} style={{ textAlign: 'left' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#caa049' }}>🛕</span> Select Temple / Shrine *
                          </span>
                          {availableTemples.length > 1 && (
                            <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600, background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
                              {availableTemples.length} Managed Temples
                            </span>
                          )}
                        </label>
                        <select
                          required
                          value={newFestModalForm.templeId || availableTemples[0]?.id || ''}
                          onChange={(e) => setNewFestModalForm({ ...newFestModalForm, templeId: Number(e.target.value) })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#0b3d2b',
                            background: '#ffffff',
                            outline: 'none',
                            boxSizing: 'border-box',
                            cursor: 'pointer'
                          }}
                        >
                          {availableTemples.map((t) => (
                            <option key={t.id} value={t.id}>
                              🛕 {t.name} {t.city ? `(${t.city})` : ''} {t.classification ? `• [${t.classification}]` : ''}
                            </option>
                          ))}
                        </select>
                        <small style={{ display: 'block', marginTop: '4px', fontSize: '11.5px', color: '#6b7280' }}>
                          Select which of your registered temples this annual festival celebration belongs to.
                        </small>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Festival Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Srivari Salakatla Brahmotsavam"
                          value={newFestModalForm.name}
                          onChange={(e) => setNewFestModalForm({ ...newFestModalForm, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Festival Period / Occasion *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mid-November to Late December"
                          value={newFestModalForm.period}
                          onChange={(e) => setNewFestModalForm({ ...newFestModalForm, period: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Devotional Description
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Significance, celestial procession, and sacred observances..."
                          value={newFestModalForm.description}
                          onChange={(e) => setNewFestModalForm({ ...newFestModalForm, description: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Special Seva / Pooja Details
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Daily Neyyabhishekam and Rathotsavam"
                          value={newFestModalForm.specialPoojaInfo}
                          onChange={(e) => setNewFestModalForm({ ...newFestModalForm, specialPoojaInfo: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setShowAddFestModal(false)}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '10px',
                            border: '1px solid #10b981',
                            background: '#ffffff',
                            color: '#064e3b',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingFestModal}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#e29e38',
                            color: '#1c1917',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(226, 158, 56, 0.35)'
                          }}
                        >
                          {submittingFestModal ? 'Submitting...' : 'Submit Festival'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Dynamic Temple Events Section from DB */}
              <div className="rich-card space-above">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span role="img" aria-label="calendar">📅</span> Upcoming Temple Events & Sevas ({dkEvents.length})
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                      Scheduled homams, abhishekam, and volunteer programmes from database.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn gold"
                      onClick={() => setShowAddEventModal(true)}
                      style={{ padding: '6px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Icon name="Plus" size={15} /> Create Temple Event
                    </button>
                    <Button to="/dharma-kartha/events" variant="outline small">
                      Manage All
                    </Button>
                  </div>
                </div>

                {dkLoading ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>Loading events from database...</p>
                ) : dkEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#fdfbf7', borderRadius: '10px', border: '1px dashed #d4a753' }}>
                    <p style={{ margin: '0 0 10px', color: '#666' }}>No special events scheduled yet.</p>
                    <button type="button" className="btn gold small" onClick={() => setShowAddEventModal(true)}>
                      Create First Event
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {dkEvents.map((e) => (
                      <div key={e.id} style={{ background: '#fff', border: '1px solid #e2ece5', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#caa049', background: '#fbf7ee', padding: '3px 8px', borderRadius: '4px' }}>
                            {e.category || 'SEVA PROGRAMME'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                            🛕 {e.temple?.name || dkTemples.find(t => t.id === e.templeId)?.name || profile?.templeName || 'Registered Mandir'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#2e7d32', background: '#e8f5e9', padding: '2px 8px', borderRadius: '10px' }}>
                            {e.status || 'PUBLISHED'}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0b3d2b', fontFamily: "'Cinzel', serif" }}>{e.title}</h4>
                        <p style={{ fontSize: '13px', color: '#555', margin: '0 0 10px', lineHeight: 1.5 }}>
                          {e.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#666', borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="Calendar" size={13} style={{ color: '#d4a753' }} />
                            {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'Scheduled'}
                          </span>
                          {e.timeInfo && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Icon name="Clock" size={13} style={{ color: '#d4a753' }} />
                              {e.timeInfo}
                            </span>
                          )}
                          {e.location && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Icon name="MapPin" size={13} style={{ color: '#e05638' }} />
                              {e.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exact Create Temple Event Modal on Profile */}
              {showAddEventModal && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '16px'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    maxWidth: '560px',
                    width: '100%',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
                    border: '1px solid #eef2eb'
                  }}>
                    <h2 style={{
                      color: '#0b3d2b',
                      fontSize: '24px',
                      fontWeight: 800,
                      textAlign: 'center',
                      margin: '0 0 6px',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      Create Temple Event
                    </h2>
                    <p style={{
                      color: '#556b62',
                      fontSize: '14px',
                      textAlign: 'center',
                      margin: '0 0 24px'
                    }}>
                      Schedule a devotional seva, discourse, or community worship event.
                    </p>

                    <form onSubmit={handleCreateEventModal} style={{ textAlign: 'left' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#caa049' }}>🛕</span> Select Temple / Shrine *
                          </span>
                          {availableTemples.length > 1 && (
                            <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600, background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
                              {availableTemples.length} Managed Temples
                            </span>
                          )}
                        </label>
                        <select
                          required
                          value={newEventModalForm.templeId || availableTemples[0]?.id || ''}
                          onChange={(e) => setNewEventModalForm({ ...newEventModalForm, templeId: Number(e.target.value) })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#0b3d2b',
                            background: '#ffffff',
                            outline: 'none',
                            boxSizing: 'border-box',
                            cursor: 'pointer'
                          }}
                        >
                          {availableTemples.map((t) => (
                            <option key={t.id} value={t.id}>
                              🛕 {t.name} {t.city ? `(${t.city})` : ''} {t.classification ? `• [${t.classification}]` : ''}
                            </option>
                          ))}
                        </select>
                        <small style={{ display: 'block', marginTop: '4px', fontSize: '11.5px', color: '#6b7280' }}>
                          Select which of your registered temples this devotional event is scheduled at.
                        </small>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Event Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sri Srinivasa Kalyanotsavam Seva"
                          value={newEventModalForm.title}
                          onChange={(e) => setNewEventModalForm({ ...newEventModalForm, title: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                            Date &amp; Time *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={newEventModalForm.startDate}
                            onChange={(e) => setNewEventModalForm({ ...newEventModalForm, startDate: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                            Location / Hall
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Prakaram Mandapam"
                            value={newEventModalForm.location}
                            onChange={(e) => setNewEventModalForm({ ...newEventModalForm, location: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Description &amp; Devotee Guidelines
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Details about participation, seva tokens, or timings..."
                          value={newEventModalForm.description}
                          onChange={(e) => setNewEventModalForm({ ...newEventModalForm, description: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setShowAddEventModal(false)}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '10px',
                            border: '1px solid #10b981',
                            background: '#ffffff',
                            color: '#064e3b',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingEventModal}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#e29e38',
                            color: '#1c1917',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(226, 158, 56, 0.35)'
                          }}
                        >
                          {submittingEventModal ? 'Publishing...' : 'Publish Event'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Dynamic Temple Gallery & Sacred Media Section from DB */}
              <div className="rich-card space-above">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span role="img" aria-label="camera">📸</span> Temple Sacred Gallery ({dkGallery.length})
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                      Sanctum, gopuram, and festival photos dynamically fetched from database.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn gold"
                      onClick={() => setShowAddMediaModal(true)}
                      style={{ padding: '6px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Icon name="Plus" size={15} /> Upload Temple Media
                    </button>
                    <Button to="/dharma-kartha/gallery" variant="outline small">
                      Manage All
                    </Button>
                  </div>
                </div>

                {dkLoading ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>Loading media from database...</p>
                ) : dkGallery.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#fdfbf7', borderRadius: '10px', border: '1px dashed #d4a753' }}>
                    <p style={{ margin: '0 0 10px', color: '#666' }}>No photos uploaded yet.</p>
                    <button type="button" className="btn gold small" onClick={() => setShowAddMediaModal(true)}>
                      Upload First Photo
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    {dkGallery.map((m) => (
                      <div key={m.id} style={{ background: '#fff', border: '1px solid #e2ece5', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div style={{ height: '140px', overflow: 'hidden', background: '#f5f0e6', position: 'relative' }}>
                          <img
                            src={m.mediaUrl}
                            alt={m.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }}
                          />
                          <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: '#fef08a', fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            🛕 {m.temple?.name || dkTemples.find(t => t.id === m.templeId)?.name || profile?.templeName || 'Mandir'}
                          </span>
                          <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(11,61,43,0.85)', color: '#fff', fontSize: '10.5px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                            {m.type || 'Photo'}
                          </span>
                        </div>
                        <div style={{ padding: '12px' }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#0b3d2b', fontWeight: 600 }}>{m.title}</h4>
                          {m.caption && <p style={{ margin: 0, fontSize: '12px', color: '#666', lineHeight: 1.4 }}>{m.caption}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exact Upload Temple Media Modal on Profile */}
              {showAddMediaModal && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '16px'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    maxWidth: '540px',
                    width: '100%',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
                    border: '1px solid #eef2eb'
                  }}>
                    <h2 style={{
                      color: '#0b3d2b',
                      fontSize: '24px',
                      fontWeight: 800,
                      textAlign: 'center',
                      margin: '0 0 6px',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      Upload Temple Media
                    </h2>
                    <p style={{
                      color: '#556b62',
                      fontSize: '14px',
                      textAlign: 'center',
                      margin: '0 0 24px'
                    }}>
                      Images are submitted for Super Admin verification to maintain high devotional quality.
                    </p>

                    <form onSubmit={handleCreateMediaModal} style={{ textAlign: 'left' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#caa049' }}>🛕</span> Select Temple / Shrine *
                          </span>
                          {availableTemples.length > 1 && (
                            <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600, background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
                              {availableTemples.length} Managed Temples
                            </span>
                          )}
                        </label>
                        <select
                          required
                          value={newMediaModalForm.templeId || availableTemples[0]?.id || ''}
                          onChange={(e) => setNewMediaModalForm({ ...newMediaModalForm, templeId: Number(e.target.value) })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#0b3d2b',
                            background: '#ffffff',
                            outline: 'none',
                            boxSizing: 'border-box',
                            cursor: 'pointer'
                          }}
                        >
                          {availableTemples.map((t) => (
                            <option key={t.id} value={t.id}>
                              🛕 {t.name} {t.city ? `(${t.city})` : ''} {t.classification ? `• [${t.classification}]` : ''}
                            </option>
                          ))}
                        </select>
                        <small style={{ display: 'block', marginTop: '4px', fontSize: '11.5px', color: '#6b7280' }}>
                          Select which of your registered temples this sacred photograph belongs to.
                        </small>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Image / Media Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sanctum Golden Dome"
                          value={newMediaModalForm.title}
                          onChange={(e) => setNewMediaModalForm({ ...newMediaModalForm, title: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Category *
                        </label>
                        <select
                          value={newMediaModalForm.category}
                          onChange={(e) => setNewMediaModalForm({ ...newMediaModalForm, category: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            background: '#ffffff',
                            boxSizing: 'border-box'
                          }}
                        >
                          {mediaCategories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Image Asset Path / URL *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="/images/temple-hero.jpg"
                          value={newMediaModalForm.mediaUrl}
                          onChange={(e) => setNewMediaModalForm({ ...newMediaModalForm, mediaUrl: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                          Devotional Caption
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Brief description of the architectural or sanctum view..."
                          value={newMediaModalForm.caption}
                          onChange={(e) => setNewMediaModalForm({ ...newMediaModalForm, caption: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setShowAddMediaModal(false)}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '10px',
                            border: '1px solid #10b981',
                            background: '#ffffff',
                            color: '#064e3b',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingMediaModal}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#e29e38',
                            color: '#1c1917',
                            fontWeight: 700,
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(226, 158, 56, 0.35)'
                          }}
                        >
                          {submittingMediaModal ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="rich-card">
                <h2>Dharma Kartha & Trust Details</h2>
                <div className="profile-facts">
                  <span><b>Trustee Name</b>{profile?.fullName || profile?.name || 'Not specified'}</span>
                  <span><b>Registered Mobile</b>{profile?.phoneNumber || profile?.mobile || 'Not specified'}</span>
                  <span><b>Email Address</b>{profile?.email || 'Not specified'}</span>
                  <span><b>Temple / Shrine</b>{profile?.templeName || 'Not specified'}</span>
                  <span><b>Managing Trust</b>{profile?.templeTrustName || 'Not specified'}</span>
                  <span><b>Mandir Location</b>{profile?.templeCity || profile?.city || 'Not specified'}</span>
                  <span><b>Account Role</b>Dharma Kartha (Temple Founder)</span>
                  <span><b>Preferred Language</b>{languages.find(l => l[2] === language)?.[0]}</span>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Button to="/edit-profile">Update Trustee Profile</Button>
                </div>
              </div>
            </>
          ) : (
            /* CUSTOMER (DEVOTEE) PROFILE VIEW */
            <>
              <div className="rich-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
                  <div className="sa-dk-avatar-ring" style={{ width: '68px', height: '68px', margin: 0, flexShrink: 0 }}>
                    <img
                      src={profile?.profileImageUrl || profile?.avatarUrl || '/images/ayyappa-icon.jpg'}
                      alt="Profile Avatar"
                      className="sa-dk-avatar-img"
                      onError={(e) => { e.target.src = '/images/ayyappa-icon.jpg'; }}
                    />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Welcome, {profile?.fullName || profile?.name || 'Devotee'} 🙏</h2>
                    <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>Your devotional profile is synchronized live with the temple database.</p>
                  </div>
                </div>
                <div className="profile-facts">
                  <span><b>Mobile Number</b>{profile?.phoneNumber || profile?.mobile || 'Not specified'}</span>
                  <span><b>Email Address</b>{profile?.email || 'Not specified'}</span>
                  <span><b>Date of Birth</b>{profile?.dateOfBirth || 'Not specified'}</span>
                  <span><b>Gender</b>{profile?.gender || 'Not specified'}</span>
                  <span><b>Rashi</b>{profile?.rashi || 'Not specified'}</span>
                  <span><b>Nakshatram</b>{profile?.nakshatram || profile?.nakshatra || 'Not specified'}</span>
                  <span><b>City / Town</b>{profile?.city || 'Not specified'}</span>
                  <span><b>District</b>{profile?.district || 'Not specified'}</span>
                  <span><b>State</b>{profile?.state || 'Not specified'}</span>
                  <span><b>Pin Code</b>{profile?.pincode || profile?.pinCode || 'Not specified'}</span>
                  <span><b>Preferred Language</b>{profile?.preferredLang ? (profile.preferredLang === 'te' ? 'Telugu (తెలుగు)' : profile.preferredLang === 'kn' ? 'Kannada (ಕನ್ನಡ)' : profile.preferredLang === 'ta' ? 'Tamil (தமிழ்)' : profile.preferredLang === 'hi' ? 'Hindi (हिन्दी)' : profile.preferredLang === 'ml' ? 'Malayalam (മലയാളം)' : 'English') : (languages.find(l => l[2] === language)?.[0] || 'Not specified')}</span>
                  <span><b>Favorite Deity</b>{profile?.favoriteDeity || god || 'Lord Ayyappa'}</span>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Button to="/edit-profile">Edit Your Profile</Button>
                </div>
              </div>
              <div className="rich-card space-above">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ margin: 0 }}>Saved Devotional Bookmarks ({favorites.length})</h2>
                  <Button to="/bookmarks" variant="outline" icon="Bookmark">Manage Bookmarks</Button>
                </div>
                {favorites.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {favorites.slice(0, 5).map(f => (
                      <div className="saved-item" key={f} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Icon name="Bookmark" size={17} />
                          <b>{f}</b>
                        </span>
                        <Link to="/bookmarks" style={{ fontSize: '12px', color: '#0b3d2b', fontWeight: '600' }}>
                          View
                        </Link>
                      </div>
                    ))}
                    {favorites.length > 5 && (
                      <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
                        + {favorites.length - 5} more items in your bookmarks
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No saved prayers or songs yet. Explore content and tap Save to build your sacred collection.</p>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <Button variant="outline" to="/categories">Explore Categories</Button>
                  <Button to="/bookmarks">Open Bookmarks</Button>
                </div>
              </div>
            </>
          )}
        </ProfilePortalLayout>
      )}
      {path === '/edit-profile' && (
        <ProfilePortalLayout profile={profile} god={god}>
          <PageHeading
            eyebrow={profile?.role === 'DHARMA_KARTHA' ? 'MANDIR TRUSTEE & PERSONAL DETAILS' : 'PERSONAL & DEVOTIONAL INFORMATION'}
            title="Edit Profile"
            desc={profile?.role === 'DHARMA_KARTHA' ? 'Update your Dharma Kartha trustee credentials, mandir details and location.' : 'Update your details, preferences, Rashi and Nakshatram.'}
          />
          <ProfileForm profile={profile || {}} setProfile={setProfile} onSave={async () => {
            const nameToSave = profile?.fullName || profile?.name;
            if (!nameToSave || !nameToSave.trim()) return notify('Full name is required');
            try {
              const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: profile?.id,
                  phoneNumber: profile?.phoneNumber || profile?.mobile || phone,
                  fullName: nameToSave,
                  email: profile?.email,
                  role: profile?.role || 'CUSTOMER',
                  templeName: profile?.templeName,
                  templeTrustName: profile?.templeTrustName,
                  templeCity: profile?.templeCity,
                  dateOfBirth: profile?.dateOfBirth || profile?.dob,
                  gender: profile?.gender,
                  city: profile?.city,
                  district: profile?.district,
                  state: profile?.state,
                  pincode: profile?.pincode || profile?.pinCode,
                  preferredLang: profile?.preferredLang || profile?.preferredLanguage || language,
                  favoriteDeity: profile?.favoriteDeity || god,
                  rashi: profile?.rashi,
                  rashiId: profile?.rashiId,
                  nakshatram: profile?.nakshatram || profile?.nakshatra,
                  nakshatraId: profile?.nakshatraId,
                  profileImageUrl: profile?.profileImageUrl || profile?.avatarUrl,
                  avatarUrl: profile?.profileImageUrl || profile?.avatarUrl,
                  address: profile?.addressLine || profile?.address,
                }),
              });
              const data = await res.json();
              if (res.ok && data.success) {
                if (data.user) {
                  const updatedProfile = {
                    ...profile,
                    ...data.user,
                  };
                  setProfile(updatedProfile);
                  localStorage.setItem('sa-profile', JSON.stringify(updatedProfile));
                }
                notify('Profile saved to database successfully!');
                navigate('/profile');
              } else {
                notify(data.message || 'Failed to update profile in database');
              }
            } catch (e) {
              notify('Profile update error');
            }
          }} action="Save Changes" />
        </ProfilePortalLayout>
      )}
      {path === '/bookmarks' && (
        <ProfilePortalLayout profile={profile} god={god}>
          <BookmarksPage
            favorites={favorites}
            toggleFav={toggleFav}
            notify={notify}
          />
        </ProfilePortalLayout>
      )}
      {(path === '/delete-account' || path === '/account-deletion') && (
        <ProfilePortalLayout profile={profile} god={god}>
          <DeleteAccountPage
            profile={profile}
            notify={notify}
            onDeleted={() => {
              setLogged(false);
              setProfile(null);
            }}
          />
        </ProfilePortalLayout>
      )}
      {path === '/terms' && <TermsPage />}
      {path === '/privacy' && <PrivacyPolicyPage />}
      {path === '/refund-policy' && <RefundPolicyPage />}
      {path === '/about' && <AboutPage />}
      {path === '/contact' && <ContactPage notify={notify} />}
      {path === '/help-center' && <ContactPage notify={notify} />}
      {path === '/add-mandir' && <AddMandirPage notify={notify} />}
      {path === '/logout' && <div className="modal-scrim"><div className="logout-modal"><div className="logout-icon"><Icon name="LogOut" size={27} /></div><h2>Logout from Saranam Ayyappa?</h2><p>Are you sure you want to sign out from your devotional account?</p><div><Button to="/profile" variant="outline">Cancel</Button><Button onClick={() => { setLogged(false); notify('Logged out successfully'); navigate('/login') }}>Logout</Button></div></div></div>}
    </main>
    {!onboarding && !isRolePage && <Footer notify={notify} brand={appBrand} />}
    {!onboarding && !isRolePage && (
      <div className="mobile-bottom-nav">
        <Link className={path === '/home' ? 'active' : ''} to="/home">
          <Icon name="House" size={18} />
          <span>{t('navSannidhi', 'Sannidhi')}</span>
        </Link>
        <Link className={path === '/categories' ? 'active' : ''} to="/categories">
          <Icon name="Grid2X2" size={18} />
          <span>{t('navServices', 'Services')}</span>
        </Link>
        <Link className={path === '/panchangam' ? 'active' : ''} to="/panchangam">
          <Icon name="CalendarDays" size={18} />
          <span>{t('navPanchangam', 'Panchangam')}</span>
        </Link>
        <Link className={path === '/profile' ? 'active' : ''} to="/profile">
          <Icon name="UserRound" size={18} />
          <span>{logged ? t('navProfile', 'Profile') : t('navLoginRegister', 'Login')}</span>
        </Link>
      </div>
    )}
  </>;
  function ServiceGrid({ query = '', compact = false }) { let list = services.filter(s => `${s.title} ${s.sub}`.toLowerCase().includes(query.toLowerCase())); return <div className={`service-grid ${compact ? 'compact' : ''}`}>{list.map(s => <Link to={s.url} key={s.id} className="service-card"><span className="service-icon"><Icon name={s.icon} size={29} /></span><strong>{s.title}</strong>{!compact && <small>{s.sub}</small>}</Link>)}</div> }
}
function Progress({ step }) { return <div className="progress-line">{[['Choose God', 1], ['Choose Language', 2], ['Register / Login', 3], ['Profile', 4]].map(([label, i]) => <div className={`${step === i ? 'current' : ''} ${step > i ? 'done' : ''}`} key={i}><span>{step > i ? <Icon name="Check" size={14} /> : i}</span><small>{label}</small></div>)}</div> }
function SectionHeading({ eyebrow, title, link }) { return <div className="section-heading"><div><Tag>{eyebrow}</Tag><h2>{title}</h2></div>{link && <Link to={link}>View All <Icon name="ArrowUpRight" size={17} /></Link>}</div> }
function PageHeading({ eyebrow, title, desc }) { return <div className="page-header"><Tag>{eyebrow}</Tag><h1>{title}</h1><p>{desc}</p><span className="title-rule">✦ &nbsp; ━━━━━ &nbsp; ❀ &nbsp; ━━━━━ &nbsp; ✦</span></div> }
function TempleCard({ temple: t }) { return <Link to="/temple-detail" className="temple-card"><div className="temple-image"><img src={image(t.image)} alt={t.name} /></div><div><span className="temple-location"><Icon name="MapPin" size={14} />{t.state}, India</span><h3>{t.name}</h3><p>{t.special}</p><span className="text-link">Explore Temple <Icon name="ArrowRight" size={15} /></span></div></Link> }
function ImageCard({ img, title, desc, to, action, onAction }) { return <div className="image-card"><img src={image(img)} alt={title} /><div><h3>{title}</h3><p>{desc}</p>{to ? <Button to={to}>{action || 'Explore'}</Button> : <Button onClick={onAction}>{action || 'Explore'}</Button>}</div></div> }
function Breadcrumb({ items }) { return <div className="breadcrumb">{items.map((s, i) => <React.Fragment key={s}>{i > 0 && <Icon name="ChevronRight" size={13} />}<span>{s}</span></React.Fragment>)}</div> }
const FALLBACK_INDIAN_STATES = [
  'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Karnataka',
  'Maharashtra', 'Odisha', 'Gujarat', 'Rajasthan', 'Uttar Pradesh',
  'Madhya Pradesh', 'Delhi', 'West Bengal', 'Punjab', 'Haryana',
  'Bihar', 'Assam', 'Goa', 'Jharkhand', 'Chhattisgarh',
  'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir', 'Puducherry'
];

const FALLBACK_PREFERRED_LANGUAGES = [
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
];

const FALLBACK_FAVORITE_DEITIES = [
  'Lord Ayyappa (అయ్యప్ప స్వామి)',
  'Lord Shiva (శివుడు)',
  'Goddess Durga / Devi (దుర్గా దేవి)',
  'Lord Ganesha (వినాయకుడు)',
  'Lord Venkateswara (శ్రీ వెంకటేశ్వర స్వామి)',
  'Lord Murugan / Subrahmanya (సుబ్రహ్మణ్య స్వామి)',
  'Lord Rama (శ్రీ రాముడు)',
  'Lord Hanuman (శ్రీ ఆంజనేయ స్వామి)',
];

const DEFAULT_PRESET_LOGOS = [
  { id: 'ayyappa-icon', name: 'Lord Ayyappa Classic', url: '/images/ayyappa-icon.jpg' },
  { id: 'ayyappa-tiger', name: 'Ayyappa Swamy on Tiger', url: '/images/ayyappa-tiger-gold-bg.png' },
  { id: 'ayyappa-gold', name: 'Lord Ayyappa Golden', url: '/images/god-ayyappa.jpg' },
  { id: 'shiva', name: 'Lord Shiva Mahadeva', url: '/images/god-shiva.jpg' },
  { id: 'durga', name: 'Goddess Durga Bhavani', url: '/images/god-durga.jpg' },
  { id: 'ganesha', name: 'Lord Ganesha Vignaharta', url: '/images/god-ganesha.jpg' },
  { id: 'venkateswara', name: 'Lord Balaji Venkateswara', url: '/images/god-venkateswara.jpg' },
  { id: 'krishna', name: 'Lord Sri Krishna', url: '/images/god-krishna.jpg' },
  { id: 'lakshmi', name: 'Goddess Sri Mahalakshmi', url: '/images/lakshmi.jpg' },
  { id: 'emblem', name: 'Saranam Ayyappa Official Emblem', url: '/images/saranam-ayyappa-official-emblem.jpg' },
];

function ProfileForm({ profile, setProfile, onSave, action }) {
  const update = (key, val) => setProfile(p => ({ ...p, [key]: val }));
  const isDharmaKartha = profile?.role === 'DHARMA_KARTHA';

  const [options, setOptions] = useState({
    states: [],
    districts: [],
    stateDistrictsMap: {},
    languages: [],
    deities: [],
    rashis: [],
    nakshatras: [],
    presetLogos: DEFAULT_PRESET_LOGOS,
  });
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  // 1. Fetch dynamic master data (states, languages, deities, rashis, nakshatras, logos) from DB via API
  useEffect(() => {
    let isMounted = true;
    async function fetchMasterOptions() {
      try {
        setLoadingOptions(true);
        const res = await fetch(`${API_BASE_URL}/master/profile-options?lang=${profile.preferredLang || 'te'}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            setOptions(prev => ({
              ...prev,
              ...json.data,
              presetLogos: json.data.presetLogos?.length ? json.data.presetLogos : DEFAULT_PRESET_LOGOS,
            }));
          }
        }
      } catch (err) {
        console.warn('Profile options dynamic load notice:', err);
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    }
    fetchMasterOptions();
    return () => { isMounted = false; };
  }, [profile.preferredLang]);

  // 2. Fetch districts dynamically from DB via API when selected state changes
  useEffect(() => {
    if (!profile.state) return;
    let isMounted = true;
    async function fetchDistricts() {
      try {
        setDistrictsLoading(true);
        const res = await fetch(`${API_BASE_URL}/master/districts?state=${encodeURIComponent(profile.state)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && isMounted) {
            setOptions(prev => ({
              ...prev,
              districts: json.data,
            }));
          }
        }
      } catch (e) {
        // Handled silently
      } finally {
        if (isMounted) setDistrictsLoading(false);
      }
    }
    fetchDistricts();
    return () => { isMounted = false; };
  }, [profile.state]);

  // Custom photo upload handler
  const handleCustomLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Selected photo must be under 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (dataUrl) {
        update('profileImageUrl', dataUrl);
        update('avatarUrl', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentAvatar = profile.profileImageUrl || profile.avatarUrl || '/images/ayyappa-icon.jpg';

  // State options derived from DB or comprehensive master list
  const stateList = options.states?.length > 0 
    ? options.states 
    : FALLBACK_INDIAN_STATES.map((s, i) => ({ id: i + 1, name: s }));

  // District options dynamically resolved for chosen state
  const districtList = options.districts?.length > 0
    ? options.districts
    : (profile.state && options.stateDistrictsMap?.[profile.state]
        ? options.stateDistrictsMap[profile.state].map((d, i) => ({ id: i + 1, name: d }))
        : []);

  // Language options derived from DB
  const languageList = options.languages?.length > 0
    ? options.languages
    : FALLBACK_PREFERRED_LANGUAGES;

  // Deities options derived from DB
  const deityList = options.deities?.length > 0
    ? options.deities
    : FALLBACK_FAVORITE_DEITIES.map((d, i) => ({ id: i + 1, name: d }));

  // Rashis options derived from DB
  const rashiList = options.rashis?.length > 0
    ? options.rashis
    : ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'].map((v, i) => ({ id: i + 1, name: v }));

  // Nakshatras options derived from DB
  const nakshatraList = options.nakshatras?.length > 0
    ? options.nakshatras
    : ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'].map((v, i) => ({ id: i + 1, name: v }));

  // Preset Logos derived from DB / assets
  const logoList = options.presetLogos?.length > 0
    ? options.presetLogos
    : DEFAULT_PRESET_LOGOS;

  return (
    <div className="profile-form-card">
      <div className="form-heading">
        <Icon name={isDharmaKartha ? "Landmark" : "UserRound"} />
        {isDharmaKartha ? ' Mandir & Dharma Kartha Information' : ' Personal Information'}
      </div>

      {/* DYNAMIC PROFILE LOGO & AVATAR SELECTION */}
      <div style={{
        background: 'linear-gradient(145deg, #fffcf5 0%, #fff9ec 100%)',
        border: '1.5px solid #ebd9ba',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="sa-dk-avatar-ring" style={{ width: '74px', height: '74px', margin: 0, flexShrink: 0 }}>
              <img
                src={currentAvatar}
                alt="Selected Profile Logo"
                className="sa-dk-avatar-img"
                onError={(e) => { e.target.src = '/images/ayyappa-icon.jpg'; }}
              />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#0b3d2b', fontSize: '15px' }}>
                Profile Logo & Avatar
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#7a6344' }}>
                Select a divine emblem or upload your own custom photo.
              </p>
            </div>
          </div>

          <div>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0b3d2b',
              color: '#d4a753',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid #d4a753',
              boxShadow: '0 3px 10px rgba(11, 61, 43, 0.15)',
              margin: 0,
            }}>
              <Icon name="Camera" size={16} />
              <span>Upload Custom Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomLogoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9b6c1e' }}>
            Choose Divine Avatar / Logo:
          </span>
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            padding: '10px 4px 6px',
          }}>
            {logoList.map(logo => {
              const isSelected = currentAvatar === logo.url;
              return (
                <button
                  type="button"
                  key={logo.id}
                  onClick={() => {
                    update('profileImageUrl', logo.url);
                    update('avatarUrl', logo.url);
                  }}
                  title={logo.name}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    flex: '0 0 auto',
                  }}
                >
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    padding: '2px',
                    background: isSelected ? 'linear-gradient(135deg, #d4a753, #9b6c1e)' : '#e2dbcb',
                    boxShadow: isSelected ? '0 4px 12px rgba(212, 167, 83, 0.5)' : 'none',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}>
                    <img
                      src={logo.url}
                      alt={logo.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => { e.target.src = '/images/ayyappa-icon.jpg'; }}
                    />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#9b6c1e' : '#666',
                    maxWidth: '64px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {logo.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="form-grid">
        <label>
          {isDharmaKartha ? 'Dharma Kartha / Trustee Name *' : 'Full Name *'}
          <input value={profile.name || profile.fullName || ''} onChange={e => update('name', e.target.value)} placeholder="Enter full name" />
        </label>

        {isDharmaKartha && (
          <>
            <label>
              Temple / Mandir Name *
              <input value={profile.templeName || ''} onChange={e => update('templeName', e.target.value)} placeholder="e.g. Sri Dharma Sastha Temple" />
            </label>
            <label>
              Temple Trust / Committee Name
              <input value={profile.templeTrustName || ''} onChange={e => update('templeTrustName', e.target.value)} placeholder="e.g. Ayyappa Seva Samithi Trust" />
            </label>
            <label>
              Temple City / Location
              <input value={profile.templeCity || ''} onChange={e => update('templeCity', e.target.value)} placeholder="City, State" />
            </label>
          </>
        )}

        {!isDharmaKartha && (
          <>
            <label>Date of Birth<input type="date" value={profile.dob || profile.dateOfBirth || ''} onChange={e => update('dob', e.target.value)} /></label>
            <label>Gender<select value={profile.gender || ''} onChange={e => update('gender', e.target.value)}><option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option></select></label>
            
            {/* RASHI DROPDOWN FROM DB VIA API */}
            <label>
              Rashi (Moon Sign)
              <select value={profile.rashi || ''} onChange={e => {
                const selected = rashiList.find(r => r.name === e.target.value);
                update('rashi', e.target.value);
                if (selected?.id) update('rashiId', selected.id);
              }}>
                <option value="">Select Rashi from DB</option>
                {rashiList.map(r => (
                  <option key={r.id || r.code || r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </label>

            {/* NAKSHATRAM DROPDOWN FROM DB VIA API */}
            <label>
              Nakshatram (Birth Star)
              <select value={profile.nakshatram || profile.nakshatra || ''} onChange={e => {
                const selected = nakshatraList.find(n => n.name === e.target.value);
                update('nakshatram', e.target.value);
                update('nakshatra', e.target.value);
                if (selected?.id) update('nakshatraId', selected.id);
              }}>
                <option value="">Select Nakshatram from DB</option>
                {nakshatraList.map(n => (
                  <option key={n.id || n.code || n.name} value={n.name}>{n.name}</option>
                ))}
              </select>
            </label>
          </>
        )}

        <label>Email Address<input type="email" value={profile.email || ''} onChange={e => update('email', e.target.value)} placeholder="Email address" /></label>
        <label>Mobile Number<input type="tel" value={profile.mobile || profile.phoneNumber || ''} onChange={e => update('mobile', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} placeholder="10-digit mobile number" /></label>
        
        {/* STATE DROPDOWN FROM DB VIA API */}
        <label>
          State
          <select value={profile.state || ''} onChange={e => {
            const nextState = e.target.value;
            update('state', nextState);
            update('district', '');
          }}>
            <option value="">Select State from DB</option>
            {stateList.map(s => (
              <option key={s.id || s.code || s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </label>

        {/* DISTRICT DROPDOWN DYNAMICALLY FETCHED FROM DB VIA API FOR SELECTED STATE */}
        <label>
          District {districtsLoading && '(Loading...)'}
          <select value={profile.district || ''} onChange={e => update('district', e.target.value)} disabled={!profile.state}>
            <option value="">{profile.state ? 'Select District from DB' : 'Select State First'}</option>
            {districtList.map(d => (
              <option key={d.id || d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </label>

        <label>
          City / Town
          <input value={profile.city || ''} onChange={e => update('city', e.target.value)} placeholder="City / Town name" />
        </label>

        <label>
          Pin Code
          <input value={profile.pincode || profile.pinCode || ''} onChange={e => update('pincode', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="6-digit PIN code" maxLength={6} />
        </label>

        {/* PREFERRED LANGUAGE DROPDOWN FROM DB VIA API */}
        <label>
          Preferred Language
          <select value={profile.preferredLang || profile.preferredLanguage || ''} onChange={e => update('preferredLang', e.target.value)}>
            <option value="">Select Preferred Language</option>
            {languageList.map(l => (
              <option key={l.code || l.id} value={l.code}>{l.label || l.nativeName || l.name}</option>
            ))}
          </select>
        </label>

        {/* FAVORITE DEITY DROPDOWN FROM DB VIA API */}
        <label>
          Favorite Deity
          <select value={profile.favoriteDeity || ''} onChange={e => update('favoriteDeity', e.target.value)}>
            <option value="">Select Favorite Deity from DB</option>
            {deityList.map(d => (
              <option key={d.id || d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </label>

        <label className="wide">Address<input value={profile.address || profile.addressLine || ''} onChange={e => update('address', e.target.value)} placeholder="Door number, locality, city" /></label>
      </div>

      <div className="form-footer">
        <p>Profile information is securely synchronized live with the temple database.</p>
        <Button onClick={onSave}>{action} <Icon name="CheckCircle2" size={17} /></Button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </BrowserRouter>
);
