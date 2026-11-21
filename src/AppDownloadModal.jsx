import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './apiConfig';
import './appDownloadModal.css';

// Module-level cached store links so reopening modal is instantaneous
let memoryCachedLinks = null;

export default function AppDownloadModal({
  isOpen,
  onClose,
  itemTitle = '',
  playStoreUrl: propPlayStoreUrl,
  appStoreUrl: propAppStoreUrl,
}) {
  const [storeLinks, setStoreLinks] = useState(() => {
    // 1. Check memory cache
    if (memoryCachedLinks) return memoryCachedLinks;

    // 2. Check session storage cache
    try {
      const stored = sessionStorage.getItem('sa_app_links');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.playStoreUrl || parsed?.appStoreUrl) {
          memoryCachedLinks = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore sessionStorage error
    }

    // 3. Initial default state
    return {
      playStoreUrl: propPlayStoreUrl || 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
      appStoreUrl: propAppStoreUrl || 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
      logoUrl: '/images/saranam-ayyappa-official-emblem.jpg',
      storeSubtext: 'Available on iOS & Android',
      appName: 'Saranam Ayyappa App',
    };
  });

  // Fetch dynamic links directly from MySQL database via API
  useEffect(() => {
    let isMounted = true;

    const fetchAppLinks = async () => {
      try {
        // Try dedicated app-links endpoint first, then fallback to /home/logo
        const res = await fetch(`${API_BASE_URL}/home/app-links`).catch(() =>
          fetch(`${API_BASE_URL}/home/logo`)
        );
        if (!res || !res.ok) return;
        const data = await res.json();

        if (data?.success && isMounted) {
          let resolvedLogo = '/images/saranam-ayyappa-official-emblem.jpg';
          if (data.logoUrl) {
            if (data.logoUrl.startsWith('http://') || data.logoUrl.startsWith('https://') || data.logoUrl.startsWith('data:')) {
              resolvedLogo = data.logoUrl;
            } else if (data.logoUrl.startsWith('/')) {
              resolvedLogo = data.logoUrl;
            } else {
              resolvedLogo = `/${data.logoUrl}`;
            }
          }

          const updated = {
            playStoreUrl: data.playStoreUrl || propPlayStoreUrl || 'https://play.google.com/store/apps/details?id=com.saranamayyappa.app',
            appStoreUrl: data.appStoreUrl || propAppStoreUrl || 'https://apps.apple.com/app/saranam-ayyappa/id123456789',
            logoUrl: resolvedLogo,
            storeSubtext: data.storeSubtext || 'Available on iOS & Android',
            appName: data.appName || 'Saranam Ayyappa App',
          };

          memoryCachedLinks = updated;
          try {
            sessionStorage.setItem('sa_app_links', JSON.stringify(updated));
          } catch {
            // Ignore sessionStorage error
          }

          setStoreLinks(updated);
        }
      } catch (err) {
        // Keep fallback links if API call fails
      }
    };

    fetchAppLinks();

    return () => {
      isMounted = false;
    };
  }, [propPlayStoreUrl, propAppStoreUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activePlayStoreUrl = propPlayStoreUrl || storeLinks.playStoreUrl;
  const activeAppStoreUrl = propAppStoreUrl || storeLinks.appStoreUrl;

  const handleStoreClick = (url, platformName = 'App') => {
    if (url && typeof url === 'string' && url.trim().startsWith('http')) {
      window.open(url.trim(), '_blank', 'noopener,noreferrer');
    } else {
      alert(`Saranam Ayyappa for ${platformName}: Official link will be updated shortly.`);
    }
  };

  return (
    <div className="sa-app-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sa-app-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="sa-app-modal-close"
          onClick={onClose}
          aria-label="Close download modal"
        >
          ✕
        </button>

        {/* Top Decorative Devotional Icon */}
        <div className="sa-app-modal-icon-wrap">
          <img
            src={storeLinks.logoUrl || '/images/saranam-ayyappa-official-emblem.jpg'}
            alt="Saranam Ayyappa Emblem"
            className="sa-app-modal-emblem"
            onError={(e) => {
              e.target.src = '/images/pooja/pooja-card-1-ref.png';
            }}
          />
          <span className="sa-app-modal-om">ॐ</span>
        </div>

        {/* Modal Header */}
        <div className="sa-app-modal-badge">
          <span>🙏 Official Saranam Ayyappa App</span>
        </div>

        <h2 className="sa-app-modal-title">
          {itemTitle ? (
            <>Read <em>&ldquo;{itemTitle}&rdquo;</em> in Mobile App</>
          ) : (
            <>Read Complete Sacred Content in Mobile App</>
          )}
        </h2>

        <p className="sa-app-modal-sub-te">
          సంపూర్ణ పూజా విధానం, దివ్య స్తోత్రములు, నిత్య శ్లోకములు మరియు మంత్రాల పఠనం మా అఫీషియల్ మొబైల్ యాప్‌లో మాత్రమే అందుబాటులో ఉన్నాయి.
        </p>

        <p className="sa-app-modal-sub-en">
          To read the full sacred procedure steps, mantras, and stotras for all deities, please download the free Saranam Ayyappa Mobile App.
        </p>

        {/* Features Checklist */}
        <div className="sa-app-modal-features">
          <div className="sa-app-feature-item">
            <span className="sa-app-feat-check">✓</span>
            <span>Complete 16-Step Pooja Vidhanam in 5 Languages</span>
          </div>
          <div className="sa-app-feature-item">
            <span className="sa-app-feat-check">✓</span>
            <span>Divine Stotras & Ashtottara Sata Namavali</span>
          </div>
          <div className="sa-app-feature-item">
            <span className="sa-app-feat-check">✓</span>
            <span>Offline Reading & Devotional Bookmarks</span>
          </div>
        </div>

        {/* Download Buttons Row */}
        <div className="sa-app-modal-buttons">
          <button
            type="button"
            className="sa-store-btn play-store"
            onClick={() => handleStoreClick(activePlayStoreUrl, 'Google Play')}
            aria-label="Get it on Google Play"
          >
            <svg width="22" height="24" viewBox="0 0 512 512" fill="currentColor">
              <path d="M325.3 234.3L104.6 13l280 280-59.3-58.7z" fill="#00E676" />
              <path d="M47 36.1C47 23.3 54.4 11.7 66.2 6.5c11.8-5.1 25.6-3.2 35.6 4.9L325.3 234.3 104.6 455.1c-10 8.1-23.8 10-35.6 4.9C54.4 454.8 47 443.2 47 430.4V36.1z" fill="#00B0FF" />
              <path d="M325.3 277.7l-220.7 221c10 8.1 23.8 10 35.6 4.9L408.4 345l-83.1-67.3z" fill="#FF3D00" />
              <path d="M433.8 247.9c0-17.6-9.7-33.8-25.2-42.7L104.6 13 325.3 234.3l82.2 47.1c4-3 7.1-6.8 9.6-11.1 11.1-6.4 16.7-14.8 16.7-22.4z" fill="#FFC400" />
            </svg>
            <div className="sa-store-btn-text">
              <small>GET IT ON</small>
              <strong>Google Play</strong>
            </div>
          </button>

          <button
            type="button"
            className="sa-store-btn app-store"
            onClick={() => handleStoreClick(activeAppStoreUrl, 'Apple App Store')}
            aria-label="Download on the App Store"
          >
            <svg width="22" height="24" viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.37-2.73-7.24-7.39-11.6-13.98-6.19-9.37-11.05-20.2-14.58-32.48-3.53-12.28-5.3-23.77-5.3-34.46 0-14.34 3.73-26.17 11.19-35.49 7.46-9.33 16.71-14.07 27.76-14.23 4.8 0 10.37 1.34 16.71 4.02 6.34 2.68 10.39 4.07 12.14 4.18 1.48-.11 5.75-1.55 12.82-4.34 7.07-2.79 12.85-4.04 17.34-3.76 13.06.66 23.32 5.56 30.78 14.7-11.45 6.94-17.06 16.5-16.83 28.69.23 9.49 3.86 17.51 10.9 24.08 7.04 6.57 15.34 10.22 24.9 10.95-1.92 6.07-4.22 12.33-6.9 18.77zm-38.31-105.74c0-7.25 2.61-14.02 7.84-20.31 5.23-6.29 11.69-10.42 19.38-12.39.22 1.48.33 2.85.33 4.1 0 7.37-2.82 14.41-8.46 21.11-5.64 6.7-12.44 10.74-20.4 12.13-.33-1.63-.5-3.08-.5-4.35z" />
            </svg>
            <div className="sa-store-btn-text">
              <small>Download on the</small>
              <strong>App Store</strong>
            </div>
          </button>
        </div>

        <button
          type="button"
          className="sa-app-modal-continue"
          onClick={onClose}
        >
          Close & Return to Browsing
        </button>
      </div>
    </div>
  );
}
