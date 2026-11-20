import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL, API_ORIGIN } from './apiConfig';
import { useLanguage } from './LanguageContext';
import './footer.css';

export default function Footer({ notify, brand: propBrand }) {
  const { t } = useLanguage();
  // Dynamically fetched brand, app links, and social links from MySQL
  const [socialItems, setSocialItems] = useState([]);
  const [brand, setBrand] = useState({
    logoUrl: propBrand?.logoUrl || '/images/saranam-ayyappa-official-emblem.jpg',
    title: propBrand?.title || 'Saranam Ayyappa',
    tagline: propBrand?.tagline || 'SWAMIYE SARANAM AYYAPPA',
    description: 'A sacred digital companion providing authenticated pooja vidhanam, divine stotras, live temple darshan, and verified Annadanam seva opportunities.',
    footerAppDesc: propBrand?.footerAppDesc || 'Experience daily darshan, audio bhajans, Panchangam alerts & sacred pooja vidhanam on your mobile.',
    playStoreUrl: propBrand?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
    appStoreUrl: propBrand?.appStoreUrl || 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
    socialLinks: {
      youtube: 'https://www.youtube.com/@SaranamAyyappaOfficial',
      telegram: 'https://t.me/saranam_ayyappa_satsang',
      instagram: 'https://www.instagram.com/saranamayyappa_official',
      facebook: 'https://www.facebook.com/saranamayyappaportal',
      whatsapp: 'https://whatsapp.com/channel/saranamayyappa',
    },
  });

  // Sync when parent provides updated brand
  useEffect(() => {
    if (propBrand) {
      setBrand((prev) => ({
        ...prev,
        logoUrl: propBrand.logoUrl || prev.logoUrl,
        title: propBrand.title || prev.title,
        tagline: propBrand.tagline || prev.tagline,
        footerAppDesc: propBrand.footerAppDesc || prev.footerAppDesc,
        playStoreUrl: propBrand.playStoreUrl || prev.playStoreUrl,
        appStoreUrl: propBrand.appStoreUrl || prev.appStoreUrl,
      }));
    }
  }, [propBrand]);

  // Fetch brand identity and social links dynamically from MySQL DB via API
  useEffect(() => {
    fetch(`${API_BASE_URL}/home/logo`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          let resolvedLogo = '';
          if (data.logoUrl) {
            if (data.logoUrl.startsWith('http://') || data.logoUrl.startsWith('https://') || data.logoUrl.startsWith('data:') || data.logoUrl.startsWith('/images/')) {
              resolvedLogo = data.logoUrl;
            } else {
              resolvedLogo = `${API_ORIGIN}${data.logoUrl.startsWith('/') ? '' : '/'}${data.logoUrl}`;
            }
          }

          setBrand((prev) => ({
            ...prev,
            logoUrl: resolvedLogo || prev.logoUrl,
            title: data.title || prev.title,
            tagline: data.tagline || prev.tagline,
            description: data.description || prev.description,
            footerAppDesc: data.footerAppDesc || prev.footerAppDesc,
            playStoreUrl: data.playStoreUrl || prev.playStoreUrl,
            appStoreUrl: data.appStoreUrl || prev.appStoreUrl,
            socialLinks: {
              ...prev.socialLinks,
              ...(data.socialLinks || {}),
            },
          }));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/home/social-links`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setSocialItems(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleAppClick = (platform, targetUrl) => {
    if (targetUrl && targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (notify) {
      notify(`Saranam Ayyappa for ${platform}: Pre-registration open! App coming soon.`);
    } else {
      alert(`Saranam Ayyappa for ${platform}: Pre-registration open! App coming soon.`);
    }
  };

  const handleSocialClick = (url, name) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (notify) {
      notify(`Visit our official ${name} channel`);
    }
  };

  return (
    <footer className="site-footer">
      {/* ── TOP PROMO BANNER: APP STORE & PLAY STORE DOWNLOAD ── */}
      <div className="footer-top-banner">
        <div className="container footer-top-inner">
          <div className="footer-app-cta">
            <div className="footer-app-icon-wrap" aria-hidden="true">
              <L.Smartphone size={28} />
            </div>
            <div className="footer-app-cta-copy">
              <h3>{t('footerAppTitle', `Download ${brand.title} App`)}</h3>
              <p>{brand.footerAppDesc || t('footerAppDesc', 'Experience daily darshan, audio bhajans, Panchangam alerts & sacred pooja vidhanam on your mobile.')}</p>
            </div>
          </div>

          <div className="footer-store-badges">
            {/* Apple App Store Badge */}
            <button
              type="button"
              className="app-store-badge"
              onClick={() => handleAppClick('iOS (Apple App Store)', brand.appStoreUrl)}
              aria-label="Download on the Apple App Store"
            >
              {/* Official Apple Logo SVG */}
              <svg width="22" height="26" viewBox="0 0 170 170" fill="currentColor">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.37-2.73-7.24-7.39-11.6-13.98-6.19-9.37-11.05-20.2-14.58-32.48-3.53-12.28-5.3-23.77-5.3-34.46 0-14.34 3.73-26.17 11.19-35.49 7.46-9.33 16.71-14.07 27.76-14.23 4.8 0 10.37 1.34 16.71 4.02 6.34 2.68 10.39 4.07 12.14 4.18 1.48-.11 5.75-1.55 12.82-4.34 7.07-2.79 12.85-4.04 17.34-3.76 13.06.66 23.32 5.56 30.78 14.7-11.45 6.94-17.06 16.5-16.83 28.69.23 9.49 3.86 17.51 10.9 24.08 7.04 6.57 15.34 10.22 24.9 10.95-1.92 6.07-4.22 12.33-6.9 18.77zm-38.31-105.74c0-7.25 2.61-14.02 7.84-20.31 5.23-6.29 11.69-10.42 19.38-12.39.22 1.48.33 2.85.33 4.1 0 7.37-2.82 14.41-8.46 21.11-5.64 6.7-12.44 10.74-20.4 12.13-.33-1.63-.5-3.08-.5-4.35z" />
              </svg>
              <div className="badge-text">
                <small>Download on the</small>
                <strong>App Store</strong>
              </div>
            </button>

            {/* Official Google Play Store Badge */}
            <button
              type="button"
              className="app-store-badge play-store"
              onClick={() => handleAppClick('Android (Google Play)', brand.playStoreUrl)}
              aria-label="Get it on Google Play"
            >
              <svg width="22" height="24" viewBox="0 0 512 512">
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
      </div>

      {/* ── MAIN 5-COLUMN FOOTER GRID ── */}
      <div className="container footer-grid">
        {/* Column 1: Brand & Spiritual Identity */}
        <div className="footer-col-brand">
          <Link to="/home" className="footer-brand">
            <img 
              src={propBrand?.logoUrl || brand.logoUrl} 
              alt=""
              aria-hidden="true" 
              className="brand-logo-img" 
              style={{ height: '46px', width: 'auto', objectFit: 'contain', border: 'none', background: 'transparent', display: 'block', flexShrink: 0 }}
              onError={(e) => {
                if (!e.target.dataset.tried) {
                  e.target.dataset.tried = 'true';
                  e.target.src = '/images/saranam-ayyappa-official-emblem.jpg';
                } else {
                  e.target.style.display = 'none';
                }
              }}
            />
            <div className="footer-brand-text">
              <span className="footer-brand-title">{propBrand?.title || brand.title}</span>
              <small className="footer-brand-tagline">{propBrand?.tagline || brand.tagline}</small>
            </div>
          </Link>
          <p className="footer-desc">
            {brand.description}
          </p>

          <div className="footer-social-wrap">
            {socialItems.length > 0 ? (
              socialItems.map((item) => {
                const IconComponent = L[item.icon] || L.Share2;
                return (
                  <button 
                    key={item.id}
                    type="button"
                    className="footer-social-btn" 
                    title={item.title} 
                    aria-label={item.title}
                    onClick={() => {
                      if (item.isShare) {
                        if (navigator.share) {
                          navigator.share({ 
                            title: propBrand?.title || brand.title, 
                            text: propBrand?.tagline || brand.tagline, 
                            url: window.location.origin 
                          }).catch(() => {});
                        } else if (notify) {
                          notify('Share Saranam Ayyappa with family & friends');
                        }
                      } else {
                        handleSocialClick(item.url, item.name);
                      }
                    }}
                  >
                    <IconComponent size={item.icon === 'Youtube' ? 17 : 16} />
                  </button>
                );
              })
            ) : (
              <>
                <button 
                  className="footer-social-btn" 
                  title="YouTube Devotional Channel" 
                  onClick={() => handleSocialClick(brand.socialLinks?.youtube, 'YouTube')}
                >
                  <L.Youtube size={17} />
                </button>
                <button 
                  className="footer-social-btn" 
                  title="Telegram Devotee Satsang" 
                  onClick={() => handleSocialClick(brand.socialLinks?.telegram, 'Telegram')}
                >
                  <L.Send size={16} />
                </button>
                <button 
                  className="footer-social-btn" 
                  title="WhatsApp Channel" 
                  onClick={() => handleSocialClick(brand.socialLinks?.whatsapp, 'WhatsApp')}
                >
                  <L.MessageSquare size={16} />
                </button>
                <button 
                  className="footer-social-btn" 
                  title="Share with Devotees" 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: brand.title, text: brand.tagline, url: window.location.origin }).catch(() => {});
                    } else if (notify) {
                      notify('Share Saranam Ayyappa with family & friends');
                    }
                  }}
                >
                  <L.Share2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Column 2: Devotional Services */}
        <div>
          <h4>{t('footerColServices', 'Devotional Services')}</h4>
          <div className="footer-links">
            <Link to="/subcategories"><L.Flame size={13} /> {t('footerPoojas', 'Pooja Vidhanam')}</Link>
            <Link to="/stotras"><L.BookOpen size={13} /> {t('footerStotras', 'Astothrams & Stotras')}</Link>
            <Link to="/slokas"><L.ScrollText size={13} /> {t('footerSlokas', 'Sacred Slokas')}</Link>
            <Link to="/songs"><L.Music2 size={13} /> {t('footerSongs', 'Bhajans & Songs')}</Link>
            <Link to="/panchangam"><L.CalendarDays size={13} /> {t('footerPanchangam', 'Daily Panchangam')}</Link>
          </div>
        </div>

        {/* Column 3: Explore & Pilgrimage */}
        <div>
          <h4>{t('footerColExplore', 'Explore')}</h4>
          <div className="footer-links">
            <Link to="/temples"><L.Landmark size={13} /> {t('footerTemples', 'Hindu Temples')}</Link>
            <Link to="/live-streams"><L.Video size={13} /> {t('footerLive', 'Events & Live')}</Link>
            <Link to="/donations"><L.Soup size={13} /> {t('footerDonations', 'Annadanam / Seva')}</Link>
            <Link to="/food-donations"><L.MapPin size={13} /> {t('footerFoodDonation', 'Food Donation Centers')}</Link>
            <Link to="/notifications"><L.Bell size={13} /> {t('footerNotices', 'Temple Notices')}</Link>
          </div>
        </div>

        {/* Column 4: Devotee Support & Policies */}
        <div>
          <h4>{t('footerColCare', 'Devotee Care')}</h4>
          <div className="footer-links">
            <Link to="/contact">{t('footerContact', 'Contact Us')}</Link>
            <Link to="/about">{t('footerAbout', 'About Platform')}</Link>
            <Link to="/terms">{t('footerTerms', 'Terms & Conditions')}</Link>
            <Link to="/privacy">{t('footerPrivacy', 'Privacy Policy')}</Link>
            <Link to="/refund-policy">{t('footerRefunds', 'Donation & Refund')}</Link>
            <Link to="/account-deletion">{t('footerDataSafety', 'Account Deletion')}</Link>
            <Link to="/profile">{t('footerProfile', 'My Devotee Profile')}</Link>
          </div>
        </div>

        {/* Column 5: Trust, Security & Helpline */}
        <div className="footer-col-contact">
          <h4>{t('footerColTrust', 'Helpline & Trust')}</h4>
          <div className="footer-support-box">
            <div className="support-row">
              <L.Headphones size={18} />
              <div>
                <strong>{t('footerHelpDesk', 'Devotee Seva Desk')}</strong>
                <span>support@saranamayyappa.org</span>
              </div>
            </div>
            <div className="support-row">
              <L.Clock3 size={18} />
              <div>
                <strong>{t('footerTimingsHelp', 'Temple Timings Help')}</strong>
                <span>Mon – Sun: 5:00 AM – 9:00 PM</span>
              </div>
            </div>
            <div className="security-badges">
              <L.ShieldCheck size={16} />
              <span>{t('footerVerifiedPlatform', '100% Verified Devotional Platform')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER BOTTOM BAR ── */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <div className="footer-copyright">
            <span>© 2026 {brand.title} Devotional Portal. {t('footerAllRights', 'All rights reserved.')}</span>
          </div>
          <div className="footer-legal-links">
            <Link to="/contact">Contact Us</Link>
            <span>•</span>
            <Link to="/privacy">{t('footerPrivacy', 'Privacy')}</Link>
            <span>•</span>
            <Link to="/terms">{t('footerTerms', 'Terms')}</Link>
            <span>•</span>
            <Link to="/refund-policy">{t('footerRefunds', 'Refunds')}</Link>
            <span>•</span>
            <Link to="/account-deletion">{t('footerDataSafety', 'Data Safety')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
