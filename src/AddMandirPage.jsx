import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import './contactPage.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function AddMandirPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="contact-help-page">
      <div className="contact-help-container">
        
        {/* Mandir Icon & Header */}
        <div className="add-mandir-header">
          <span className="add-mandir-icon" role="img" aria-label="mandir">🛕</span>
          <h1 className="add-mandir-title">Add a mandir</h1>
          <p className="add-mandir-subtitle">
            Know a temple that isn't listed yet? Submit it for our team to verify. You'll be credited as its author and can keep it updated from your dashboard.
          </p>
        </div>

        {/* Please sign in first Card */}
        <div className="signin-prompt-box">
          <div className="signin-prompt-user-icon">
            <Icon name="User" size={20} />
          </div>
          <h2 className="signin-prompt-heading">Please sign in first</h2>
          <p className="signin-prompt-text">
            To submit a mandir and manage it later, you need a free Saranam Ayyappa account. It only takes a minute.
          </p>
          <button 
            type="button" 
            className="signin-action-btn"
            style={{ border: 'none', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            <Icon name="KeyRound" size={16} />
            <span>Sign in or create an account</span>
          </button>
        </div>

        {/* How a listing gets published */}
        <div className="workflow-section">
          <h3 className="workflow-section-title">How a listing gets published</h3>
          <ol className="workflow-steps-list">
            <li>
              <strong>1. You submit the mandir.</strong> Name, deity, city and location are enough to start. Timings, photographs, the temple phone number and a short history help it get approved faster.
            </li>
            <li>
              <strong>2. We verify it.</strong> Every submission is checked by hand against public records, the temple's own website or trust, and map data. We confirm the mandir exists, that the location is right, and that any photographs genuinely show that temple.
            </li>
            <li>
              <strong>3. It goes live.</strong> Once approved the page is published with you credited as its author, and it becomes searchable on Saranam Ayyappa.
            </li>
            <li>
              <strong>4. You keep it accurate.</strong> Aarti timings change, festivals move, renovations close a sanctum. You can edit your listing at any time from your dashboard, and edits to a live listing are reviewed before they appear.
            </li>
          </ol>
        </div>

        {/* What we ask for */}
        <div className="contact-note-block">
          <h3 className="contact-note-title">What we ask for</h3>
          <p className="contact-note-body">
            Listings are free, for every mandir, of every size — a famous jyotirlinga and a village shrine are treated the same way. We only ask that the information be accurate and that any photograph you upload is one you have the right to share. We do not accept paid placement, and no temple can pay to rank higher in search results.
          </p>
        </div>

        {/* Are you the temple trust? */}
        <div className="contact-note-block">
          <h3 className="contact-note-title">Are you the temple trust?</h3>
          <p className="contact-note-body">
            If you manage the mandir officially, submit it here and mention the trust's name in the description. We will get in touch to verify your role, after which you can manage the listing's timings, sevas and festival calendar directly. If the temple is already listed, open its page and use{' '}
            <strong>Suggest an edit</strong> instead — that routes the correction straight to our verification team.
          </p>
        </div>

        {/* Back Link to Contact */}
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <Link to="/contact" className="contact-accent-link" style={{ fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="ArrowLeft" size={16} /> Back to Contact & Help Center
          </Link>
        </div>

      </div>
    </div>
  );
}
