import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { temples as initialTemples } from './data';
import { API_BASE_URL } from './apiConfig';
import { useLanguage } from './LanguageContext';
import './templesPage.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

// Map each temple to its banner image matching the approved reference
const templeBannerMap = {
  'Sabarimala Sri Ayyappa Temple': '/images/temples/banner-sabarimala-hd.png',
  'Sri Venkateswara Temple': '/images/temples/banner-venkateswara-hd.png',
  'Kashi Vishwanath Temple': '/images/temples/banner-kashi-hd.png',
  'Meenakshi Amman Temple': '/images/temples/banner-meenakshi-hd.png',
  'Kedarnath Temple': '/images/temples/banner-kedarnath-hd.png',
  'Kanaka Durga Temple': '/images/temples/banner-kanaka-hd.png',
};

export default function TemplesPage() {
  const { currentLanguage, t } = useLanguage();
  const [templesList, setTemplesList] = useState(initialTemples);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [templeTypes, setTempleTypes] = useState([
    { id: 'MAIN_TEMPLE', name: 'Main Temple' },
    { id: 'SUB_TEMPLE', name: 'Sub Temple' },
    { id: 'MULTI_TEMPLE', name: 'Multi Temple (Trust / Complex)' },
  ]);

  // Dynamically fetch temple types from database via API
  useEffect(() => {
    fetch(`${API_BASE_URL}/home/temple-types?lang=${currentLanguage}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setTempleTypes(data.data);
        }
      })
      .catch(() => {});
  }, [currentLanguage]);

  // Dynamically sync published & approved temples from API
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/dharma-kartha/public/temples?lang=${currentLanguage}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.temples) && data.temples.length > 0) {
          // Merge API-approved temples with fallback static data
          const merged = [...initialTemples];
          data.temples.forEach((apiT) => {
            const idx = merged.findIndex((m) => m.name === apiT.name);
            if (idx !== -1) {
              merged[idx] = {
                ...merged[idx],
                ...apiT,
                templeType: apiT.templeType || merged[idx].templeType || 'MAIN_TEMPLE',
                special: apiT.speciality || apiT.shortDescription || merged[idx].special,
                deity: apiT.primaryDeity || merged[idx].deity,
              };
            } else if (apiT.status === 'PUBLISHED') {
              merged.push({
                name: apiT.name,
                city: apiT.city,
                state: apiT.state,
                templeType: apiT.templeType || 'MAIN_TEMPLE',
                deity: apiT.primaryDeity,
                special: apiT.shortDescription || apiT.speciality,
                image: 'temple-hero',
              });
            }
          });
          setTemplesList(merged);
        }
      })
      .catch(() => {
        // Retain initialTemples
      });

    return () => { isMounted = false; };
  }, [currentLanguage]);

  // Extract unique states for dropdown
  const states = useMemo(() => {
    return ['All', ...new Set(templesList.map((t) => t.state))];
  }, [templesList]);

  // Filter temples by search, state, and dynamic temple type
  const filteredTemples = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templesList.filter((t) => {
      const matchesState = stateFilter === 'All' || t.state === stateFilter;
      const matchesType = typeFilter === 'All' || (t.templeType || 'MAIN_TEMPLE') === typeFilter;
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.state.toLowerCase().includes(q) ||
        (t.special && t.special.toLowerCase().includes(q)) ||
        (t.deity && t.deity.toLowerCase().includes(q));
      return matchesState && matchesType && matchesSearch;
    });
  }, [templesList, search, stateFilter, typeFilter]);

  return (
    <div className="sa-temples-page">
      <div className="sa-temples-container">
        {/* Centered Heading Section */}
        <header className="sa-temples-header">
          {/* Top golden lotus */}
          <div className="sa-temples-lotus-top">
            <img
              src="/images/home/heading-lotus-transparent.png"
              alt=""
              className="sa-temples-lotus-img"
              aria-hidden="true"
            />
          </div>

          {/* Eyebrow with diamond & flourish */}
          <div className="sa-temples-eyebrow">
            <span className="sa-temples-flourish">― ◆</span>
            <span className="sa-temples-eyebrow-text">{t('templesEyebrow', 'PILGRIMAGE & TEMPLE HERITAGE')}</span>
            <span className="sa-temples-flourish">◆ ―</span>
          </div>

          {/* Main Title in Raleway 800 */}
          <h1 className="sa-temples-title">{t('templesTitle', 'Famous Hindu Temples')}</h1>

          {/* Subtitle */}
          <p className="sa-temples-subtitle">
            {t('templesDesc', 'Discover temple history, cultural significance, worship traditions and locations.')}
          </p>

          {/* Fine golden horizontal decorative divider */}
          <div className="sa-temples-divider" aria-hidden="true">
            <span className="sa-temples-divider-line"></span>
            <span className="sa-temples-divider-diamond">◆</span>
            <span className="sa-temples-divider-line"></span>
          </div>
        </header>

        {/* Search Field & State Filter Toolbar */}
        <div className="sa-temples-toolbar-wrapper">
          <div className="sa-temples-toolbar">
            {/* Search Input */}
            <div className="sa-temples-search-box">
              <Icon name="Search" size={19} className="sa-temples-search-icon" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder', 'Search temple, city or state...')}
                aria-label="Search temple, city or state"
              />
              {search && (
                <button
                  type="button"
                  className="sa-temples-search-clear"
                  aria-label="Clear search input"
                  onClick={() => setSearch('')}
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>

            {/* State Filter Dropdown */}
            <div className="sa-temples-select-box">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                aria-label="Filter by state"
              >
                <option value="All">{t('allStates', 'All States')}</option>
                {states
                  .filter((s) => s !== 'All')
                  .map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
              <Icon name="ChevronDown" size={16} className="sa-temples-select-arrow" />
            </div>

            {/* Dynamic Temple Type Filter Dropdown */}
            <div className="sa-temples-select-box">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by temple type"
              >
                <option value="All">{t('allTempleTypes', 'All Temple Types')}</option>
                {templeTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    🛕 {type.name}
                  </option>
                ))}
              </select>
              <Icon name="ChevronDown" size={16} className="sa-temples-select-arrow" />
            </div>
          </div>
        </div>

        {/* Temple Grid: 3 columns x 2 rows (6 cards) */}
        <div className="sa-temples-grid">
          {filteredTemples.map((temple) => {
            const bannerSrc = templeBannerMap[temple.name] || `/images/${temple.image}.jpg`;

            return (
              <div key={temple.name} className="sa-temple-card">
                {/* Temple Banner Image */}
                <div className="sa-temple-card-image-wrap">
                  <img
                    src={bannerSrc}
                    alt={temple.name}
                    className="sa-temple-card-image"
                    loading="lazy"
                  />
                </div>

                {/* Temple Card Body */}
                <div className="sa-temple-card-body">
                  {/* Location with Pin */}
                  <div className="sa-temple-card-location">
                    <Icon name="MapPin" size={14} className="sa-temple-pin-icon" />
                    <span>{temple.state}, India</span>
                  </div>

                  {/* Temple Name */}
                  <h3 className="sa-temple-card-name">{temple.name}</h3>

                  {/* Temple Description */}
                  <p className="sa-temple-card-desc">{temple.special}</p>

                  {/* Explore Temple Button */}
                  <div className="sa-temple-card-action">
                    <Link
                      to="/temple-detail"
                      state={{ name: temple.name }}
                      className="sa-temple-explore-btn"
                      aria-label={`Explore ${temple.name}`}
                    >
                      <span>Explore Temple</span>
                      <Icon name="ArrowRight" size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemples.length === 0 && (
          <div className="sa-temples-empty-state" role="status">
            <Icon name="Search" size={32} />
            <p>No temples found matching "{search}".</p>
            <button
              type="button"
              className="sa-temples-reset-btn"
              onClick={() => {
                setSearch('');
                setStateFilter('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Scenic Landscape Illustration Layer */}
      <div className="sa-temples-scenery-bottom" aria-hidden="true">
        <img
          src="/images/categories/cat-decor-bottom.png"
          alt=""
          className="sa-temples-scenery-img"
        />
      </div>
    </div>
  );
}

