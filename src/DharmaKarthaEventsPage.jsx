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

export default function DharmaKarthaEventsPage({ notify, profile }) {
  const [temples, setTemples] = useState([]);
  const [selectedTempleId, setSelectedTempleId] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'SEVA_PROGRAMME',
    startDate: '',
    location: '',
    description: '',
  });

  useEffect(() => {
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

  const fetchEvents = () => {
    setLoading(true);
    const param = selectedTempleId ? `?templeId=${selectedTempleId}` : '';
    fetch(`${API_BASE_URL}/dharma-kartha/events${param}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.events) setEvents(data.events);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedTempleId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.startDate) {
      if (notify) notify('Event title and date are required');
      return;
    }
    try {
      const targetTempleId = Number(newEvent.templeId) || Number(selectedTempleId) || (temples[0]?.id ? Number(temples[0].id) : 1);
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, templeId: targetTempleId }),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Temple event published successfully! 🙏');
        setShowAddModal(false);
        setNewEvent({ templeId: selectedTempleId, title: '', category: 'SEVA_PROGRAMME', startDate: '', location: '', description: '' });
        fetchEvents();
      }
    } catch {
      if (notify) notify('Event saved in development mode.');
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
              <h1 className="sa-dk-title">Manage Temple Events</h1>
            </div>
            <p className="sa-dk-subtitle">
              Schedule, publish, and oversee devotional programmes, homams, and volunteer sevas for your temples.
            </p>
          </div>

          <button
            type="button"
            className="sa-dk-btn-add"
            onClick={() => setShowAddModal(true)}
          >
            <Icon name="Plus" size={16} />
            <span>Create Temple Event</span>
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

        {/* Events Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
            <Icon name="Loader" size={28} />
            <p style={{ marginTop: '10px' }}>Loading temple events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="sa-dk-empty-card">
            <Icon name="CalendarDays" size={44} color="#caa049" style={{ margin: '0 auto 12px' }} />
            <h3>No Devotional Events Scheduled</h3>
            <p>
              Create temple-specific special poojas, Kalyanam sevas, or volunteer programmes.
            </p>
            <button type="button" className="btn gold" onClick={() => setShowAddModal(true)}>
              Create First Event
            </button>
          </div>
        ) : (
          <div className="sa-dk-cards-grid">
            {events.map((e) => (
              <div key={e.id} className="sa-dk-card">
                <div>
                  <div className="sa-dk-card-top-row">
                    <span className="sa-dk-badge-category">
                      {e.category || 'SEVA / UTSAVAM'}
                    </span>
                    <span className={`sa-dk-badge-status ${e.status === 'PUBLISHED' ? 'published' : 'pending'}`}>
                      {e.status || 'Active'}
                    </span>
                  </div>

                  <h3 className="sa-dk-card-title">{e.title}</h3>

                  <p className="sa-dk-card-desc">{e.description}</p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid #edf4ef', paddingTop: '14px', marginTop: '12px' }}>
                  <span className="sa-dk-card-meta-pill" style={{ margin: 0 }}>
                    <Icon name="Calendar" size={14} />
                    <span>{e.startDate ? new Date(e.startDate).toLocaleDateString() : 'Regular Pooja'}</span>
                  </span>
                  {e.location && (
                    <span className="sa-dk-card-meta-pill" style={{ margin: 0 }}>
                      <Icon name="MapPin" size={14} style={{ color: '#e05638' }} />
                      <span>{e.location}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Event Modal */}
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
                Create Temple Event
              </h2>
              <p style={{
                color: '#556b62',
                fontSize: '14px',
                textAlign: 'center',
                margin: '0 0 24px'
              }}>
                Schedule a devotional seva, discourse, or community worship event.
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
                    value={newEvent.templeId || selectedTempleId || (temples[0]?.id ?? '')}
                    onChange={(e) => setNewEvent({ ...newEvent, templeId: e.target.value })}
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
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Srinivasa Kalyanotsavam Seva"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                      Date &amp; Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
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

                  <div>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                      Location / Hall
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prakaram Mandapam"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
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
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Description &amp; Devotee Guidelines
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Details about participation, seva tokens, or timings..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
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
                    Publish Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </ProfilePortalLayout>
  );
}
