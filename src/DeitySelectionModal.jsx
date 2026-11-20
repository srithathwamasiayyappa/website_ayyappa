import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { API_BASE_URL } from './apiConfig';
import './deitySelectionModal.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

// Default high-fidelity Indic deities with 5-language localized names & imagery matching reference exactly
export const DEFAULT_DEITIES_LIST = [
  {
    id: 'ayyappa',
    slug: 'lord-ayyappa',
    name: 'Lord Ayyappa',
    te: 'శ్రీ అయ్యప్ప స్వామి',
    kn: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ',
    ta: 'ஸ்ரீ ஐயப்ப சுவாமி',
    hi: 'भगवान अय्यप्पा',
    image: '/images/deities/lord_ayyappa.png',
    fallbackImage: '/images/god-ayyappa.jpg',
    sortOrder: 1,
  },
  {
    id: 'shiva',
    slug: 'lord-shiva',
    name: 'Lord Shiva',
    te: 'పరమశివుడు',
    kn: 'ಪರಮಶಿವ',
    ta: 'பரமசிவன்',
    hi: 'भगवान शिव',
    image: '/images/deities/lord_shiva.png',
    fallbackImage: '/images/god-shiva.jpg',
    sortOrder: 2,
  },
  {
    id: 'venkateswara',
    slug: 'lord-venkateswara',
    name: 'Lord Venkateswara',
    te: 'శ్రీ వేంకటేశ్వర స్వామి',
    kn: 'ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ',
    ta: 'ஸ்ரீ வெங்கடேஸ்வர சுவாமி',
    hi: 'भगवान वेंकटेश्वर',
    image: '/images/deities/lord_vishnu.png',
    fallbackImage: '/images/god-venkateswara.jpg',
    sortOrder: 3,
  },
  {
    id: 'ganesha',
    slug: 'lord-ganesha',
    name: 'Lord Ganesha',
    te: 'శ్రీ మహాగణపతి',
    kn: 'ಶ್ರೀ ಮಹಾಗಣಪತಿ',
    ta: 'ஸ்ரீ மகாகணபதி',
    hi: 'भगवान गणेश',
    image: '/images/deities/lord_ganesha.png',
    fallbackImage: '/images/god-ganesha.jpg',
    sortOrder: 4,
  },
  {
    id: 'devi',
    slug: 'goddess-lakshmi-durga',
    name: 'Goddess Lakshmi / Durga',
    te: 'శ్రీ దుర్గా / లక్ష్మీ దేవి',
    kn: 'ಶ್ರೀ ದುರ್ಗಾ / ಲಕ್ಷ್ಮೀ ದೇವಿ',
    ta: 'ஸ்ரீ துர்கா / லட்சுமி தேவி',
    hi: 'देवी दुर्गा / लक्ष्मी',
    image: '/images/deities/goddess_devi.png',
    fallbackImage: '/images/god-durga.jpg',
    sortOrder: 5,
  },
  {
    id: 'hanuman',
    slug: 'lord-hanuman',
    name: 'Lord Hanuman',
    te: 'శ్రీ ఆంజనేయ స్వామి',
    kn: 'ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ',
    ta: 'ஸ்ரீ ஆஞ்சநேய சுவாமி',
    hi: 'भगवान हनुमान',
    image: '/images/deities/hanuman.jpg',
    fallbackImage: '/images/deity.jpg',
    sortOrder: 6,
  },
  {
    id: 'murugan',
    slug: 'lord-murugan',
    name: 'Lord Murugan',
    te: 'శ్రీ సుబ్రహ్మణ్య స్వామి',
    kn: 'ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ',
    ta: 'ஸ்ரீ சுப்பிரமணிய சுவாமி',
    hi: 'भगवान मुरुगन',
    image: '/images/deities/lord_murugan.png',
    fallbackImage: '/images/deities/card_murugan.jpg',
    sortOrder: 7,
  },
  {
    id: 'all',
    slug: 'all-deities',
    name: 'All Deities',
    te: 'అన్ని దైవాలు',
    kn: 'ಎಲ್ಲಾ ದೇವತೆಗಳು',
    ta: 'அனைத்து தெய்வங்கள்',
    hi: 'सभी देवी-देवता',
    image: '/images/deities/saranam_deity_emblem.png',
    fallbackImage: '/images/hero-deity.jpg',
    isAll: true,
    sortOrder: 8,
  },
];

/**
 * DeitySelectionModal
 * Centered modal popup asking the user to select a God / Goddess before viewing devotional content.
 * Matches reference image 1:1 in layout, colors, temple-arch styling, hanging lamps, and responsive UX.
 */
export default function DeitySelectionModal({
  isOpen = false,
  onClose,
  onSelectDeity,
  currentDeityId = 'all',
  targetPageTitle = 'Pooja Vidhanam',
}) {
  const { currentLanguage = 'en' } = useLanguage();
  const [selectedDeity, setSelectedDeity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deities, setDeities] = useState(DEFAULT_DEITIES_LIST);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync initial selection when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = deities.find((d) => d.id === currentDeityId || d.slug === currentDeityId) || deities.find(d => d.id === 'ayyappa') || deities[0];
      setSelectedDeity(initial);
      setSearchQuery('');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 150);
    }
  }, [isOpen, currentDeityId, deities]);

  // Fetch deities dynamically from backend DB/API
  useEffect(() => {
    let cancelled = false;
    const fetchDeities = async () => {
      try {
        setLoading(true);
        // Try categories/deities or master/deities
        let res = await fetch(`${API_BASE_URL}/categories/deities?lang=${currentLanguage}`).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${API_BASE_URL}/master/deities?lang=${currentLanguage}`).catch(() => null);
        }
        if (res && res.ok) {
          const json = await res.json().catch(() => null);
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            // Merge with local rich imagery and structure
            const merged = DEFAULT_DEITIES_LIST.map((def) => {
              const apiMatch = json.data.find(
                (a) =>
                  a.id === def.id ||
                  (a.slug && a.slug.includes(def.id)) ||
                  (a.name && a.name.toLowerCase().includes(def.id))
              );
              if (apiMatch) {
                return {
                  ...def,
                  name: apiMatch.name || def.name,
                  image: apiMatch.imageUrl || apiMatch.image || def.image,
                };
              }
              return def;
            });
            if (!cancelled) {
              setDeities(merged);
            }
          }
        }
      } catch (err) {
        console.warn('Using local rich deities configuration:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDeities();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  // Keyboard accessibility: ESC closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter deities in real time as user types
  const filteredDeities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return deities;
    return deities.filter((d) => {
      const nameEn = (d.name || '').toLowerCase();
      const nameLoc = (d[currentLanguage] || '').toLowerCase();
      const slug = (d.slug || '').toLowerCase();
      return nameEn.includes(q) || nameLoc.includes(q) || slug.includes(q);
    });
  }, [deities, searchQuery, currentLanguage]);

  if (!isOpen) return null;

  const handleCardClick = (deity) => {
    setSelectedDeity(deity);
  };

  const handleContinue = () => {
    if (!selectedDeity) return;
    try {
      localStorage.setItem('sa_selected_deity', selectedDeity.id);
      localStorage.setItem('sa-selected-god', selectedDeity.id);
      localStorage.setItem('selected_deity', selectedDeity.slug || selectedDeity.id);
    } catch {}
    onSelectDeity?.(selectedDeity);
    onClose?.();
  };

  const handleChooseLater = () => {
    try {
      // If user chooses later, keep existing or set to 'all' so full content shows
      if (!localStorage.getItem('sa_selected_deity')) {
        localStorage.setItem('sa_selected_deity', 'all');
      }
    } catch {}
    onClose?.();
  };

  return (
    <div
      className="sa-deity-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deity-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="sa-deity-modal-container" ref={modalRef}>
        {/* Top Temple Arch Crown Embellishment */}
        <div className="sa-deity-top-arch">
          <svg className="sa-arch-curve" viewBox="0 0 600 50" preserveAspectRatio="none">
            <path
              d="M0,50 L0,20 Q150,20 200,8 Q270,0 300,0 Q330,0 400,8 Q450,20 600,20 L600,50 Z"
              fill="#FCFAF5"
            />
            <path
              d="M0,20 Q150,20 200,8 Q270,0 300,0 Q330,0 400,8 Q450,20 600,20"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Decorative Top-Left & Top-Right Temple Green Panels */}
        <div className="sa-deity-corner-panel top-left" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="corner-svg">
            <path d="M0,0 L90,0 Q60,30 35,60 L0,90 Z" fill="#0C3823" />
            <path d="M5,0 L85,0 Q58,28 32,58 L0,85" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="28" cy="28" r="3" fill="#D4AF37" />
          </svg>
        </div>

        <div className="sa-deity-corner-panel top-right" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="corner-svg">
            <path d="M100,0 L10,0 Q40,30 65,60 L100,90 Z" fill="#0C3823" />
            <path d="M95,0 L15,0 Q42,28 68,58 L100,85" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="72" cy="28" r="3" fill="#D4AF37" />
          </svg>
        </div>

        {/* Hanging Brass Oil Lamps (Diyas/Deepams) on Left & Right */}
        <div className="sa-deity-hanging-lamp left" aria-hidden="true">
          <svg viewBox="0 0 36 120" className="lamp-svg">
            {/* Chain */}
            <line x1="18" y1="0" x2="18" y2="70" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3,2" />
            {/* Lamp Hook / Ring */}
            <circle cx="18" cy="72" r="3" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
            {/* Lamp Body Top Cup */}
            <path d="M10,76 L26,76 L24,84 L12,84 Z" fill="#D4AF37" />
            {/* Tier 2 */}
            <path d="M6,86 Q18,92 30,86 L26,96 L10,96 Z" fill="#C5A059" />
            {/* Main Oil Bowl */}
            <ellipse cx="18" cy="98" rx="14" ry="4" fill="#D4AF37" />
            {/* Flame */}
            <path d="M18,97 Q14,90 18,80 Q22,90 18,97 Z" fill="#FFB703" />
            <circle cx="18" cy="91" r="2" fill="#FFE49E" />
            {/* Hanging Bell Tassel */}
            <line x1="18" y1="102" x2="18" y2="114" stroke="#C5A059" strokeWidth="1.5" />
            <circle cx="18" cy="116" r="2.5" fill="#D4AF37" />
          </svg>
        </div>

        <div className="sa-deity-hanging-lamp right" aria-hidden="true">
          <svg viewBox="0 0 36 120" className="lamp-svg">
            <line x1="18" y1="0" x2="18" y2="70" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3,2" />
            <circle cx="18" cy="72" r="3" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
            <path d="M10,76 L26,76 L24,84 L12,84 Z" fill="#D4AF37" />
            <path d="M6,86 Q18,92 30,86 L26,96 L10,96 Z" fill="#C5A059" />
            <ellipse cx="18" cy="98" rx="14" ry="4" fill="#D4AF37" />
            <path d="M18,97 Q14,90 18,80 Q22,90 18,97 Z" fill="#FFB703" />
            <circle cx="18" cy="91" r="2" fill="#FFE49E" />
            <line x1="18" y1="102" x2="18" y2="114" stroke="#C5A059" strokeWidth="1.5" />
            <circle cx="18" cy="116" r="2.5" fill="#D4AF37" />
          </svg>
        </div>

        {/* Circular Close Button (top-right white pill with gold outline) */}
        <button
          type="button"
          className="sa-deity-close-btn"
          onClick={onClose}
          aria-label="Close deity selection popup"
        >
          <Icon name="X" size={17} />
        </button>

        {/* Modal Inner Content */}
        <div className="sa-deity-modal-body">
          {/* Golden Lotus Icon Ornament */}
          <div className="sa-deity-lotus-ornament" aria-hidden="true">
            <svg viewBox="0 0 80 40" className="lotus-svg">
              <path
                d="M40,5 C43,15 52,22 62,25 C50,26 44,22 40,32 C36,22 30,26 18,25 C28,22 37,15 40,5 Z"
                fill="#C5A059"
              />
              <path
                d="M40,12 C42,20 48,25 54,27 C46,28 42,25 40,32 C38,25 34,28 26,27 C32,25 38,20 40,12 Z"
                fill="#D4AF37"
              />
              <circle cx="40" cy="33" r="2.5" fill="#C5A059" />
              <line x1="10" y1="33" x2="33" y2="33" stroke="#D4AF37" strokeWidth="1" />
              <line x1="47" y1="33" x2="70" y2="33" stroke="#D4AF37" strokeWidth="1" />
              <circle cx="10" cy="33" r="2" fill="#D4AF37" />
              <circle cx="70" cy="33" r="2" fill="#D4AF37" />
            </svg>
          </div>

          {/* Heading */}
          <h2 id="deity-modal-title" className="sa-deity-heading">
            Choose Your God / Goddess
          </h2>

          {/* Subtitle */}
          <p className="sa-deity-subtitle">
            Select your preferred deity to personalize Pooja Vidhanam, Divine Stotras, Daily Slokas and Bhajans &amp; Songs.
          </p>

          {/* Full-width Search Input */}
          <div className="sa-deity-search-wrap">
            <Icon name="Search" size={18} className="sa-deity-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="sa-deity-search-input"
              placeholder="Search deity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search deity by name"
            />
            {searchQuery && (
              <button
                type="button"
                className="sa-deity-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <Icon name="X" size={14} />
              </button>
            )}
          </div>

          {/* Deity Cards Responsive Grid */}
          <div className="sa-deity-grid">
            {filteredDeities.map((deity) => {
              const isSelected = selectedDeity && selectedDeity.id === deity.id;
              const displayName =
                currentLanguage !== 'en' && deity[currentLanguage]
                  ? deity[currentLanguage]
                  : deity.name;

              return (
                <div
                  key={deity.id}
                  className={`sa-deity-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCardClick(deity)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(deity);
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select ${displayName}`}
                >
                  {/* Selected Circular Check Badge at Top-Right */}
                  {isSelected && (
                    <div className="sa-deity-selected-check" aria-hidden="true">
                      <span>✓</span>
                    </div>
                  )}

                  {/* Deity Portrait Artwork */}
                  <div className="sa-deity-card-img-wrap">
                    {deity.isAll ? (
                      /* Auspicious Vilakku / Diya with Leaves for All Deities */
                      <div className="sa-deity-all-lamp-icon" aria-hidden="true">
                        <svg viewBox="0 0 64 64" className="vilakku-svg">
                          {/* Green holy betel leaves flanking */}
                          <path d="M12,46 Q16,30 26,40 Q22,50 12,46 Z" fill="#2D6A4F" />
                          <path d="M52,46 Q48,30 38,40 Q42,50 52,46 Z" fill="#2D6A4F" />
                          {/* Brass Lamp Base */}
                          <ellipse cx="32" cy="56" rx="18" ry="4" fill="#C5A059" />
                          <path d="M26,56 L38,56 L35,46 L29,46 Z" fill="#D4AF37" />
                          {/* Central Column */}
                          <path d="M30,46 L34,46 L33,32 L31,32 Z" fill="#C5A059" />
                          {/* Oil Dish */}
                          <ellipse cx="32" cy="32" rx="16" ry="4" fill="#D4AF37" />
                          {/* Flame */}
                          <path d="M32,30 Q27,20 32,8 Q37,20 32,30 Z" fill="#FFB703" />
                          <circle cx="32" cy="22" r="3" fill="#FFF275" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={deity.image}
                        alt={displayName}
                        className="sa-deity-card-img"
                        loading="lazy"
                        onError={(e) => {
                          if (deity.fallbackImage && e.target.src !== deity.fallbackImage) {
                            e.target.src = deity.fallbackImage;
                          } else {
                            e.target.src = '/images/deities/ayyappa.jpg';
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Deity Name */}
                  <div className="sa-deity-card-title">{displayName}</div>

                  {/* Small Decorative Flourish Line Under Title */}
                  <div className="sa-deity-card-flourish" aria-hidden="true">
                    <svg viewBox="0 0 50 8" className="flourish-svg">
                      <line x1="2" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="1" />
                      <circle cx="25" cy="4" r="2" fill="currentColor" />
                      <line x1="30" y1="4" x2="48" y2="4" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDeities.length === 0 && (
            <div className="sa-deity-empty-search">
              <p>No deity matching "{searchQuery}"</p>
              <button
                type="button"
                className="sa-deity-btn-clear"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Action Area: Continue CTA, Choose Later Link & Helper Text */}
          <div className="sa-deity-action-area">
            {/* Primary CTA */}
            <button
              type="button"
              className="sa-deity-btn-continue"
              disabled={!selectedDeity}
              onClick={handleContinue}
            >
              <span>Continue</span>
              <span className="arrow">→</span>
            </button>

            {/* Secondary Link */}
            <button
              type="button"
              className="sa-deity-link-later"
              onClick={handleChooseLater}
            >
              Choose later
            </button>

            {/* Helper Text */}
            <div className="sa-deity-helper-text">
              <span className="info-icon">ⓘ</span>
              <span>You can change this anytime in <strong>Preferences</strong>.</span>
            </div>
          </div>
        </div>

        {/* Bottom Devotional Mountain / Temple Skyline Fade Illustration */}
        <div className="sa-deity-bottom-fade" aria-hidden="true">
          <svg className="bottom-hill-svg" viewBox="0 0 800 90" preserveAspectRatio="none">
            <path
              d="M0,90 L0,55 Q100,35 220,50 Q340,65 420,38 Q500,10 580,35 Q680,60 800,45 L800,90 Z"
              fill="#EFE7D3"
              opacity="0.5"
            />
            <path
              d="M0,90 L0,68 Q140,50 280,62 Q410,75 520,55 Q630,35 800,60 L800,90 Z"
              fill="#E6DAC0"
              opacity="0.6"
            />
            {/* Distant Temple Silhouette Accents */}
            <path
              d="M392,50 L400,28 L408,50 Z M397,28 L400,20 L403,28 Z"
              fill="#D4AF37"
              opacity="0.45"
            />
            <path
              d="M574,45 L580,30 L586,45 Z"
              fill="#D4AF37"
              opacity="0.4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
