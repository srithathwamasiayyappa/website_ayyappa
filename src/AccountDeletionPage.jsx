import React from 'react';
import * as L from 'lucide-react';
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

export default function AccountDeletionPage() {
  const { t } = useLanguage();
  const handleClearData = () => {
    localStorage.clear();
    alert('Devotee local account data has been completely cleared.');
    window.location.href = '/home';
  };

  return (
    <section className="container section-block legal-wrap">
      <PageHeading 
        eyebrow="WEBSITE INFORMATION" 
        title="Account Deletion Request" 
        desc="Learn how to submit a request to delete your devotee or Dharma Kartha account and saved data." 
      />
      <article className="rich-card legal-article">
        <span className="legal-label">
          DEVOTIONAL PORTAL POLICY • Last updated: November 2026
        </span>

        <h2>1. User Right to Account Deletion</h2>
        <p>
          Devotees and Dharma Karthas have complete control over their devotional profiles and personal information. You can request the permanent deletion of your profile, mandir records, and associated preferences at any time.
        </p>

        <h2>2. How to Request Account Deletion</h2>
        <p>
          You can instantly clear all your saved information by clearing your browser application storage or clicking the "Clear Local Devotional Data" button below. For server-registered mobile numbers and mandir records, you may email support@saranamayyappa.org with your registered 10-digit mobile number.
        </p>
        <div style={{ margin: '18px 0' }}>
          <button className="btn outline" type="button" onClick={handleClearData}>
            🗑 &nbsp; Clear Local Devotional Data
          </button>
        </div>

        <h2>3. Data Purge Timeline</h2>
        <p>
          Upon receiving a verified deletion request, your profile, contact details, saved stotras, and preferences will be permanently expunged within 48 to 72 hours from all active records.
        </p>

        <h2>4. Irreversibility</h2>
        <p>
          Once deleted, saved favorite hymns, personal profile attributes, and bookmark collections cannot be restored and must be re-configured upon a new visit.
        </p>

        <div className="legal-note">
          <Icon name="Info" /> Saranam Ayyappa Devotional Portal Policy • Dedicated to faith, transparency, and seva.
        </div>
      </article>
    </section>
  );
}
