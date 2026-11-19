import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import './contactPage.css';

export default function ContactPage() {
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetch(`${API_BASE_URL}/home/cms/contact_us?lang=en`)
      .then(res => res.json())
      .then(data => {
        setCmsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Failed to load contact CMS from backend:', err);
        setLoading(false);
      });
  }, []);

  const isHtml = cmsData?.value && /<[a-z][\s\S]*>/i.test(cmsData.value);

  return (
    <div className="contact-help-page">
      <div className="contact-help-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#777' }}>
            <p>Loading Saranam Ayyappa Help Center & Contact information...</p>
          </div>
        ) : isHtml ? (
          /* Render admin-curated CKEditor rich HTML */
          <div 
            className="contact-dynamic-content"
            dangerouslySetInnerHTML={{ __html: cmsData.value }} 
          />
        ) : (
          /* Default reference structure matching uploaded screenshots */
          <>
            {/* Header Badge & Title */}
            <span className="contact-eyebrow-badge">CONTACT</span>
            <h1 className="contact-header-title">Get in touch</h1>
            <p className="contact-intro-lead">
              Questions, corrections to a temple listing, or partnership enquiries — we'd love to hear from you.
            </p>

            {/* Email Block */}
            <div className="contact-item-group">
              <h3 className="contact-item-title">Email</h3>
              <p className="contact-item-desc">
                <a href="mailto:support@saranamayyappa.org" className="contact-accent-link">
                  support@saranamayyappa.org
                </a>
                {' '}— for general queries and listing corrections.
              </p>
            </div>

            {/* For temple trusts */}
            <div className="contact-item-group">
              <h3 className="contact-item-title">For temple trusts</h3>
              <p className="contact-item-desc">
                Run a temple?{' '}
                <Link to="/add-mandir" className="contact-accent-link">
                  List your mandir free
                </Link>
                {' '}and manage timings, sevas and donations from your Trust Console.
              </p>
            </div>

            {/* Report an issue */}
            <div className="contact-item-group">
              <h3 className="contact-item-title">Report an issue</h3>
              <p className="contact-item-desc">
                Found a wrong timing or detail? Open the temple page and use “Suggest an edit”, or email us with the temple name — our verification team reviews every report.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
