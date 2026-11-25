import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { services } from './data';
import { useLanguage } from './LanguageContext';
import './categories.css';
import './devotionalCleanList.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

// Dedicated artwork mappings for categories services
const categoryArtworkMap = {
  pooja: '/images/categories/art-pooja-trans.png',
  ashtothram: '/images/categories/art-ashtothram-trans.png',
  stotras: '/images/categories/art-stotras-trans.png',
  slokas: '/images/categories/art-slokas-trans.png',
  bhajans: '/images/categories/art-bhajans-trans.png',
  songs: '/images/categories/art-bhajans-trans.png',
  harathis: '/images/categories/art-harathis-trans.png',
  live: '/images/categories/art-live-trans.png',
  'live-streams': '/images/categories/art-live-trans.png',
  panchangam: '/images/categories/art-panchangam-trans.png',
  festivals: '/images/categories/art-stotras-trans.png',
  temples: '/images/categories/art-temples-trans.png',
  donations: '/images/categories/art-donations-trans.png',
  food: '/images/categories/art-food-trans.png',
};

// Localized titles & subtitles across all 5 database languages
const serviceI18n = {
  pooja: {
    te: { title: 'పూజా విధానం', sub: 'దశలవారీ పూజా పద్ధతులు & నియమాలు' },
    kn: { title: 'ಪೂಜಾ ವಿಧಾನ', sub: 'ಹಂತ-ಹಂತದ ಪೂಜಾ ವಿಧಾನಗಳು' },
    en: { title: 'Pooja Vidhanam', sub: 'Step-by-step sacred rituals' },
    ta: { title: 'பூஜை முறை', sub: 'படி படியான பூஜை முறைகள்' },
    hi: { title: 'पूजा विधान', sub: 'चरण-दर-चरण पूजा पद्धतियां' },
  },
  ashtothram: {
    te: { title: 'అష్టోత్తరాలు', sub: '108 దివ్య నామావళులు' },
    kn: { title: 'ಅಷ್ಟೋತ್ತರ', sub: '108 ದಿವ್ಯ ನಾಮಾವಳಿಗಳು' },
    en: { title: 'Astothrams', sub: '108 divine names' },
    ta: { title: 'அஷ்டோத்திரம்', sub: '108 திருநாமங்கள்' },
    hi: { title: 'अष्टोत्तर', sub: '108 दिव्य नाम' },
  },
  stotras: {
    te: { title: 'దివ్య స్తోత్రాలు', sub: 'శక్తివంతమైన భక్తి స్తోత్రాలు' },
    kn: { title: 'ದಿವ್ಯ ಸ್ತೋತ್ರಗಳು', sub: 'ಶಕ್ತಿಶಾಲಿ ಭಕ್ತಿ ಸ್ತೋತ್ರಗಳು' },
    en: { title: 'Divine Stotras', sub: 'Sacred Hymns & Chants' },
    ta: { title: 'தெய்வீக ஸ்தோத்திரங்கள்', sub: 'சக்திவாய்ந்த பக்தி துதிகள்' },
    hi: { title: 'दिव्य स्तोत्र', sub: 'पावन भक्ति स्तोत्र' },
  },
  slokas: {
    te: { title: 'నిత్య శ్లోకాలు', sub: 'ధ్యాన శ్లోకాలు & అర్థాలు' },
    kn: { title: 'ನಿತ್ಯ ಶ್ಲೋಕಗಳು', sub: 'ಧ್ಯಾನ ಶ್ಲೋಕಗಳು & ಅರ್ಥಗಳು' },
    en: { title: 'Daily Slokas', sub: 'Verses for Meditation' },
    ta: { title: 'தினசரி ஸ்லோகங்கள்', sub: 'தியான ஸ்லோகங்கள் & பொருள்' },
    hi: { title: 'दैनिक श्लोक', sub: 'ध्यान श्लोक और अर्थ' },
  },
  songs: {
    te: { title: 'భజనలు & కీర్తనలు', sub: 'భక్తి గీతాలు & హారతులు' },
    kn: { title: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು', sub: 'ಭಕ್ತಿಗೀತೆಗಳು & ಆರತಿಗಳು' },
    en: { title: 'Bhajans & Songs', sub: 'Devotional Melodies' },
    ta: { title: 'பஜனைகள் & பாடல்கள்', sub: 'பக்திப் பாடல்கள் & ஆரத்திகள்' },
    hi: { title: 'भजन और कीर्तन', sub: 'भक्ति गीत और आरतियां' },
  },
  bhajans: {
    te: { title: 'భజనలు & కీర్తనలు', sub: 'భక్తి గీతాలు & హారతులు' },
    kn: { title: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು', sub: 'ಭಕ್ತಿಗೀತೆಗಳು & ಆರತಿಗಳು' },
    en: { title: 'Bhajans & Songs', sub: 'Devotional Melodies' },
    ta: { title: 'பஜனைகள் & பாடல்கள்', sub: 'பக்திப் பாடல்கள் & ஆரத்திகள்' },
    hi: { title: 'भजन और कीर्तन', sub: 'भक्ति गीत और आरतियां' },
  },
  'live-streams': {
    te: { title: 'ప్రత్యక్ష దర్శనం', sub: 'ఆలయ ప్రత్యక్ష ప్రసారాలు' },
    kn: { title: 'ನೇರ ದರ್ಶನ', sub: 'ದೇವಾಲಯ ನೇರ ಪ್ರಸಾರಗಳು' },
    en: { title: 'Live Darshan', sub: 'Daily Temple Streams' },
    ta: { title: 'நேரலை தரிசனம்', sub: 'கோயில் நேரலை ஒளிபரப்புகள்' },
    hi: { title: 'लाइव दर्शन', sub: 'मंदिर सीधा प्रसारण' },
  },
  live: {
    te: { title: 'ప్రత్యక్ష దర్శనం', sub: 'ఆలయ ప్రత్యక్ష ప్రసారాలు' },
    kn: { title: 'ನೇರ ದರ್ಶನ', sub: 'ದೇವಾಲಯ ನೇರ ಪ್ರಸಾರಗಳು' },
    en: { title: 'Live Darshan', sub: 'Daily Temple Streams' },
    ta: { title: 'நேரலை தரிசனம்', sub: 'கோயில் நேரலை ஒளிபரப்புகள்' },
    hi: { title: 'लाइव दर्शन', sub: 'मंदिर सीधा प्रसारण' },
  },
  panchangam: {
    te: { title: 'నిత్య పంచాంగం', sub: 'తిథి, నక్షత్రం & శుభ ముహూర్తాలు' },
    kn: { title: 'ದೈನಂದಿನ ಪಂಚಾಂಗ', sub: 'ತಿಥಿ, ನಕ್ಷತ್ರ & ಶುಭ ಮುಹೂರ್ತ' },
    en: { title: 'Panchangam', sub: 'Auspicious Timings' },
    ta: { title: 'தினசரி பஞ்சாங்கம்', sub: 'திதி, நட்சத்திரம் & சுப முகூர்த்தம்' },
    hi: { title: 'दैनिक पंचांग', sub: 'तिथि, नक्षत्र और शुभ मुहूर्त' },
  },
  festivals: {
    te: { title: 'ఆలయ పండుగలు', sub: 'వార్షిక ఉత్సవాలు & విశేషాలు' },
    kn: { title: 'ದೇವಾಲಯ ಹಬ್ಬಗಳು', sub: 'ವಾರ್ಷಿಕ ಹಬ್ಬಗಳು & ವಿಶೇಷಗಳು' },
    en: { title: 'Temple Festivals', sub: 'Annual Celebrations' },
    ta: { title: 'கோயில் திருவிழாக்கள்', sub: 'ஆண்டு விழாக்கள் & சிறப்புகள்' },
    hi: { title: 'मंदिर उत्सव', sub: 'वार्षिक उत्सव और व्रत' },
  },
  temples: {
    te: { title: 'పవిత్ర దేవాలయాలు', sub: 'పుణ్యక్షేత్రాలు & తీర్థయాత్రలు' },
    kn: { title: 'ಪವಿತ್ರ ದೇವಾಲಯಗಳು', sub: 'ಪುಣ್ಯಕ್ಷೇತ್ರಗಳು & ಯಾತ್ರೆಗಳು' },
    en: { title: 'Sacred Temples', sub: 'Shrines & Pilgrimages' },
    ta: { title: 'புனித திருக்கோயில்கள்', sub: 'திருத்தலங்கள் & யாத்திரைகள்' },
    hi: { title: 'पवित्र मंदिर', sub: 'तीर्थ स्थल और देवालय' },
  },
  donations: {
    te: { title: 'అన్నదాన సేవ', sub: 'నిత్యాన్నదానం & సేవా సహకారం' },
    kn: { title: 'ಅನ್ನದಾನ ಸೇವೆ', sub: 'ನಿತ್ಯಾನ್ನದಾನ & ಸೇವಾ ಸಹಕಾರ' },
    en: { title: 'Annadanam Seva', sub: 'Meal Offering & Seva' },
    ta: { title: 'அன்னதான சேவை', sub: 'அன்னதானம் & சேவைப் பங்களிப்பு' },
    hi: { title: 'अन्नदान सेवा', sub: 'महाप्रसाद एवं सेवा सहयोग' },
  },
  food: {
    te: { title: 'నేటి అన్నదానం', sub: 'ఆహార వితరణ కేంద్రాలు' },
    kn: { title: 'ಇಂದಿನ ಅನ್ನದಾನ', sub: 'ಆಹಾರ ವಿತರಣಾ ಕೇಂದ್ರಗಳು' },
    en: { title: 'Food Donation Today', sub: 'Today’s annadanam locations' },
    ta: { title: 'இன்றைய அன்னதானம்', sub: 'உணவு வழங்கும் இடங்கள்' },
    hi: { title: 'आज का अन्नदान', sub: 'भोजन वितरण केंद्र' },
  },
};

export default function CategoriesPage() {
  const { currentLanguage, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Server-side search and database fetch (no static/mock fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      setLoading(true);
      try {
        const queryParam = search.trim() 
          ? `?search=${encodeURIComponent(search.trim())}&lang=${currentLanguage}` 
          : `?lang=${currentLanguage}`;
        const res = await fetch(`${API_BASE_URL}/categories/services${queryParam}`);
        if (res.ok) {
          const result = await res.json();
          if (isMounted) {
            if (result && Array.isArray(result.data)) {
              setServicesList(result.data);
            } else {
              setServicesList([]);
            }
          }
        } else {
          if (isMounted) setServicesList([]);
        }
      } catch (err) {
        if (isMounted) {
          setServicesList([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchServices();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [search, currentLanguage]);

  return (
    <div className="sa-categories-page">
      {/* Devotional Watermark Background with Subtle Opacity */}
      <div className="sa-categories-bg-watermark" aria-hidden="true">
        <img
          src="/images/ayyappa-tiger-gold-bg.png"
          alt=""
          className="sa-categories-bg-watermark-img"
        />
      </div>

      {/* Decorative background container */}
      <div className="sa-categories-container">
        {/* Centered Heading Section matching Reference */}
        <header className="sa-cat-header">
          {/* Top golden lotus */}
          <div className="sa-cat-lotus-top">
            <img
              src="/images/home/heading-lotus-transparent.png"
              alt=""
              className="sa-cat-lotus-img"
              aria-hidden="true"
            />
          </div>

          {/* Eyebrow with diamond & flourish */}
          <div className="sa-cat-eyebrow">
            <span className="sa-cat-flourish">― ◆</span>
            <span className="sa-cat-eyebrow-text">{t('curatedEyebrow', 'SACRED KNOWLEDGE & SERVICE')}</span>
            <span className="sa-cat-flourish">◆ ―</span>
          </div>

          {/* Large Main Heading in Raleway 800 */}
          <h1 className="sa-cat-title">{t('servicesTitle', 'Devotional Services')}</h1>

          {/* Subtitle */}
          <p className="sa-cat-subtitle">
            {t('servicesDesc', 'Explore spiritual services, rituals and knowledge for Lord Ayyappa.')}
          </p>

          {/* Fine golden horizontal decorative divider */}
          <div className="sa-cat-divider" aria-hidden="true">
            <span className="sa-cat-divider-line"></span>
            <span className="sa-cat-divider-diamond">◆</span>
            <span className="sa-cat-divider-line"></span>
          </div>
        </header>

        {/* Large Centered Search Field with server-side query */}
        <div className="sa-cat-search-wrapper">
          <div className="sa-cat-search-box">
            <Icon name="Search" size={19} className="sa-cat-search-icon" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search pooja, stotra, sloka, song, temple...')}
              aria-label="Search devotional categories"
            />
            {search && (
              <button
                type="button"
                className="sa-cat-search-clear"
                aria-label="Clear search input"
                onClick={() => setSearch('')}
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Grid (3 columns, 4 rows: 3-3-3-2) matching approved previous style */}
        <div className="sa-cat-grid">
          {servicesList.map((service) => {
            const isFoodCard = service.id === 'food' || service.serviceId === 'food';
            const sKey = service.id || service.serviceId;
            const artworkSrc = service.artwork || categoryArtworkMap[service.id] || categoryArtworkMap[service.serviceId];
            const loc = serviceI18n[sKey]?.[currentLanguage] || serviceI18n[sKey]?.en;
            const displayTitle = loc?.title || service.title;
            const displaySub = loc?.sub || service.sub;

            const targetUrl = service.url;

            return (
              <Link
                to={targetUrl}
                key={service.id || service.serviceId}
                className={`sa-cat-card ${isFoodCard ? 'sa-cat-card-food' : ''}`}
                aria-label={`${displayTitle} - ${displaySub}`}
              >
                {/* 1. Left Medallion Icon with Divine Glyph */}
                <div className="sa-cat-card-medallion" aria-hidden="true">
                  <Icon name={service.icon || 'Sparkles'} size={22} />
                </div>

                {/* 2. Middle Information (Title + Subtitle) */}
                <div className="sa-cat-card-info">
                  <h3 className="sa-cat-card-title">{displayTitle}</h3>
                  <p className="sa-cat-card-sub">{displaySub}</p>
                </div>

                {/* 3. Devotional Line Artwork */}
                {artworkSrc && (
                  <div className="sa-cat-card-art-wrap" aria-hidden="true">
                    <img
                      src={artworkSrc}
                      alt=""
                      className="sa-cat-card-art"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* 4. Navigation Circle Arrow */}
                <div className="sa-cat-card-arrow-circle" aria-hidden="true">
                  <Icon name="ArrowRight" size={14} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State when search has no matches from database */}
        {!loading && servicesList.length === 0 && (
          <div className="sa-cat-empty-state" role="status">
            <Icon name="Search" size={32} />
            <p>No devotional categories found matching "{search}".</p>
            <button
              type="button"
              className="sa-cat-reset-btn"
              onClick={() => setSearch('')}
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Bottom Scenic Landscape Illustration Layer */}
      <div className="sa-cat-scenery-bottom" aria-hidden="true">
        <img
          src="/images/categories/cat-decor-bottom.png"
          alt=""
          className="sa-cat-scenery-img"
        />
      </div>
    </div>
  );
}
