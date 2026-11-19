import React, { useState, useEffect } from 'react';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { useLanguage } from './LanguageContext';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

const Tag = ({ children }) => <span className="tag">{children}</span>;

function PageHeading({ eyebrow, title, desc }) {
  return (
    <div className="page-header">
      <Tag>{eyebrow}</Tag>
      <h1>{title}</h1>
      <p>{desc}</p>
      <span className="title-rule">✦ &nbsp; ━━━━━ &nbsp; ❀ &nbsp; ━━━━━ &nbsp; ✦</span>
    </div>
  );
}

export default function TermsPage() {
  const { currentLanguage, t } = useLanguage();
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetch(`${API_BASE_URL}/home/cms/terms_conditions?lang=${currentLanguage}`)
      .then((res) => res.json())
      .then((json) => {
        setCmsData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentLanguage]);

  const renderDbContent = () => {
    if (loading) {
      return <p style={{ padding: '24px 0', textAlign: 'center' }}>Loading devotional portal terms from database...</p>;
    }
    if (!cmsData || !cmsData.value) {
      return <p style={{ padding: '24px 0', color: '#c0392b' }}>No terms and conditions found in database.</p>;
    }

    const raw = cmsData.value;
    const sections = raw.split(/\n\n(?=\d+\.\s+)/);

    return sections.map((sec, idx) => {
      const lines = sec.trim().split('\n');
      const heading = lines[0];
      const body = lines.slice(1).join('\n');
      return (
        <React.Fragment key={idx}>
          <h2>{heading}</h2>
          {body && <p>{body}</p>}
        </React.Fragment>
      );
    });
  };

  return (
    <section className="container section-block legal-wrap">
      <PageHeading 
        eyebrow="WEBSITE INFORMATION" 
        title="Terms & Conditions" 
        desc="Read the usage terms for the devotional platform." 
      />
      <article className="rich-card legal-article">
        <span className="legal-label">
          DEVOTIONAL PORTAL POLICY • {cmsData?.updatedAt ? `Last updated: ${new Date(cmsData.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Last updated: November 2026'}
        </span>

        {renderDbContent()}

        <div className="legal-note">
          <Icon name="Info" /> Saranam Ayyappa Devotional Portal Policy • Dedicated to faith, transparency, and seva.
        </div>
      </article>
    </section>
  );
}
