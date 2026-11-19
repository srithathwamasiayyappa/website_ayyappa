import React, { useState, useEffect } from 'react';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { image } from './data';
import { useLanguage } from './LanguageContext';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

const Tag = ({ children }) => <span className="tag">{children}</span>;

export default function AboutPage() {
  const { currentLanguage, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetch(`${API_BASE_URL}/home/cms/about_us?lang=${currentLanguage}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentLanguage]);

  const paragraphs = data && data.value ? data.value.split('\n\n').filter(Boolean) : [];

  return (
    <section className="container section-block about-layout">
      <div className="about-art">
        <img src={image('deity')} alt="Lord Ayyappa" />
      </div>
      <div>
        <Tag>ABOUT THE PLATFORM</Tag>
        <h1>{data?.description || 'About Saranam Ayyappa'}</h1>
        {loading && <p>Loading sacred devotional overview from database...</p>}
        {!loading && paragraphs.length > 0 && (
          paragraphs.map((p, idx) => <p key={idx}>{p}</p>)
        )}
        <div style={{ marginTop: '20px' }}>
          <a href="/categories" className="btn primary">
            Explore Devotional Services
          </a>
        </div>
      </div>
    </section>
  );
}
