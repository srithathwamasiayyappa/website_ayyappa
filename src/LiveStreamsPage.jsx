import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import './liveStreams.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

// Hero carousel slides
const heroSlides = [
  {
    id: 'sabarimala',
    title: 'Sabarimala Sree Ayyappa Temple',
    darshan: 'Live Darshan',
    season: 'Makaravilakku Season',
    desc: 'Temple live stream, daily darshan, and special poojas from Sabarimala Sree Ayyappa Temple.',
    image: '/images/live-streams/sabarimala-hero.png',
    badge: 'LIVE NOW',
    badgeType: 'live',
  },
  {
    id: 'tirumala',
    title: 'Sri Venkateswara Temple',
    darshan: 'Live Darshan',
    season: 'Suprabhata Seva',
    desc: 'Sacred hill shrine of Tirumala with continuous devotional prayers, daily seva and rituals.',
    image: '/images/live-streams/sri-venkateswara-temple.png',
    badge: 'LIVE NOW',
    badgeType: 'live',
  },
  {
    id: 'kashi',
    title: 'Kashi Vishwanath Temple',
    darshan: 'Live Darshan',
    season: 'Ganga Aarti & Harathi',
    desc: 'Ancient Jyotirlinga shrine darshan with sacred morning and evening deeparadhana prayers.',
    image: '/images/live-streams/golden-temple-staircase.png',
    badge: 'LIVE NOW',
    badgeType: 'live',
  },
  {
    id: 'deeparadhana',
    title: 'Sannidhanam Deeparadhana',
    darshan: 'Special Broadcast',
    season: 'Evening Padi Pooja',
    desc: 'Experience the sacred lamps, nadaswaram melodies and Harivarasanam lullaby from Sabarimala.',
    image: '/images/live-streams/sabarimala-temple.png',
    badge: 'LIVE NOW',
    badgeType: 'live',
  },
];

// 4 Feature items matching Reference Image 1
const featureItems = [
  {
    icon: 'Video',
    title: 'Live Temple Darshan',
    desc: 'Real-time temple experience',
  },
  {
    icon: 'Radio',
    title: 'Verified Streams',
    desc: 'Official temple broadcasts',
  },
  {
    icon: 'Calendar',
    title: 'Special Events',
    desc: 'Festivals & seasonal rituals',
  },
  {
    icon: 'Bell',
    title: 'Instant Updates',
    desc: 'Get notified for live events',
  },
];

// 3 Featured Broadcast cards matching Reference Image 1
const featuredCards = [
  {
    id: 'sabarimala-broadcast',
    title: 'Sabarimala Sri Ayyappa Temple – Darshan',
    desc: 'Streaming schedule and availability are examples only.',
    image: '/images/live-streams/sabarimala-hero.png',
    badge: 'LIVE',
    alt: 'Sabarimala Sri Ayyappa Temple',
  },
  {
    id: 'venkateswara-broadcast',
    title: 'Sri Venkateswara Temple – Darshan',
    desc: 'Streaming schedule and availability are examples only.',
    image: '/images/live-streams/sri-venkateswara-temple.png',
    badge: 'LIVE',
    alt: 'Sri Venkateswara Temple Gopuram',
  },
  {
    id: 'kashi-broadcast',
    title: 'Kashi Vishwanath Temple – Darshan',
    desc: 'Streaming schedule and availability are examples only.',
    image: '/images/live-streams/golden-temple-staircase.png',
    badge: 'LIVE',
    alt: 'Golden Temple Staircase (Illustrative Artwork)',
  },
];

export default function LiveStreamsPage({ notify }) {
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [modalStream, setModalStream] = useState(null);

  // Auto-rotate slides gently every 7 seconds, pauses on user interaction
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[activeSlide];

  const handleOpenStream = (streamInfo) => {
    setModalStream(streamInfo);
    if (notify) {
      notify(`Opening stream preview for ${streamInfo.title}`);
    }
  };

  return (
    <main className="sa-live-page">
      <div className="sa-live-container">
        {/* =========================================================
            PHASE 3: PAGE HEADING WITH FLANKING GOLD LOTUSES
            ========================================================= */}
        <header className="sa-live-header">
          <span className="sa-live-eyebrow">{t('liveEyebrow', 'LIVE TEMPLE DEVOTION')}</span>

          <div className="sa-live-title-row">
            <img
              src="/images/pooja/lotus-heading-left-trans.png"
              alt=""
              className="sa-live-lotus"
              aria-hidden="true"
            />
            <h1 className="sa-live-title">{t('liveTitle', 'Live Streams & Darshan')}</h1>
            <img
              src="/images/pooja/lotus-heading-right-trans.png"
              alt=""
              className="sa-live-lotus"
              aria-hidden="true"
            />
          </div>

          <p className="sa-live-subtitle">
            {t('liveDesc', 'Explore temple broadcasts, virtual darshan and upcoming special events.')}
          </p>

          <div className="sa-live-divider" aria-hidden="true">
            <span className="sa-live-divider-line"></span>
            <span className="sa-live-divider-lotus">❀</span>
            <span className="sa-live-divider-line"></span>
          </div>
        </header>

        {/* =========================================================
            PHASE 4 & 5: HERO LIVE DARSHAN BANNER
            ========================================================= */}
        <div className="sa-live-hero-wrap">
          <div className="sa-live-hero">
            <div
              className="sa-live-hero-bg"
              style={{ backgroundImage: `url("${slide.image}")` }}
            />
            <div className="sa-live-hero-overlay" />

            <div className="sa-live-hero-content">
              {/* Status Badge */}
              <div className="sa-live-status-pill">
                <span className="sa-live-status-dot">●</span>
                <span>{slide.badge}</span>
              </div>

              {/* Title with Broadcast Icon */}
              <div className="sa-live-hero-header">
                <Icon name="Radio" size={26} className="sa-live-broadcast-icon" />
                <h2 className="sa-live-hero-title">{slide.title}</h2>
              </div>

              {/* Supporting Meta Information */}
              <div className="sa-live-hero-meta">
                <span className="sa-live-meta-item">
                  <Icon name="Crown" size={15} />
                  <span>{slide.darshan}</span>
                </span>
                <span className="sa-live-meta-sep">|</span>
                <span className="sa-live-meta-item">
                  <Icon name="Calendar" size={15} />
                  <span>{slide.season}</span>
                </span>
              </div>

              {/* Description */}
              <p className="sa-live-hero-desc">{slide.desc}</p>

              {/* Watch Live Now Button */}
              <button
                type="button"
                className="sa-live-hero-btn"
                onClick={() => handleOpenStream(slide)}
                aria-label={`Watch Live Now - ${slide.title}`}
              >
                <Icon name="Play" size={16} fill="currentColor" />
                <span>{t('watchLiveNow', 'Watch Live Now')}</span>
                <Icon name="ArrowRight" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            PHASE 6: HERO CAROUSEL INDICATORS
            ========================================================= */}
        <div className="sa-live-carousel-dots" role="tablist" aria-label="Hero Slides">
          {heroSlides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`sa-live-dot ${idx === activeSlide ? 'active' : ''}`}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Slide ${idx + 1}: ${s.title}`}
              role="tab"
              aria-selected={idx === activeSlide}
            />
          ))}
        </div>

        {/* =========================================================
            PHASE 7: FOUR-FEATURE INFORMATION STRIP
            ========================================================= */}
        <section className="sa-live-strip" aria-label="Live Stream Highlights">
          {featureItems.map((f) => {
            const titleMap = {
              'Live Temple Darshan': t('liveDarshan', f.title),
              'Verified Streams': t('verifiedStreams', f.title),
              'Special Events': t('specialEvents', f.title),
              'Instant Updates': t('instantUpdates', f.title),
            };
            return (
              <div key={f.title} className="sa-live-strip-col">
                <div className="sa-live-strip-icon-wrap">
                  <Icon name={f.icon} size={22} />
                </div>
                <div className="sa-live-strip-info">
                  <h4 className="sa-live-strip-title">{titleMap[f.title] || f.title}</h4>
                  <p className="sa-live-strip-desc">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* =========================================================
            PHASE 8 & 9: FEATURED BROADCASTS SECTION & 3 CARDS
            ========================================================= */}
        <section className="sa-live-featured-section" aria-label="Featured Broadcasts">
          <div className="sa-live-section-header">
            <div className="sa-live-section-heading-left">
              <span className="sa-live-section-eyebrow">{t('liveEyebrow', 'EXPLORE MORE')}</span>
              <h2 className="sa-live-section-title">{t('liveTitle', 'Featured Broadcasts')}</h2>
            </div>

            <Link to="/temples" className="sa-live-view-all-btn">
              <span>{t('exploreStreamDir', 'View All Streams')}</span>
              <Icon name="ArrowRight" size={15} />
            </Link>
          </div>

          <div className="sa-live-broadcast-grid">
            {featuredCards.map((card) => (
              <article key={card.id} className="sa-live-card">
                {/* Left Thumbnail with Badge & Play Overlay */}
                <div
                  className="sa-live-card-thumb-wrap"
                  onClick={() => handleOpenStream(card)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play stream preview for ${card.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenStream(card);
                    }
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="sa-live-card-thumb"
                    loading="lazy"
                  />
                  <span className="sa-live-card-badge">● {t('liveNow', card.badge)}</span>
                  <div className="sa-live-card-play-overlay" aria-hidden="true">
                    <Icon name="Play" size={18} fill="currentColor" />
                  </div>
                </div>

                {/* Right Card Content */}
                <div className="sa-live-card-content">
                  <div className="sa-live-card-body">
                    <h3 className="sa-live-card-title">{card.title}</h3>
                    <p className="sa-live-card-desc">{t('streamScheduleNotice', card.desc)}</p>
                  </div>

                  <button
                    type="button"
                    className="sa-live-card-btn"
                    onClick={() => handleOpenStream(card)}
                    aria-label={`View Live stream for ${card.title}`}
                  >
                    <span>{t('viewLive', 'View Live')}</span>
                    <Icon name="ArrowRight" size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =========================================================
            LIVE STREAM PREVIEW MODAL DIALOG
            ========================================================= */}
        {modalStream && (
          <div
            className="sa-live-modal-scrim"
            onClick={() => setModalStream(null)}
            role="dialog"
            aria-modal="true"
            aria-label={modalStream.title}
          >
            <div className="sa-live-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sa-live-modal-header">
                <h3>{modalStream.title}</h3>
                <button
                  type="button"
                  className="sa-live-modal-close"
                  onClick={() => setModalStream(null)}
                  aria-label="Close stream preview"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="sa-live-modal-video">
                <img src={modalStream.image} alt={modalStream.title} />
                <span className="sa-live-modal-video-badge">● STREAM PREVIEW</span>
                <div className="sa-live-modal-video-overlay">
                  <div>
                    <h4>{modalStream.title}</h4>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.85 }}>
                      Official temple broadcast preview feed
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Icon name="Volume2" size={18} />
                    <Icon name="Maximize" size={18} />
                  </div>
                </div>
              </div>

              <div className="sa-live-modal-footer">
                <span>
                  <strong>Note:</strong> Real-time streaming requires authorized live temple broadcast connection.
                </span>
                <button
                  type="button"
                  className="sa-live-card-btn"
                  onClick={() => setModalStream(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

