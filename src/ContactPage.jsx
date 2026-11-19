import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { useLanguage } from './LanguageContext';
import './contactPage.css';

export default function ContactPage() {
  const { currentLanguage, t } = useLanguage();
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true);

    fetch(`${API_BASE_URL}/home/cms/contact_us?lang=${currentLanguage}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setCmsData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Failed to load contact CMS from backend:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [currentLanguage]);

  const isHtml = cmsData?.value && /<[a-z][\s\S]*>/i.test(cmsData.value);

  return (
    <div className="contact-help-page">
      <div className="contact-help-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#777' }}>
            <p>{t('loading', 'Loading Saranam Ayyappa Help Center & Contact information...')}</p>
          </div>
        ) : isHtml ? (
          /* Render admin-curated CKEditor rich HTML */
          <div 
            className="contact-dynamic-content"
            dangerouslySetInnerHTML={{ __html: cmsData.value }} 
          />
        ) : (
          /* Default reference structure matching approved UI */
          <>
            {/* Header Badge & Title */}
            <span className="contact-eyebrow-badge">{t('contactEyebrow', 'CONTACT')}</span>
            <h1 className="contact-header-title">{cmsData?.description || t('contactTitle', 'Get in touch')}</h1>
            <p className="contact-intro-lead">
              {cmsData?.value || t('contactLead', "Questions, corrections to a temple listing, or partnership enquiries — we'd love to hear from you.")}
            </p>

            {/* Email Block */}
            <div className="contact-item-group">
              <h3 className="contact-item-title">{t('contactEmailTitle', 'Email')}</h3>
              <p className="contact-item-desc">
                <a href="mailto:support@saranamayyappa.org" className="contact-accent-link">
                  support@saranamayyappa.org
                </a>
                {' '}{t('contactEmailDesc', '— for general queries and listing corrections.')}
              </p>
            </div>

            {/* For temple trusts */}
            <div className="contact-item-group">
              <h3 className="contact-item-title">{t('contactHelpdeskTitle', 'Devotee Support & Help Desk')}</h3>
              <p className="contact-item-desc">
                {t('contactHelpdeskDesc', 'Operating hours: 9:00 AM – 7:00 PM IST, Monday to Saturday.')}
              </p>
            </div>

            {/* Office Location */}
            <div className="contact-item-group">
              <h3 className="contact-item-title">{t('contactLocationTitle', 'Sanctuary & Operations Office')}</h3>
              <p className="contact-item-desc">
                {t('contactLocationDesc', 'Saranam Ayyappa Seva Trust, Hyderabad, Telangana, India.')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
