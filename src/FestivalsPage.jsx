import React, { useState, useEffect } from 'react';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { useLanguage } from './LanguageContext';
import './templesPage.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function FestivalsPage({ notify, language: propLang }) {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const effectiveLang = propLang || currentLanguage;
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedLang, setSelectedLang] = useState(effectiveLang);
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveLang) {
      setSelectedLang(effectiveLang);
    }
  }, [effectiveLang]);

  const years = ['2025', '2026', '2027', '2028'];
  const cities = ['Hyderabad', 'Tirupati', 'Chennai', 'Bangalore', 'Kochi', 'Varanasi', 'Mumbai', 'Delhi'];
  const categories = ['ALL', 'Major Festival', 'Devotional Observance', 'Avatar Jayanti', 'Ayyappa Season', 'Nine Nights'];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`${API_BASE_URL}/dharma-kartha/general/calendar?year=${selectedYear}&lang=${selectedLang}&city=${encodeURIComponent(selectedCity)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.festivals) {
          setFestivals(data.festivals);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedYear, selectedLang, selectedCity]);

  const filtered = festivals.filter((f) => {
    return selectedCategory === 'ALL' || f.category === selectedCategory;
  });

  return (
    <div className="sa-temples-page" style={{ minHeight: '80vh', padding: '40px 16px', background: '#faf8f4' }}>
      <div className="sa-temples-container" style={{ maxWidth: '1120px', margin: '0 auto' }}>
        
        {/* Header */}
        <header className="sa-temples-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="sa-temples-lotus-top">
            <img
              src="/images/home/heading-lotus-transparent.png"
              alt=""
              className="sa-temples-lotus-img"
              style={{ width: '48px', height: 'auto', margin: '0 auto 8px' }}
            />
          </div>
          <div className="sa-temples-eyebrow">
            <span className="sa-temples-flourish">― ◆</span>
            <span className="sa-temples-eyebrow-text">{t('festivalsEyebrow', 'VEDIC PANCHANGAM & AUSPICIOUS CELEBRATIONS')}</span>
            <span className="sa-temples-flourish">◆ ―</span>
          </div>
          <h1 className="sa-temples-title" style={{ color: '#0b3d2b', fontSize: '32px', fontWeight: 800, margin: '8px 0' }}>
            {t('festivalsTitle', 'Festivals & Sacred Celebrations')}
          </h1>
          <p className="sa-temples-subtitle" style={{ color: '#555', maxWidth: '640px', margin: '0 auto' }}>
            {t('festivalsSubtitle', 'Explore Hindu festivals, auspicious lunar observances, and sacred celebrations throughout the year across India.')}
          </p>
        </header>

        {/* Dynamic Filters Bar */}
        <div style={{ background: '#fff', padding: '18px 24px', borderRadius: '14px', border: '1px solid #e8dfcf', marginBottom: '28px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Year Selector */}
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0b3d2b' }}>
              {t('year', 'Year')}:
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ marginLeft: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 700 }}
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>

            {/* Language Selector */}
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0b3d2b' }}>
              {t('language', 'Language')}:
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  if (setLanguage) setLanguage(e.target.value);
                }}
                style={{ marginLeft: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 700 }}
              >
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </label>

            {/* City / Location Selector */}
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0b3d2b' }}>
              Location:
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ marginLeft: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 600 }}
              >
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: selectedCategory === cat ? '1px solid #0b3d2b' : '1px solid #dcd3c5',
                  background: selectedCategory === cat ? '#0b3d2b' : '#fff',
                  color: selectedCategory === cat ? '#fff' : '#444',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Festivals Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
            <Icon name="Loader" size={32} />
            <p style={{ marginTop: '12px' }}>Loading Vedic Festival Calendar...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2dac9' }}>
            <p style={{ color: '#666' }}>No festivals found for the selected category.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            {filtered.map((f) => (
              <div
                key={f.slug}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  border: '1px solid #e8dfcf',
                  padding: '22px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#caa049', textTransform: 'uppercase' }}>
                      {f.category}
                    </span>
                    <span style={{ background: '#eaf4ee', color: '#0b3d2b', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                      {f.weekday}
                    </span>
                  </div>

                  <h3 style={{ color: '#0b3d2b', fontSize: '19px', fontWeight: 800, margin: '4px 0 8px' }}>
                    {f.name}
                  </h3>

                  <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px' }}>
                    {f.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f0e6d6', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '13px', fontWeight: 600 }}>
                    <Icon name="Calendar" size={15} color="#caa049" />
                    <span>{f.date}</span>
                  </div>

                  <span style={{ fontSize: '12px', color: '#888' }}>
                    📍 {f.city}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
