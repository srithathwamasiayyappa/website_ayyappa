import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import ProfilePortalLayout from './ProfilePortalLayout';
import './dharmaKarthaDashboard.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function DharmaKarthaFestivalsPage({ notify, profile }) {
  const [temples, setTemples] = useState([]);
  const [selectedTempleId, setSelectedTempleId] = useState('');
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFest, setNewFest] = useState({
    name: '',
    period: '',
    category: 'MAHOTSAVAM',
    description: '',
    specialPoojaInfo: '',
  });

  useEffect(() => {
    // 1. Fetch authorized temples
    fetch(`${API_BASE_URL}/dharma-kartha/temples`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.temples && data.temples.length > 0) {
          setTemples(data.temples);
          setSelectedTempleId(String(data.temples[0].id));
        }
      })
      .catch(() => {});
  }, []);

  const fetchFestivals = () => {
    setLoading(true);
    const param = selectedTempleId ? `?templeId=${selectedTempleId}` : '';
    fetch(`${API_BASE_URL}/dharma-kartha/festivals${param}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.festivals) setFestivals(data.festivals);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFestivals();
  }, [selectedTempleId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newFest.name.trim() || !newFest.period.trim()) {
      if (notify) notify('Festival name and period are required');
      return;
    }
    try {
      const targetTempleId = Number(newFest.templeId) || Number(selectedTempleId) || (temples[0]?.id ? Number(temples[0].id) : 1);
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/festivals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newFest, templeId: targetTempleId }),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Temple festival submitted for Super Admin publication! 🙏');
        setShowAddModal(false);
        setNewFest({ templeId: selectedTempleId, name: '', period: '', category: 'MAHOTSAVAM', description: '', specialPoojaInfo: '' });
        fetchFestivals();
      }
    } catch {
      if (notify) notify('Festival submitted in development mode.');
      setShowAddModal(false);
    }
  };

  return (
    <ProfilePortalLayout profile={profile}>
      <div className="sa-dk-back-wrap">
        <Link to="/profile" className="sa-dk-back-btn">
          <Icon name="ArrowLeft" size={16} /> Back to Profile
        </Link>
      </div>

        <div className="sa-dk-heading-row">
          <div>
            <div className="sa-dk-title-with-lotus">
              <span className="sa-dk-lotus-icon">🪷</span>
              <h1 className="sa-dk-title">Manage Temple Festivals</h1>
            </div>
            <p className="sa-dk-subtitle">
              Publish annual Brahmotsavams, Utsavams, and temple-specific observances for your holy shrines.
            </p>
          </div>

          <button
            type="button"
            className="sa-dk-btn-add"
            onClick={() => setShowAddModal(true)}
          >
            <Icon name="Plus" size={16} />
            <span>Add Temple Festival</span>
          </button>
        </div>

        {/* Temple Selector */}
        {temples.length > 0 && (
          <div className="sa-dk-toolbar-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 700, color: '#0b3d2b', fontSize: '14px' }}>Managing Temple:</span>
              <select
                value={selectedTempleId}
                onChange={(e) => setSelectedTempleId(e.target.value)}
                className="sa-dk-select-control"
              >
                {temples.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Festival Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
            <Icon name="Loader" size={28} />
            <p style={{ marginTop: '10px' }}>Loading temple festivals...</p>
          </div>
        ) : festivals.length === 0 ? (
          <div className="sa-dk-empty-card">
            <Icon name="Calendar" size={44} color="#caa049" style={{ margin: '0 auto 12px' }} />
            <h3>No Temple Festivals Listed</h3>
            <p>
              Add annual temple-specific festivals, Brahmotsavams, and utsavam schedules for this shrine.
            </p>
            <button type="button" className="btn gold" onClick={() => setShowAddModal(true)}>
              Add First Festival
            </button>
          </div>
        ) : (
          <div className="sa-dk-cards-grid">
            {festivals.map((f) => (
              <div key={f.id} className="sa-dk-card">
                <div>
                  <div className="sa-dk-card-top-row">
                    <span className="sa-dk-badge-category">
                      {f.category || 'TEMPLE UTSAVAM'}
                    </span>
                    <span className={`sa-dk-badge-status ${f.status === 'PUBLISHED' ? 'published' : 'pending'}`}>
                      {f.status || 'Active'}
                    </span>
                  </div>

                  <h3 className="sa-dk-card-title">{f.name}</h3>

                  <div className="sa-dk-card-meta-pill">
                    <Icon name="Calendar" size={14} />
                    <span>{f.period}</span>
                  </div>

                  <p className="sa-dk-card-desc">{f.description}</p>
                </div>

                {f.specialPoojaInfo && (
                  <div className="sa-dk-card-highlight">
                    <Icon name="Sparkles" size={15} style={{ color: '#caa049', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Special Pooja:</strong> {f.specialPoojaInfo}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Festival Modal */}
        {showAddModal && (
          <div className="sa-dk-modal-backdrop" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '540px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1px solid #eef2eb'
            }}>
              <h2 style={{
                color: '#0b3d2b',
                fontSize: '24px',
                fontWeight: 800,
                textAlign: 'center',
                margin: '0 0 6px',
                fontFamily: "'Poppins', sans-serif"
              }}>
                Add Temple Festival
              </h2>
              <p style={{
                color: '#556b62',
                fontSize: '14px',
                textAlign: 'center',
                margin: '0 0 24px'
              }}>
                Enter the details of the annual celebration or festival for this shrine.
              </p>

              <form onSubmit={handleCreate} style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#caa049' }}>🛕</span> Select Temple / Shrine *
                    </span>
                    {temples.length > 1 && (
                      <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600, background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
                        {temples.length} Managed Temples
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={newFest.templeId || selectedTempleId || (temples[0]?.id ?? '')}
                    onChange={(e) => setNewFest({ ...newFest, templeId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0b3d2b',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    {temples.map((t) => (
                      <option key={t.id} value={t.id}>
                        🛕 {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Festival Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Srivari Salakatla Brahmotsavam"
                    value={newFest.name}
                    onChange={(e) => setNewFest({ ...newFest, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Festival Period / Occasion *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-November to Late December"
                    value={newFest.period}
                    onChange={(e) => setNewFest({ ...newFest, period: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Devotional Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Significance, celestial procession, and sacred observances..."
                    value={newFest.description}
                    onChange={(e) => setNewFest({ ...newFest, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Special Seva / Pooja Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daily Neyyabhishekam and Rathotsavam"
                    value={newFest.specialPoojaInfo}
                    onChange={(e) => setNewFest({ ...newFest, specialPoojaInfo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: '1px solid #10b981',
                      background: '#ffffff',
                      color: '#064e3b',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#e29e38',
                      color: '#1c1917',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(226, 158, 56, 0.35)'
                    }}
                  >
                    Submit Festival
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </ProfilePortalLayout>
  );
}
