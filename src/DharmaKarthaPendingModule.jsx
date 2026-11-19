import React from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import './dharmaKarthaDashboard.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function DharmaKarthaPendingModule({ title, category, description, icon = 'Clock' }) {
  return (
    <div className="sa-dk-portal-wrap">
      <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
        <div className="sa-dk-empty-card" style={{ padding: '48px 32px', background: '#ffffff', border: '1.5px solid #dce8e0' }}>
          <div className="sa-dk-kpi-icon-wrap" style={{ width: '64px', height: '64px', margin: '0 auto 16px' }}>
            <Icon name={icon} size={32} />
          </div>
          <span className="tag" style={{ color: '#caa049', fontWeight: 700, letterSpacing: '0.12em' }}>
            DHARMA KARTHA PORTAL • {category?.toUpperCase() || 'MANAGEMENT'}
          </span>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#0b3d2b', fontSize: '26px', margin: '8px 0 10px 0' }}>
            {title}
          </h2>
          <p style={{ color: '#556b62', fontSize: '14px', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 24px' }}>
            {description || 'This dedicated management module is scheduled for implementation in Phase 4–6 with full MariaDB schema integration, validation, and Super Admin audit workflows.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/dharma-kartha/dashboard" className="btn gold">
              <Icon name="ArrowLeft" size={17} /> Return to Dashboard
            </Link>
            <Link to="/dharma-kartha/temples" className="btn outline">
              <Icon name="Landmark" size={17} /> View My Temples
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
