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

export default function RefundPolicyPage() {
  const { currentLanguage, t } = useLanguage();
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetch(`${API_BASE_URL}/home/cms/refund_policy?lang=${currentLanguage}`)
      .then((res) => res.json())
      .then((json) => {
        setCmsData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentLanguage]);

  const renderDbContent = () => {
    if (loading) {
      return <p style={{ padding: '24px 0', textAlign: 'center' }}>Loading refund policy...</p>;
    }
    if (!cmsData || !cmsData.value) {
      return (
        <div>
          <h2>1. Voluntary Devotional Offerings and Sevas</h2>
          <p>
            All voluntary contributions, e-hundi donations, and seva booking amounts made through the Saranam Ayyappa portal are directed to the respective temple trusts for sacred activities, annadanam, and sanctum maintenance.
          </p>
          <h2>2. Cancellation and Refund Guidelines</h2>
          <p>
            General voluntary donations once completed are sacred offerings and non-refundable. In the event of a duplicate payment or transaction failure caused by network errors, devotees may contact our support team within 7 business days with transaction details. Verified duplicate deductions will be refunded to the original payment source within 5–7 banking days.
          </p>
          <h2>3. Seva Rescheduling</h2>
          <p>
            If a scheduled pooja or event cannot be conducted due to unforeseen temple sanctum circumstances or regulatory guidelines, the temple administration reserves the right to reschedule the seva to an alternate auspicious date in consultation with the devotee.
          </p>
          <h2>4. Contact for Payment and Refund Queries</h2>
          <p>
            For any billing, duplicate deduction, or donation receipt queries, please reach out via our contact page or email support@saranamayyappa.org with your transaction reference number.
          </p>
        </div>
      );
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
        title="Refund Policy" 
        desc="Review the policy regarding voluntary temple contributions and devotional offerings." 
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
