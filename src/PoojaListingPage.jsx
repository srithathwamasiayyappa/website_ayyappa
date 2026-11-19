import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as L from 'lucide-react';
import './poojaListing.css';
import './devotionalCleanList.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

// Subcategory configurations for each devotional domain
export const subcategoryConfigs = {
  pooja: {
    title: 'Pooja Vidhanam',
    subtitle: 'Traditional worship procedures, required materials and sacred chants.',
    breadcrumb: 'POOJA VIDHANAM',
    badgeCount: '6 Sacred Guides',
    searchPlaceholder: 'Search poojas, vrathams, or rituals...',
    filterChips: [
      { label: 'All', icon: 'Sparkles' },
      { label: 'Beginner', icon: 'UserCheck' },
      { label: 'Festival', icon: 'CalendarDays' },
      { label: 'Ayyappa', icon: 'Mountain' },
      { label: 'Daily', icon: 'Sun' },
      { label: 'Popular', icon: 'Flame' },
    ],
    infoLeft: 'Choose a pooja to view materials, steps, chants and timing.',
    infoRight: 'Includes: materials, procedure, mantrā, benefits',
    detailBase: '/pooja-detail',
    items: [
      {
        id: 'ayyappa-pooja',
        title: 'Ayyappa Pooja Vidhanam',
        desc: 'Complete step-by-step worship procedure',
        duration: '25 minutes',
        badge: 'Beginner',
        badgeClass: 'badge-beginner',
        type: 'Pooja',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Ayyappa',
        popularity: 100,
        durationMinutes: 25,
      },
      {
        id: 'mandala-pooja',
        title: 'Mandala Pooja',
        desc: 'Daily devotion during Mandala season',
        duration: '40 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Festival',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Festival',
        popularity: 95,
        durationMinutes: 40,
      },
      {
        id: 'makaravilakku-pooja',
        title: 'Makaravilakku Pooja',
        desc: 'Special festival rituals and offerings',
        duration: '35 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Festival',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Festival',
        popularity: 90,
        durationMinutes: 35,
      },
      {
        id: 'vratham-vidhanam',
        title: 'Vratham Vidhanam',
        desc: 'Preparation, observance and practices',
        duration: '15 minutes',
        badge: 'Beginner',
        badgeClass: 'badge-beginner',
        type: 'Vratham',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Beginner',
        popularity: 85,
        durationMinutes: 15,
      },
      {
        id: 'ganapathi-pooja',
        title: 'Ganapathi Pooja',
        desc: 'Traditional prayers before auspicious beginnings',
        duration: '20 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Pooja',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Daily',
        popularity: 88,
        durationMinutes: 20,
      },
      {
        id: 'lakshmi-pooja',
        title: 'Lakshmi Pooja',
        desc: 'Worship procedure for wealth, prosperity and harmony',
        duration: '30 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Pooja',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Popular',
        popularity: 98,
        durationMinutes: 30,
      },
    ],
  },
  stotras: {
    title: 'Astothrams & Stotras',
    subtitle: 'Sacred 108 names, thousand divine praises and timeless devotional hymns.',
    breadcrumb: 'ASTOTHRAMS & STOTRAS',
    badgeCount: '6 Sacred Hymns',
    searchPlaceholder: 'Search astothrams, sahasranamam, or stotras...',
    filterChips: [
      { label: 'All', icon: 'Sparkles' },
      { label: 'Astothram', icon: 'Flower2' },
      { label: 'Sahasranamam', icon: 'BookOpen' },
      { label: 'Ayyappa', icon: 'Mountain' },
      { label: 'Daily', icon: 'Sun' },
      { label: 'Popular', icon: 'Flame' },
    ],
    infoLeft: 'Choose an astothram or stotra to view sacred verses and chanting guidance.',
    infoRight: 'Includes: sanskrit slokas, transliteration, audio, spiritual benefits',
    detailBase: '/sloka-detail',
    items: [
      {
        id: 'ayyappa-ashtothram',
        title: 'Sri Ayyappa Ashtothram',
        desc: '108 sacred names chanted during daily pooja and vratham',
        duration: '15 minutes',
        badge: 'Beginner',
        badgeClass: 'badge-beginner',
        type: 'Astothram',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Astothram',
        popularity: 100,
        durationMinutes: 15,
      },
      {
        id: 'ayyappa-sahasranamam',
        title: 'Sri Ayyappa Sahasranamam',
        desc: '1,000 divine names reciting the glory and virtues of Lord Sastha',
        duration: '45 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Sahasranamam',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Sahasranamam',
        popularity: 95,
        durationMinutes: 45,
      },
      {
        id: 'ayyappa-stotram',
        title: 'Sri Ayyappa Stotram',
        desc: 'Powerful daily hymn for protection, spiritual strength and grace',
        duration: '12 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Stotram',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Daily',
        popularity: 92,
        durationMinutes: 12,
      },
      {
        id: 'harivarasanam-stotra',
        title: 'Harivarasanam Viswamohanam',
        desc: 'The eternal bedtime lullaby and sacred hymn of Sabarimala',
        duration: '8 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Stotram',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Popular',
        popularity: 99,
        durationMinutes: 8,
      },
      {
        id: 'vishnu-sahasranamam',
        title: 'Vishnu Sahasranamam',
        desc: 'Traditional thousand sacred names of Maha Vishnu for peace and health',
        duration: '35 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Sahasranamam',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Sahasranamam',
        popularity: 96,
        durationMinutes: 35,
      },
      {
        id: 'lalitha-sahasranamam',
        title: 'Sri Lalitha Sahasranamam',
        desc: 'Sacred hymn praising the divine mother Lalitha Tripura Sundari',
        duration: '40 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Sahasranamam',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Sahasranamam',
        popularity: 94,
        durationMinutes: 40,
      },
    ],
  },
  slokas: {
    title: 'Sacred Slokas',
    subtitle: 'Daily invocations, powerful mantras and spiritual verses with meanings.',
    breadcrumb: 'SACRED SLOKAS',
    badgeCount: '6 Divine Slokas',
    searchPlaceholder: 'Search slokas, mantras, or divine verses...',
    filterChips: [
      { label: 'All', icon: 'Sparkles' },
      { label: 'Daily', icon: 'Sun' },
      { label: 'Ayyappa', icon: 'Mountain' },
      { label: 'Mantra', icon: 'Sparkles' },
      { label: 'Protection', icon: 'ShieldCheck' },
      { label: 'Popular', icon: 'Flame' },
    ],
    infoLeft: 'Select a sloka to read traditional script, pronunciation and sacred meaning.',
    infoRight: 'Includes: telugu script, english transliteration, word meaning, audio',
    detailBase: '/sloka-detail',
    items: [
      {
        id: 'ayyappa-slokas',
        title: 'Sri Ayyappa Slokas',
        desc: 'Swamiye Saranam Ayyappa — daily invocation and surrender verses',
        duration: '10 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Slokas',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Ayyappa',
        popularity: 100,
        durationMinutes: 10,
      },
      {
        id: 'ganesha-prarthana',
        title: 'Ganesha Prarthana Sloka',
        desc: 'Shuklambaradharam Vishnum — auspicious prayer before beginnings',
        duration: '5 minutes',
        badge: 'Beginner',
        badgeClass: 'badge-beginner',
        type: 'Slokas',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Daily',
        popularity: 95,
        durationMinutes: 5,
      },
      {
        id: 'gayatri-mantra',
        title: 'Gayatri Maha Mantra',
        desc: 'Om Bhur Bhuva Swaha — universal Vedic prayer for spiritual light',
        duration: '15 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Mantra',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Mantra',
        popularity: 98,
        durationMinutes: 15,
      },
      {
        id: 'mrityunjaya-mantra',
        title: 'Maha Mrityunjaya Mantra',
        desc: 'Tryambakam Yajamahe — life-giving healing chant of Lord Shiva',
        duration: '12 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Mantra',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Mantra',
        popularity: 94,
        durationMinutes: 12,
      },
      {
        id: 'rama-raksha-sloka',
        title: 'Sri Rama Raksha Stotra Slokas',
        desc: 'Sacred armor prayer for protection, health and peace of mind',
        duration: '20 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Protection',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Protection',
        popularity: 91,
        durationMinutes: 20,
      },
      {
        id: 'navagraha-slokas',
        title: 'Navagraha Mangala Slokas',
        desc: 'Chants for nine planetary deities bringing balance and harmony',
        duration: '18 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Slokas',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Popular',
        popularity: 89,
        durationMinutes: 18,
      },
    ],
  },
  songs: {
    title: 'Bhajans & Songs',
    subtitle: 'Soulful devotional melodies, traditional harathis and sacred kirtans.',
    breadcrumb: 'BHAJANS & SONGS',
    badgeCount: '6 Sacred Melodies',
    searchPlaceholder: 'Search bhajans, harathis, kirtans, or songs...',
    filterChips: [
      { label: 'All', icon: 'Sparkles' },
      { label: 'Bhajans', icon: 'Music2' },
      { label: 'Harathis', icon: 'Flame' },
      { label: 'Songs', icon: 'Headphones' },
      { label: 'Ayyappa', icon: 'Mountain' },
      { label: 'Popular', icon: 'Flame' },
    ],
    infoLeft: 'Choose a devotional song or harathi to stream audio and read lyrical chants.',
    infoRight: 'Includes: audio player, synchronized lyrics, ragam, devotional meaning',
    detailBase: '/songs-detail',
    items: [
      {
        id: 'ayyappa-bhajan',
        title: 'Ayyappa Bhajan — Swamiye Saranam',
        desc: 'Heartfelt chorus invoking the divine grace of Lord Ayyappa',
        duration: '04:38',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Bhajans',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Bhajans',
        popularity: 100,
        durationMinutes: 5,
      },
      {
        id: 'ayyappa-harathi',
        title: 'Harathi — Sri Ayyappa Swamy',
        desc: 'Traditional camphor harathi hymn for evening deeparadhana',
        duration: '05:12',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Harathis',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Harathis',
        popularity: 96,
        durationMinutes: 5,
      },
      {
        id: 'manasa-smarami',
        title: 'Manasa Smarami — Devotional Song',
        desc: 'Meditative melody for contemplation and spiritual surrender',
        duration: '03:54',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Songs',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Songs',
        popularity: 90,
        durationMinutes: 4,
      },
      {
        id: 'ayyappa-suprabhatam',
        title: 'Ayyappa Suprabhatam',
        desc: 'Auspicious dawn awakening chants for Lord Sastha at Sannidhanam',
        duration: '07:18',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Bhajans',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Bhajans',
        popularity: 94,
        durationMinutes: 7,
      },
      {
        id: 'harivarasanam-song',
        title: 'Harivarasanam Viswamohanam Song',
        desc: 'The peaceful lullaby sung during the sanctum closure at night',
        duration: '06:10',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Songs',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Songs',
        popularity: 99,
        durationMinutes: 6,
      },
      {
        id: 'pallikattu-sabarimalaikku',
        title: 'Pallikattu Sabarimalaikku',
        desc: 'Legendary energetic kirtan celebrating the sacred irumudi journey',
        duration: '05:45',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Bhajans',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Bhajans',
        popularity: 98,
        durationMinutes: 6,
      },
    ],
  },
};

export const poojaListingData = subcategoryConfigs.pooja.items;

export default function PoojaListingPage({ category: categoryProp }) {
  const location = useLocation();

  // Detect category from prop or pathname
  const activeCategory = useMemo(() => {
    if (categoryProp) return categoryProp;
    const p = location.pathname.toLowerCase();
    if (p.includes('/stotras')) return 'stotras';
    if (p.includes('/slokas')) return 'slokas';
    if (p.includes('/songs')) return 'songs';
    return 'pooja';
  }, [categoryProp, location.pathname]);

  const config = subcategoryConfigs[activeCategory] || subcategoryConfigs.pooja;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Popular');

  // Filtering & Sorting
  const filteredList = useMemo(() => {
    let list = config.items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q);

      const matchesFilter =
        filter === 'All' ||
        item.filterTag === filter ||
        item.badge === filter ||
        item.type === filter ||
        (filter === 'Popular' && item.popularity >= 90) ||
        (filter === 'Ayyappa' &&
          (item.id.includes('ayyappa') ||
            item.title.toLowerCase().includes('ayyappa') ||
            item.desc.toLowerCase().includes('ayyappa')));

      return matchesSearch && matchesFilter;
    });

    if (sort === 'Name') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'Shortest') {
      return [...list].sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sort === 'Longest') {
      return [...list].sort((a, b) => b.durationMinutes - a.durationMinutes);
    }

    return list;
  }, [config.items, search, filter, sort]);

  return (
    <main className="sa-pooja-page">
      {/* Devotional Watermark Background with Soft Opacity */}
      <div className="sa-pooja-bg-watermark" aria-hidden="true">
        <img
          src="/images/ayyappa-tiger-gold-bg.png"
          alt=""
          className="sa-pooja-bg-watermark-img"
        />
      </div>

      <div className="sa-pooja-page__content">
        {/* Centered Breadcrumb */}
        <nav className="sa-pooja-breadcrumb" aria-label="Breadcrumb">
          <Link to="/home">HOME</Link>
          <span className="sep">/</span>
          <Link to="/categories">DEVOTIONAL SERVICES</Link>
          <span className="sep">/</span>
          <span className="current">{config.breadcrumb}</span>
        </nav>

        {/* Heading Header Group & Sacred Guides Badge */}
        <header className="sa-pooja-header-wrap">
          <div className="sa-pooja-header-center">
            <div className="sa-pooja-title-row">
              <img
                src="/images/pooja/lotus-heading-left-trans.png"
                alt=""
                className="sa-pooja-heading-lotus"
                aria-hidden="true"
              />
              <h1 className="sa-pooja-title">{config.title}</h1>
              <img
                src="/images/pooja/lotus-heading-right-trans.png"
                alt=""
                className="sa-pooja-heading-lotus"
                aria-hidden="true"
              />
            </div>
            <p className="sa-pooja-subtitle">{config.subtitle}</p>
          </div>

          {/* Sacred Guides Counter Badge (top-right) */}
          <div className="sa-pooja-sacred-badge-wrap">
            {activeCategory === 'pooja' ? (
              <img
                src="/images/pooja/sacred-guides-badge-hd.png"
                alt="6 Sacred Guides"
                className="sa-pooja-sacred-badge-img"
              />
            ) : (
              <div className="sa-pooja-sacred-badge-styled">
                <span className="sa-pooja-badge-lotus">❀</span>
                <span>{config.badgeCount}</span>
              </div>
            )}
          </div>
        </header>

        {/* Two-Column Main Composition */}
        <div className="sa-pooja-main-grid">
          {/* Left Column: Promotional Devotional Card */}
          <aside
            className="sa-pooja-promo-card"
            aria-label="Devotional Guide Overview"
          >
            <img
              src="/images/pooja/promo-card-complete-hd.png"
              alt="Ayyappa Pooja - Begin with Devotion"
              className="sa-pooja-promo-full-img"
            />
          </aside>

          {/* Right Column: Search Toolbar, Filters, Info Strip & Listing Cards */}
          <section
            className="sa-pooja-right-col"
            aria-label={`${config.title} Listing`}
          >
            {/* Search and Sort Toolbar */}
            <div className="sa-pooja-toolbar">
              <div className="sa-pooja-search-box">
                <Icon
                  name="Search"
                  size={19}
                  className="sa-pooja-search-icon"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={config.searchPlaceholder}
                  aria-label={config.searchPlaceholder}
                />
                {search && (
                  <button
                    type="button"
                    className="sa-pooja-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <Icon name="X" size={16} />
                  </button>
                )}
              </div>

              <div className="sa-pooja-sort-box">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort options"
                >
                  <option value="Popular">Sort by: Popular</option>
                  <option value="Name">Sort by: Name (A-Z)</option>
                  <option value="Shortest">Duration: Shortest</option>
                  <option value="Longest">Duration: Longest</option>
                </select>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className="sa-pooja-sort-arrow"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="sa-pooja-filters-row" role="tablist">
              {config.filterChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className={`sa-pooja-filter-chip ${
                    filter === chip.label ? 'active' : ''
                  }`}
                  onClick={() => setFilter(chip.label)}
                >
                  <Icon name={chip.icon} size={15} />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Informational Strip */}
            <div className="sa-pooja-info-strip">
              <div className="sa-pooja-info-left">
                <span className="sa-pooja-info-icon">❀</span>
                <span>{config.infoLeft}</span>
              </div>
              <div className="sa-pooja-info-right">
                <Icon
                  name="Layers"
                  size={15}
                  className="sa-pooja-info-icon"
                />
                <span>{config.infoRight}</span>
              </div>
            </div>

            {/* Clean Devotional Listing (Replacing Boxy Cards with Flowers, God Avatar, & Timers) */}
            <div className="sa-pooja-clean-list">
              {filteredList.map((item) => (
                <Link
                  key={item.id}
                  to={`${config.detailBase}?id=${item.id}`}
                  className="sa-pooja-list-item"
                >
                  <div className="sa-pooja-list-main">
                    {/* Left: God Avatar / Sacred Thumbnail */}
                    <div className="sa-pooja-god-thumb">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => { e.target.src = '/images/hero-deity.jpg'; }}
                      />
                    </div>

                    {/* Center: Title with flower accent & description */}
                    <div className="sa-pooja-list-info">
                      <div className="sa-pooja-list-title-row">
                        <span className="sa-pooja-list-flower" role="img" aria-label="flower">🪷</span>
                        <h3 className="sa-pooja-list-title">{item.title}</h3>
                      </div>
                      <p className="sa-pooja-list-desc">{item.desc}</p>
                    </div>
                  </div>

                  {/* Right: Duration Timer, Badge & Action Arrow */}
                  <div className="sa-pooja-list-meta">
                    <div className="sa-pooja-list-timer">
                      <Icon name="Clock3" size={14} />
                      <span>{item.duration}</span>
                    </div>

                    <div className={`sa-pooja-badge ${item.badgeClass}`}>
                      <Icon name="BarChart2" size={12} />
                      <span>{item.badge}</span>
                    </div>

                    <div className="sa-row-arrow-circle" aria-hidden="true">
                      <Icon name="ChevronRight" size={16} />
                    </div>
                  </div>
                </Link>
              ))}

              {filteredList.length === 0 && (
                <div className="sa-pooja-empty-state">
                  <Icon name="Search" size={32} />
                  <p>No items found matching "{search}".</p>
                  <button
                    type="button"
                    className="sa-pooja-reset-btn"
                    onClick={() => {
                      setSearch('');
                      setFilter('All');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
