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
  harathis: '/images/categories/art-harathis-trans.png',
  live: '/images/categories/art-live-trans.png',
  panchangam: '/images/categories/art-panchangam-trans.png',
  temples: '/images/categories/art-temples-trans.png',
  donations: '/images/categories/art-donations-trans.png',
  food: '/images/categories/art-food-trans.png',
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
            if (result && Array.isArray(result.data) && result.data.length > 0) {
              setServicesList(result.data);
            } else {
              setServicesList(services);
            }
          }
        } else {
          if (isMounted) setServicesList(services);
        }
      } catch (err) {
        if (isMounted) {
          setServicesList(services);
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
            const artworkSrc = service.artwork || categoryArtworkMap[service.id] || categoryArtworkMap[service.serviceId];

            return (
              <Link
                to={service.url}
                key={service.id || service.serviceId}
                className={`sa-cat-card ${isFoodCard ? 'sa-cat-card-food' : ''}`}
                aria-label={`${service.title} - ${service.sub}`}
              >
                {/* 1. Left Medallion Icon with Divine Glyph */}
                <div className="sa-cat-card-medallion" aria-hidden="true">
                  <Icon name={service.icon || 'Sparkles'} size={22} />
                </div>

                {/* 2. Middle Information (Title + Subtitle) */}
                <div className="sa-cat-card-info">
                  <h3 className="sa-cat-card-title">{service.title}</h3>
                  <p className="sa-cat-card-sub">{service.sub}</p>
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
