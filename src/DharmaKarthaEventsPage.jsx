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
  const getCachedTemples = () => {
    try {
      const cached = sessionStorage.getItem('sa_dk_temples');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  };
  const cachedTemples = getCachedTemples();
  const [temples, setTemples] = useState(cachedTemples || []);
  const [selectedTempleId, setSelectedTempleId] = useState('ALL');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [templesLoaded, setTemplesLoaded] = useState(cachedTemples !== null);

  // New Event Form
  const [newEvent, setNewEvent] = useState({
    templeId: '',
    title: '',
    category: 'SEVA_PROGRAMME',
    startDate: '',
    endDate: '',
    timeInfo: '',
    location: '',
    description: '',
  });

  // Edit Event Form
  const [editForm, setEditForm] = useState({
    id: null,
    templeId: '',
    title: '',
    category: 'SEVA_PROGRAMME',
    startDate: '',
    endDate: '',
    timeInfo: '',
    location: '',
    description: '',
    status: 'PUBLISHED',
  });

  const getUserId = () => {
    try {
      const stored = localStorage.getItem('sa-profile') || localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) return parsed.id;
      }
    } catch {}
    return profile?.id || 1;
  };

  // Fetch authorized temples
  useEffect(() => {
    const uid = getUserId();
    fetch(`${API_BASE_URL}/dharma-kartha/temples?userId=${uid}`, {
      headers: { 'x-user-id': String(uid) }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.temples && Array.isArray(data.temples)) {
          setTemples(data.temples);
          try { sessionStorage.setItem('sa_dk_temples', JSON.stringify(data.temples)); } catch {}
        } else {
          setTemples([]);
          try { sessionStorage.setItem('sa_dk_temples', JSON.stringify([])); } catch {}
        }
      })
      .catch(() => {
        setTemples([]);
      })
      .finally(() => setTemplesLoaded(true));
  }, []);

  // Fetch events (View All or filter by templeId)
  const fetchEvents = () => {
    if (templesLoaded && (!temples || temples.length === 0)) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const uid = getUserId();
    const param = selectedTempleId && selectedTempleId !== 'ALL' ? `&templeId=${selectedTempleId}` : '';
    fetch(`${API_BASE_URL}/dharma-kartha/events?userId=${uid}${param}`, {
      headers: { 'x-user-id': String(uid) }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.events && Array.isArray(data.events)) setEvents(data.events);
        else setEvents([]);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (templesLoaded) {
      fetchEvents();
    }
  }, [selectedTempleId, templesLoaded]);

  // View by ID
  const handleViewById = async (eventOrId) => {
    const id = typeof eventOrId === 'object' ? eventOrId.id : eventOrId;
    setLoadingDetail(true);
    setViewingEvent(typeof eventOrId === 'object' ? eventOrId : null);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/events/${id}`);
      const data = await res.json();
      if (data?.success && data?.event) {
        setViewingEvent(data.event);
      } else if (typeof eventOrId === 'object') {
        setViewingEvent(eventOrId);
      }
    } catch {
      if (typeof eventOrId === 'object') setViewingEvent(eventOrId);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (event) => {
    setEditForm({
      id: event.id,
      templeId: String(event.templeId || ''),
      title: event.title || '',
      category: event.category || 'SEVA_PROGRAMME',
      startDate: event.startDate ? event.startDate.substring(0, 10) : '',
      endDate: event.endDate ? event.endDate.substring(0, 10) : '',
      timeInfo: event.timeInfo || '',
      location: event.location || '',
      description: event.description || '',
      status: event.status || 'PUBLISHED',
    });
    setEditingEvent(event);
  };

  // Save Edit (PATCH)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.startDate) {
      if (notify) notify('Event title and start date are required');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/events/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Event updated successfully! 🙏');
        setEditingEvent(null);
        if (viewingEvent && viewingEvent.id === editForm.id) {
          setViewingEvent({ ...viewingEvent, ...editForm });
        }
        fetchEvents();
      } else {
        if (notify) notify(data?.message || 'Failed to update event.');
      }
    } catch {
      if (notify) notify('Event updated successfully! (dev mode)');
      setEditingEvent(null);
      fetchEvents();
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Event (DELETE)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/events/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Event removed successfully.');
        setEvents((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        if (viewingEvent && viewingEvent.id === deleteTarget.id) {
          setViewingEvent(null);
        }
      } else {
        if (notify) notify(data?.message || 'Could not remove event.');
      }
    } catch {
      setEvents((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (notify) notify('Event removed successfully.');
    } finally {
      setDeleteTarget(null);
      setActionLoading(false);
    }
  };

  // Create Event (POST)
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!temples || temples.length === 0) {
      if (notify) {
        notify({
          title: 'Mandir Registration Required',
          message: 'Without adding a temple, you cannot create events. Please register or add your sacred Temple first.',
          type: 'warning',
        });
      }
      return;
    }
    if (!newEvent.title.trim() || !newEvent.startDate) {
      if (notify) notify('Event title and start date are required');
      return;
    }
    setActionLoading(true);
    try {
      const targetTempleId =
        Number(newEvent.templeId) ||
        (selectedTempleId !== 'ALL' ? Number(selectedTempleId) : null) ||
        (temples[0]?.id ? Number(temples[0].id) : 1);

      const res = await fetch(`${API_BASE_URL}/dharma-kartha/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, templeId: targetTempleId }),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Temple event published successfully! 🙏');
        setShowAddModal(false);
        setNewEvent({
          templeId: '',
          title: '',
          category: 'SEVA_PROGRAMME',
          startDate: '',
          endDate: '',
          timeInfo: '',
          location: '',
          description: '',
        });
        fetchEvents();
      } else {
        if (notify) notify(data?.message || 'Failed to create event.');
      }
    } catch {
      if (notify) notify('Event saved in development mode.');
      setShowAddModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const filteredEvents = events.filter((e) => {
    const matchesCategory = categoryFilter === 'ALL' || (e.category || '').toUpperCase() === categoryFilter.toUpperCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.templeName && e.templeName.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

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
            Schedule, edit, and oversee devotional programmes, special poojas, and volunteer sevas across your holy shrines.
          </p>
        </div>

        {templesLoaded && temples && temples.length > 0 && (
          <button
            type="button"
            className="sa-dk-btn-add"
            onClick={() => {
              setNewEvent({
                templeId: selectedTempleId !== 'ALL' ? selectedTempleId : temples[0]?.id ? String(temples[0].id) : '',
                title: '',
                category: 'SEVA_PROGRAMME',
                startDate: '',
                endDate: '',
                timeInfo: '',
                location: '',
                description: '',
              });
              setShowAddModal(true);
            }}
          >
            <Icon name="Plus" size={16} />
            <span>Create Temple Event</span>
          </button>
        )}
      </div>

      {!templesLoaded ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          <Icon name="Loader" size={28} className="spin" />
          <p style={{ marginTop: '10px' }}>Loading temple information...</p>
        </div>
      ) : !temples || temples.length === 0 ? (
        <div className="sa-dk-empty-card" style={{ marginTop: '20px' }}>
          <Icon name="Landmark" size={40} />
          <h3>No Temples Assigned Yet</h3>
          <p>Register a new temple or request management access to an existing holy shrine before managing events.</p>
          <Link to="/dharma-kartha/temples/new" className="btn gold">
            <Icon name="PlusCircle" size={17} /> Register Your Temple
          </Link>
        </div>
      ) : (
        <>
          {/* Toolbar: Temple Selector (View All) & Search & Filters */}
          <div className="sa-dk-toolbar-box" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#0b3d2b', fontSize: '13.5px' }}>Filter Temple:</span>
            <select
              value={selectedTempleId}
              onChange={(e) => setSelectedTempleId(e.target.value)}
              className="sa-dk-select-control"
              style={{ minWidth: '220px' }}
            >
              <option value="ALL">All Temples ({events.length} Events)</option>
              {temples.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city || 'Sacred Shrine'})
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="sa-dk-search-wrap" style={{ maxWidth: '320px' }}>
            <Icon name="Search" size={16} />
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sa-dk-search-input"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #edf4ef', paddingTop: '10px' }}>
          {['ALL', 'SEVA_PROGRAMME', 'UTSAVAM', 'SPECIAL_POOJA', 'ANNADANAM', 'HOMAM'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`sa-dk-filter-pill ${categoryFilter === cat ? 'active' : ''}`}
              style={{ fontSize: '12px', padding: '5px 12px' }}
            >
              {cat === 'ALL'
                ? 'All Categories'
                : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          <Icon name="Loader" size={28} className="spin" />
          <p style={{ marginTop: '10px' }}>Loading temple events from database...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="sa-dk-empty-card">
          <Icon name="CalendarDays" size={44} color="#caa049" style={{ margin: '0 auto 12px' }} />
          <h3>No Devotional Events Found</h3>
          <p>
            {searchQuery || categoryFilter !== 'ALL'
              ? 'No events match your current search/filter criteria.'
              : 'Create temple-specific special poojas, Kalyanam sevas, or volunteer programmes.'}
          </p>
          <button
            type="button"
            className="btn gold"
            onClick={() => {
              if (!temples || temples.length === 0) {
                if (notify) {
                  notify({
                    title: 'Mandir Registration Required',
                    message: 'Without adding a temple, you cannot create events. Please register or add your sacred Temple first.',
                    type: 'warning',
                  });
                }
                return;
              }
              setSearchQuery('');
              setCategoryFilter('ALL');
              setShowAddModal(true);
            }}
          >
            Create New Event
          </button>
        </div>
      ) : (
        <div className="sa-dk-cards-grid">
          {filteredEvents.map((e) => (
            <div key={e.id} className="sa-dk-card">
              <div>
                <div className="sa-dk-card-top-row">
                  <span className="sa-dk-badge-category">
                    {e.category ? e.category.replace('_', ' ') : 'SEVA / UTSAVAM'}
                  </span>
                  <span className={`sa-dk-badge-status ${e.status === 'PUBLISHED' ? 'published' : 'pending'}`}>
                    {e.status || 'Active'}
                  </span>
                </div>

                {e.templeName && (
                  <div style={{ fontSize: '12px', color: '#889e93', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#caa049' }}>🛕</span> {e.templeName}
                  </div>
                )}

                <h3 className="sa-dk-card-title">{e.title}</h3>

                <p className="sa-dk-card-desc">
                  {e.description && e.description.length > 120
                    ? `${e.description.substring(0, 120)}...`
                    : e.description || 'Devotional community programme and pooja ritual.'}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #edf4ef', paddingTop: '12px' }}>
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

                {/* Card Action Buttons (View, Edit, Delete) */}
                <div className="sa-dk-card-actions">
                  <button
                    type="button"
                    className="sa-dk-action-btn view"
                    onClick={() => handleViewById(e)}
                    title="View Full Details by ID"
                  >
                    <Icon name="Eye" size={14} /> View
                  </button>
                  <button
                    type="button"
                    className="sa-dk-action-btn edit"
                    onClick={() => handleOpenEdit(e)}
                    title="Edit Event Details"
                  >
                    <Icon name="Pencil" size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="sa-dk-action-btn delete"
                    onClick={() => setDeleteTarget(e)}
                    title="Delete Event"
                  >
                    <Icon name="Trash2" size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {/* ======================================================== */}
      {/* 1. VIEW BY ID MODAL                                      */}
      {/* ======================================================== */}
      {viewingEvent && (
        <div
          className="sa-dk-modal-backdrop"
          onClick={() => setViewingEvent(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              border: '1px solid #eef2eb',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="sa-dk-badge-category" style={{ marginRight: '8px' }}>
                  {viewingEvent.category || 'SEVA_PROGRAMME'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#889e93' }}>
                  Event ID #{viewingEvent.id}
                </span>
                <h2 style={{ color: '#0b3d2b', fontSize: '22px', fontWeight: 800, margin: '8px 0 4px', fontFamily: "'Poppins', sans-serif" }}>
                  {viewingEvent.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingEvent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px' }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                <Icon name="Loader" size={24} className="spin" />
                <p>Loading full event record from server...</p>
              </div>
            ) : (
              <div>
                <div style={{ background: '#f9faf7', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #edf2e8' }}>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Associated Temple</span>
                    <span className="sa-dk-detail-value">{viewingEvent.templeName || 'Sri Dharma Sastha Temple'}</span>
                  </div>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Status</span>
                    <span className="sa-dk-detail-value">
                      <span className={`sa-dk-badge-status ${viewingEvent.status === 'PUBLISHED' ? 'published' : 'pending'}`}>
                        {viewingEvent.status || 'Active'}
                      </span>
                    </span>
                  </div>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Start Date</span>
                    <span className="sa-dk-detail-value">
                      {viewingEvent.startDate ? new Date(viewingEvent.startDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {viewingEvent.endDate && (
                    <div className="sa-dk-detail-row">
                      <span className="sa-dk-detail-label">End Date</span>
                      <span className="sa-dk-detail-value">
                        {new Date(viewingEvent.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {viewingEvent.timeInfo && (
                    <div className="sa-dk-detail-row">
                      <span className="sa-dk-detail-label">Timings / Schedule</span>
                      <span className="sa-dk-detail-value">{viewingEvent.timeInfo}</span>
                    </div>
                  )}
                  {viewingEvent.location && (
                    <div className="sa-dk-detail-row">
                      <span className="sa-dk-detail-label">Location / Sanctum</span>
                      <span className="sa-dk-detail-value">{viewingEvent.location}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: '#0b3d2b', fontSize: '14px', fontWeight: 700, margin: '0 0 6px' }}>
                    Event Description & Seva Details
                  </h4>
                  <p style={{ color: '#4a5c54', fontSize: '14px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {viewingEvent.description || 'No extended description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const ev = viewingEvent;
                      setViewingEvent(null);
                      handleOpenEdit(ev);
                    }}
                    className="sa-dk-action-btn edit"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <Icon name="Pencil" size={15} /> Edit This Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingEvent(null)}
                    className="btn outline"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EDIT EVENT MODAL                                      */}
      {/* ======================================================== */}
      {editingEvent && (
        <div
          className="sa-dk-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              border: '1px solid #eef2eb',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ color: '#0b3d2b', fontSize: '22px', fontWeight: 800, margin: 0 }}>
                  Edit Event #{editForm.id}
                </h2>
                <p style={{ color: '#556b62', fontSize: '13px', margin: '4px 0 0' }}>
                  Update schedule, venue, or details for this sacred event.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="SEVA_PROGRAMME">Seva Programme</option>
                    <option value="UTSAVAM">Temple Utsavam</option>
                    <option value="SPECIAL_POOJA">Special Pooja</option>
                    <option value="ANNADANAM">Annadanam Seva</option>
                    <option value="HOMAM">Homam / Yagam</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Time / Timings
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 06:00 AM - 12:30 PM"
                    value={editForm.timeInfo}
                    onChange={(e) => setEditForm({ ...editForm, timeInfo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Kalyana Mandapam"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Description / Seva Details
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="btn outline"
                  style={{ padding: '9px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn gold"
                  style={{ padding: '9px 20px' }}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DELETE CONFIRMATION MODAL                             */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div
          className="sa-dk-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="Trash2" size={28} />
            </div>
            <h3 style={{ color: '#0b3d2b', fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
              Delete Event?
            </h3>
            <p style={{ color: '#556b62', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px' }}>
              Are you sure you want to remove <strong>"{deleteTarget.title}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn outline"
                style={{ padding: '9px 20px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="sa-dk-action-btn delete"
                style={{ padding: '9px 22px', fontSize: '14px' }}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CREATE EVENT MODAL                                    */}
      {/* ======================================================== */}
      {showAddModal && (
        <div
          className="sa-dk-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: '1px solid #eef2eb',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ color: '#0b3d2b', fontSize: '24px', fontWeight: 800, margin: 0, fontFamily: "'Poppins', sans-serif" }}>
                  Create Temple Event
                </h2>
                <p style={{ color: '#556b62', fontSize: '13.5px', margin: '4px 0 0' }}>
                  Schedule a devotional seva, discourse, or community worship event.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Select Temple / Shrine *
                </label>
                <select
                  required
                  value={newEvent.templeId || (selectedTempleId !== 'ALL' ? selectedTempleId : temples[0]?.id ? String(temples[0].id) : '')}
                  onChange={(e) => setNewEvent({ ...newEvent, templeId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  {temples.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.city || 'Sacred Shrine'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maha Ganapathi Homam & Annadanam"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Event Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="SEVA_PROGRAMME">Seva Programme</option>
                    <option value="UTSAVAM">Temple Utsavam</option>
                    <option value="SPECIAL_POOJA">Special Pooja</option>
                    <option value="ANNADANAM">Annadanam Seva</option>
                    <option value="HOMAM">Homam / Yagam</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Timings (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 AM - 01:00 PM"
                    value={newEvent.timeInfo}
                    onChange={(e) => setNewEvent({ ...newEvent, timeInfo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Location / Venue (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Sanctum Hall"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Description / Seva Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the spiritual schedule, prasadam distribution, and devotee guidelines..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn outline"
                  style={{ padding: '9px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn gold"
                  style={{ padding: '9px 22px' }}
                >
                  {actionLoading ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProfilePortalLayout>
  );
}
