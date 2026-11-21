import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { API_BASE_URL } from './apiConfig';
import DeitySelectionModal, { DEFAULT_DEITIES_LIST } from './DeitySelectionModal';
import AppDownloadModal from './AppDownloadModal';
import { DEFAULT_CHILDREN } from './defaultScriptures';
import './devotionalCategoryPage.css';

// Image CDN origin — webp thumbnails live on the main website domain
const MEDIA_ORIGIN = 'https://saranamayyappa.in';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

const CARD_REFERENCE_ARTWORKS = [
  '/images/pooja/pooja-card-1-ref.png',
  '/images/pooja/pooja-card-2-ref.png',
  '/images/pooja/pooja-card-3-ref.png',
  '/images/pooja/pooja-card-4-ref.png',
  '/images/pooja/pooja-card-5-ref.png',
  '/images/pooja/pooja-card-6-ref.png',
];

export function resolveCardArtwork(slug = '', title = '', deityId = '', index = 0) {
  const s = `${slug} ${title}`.toLowerCase();
  if (s.includes('ganapa') || s.includes('vinayak') || s.includes('vignesh') || s.includes('గణప') || s.includes('వినాయక') || s.includes('విఘ్నే') || s.includes('గణేశ') || deityId === 'ganesha') {
    return '/images/pooja/card-banner-ganapathi-hd.png';
  }
  if (s.includes('gomatha') || s.includes('గోమాత') || s.includes('కామధేను')) {
    return '/images/pooja/pooja-card-5-ref.png';
  }
  if (s.includes('subrahmanya') || s.includes('murugan') || s.includes('kartikeya') || s.includes('సుబ్రహ్మణ్య') || s.includes('మురుగన్') || deityId === 'murugan') {
    return CARD_REFERENCE_ARTWORKS[1];
  }
  if (s.includes('devi') || s.includes('lakshmi') || s.includes('durga') || s.includes('lalitha') || s.includes('దేవి') || s.includes('లక్ష్మి') || s.includes('దుర్గ') || s.includes('మాళికాపురత్తమ్మ') || deityId === 'devi') {
    return '/images/pooja/card-banner-lakshmi-hd.png';
  }
  if (s.includes('harathi') || s.includes('deepa') || s.includes('diya') || s.includes('హారతి') || s.includes('దీప')) {
    return CARD_REFERENCE_ARTWORKS[3];
  }
  if (s.includes('ayyap') || s.includes('sastha') || s.includes('అయ్యప్ప') || s.includes('శాస్తా') || s.includes('శరణు') || deityId === 'ayyappa') {
    return '/images/pooja/card-banner-ayyappa-hd.png';
  }
  if (s.includes('venkat') || s.includes('vishnu') || s.includes('satyanarayana') || s.includes('వేంకట') || s.includes('విష్ణు') || s.includes('సత్యనారాయణ') || deityId === 'venkateswara') {
    return CARD_REFERENCE_ARTWORKS[2];
  }
  if (s.includes('shiva') || s.includes('linga') || s.includes('rudra') || s.includes('శివ') || s.includes('లింగ') || deityId === 'shiva') {
    return CARD_REFERENCE_ARTWORKS[0];
  }
  if (s.includes('abhisheka') || s.includes('kalasha') || s.includes('poorvaangamu') || s.includes('పూర్వాంగ')) {
    return CARD_REFERENCE_ARTWORKS[5];
  }
  return CARD_REFERENCE_ARTWORKS[index % CARD_REFERENCE_ARTWORKS.length];
}

// Category Configurations for All 4 Devotional Sections
export const DEVOTIONAL_CATEGORIES = {
  pooja: {
    id: 'pooja',
    dbParentId: '113',       // DB category id for Pooja Vidhanam
    route: '/subcategories',
    title: 'Pooja Vidhanam',
    breadcrumb: 'Pooja Vidhanam',
    subtitle: 'Traditional worship procedures, required materials and sacred chants.',
    searchPlaceholder: 'Search poojas, vrathams, or rituals...',
    iconName: 'Flame',
    tabLabel: 'Pooja Vidhanam',
    defaultTag: 'Daily',
  },
  stotras: {
    id: 'stotras',
    dbParentId: '114',       // DB category id for Divine Stotras
    route: '/stotras',
    title: 'Divine Stotras',
    breadcrumb: 'Divine Stotras',
    subtitle: 'Sacred hymns and divine praises dedicated to your chosen deity.',
    searchPlaceholder: 'Search divine stotras...',
    iconName: 'BookOpen',
    tabLabel: 'Divine Stotras',
    defaultTag: 'Daily',
  },
  slokas: {
    id: 'slokas',
    dbParentId: '115',       // DB category id for Daily Slokas
    route: '/slokas',
    title: 'Daily Slokas',
    breadcrumb: 'Daily Slokas',
    subtitle: 'Daily Sanskrit and regional-language verses for prayer and spiritual practice.',
    searchPlaceholder: 'Search daily slokas...',
    iconName: 'Sun',
    tabLabel: 'Daily Slokas',
    defaultTag: 'Daily',
  },
  songs: {
    id: 'songs',
    dbParentId: '116',       // DB category id for Bhajans & Songs
    route: '/songs',
    title: 'Bhajans & Songs',
    breadcrumb: 'Bhajans & Songs',
    subtitle: 'Devotional melodies, sacred songs and bhajans for every moment of worship.',
    searchPlaceholder: 'Search bhajans, songs, or artists...',
    iconName: 'Music',
    tabLabel: 'Bhajans & Songs',
    defaultTag: 'Popular',
  },
};

// Filter Pills Matching Reference Design Exactly
const FILTER_PILLS = [
  { label: 'All', icon: null },
  { label: 'Beginner', icon: 'Leaf' },
  { label: 'Festival', icon: 'Calendar' },
  { label: 'Daily', icon: 'Sun' },
  { label: 'Popular', icon: 'Flame' },
];

// Helper to reliably resolve Deity ID from slug/title
export function resolveDeityId(slug = '', title = '', serverDeityId = '') {
  if (serverDeityId && serverDeityId !== 'all' && serverDeityId !== '') {
    const s = serverDeityId.toLowerCase().replace(/^(lord-|goddess-)/, '');
    if (s.includes('ayyap') || s.includes('sastha') || s.includes('అయ్యప్ప') || s.includes('శాస్త')) return 'ayyappa';
    if (s.includes('shiv') || s.includes('linga') || s.includes('bilva') || s.includes('శివ') || s.includes('ఈశ్వర')) return 'shiva';
    if (s.includes('venkat') || s.includes('vishnu') || s.includes('achyuta') || s.includes('koodalmanikya') || s.includes('వేంకట') || s.includes('విష్ణు')) return 'venkateswara';
    if (s.includes('ganesh') || s.includes('vignesh') || s.includes('vinayak') || s.includes('ganapath') || s.includes('గణప') || s.includes('వినాయక')) return 'ganesha';
    if (s.includes('devi') || s.includes('durga') || s.includes('lakshmi') || s.includes('lalitha') || s.includes('kanaka') || s.includes('gomatha') || s.includes('దేవి') || s.includes('లక్ష్మి') || s.includes('గోమాత')) return 'devi';
    if (s.includes('hanuman') || s.includes('anjaneya') || s.includes('హనుమాన్') || s.includes('ఆంజనేయ')) return 'hanuman';
    if (s.includes('subrahmanya') || s.includes('murugan') || s.includes('kartikeya') || s.includes('saravana') || s.includes('సుబ్రహ్మణ్య') || s.includes('మురుగన్')) return 'murugan';
    return s;
  }
  const str = `${slug} ${title}`.toLowerCase();
  if (/ganesh|vignesh|vinayak|ganapath|modak|గణపతి|వినాయక|విఘ్నేశ్వర|గణేశ|గణప|మోదక/.test(str)) return 'ganesha';
  if (/devi|durga|lakshmi|lalitha|kanakadhara|mahalakshmi|meenakshi|kamakshi|saraswathi|gomatha|kamadhenu|దేవి|లక్ష్మి|దుర్గ|లలిత|సరస్వతి|గోమాత|కామధేను|వరలక్ష్మి|మాళికాపురత్తమ్మ/.test(str)) return 'devi';
  if (/ayyap|sastha|harivarasanam|shabarimala|uthara|sannidhanam|padi|maaladharan|sharanu|harathi|అయ్యప్ప|శాస్తా|శాస్త|శబరిమల|మాలాధారణ|హరివరాసనం|శరణం|హారతి|ఇరుముడి|పడి/.test(str)) return 'ayyappa';
  if (/shiva|linga|bilva|rudra|natara|mrityunjaya|శివ|లింగ|బిల్వ|రుద్ర|మృత్యుంజయ|ఈశ్వర|కేదారేశ్వర|నటరాజ/.test(str)) return 'shiva';
  if (/venkates|vishnu|koodalmanikya|achyuta|govinda|narayana|perumal|satyanarayana|వేంకట|వెంకట|విష్ణు|సత్యనారాయణ|గోవింద|నారాయణ|శ్రీనివాస/.test(str)) return 'venkateswara';
  if (/hanuman|anjaneya|maruti|bajrang|sundarakanda|హనుమాన్|ఆంజనేయ|మారుతి|రామదూత/.test(str)) return 'hanuman';
  if (/subrahmanya|murugan|kartikeya|saravana|shanmukha|vel|skanda|సుబ్రహ్మణ్య|మురుగన్|కార్తికేయ|షణ్ముఖ|స్కంద/.test(str)) return 'murugan';
  return 'all';
}

/**
 * DevotionalCategoryPage
 * Master Reusable Template for all 4 Devotional Pages:
 * 1. Pooja Vidhanam
 * 2. Divine Stotras
 * 3. Daily Slokas
 * 4. Bhajans & Songs
 * Exact 1:1 reproduction of the approved gold-and-emerald temple-sunrise master design.
 */
export default function DevotionalCategoryPage({ category = 'pooja' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage = 'en', t } = useLanguage();

  const activeCategory = DEVOTIONAL_CATEGORIES[category] ? category : 'pooja';
  const config = DEVOTIONAL_CATEGORIES[activeCategory];

  // 1. Deity Preference Persistence (Shared Across All 4 Sections)
  const [selectedDeity, setSelectedDeity] = useState(() => {
    const fromUrl = new URLSearchParams(location.search).get('god');
    if (fromUrl) return fromUrl;
    try {
      return (
        localStorage.getItem('sa_selected_deity') ||
        localStorage.getItem('sa-selected-god') ||
        'shiva' // Matches master reference default
      );
    } catch {
      return 'shiva';
    }
  });

  // Keep deity synced with URL param if provided
  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get('god');
    if (fromUrl && fromUrl !== selectedDeity) {
      setSelectedDeity(fromUrl);
    }
  }, [location.search]);

  // Modal Visibility State
  const [isDeityModalOpen, setIsDeityModalOpen] = useState(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('selectDeity') === 'true' || location.state?.openDeityModal) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  // App Download Modal State (When user clicks a subcategory or type)
  const [downloadModalItem, setDownloadModalItem] = useState(null);

  const handleCardClick = (item) => {
    const s = (item.slug || '').toLowerCase();
    const rawId = String(item.rawId || item.id || '');
    const hasMultipleTypes = Boolean(
      (item.children && item.children.length > 0) ||
      DEFAULT_CHILDREN[s] ||
      DEFAULT_CHILDREN[rawId] ||
      /ganapa|vignesh|subramanya|subrahmanya|ashtottara|ashtothram|satyanarayana|varalakshmi|kedareswara|vinayaka/.test(s)
    );

    if (hasMultipleTypes) {
      // Allow viewing the subcategories / Types list
      navigate(
        `/subcategory-detail?id=${encodeURIComponent(
          item.slug
        )}&category=${activeCategory}&god=${encodeURIComponent(
          selectedDeity
        )}`
      );
    } else {
      // Show App Download Popup directly (no full-page redirect)
      setDownloadModalItem(item.titleTelugu || item.title || item.name || 'Devotional Services');
    }
  };

  // Watch for direct category clicks that request deity selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('selectDeity') === 'true' || location.state?.openDeityModal) {
      setIsDeityModalOpen(true);
    }
  }, [location.search, location.state, activeCategory]);

  const handleSelectDeity = (deityId) => {
    setSelectedDeity(deityId);
    try {
      localStorage.setItem('sa_selected_deity', deityId);
      localStorage.setItem('sa-selected-god', deityId);
      localStorage.setItem('selected_deity', deityId);
      sessionStorage.setItem(`sa_deity_confirmed_${activeCategory}`, 'true');
    } catch {}
  };

  const handleCloseModal = () => {
    setIsDeityModalOpen(false);
  };

  // 2. Fetch Devotional Content from DB via API with Server-side Search & Filtering
  const [dbItems, setDbItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Debounce search input for clean server-side query dispatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const fetchContent = async () => {
      try {
        // Primary: use the confirmed-working numeric parentId from DB
        const dbParentId = config.dbParentId || activeCategory;
        let endpoint = `${API_BASE_URL}/admin/subcategories?parentId=${dbParentId}&lang=${currentLanguage}&limit=100`;
        if (debouncedSearch && debouncedSearch.trim()) {
          endpoint += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
        }

        let res = await fetch(endpoint);
        let json = await res.json().catch(() => null);

        // Fallback: use slug-based parentId
        if (!json || !Array.isArray(json.data) || json.data.length === 0) {
          let fallbackEndpoint = `${API_BASE_URL}/admin/subcategories?parentId=${activeCategory}&lang=${currentLanguage}&limit=100`;
          if (debouncedSearch && debouncedSearch.trim()) fallbackEndpoint += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
          res = await fetch(fallbackEndpoint);
          json = await res.json().catch(() => null);
        }

        // Second fallback: legacy categories endpoint
        if (!json || !Array.isArray(json.data) || json.data.length === 0) {
          let legacyEndpoint = `${API_BASE_URL}/categories/subcategories?parent=${activeCategory}&lang=${currentLanguage}&limit=100`;
          res = await fetch(legacyEndpoint);
          json = await res.json().catch(() => null);
        }

        if (!isCancelled && json && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((item, idx) => {
            const rawSlug = item.slug || String(item.id);
            const titleFormatted = item.title && item.title !== rawSlug
              ? item.title
              : rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

            const deityResolved = resolveDeityId(rawSlug, titleFormatted, item.deityId);

            return {
              id: rawSlug,
              rawId: item.id,
              slug: rawSlug,
              title: titleFormatted,
              desc: item.description || item.desc || `Complete sacred verses, meaning and guidance for ${titleFormatted}.`,
              duration: item.duration || '10 minutes',
              stepsCount: item.stepsCount || '16 Steps',
              badge: item.badge || 'Daily',
              badgeClass: item.badgeClass || 'badge-daily',
              filterTag: item.filterTag || 'Daily',
              type: item.type || (activeCategory === 'pooja' ? 'Pooja' : 'Stotra'),
              image: (() => {
                if (item.imageUrl && !item.imageUrl.includes('.webp')) {
                  if (item.imageUrl.startsWith('http')) return item.imageUrl;
                  if (item.imageUrl.startsWith('/uploads')) return `${MEDIA_ORIGIN}${item.imageUrl}`;
                  if (item.imageUrl.startsWith('/images')) return item.imageUrl;
                  return item.imageUrl;
                }
                return resolveCardArtwork(rawSlug, titleFormatted, deityResolved, idx);
              })(),
              deityId: deityResolved,
              deityName: item.deityName || (
                deityResolved === 'ganesha' ? 'Lord Ganesha' :
                deityResolved === 'ayyappa' ? 'Lord Ayyappa' :
                deityResolved === 'devi' ? 'Goddess Lakshmi / Devi' :
                deityResolved === 'shiva' ? 'Lord Shiva' :
                deityResolved === 'murugan' ? 'Lord Murugan' :
                deityResolved === 'venkateswara' ? 'Lord Venkateswara' :
                deityResolved === 'hanuman' ? 'Lord Hanuman' :
                'Devotional'
              ),
              deityIcon: (
                deityResolved === 'ganesha' ? '🐘' :
                deityResolved === 'ayyappa' ? '🕉️' :
                deityResolved === 'devi' ? '🌸' :
                deityResolved === 'shiva' ? '🔱' :
                deityResolved === 'murugan' ? '🦚' :
                deityResolved === 'venkateswara' ? '🪷' :
                deityResolved === 'hanuman' ? '🚩' :
                '🕉️'
              ),
            };
          });

          // Strict unique filter by unique slug / id (preserves all distinct database subcategories)
          const seenSlugs = new Set();
          const uniqueItems = [];

          for (const item of mapped) {
            const keySlug = (item.slug || String(item.id || '')).trim().toLowerCase();
            if (seenSlugs.has(keySlug)) {
              continue;
            }
            if (keySlug) seenSlugs.add(keySlug);
            uniqueItems.push(item);
          }

          setDbItems(uniqueItems);
        } else if (!isCancelled) {
          setDbItems([]);
        }
      } catch (err) {
        console.warn('Failed to fetch content from database via API:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchContent();
    return () => {
      isCancelled = true;
    };
  }, [activeCategory, currentLanguage, selectedDeity, debouncedSearch, activeFilter]);

  // 3. Devotional Cards list (Direct from DB Server-side filtered response)
  const filteredCards = useMemo(() => {
    return dbItems;
  }, [dbItems]);

  // Current Deity Object for Avatar & Name
  const currentDeityObj = useMemo(() => {
    return (
      DEFAULT_DEITIES_LIST.find((d) => d.id === selectedDeity || d.slug === selectedDeity) || {
        id: 'shiva',
        name: 'Lord Shiva',
        image: '/images/deities/lord_shiva.png',
      }
    );
  }, [selectedDeity]);

  // Handle Tab Switch (Preserves Selected Deity)
  const handleTabClick = (tabKey) => {
    const targetConfig = DEVOTIONAL_CATEGORIES[tabKey];
    if (targetConfig) {
      navigate(`${targetConfig.route}?god=${encodeURIComponent(selectedDeity)}`);
    }
  };

  return (
    <div className="sa-dev-page">
      {/* ── 1. SACRED TEMPLE SUNRISE HERO SECTION ── */}
      <section className="sa-dev-hero" aria-label="Devotional Header">
        {/* Background Artwork: Sacred Sunrise, Mountain & Temple Architecture */}
        <div className="sa-dev-hero-bg-wrap" aria-hidden="true">
          <img
            src="/images/pooja/sacred-temple-hero-bg.png"
            alt=""
            className="sa-dev-hero-bg-img"
          />
        </div>

        {/* Hanging Brass Lamp on Left */}
        <div className="sa-dev-hanging-lamp-left" aria-hidden="true">
          <svg viewBox="0 0 40 160" className="lamp-svg">
            <line x1="20" y1="0" x2="20" y2="100" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3,2" />
            <circle cx="20" cy="102" r="3.5" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
            <path d="M10,108 L30,108 L26,118 L14,118 Z" fill="#D4AF37" />
            <ellipse cx="20" cy="130" rx="16" ry="6" fill="#D4AF37" />
            <path d="M20,128 Q15,116 20,104 Q25,116 20,128 Z" fill="#FFB703" />
            <circle cx="20" cy="120" r="2.5" fill="#FFF275" />
            <line x1="20" y1="136" x2="20" y2="152" stroke="#C5A059" strokeWidth="1.5" />
            <circle cx="20" cy="154" r="3" fill="#D4AF37" />
          </svg>
        </div>

        <div className="sa-dev-hero-inner">
          {/* Centered Breadcrumb */}
          <nav className="sa-dev-breadcrumb" aria-label="Breadcrumb">
            <Link to="/home" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-sep">&gt;</span>
            <Link to="/categories" className="breadcrumb-link">
              Devotional Services
            </Link>
            <span className="breadcrumb-sep">&gt;</span>
            <span className="breadcrumb-current">{config.breadcrumb}</span>
          </nav>

          {/* Large Title with Flanking Golden Lotuses */}
          <div className="sa-dev-title-wrap">
            <div className="sa-dev-lotus-ornament left" aria-hidden="true">
              <img
                src="/images/pooja/gold-lotus-ornament.png"
                alt=""
                className="lotus-ornament-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <h1 className="sa-dev-hero-title">{config.title}</h1>
            <div className="sa-dev-lotus-ornament right" aria-hidden="true">
              <img
                src="/images/pooja/gold-lotus-ornament.png"
                alt=""
                className="lotus-ornament-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Subtitle */}
          <p className="sa-dev-hero-subtitle">{config.subtitle}</p>

          {/* Golden Horizontal Flourish Divider */}
          <div className="sa-dev-hero-flourish" aria-hidden="true">
            <span className="flourish-line left"></span>
            <span className="flourish-diamond">❖</span>
            <span className="flourish-line right"></span>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER (PADDED 1200PX MAX WIDTH) ── */}
      <main className="sa-dev-container">
        {/* ── 2. SELECTED DEITY BAR (ROUNDED HORIZONTAL CREAM PANEL) ── */}
        <section className="sa-dev-selected-deity-bar" aria-label="Selected Deity Selector">
          <div className="deity-bar-left">
            <span className="deity-bar-lotus-icon" aria-hidden="true">🪷</span>
            <span className="deity-bar-label">Selected Deity</span>

            {/* Circular Deity Avatar with Gold Border */}
            <div className="deity-bar-avatar-wrap" aria-hidden="true">
              <img
                src={currentDeityObj.image || '/images/deities/lord_shiva.png'}
                alt={currentDeityObj.name}
                className="deity-bar-avatar"
                onError={(e) => { e.target.src = '/images/deities/ayyappa.jpg'; }}
              />
            </div>

            {/* Dark Green Dropdown Pill Button */}
            <button
              type="button"
              className="deity-bar-dropdown-pill"
              onClick={() => setIsDeityModalOpen(true)}
              title="Click to switch God / Goddess"
              aria-label={`Current deity: ${currentDeityObj.name}. Click to change.`}
            >
              <span>{currentDeityObj.name}</span>
              <Icon name="ChevronDown" size={15} className="dropdown-arrow" />
            </button>
          </div>

          <div className="deity-bar-right">
            {/* Change Deity Button */}
            <button
              type="button"
              className="deity-bar-btn-change"
              onClick={() => setIsDeityModalOpen(true)}
              title="Change your chosen God or Goddess"
            >
              <Icon name="Repeat" size={15} className="change-icon" />
              <span>Change Deity</span>
            </button>
          </div>
        </section>

        {/* ── 3. FOUR LARGE DEVOTIONAL CATEGORY NAVIGATION CARDS (TABS) ── */}
        <nav className="sa-dev-category-tabs" aria-label="Devotional Category Sections">
          {Object.values(DEVOTIONAL_CATEGORIES).map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                className={`sa-dev-tab-card ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(cat.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Switch to ${cat.title}`}
              >
                {/* Gold Category Icon */}
                <div className="tab-card-icon" aria-hidden="true">
                  {cat.id === 'pooja' && (
                    <svg viewBox="0 0 32 32" className="gold-tab-svg">
                      <path d="M16,6 Q12,14 16,20 Q20,14 16,6 Z" fill="#D4AF37" />
                      <ellipse cx="16" cy="22" rx="11" ry="3.5" fill="#C5A059" />
                      <path d="M8,22 Q16,28 24,22" fill="#D4AF37" />
                    </svg>
                  )}
                  {cat.id === 'stotras' && (
                    <svg viewBox="0 0 32 32" className="gold-tab-svg">
                      <path d="M6,8 Q16,11 16,24 Q16,11 26,8 L26,22 Q16,25 16,24 Q16,25 6,22 Z" fill="#D4AF37" />
                    </svg>
                  )}
                  {cat.id === 'slokas' && (
                    <span className="tab-om-symbol">ॐ</span>
                  )}
                  {cat.id === 'songs' && (
                    <svg viewBox="0 0 32 32" className="gold-tab-svg">
                      <path d="M12,22 A4,4 0 1,1 8,18 L8,8 L22,5 L22,17 A4,4 0 1,1 18,13 L18,7 L12,8 Z" fill="#D4AF37" />
                    </svg>
                  )}
                </div>

                {/* Tab Label */}
                <span className="tab-card-title">{cat.tabLabel}</span>

                {/* Downward Triangular Pointer for Active Tab (Matches Reference Exactly) */}
                {isActive && <div className="tab-active-pointer" aria-hidden="true"></div>}
              </button>
            );
          })}
        </nav>

        {/* ── 4. SEARCH & FILTER CONTROLS ── */}
        <section className="sa-dev-controls-bar" aria-label="Search and Filter Content">
          {/* Wide Rounded Search Bar */}
          <div className="sa-dev-search-wrap">
            <Icon name="Search" size={17} className="search-icon" />
            <input
              type="text"
              className="sa-dev-search-input"
              placeholder={config.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={config.searchPlaceholder}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search query"
              >
                <Icon name="X" size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="sa-dev-filters-row" role="tablist" aria-label="Filter category items">
            {FILTER_PILLS.map((pill) => {
              const isPillActive = activeFilter === pill.label;
              return (
                <button
                  key={pill.label}
                  type="button"
                  className={`sa-dev-filter-pill ${isPillActive ? 'active' : ''}`}
                  onClick={() => setActiveFilter(pill.label)}
                  role="tab"
                  aria-selected={isPillActive}
                >
                  {pill.icon && (
                    <Icon name={pill.icon} size={14} className="filter-pill-icon" />
                  )}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 5. FOUR-COLUMN DEVOTIONAL CONTENT GRID ── */}
        <section className="sa-dev-grid-section" aria-label="Devotional Items">
          {loading && (
            <div className="sa-dev-loading-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="sa-dev-card skeleton-card">
                  <div className="skeleton-thumb"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line desc"></div>
                    <div className="skeleton-line chips"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredCards.length > 0 && (
            <div className="sa-dev-cards-grid">
              {filteredCards.map((item, idx) => (
                <article
                  key={item.id}
                  className="sa-dev-card"
                  onClick={() => handleCardClick(item)}
                >
                  {/* Top Image (16:9 Devotional Artwork) */}
                  <div className="sa-dev-card-image-wrap">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="sa-dev-card-image"
                      loading="lazy"
                      onError={(e) => {
                        const fallback = resolveCardArtwork(item.slug, item.title, item.deityId, idx) || CARD_REFERENCE_ARTWORKS[idx % CARD_REFERENCE_ARTWORKS.length];
                        if (e.target.src !== fallback) {
                          e.target.src = fallback;
                        }
                      }}
                    />
                  </div>

                  {/* Card Content Information */}
                  <div className="sa-dev-card-body">
                    <h2 className="sa-dev-card-title">{item.title}</h2>
                    <p className="sa-dev-card-desc">{item.desc}</p>

                    {/* Metadata Pills Row (Deity Emblem + Daily/Festival Badge) */}
                    <div className="sa-dev-card-chips-row">
                      <span className="card-chip deity-chip">
                        <span className="chip-icon">{item.deityIcon || '🕉️'}</span>
                        <span>{item.deityName}</span>
                      </span>

                      <span className="card-chip time-chip">
                        <Icon name="Calendar" size={12} className="chip-icon" />
                        <span>{item.badge}</span>
                      </span>
                    </div>

                    {/* Card Footer: Duration, Steps Count & Emerald Action Button */}
                    <div className="sa-dev-card-footer">
                      <div className="card-meta-left">
                        <div className="meta-metric duration">
                          <Icon name="Clock" size={13} className="meta-icon" />
                          <span>{item.duration}</span>
                        </div>
                        <div className="meta-metric steps">
                          <Icon name="FileText" size={13} className="meta-icon" />
                          <span>{item.stepsCount}</span>
                        </div>
                      </div>

                      <div
                        className="card-action-btn"
                        role="button"
                        aria-label={`View details for ${item.title}`}
                      >
                        <Icon name="ArrowRight" size={14} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State when No Content Exists for Selected Deity */}
          {!loading && filteredCards.length === 0 && (
            <div className="sa-dev-empty-state">
              <span className="empty-diya-icon">🕉️</span>
              <h3 className="empty-title">
                No devotional content is available for {currentDeityObj.name} in this section yet.
              </h3>
              <p className="empty-desc">
                You can explore content across all deities or choose another God or Goddess.
              </p>
              <div className="empty-actions-row">
                <button
                  type="button"
                  className="empty-btn-all"
                  onClick={() => handleSelectDeity('all')}
                >
                  View All Deities
                </button>
                <button
                  type="button"
                  className="empty-btn-change"
                  onClick={() => setIsDeityModalOpen(true)}
                >
                  Choose Another Deity
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── 6. BOTTOM SACRED GOLDEN EMBROIDERED ORNAMENTAL STRIP ── */}
      <div className="sa-dev-bottom-gold-band" aria-hidden="true">
        <svg viewBox="0 0 1200 16" className="gold-band-svg" preserveAspectRatio="none">
          <pattern id="sacred-band-pat" x="0" y="0" width="40" height="16" patternUnits="userSpaceOnUse">
            <path d="M20,0 L24,8 L20,16 L16,8 Z" fill="#D4AF37" />
            <circle cx="20" cy="8" r="1.5" fill="#FFE49E" />
            <line x1="0" y1="8" x2="16" y2="8" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="24" y1="8" x2="40" y2="8" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2,2" />
          </pattern>
          <rect x="0" y="0" width="100%" height="16" fill="url(#sacred-band-pat)" />
        </svg>
      </div>

      {/* ── 7. APPROVED CHOOSE YOUR GOD / GODDESS SELECTION POPUP ── */}
      <DeitySelectionModal
        isOpen={isDeityModalOpen}
        onClose={handleCloseModal}
        currentDeityId={selectedDeity}
        targetPageTitle={config.title}
        onSelectDeity={(deity) => {
          handleSelectDeity(deity.id);
          handleCloseModal();
        }}
      />
      {/* ── 8. APP DOWNLOAD POPUP MODAL (When clicking subcategories) ── */}
      <AppDownloadModal
        isOpen={Boolean(downloadModalItem)}
        onClose={() => setDownloadModalItem(null)}
        itemTitle={downloadModalItem}
      />
    </div>
  );
}
