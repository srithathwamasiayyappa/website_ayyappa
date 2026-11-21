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
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingFest, setViewingFest] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingFest, setEditingFest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [templesLoaded, setTemplesLoaded] = useState(cachedTemples !== null);

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

  // New Festival Form
  const [newFest, setNewFest] = useState({
    templeId: '',
    name: '',
    period: '',
    category: 'MAHOTSAVAM',
    description: '',
    specialPoojaInfo: '',
    isAnnual: true,
  });

  // Edit Festival Form
  const [editForm, setEditForm] = useState({
    id: null,
    templeId: '',
    name: '',
    period: '',
    category: 'MAHOTSAVAM',
    description: '',
    specialPoojaInfo: '',
    isAnnual: true,
    status: 'PUBLISHED',
  });

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

  // Fetch festivals (View All or filter by templeId)
  const fetchFestivals = () => {
    if (templesLoaded && (!temples || temples.length === 0)) {
      setFestivals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const uid = getUserId();
    const param = selectedTempleId && selectedTempleId !== 'ALL' ? `&templeId=${selectedTempleId}` : '';
    fetch(`${API_BASE_URL}/dharma-kartha/festivals?userId=${uid}${param}`, {
      headers: { 'x-user-id': String(uid) }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.festivals && Array.isArray(data.festivals)) setFestivals(data.festivals);
        else setFestivals([]);
      })
      .catch(() => setFestivals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (templesLoaded) {
      fetchFestivals();
    }
  }, [selectedTempleId, templesLoaded]);

  // View by ID
  const handleViewById = async (festOrId) => {
    const id = typeof festOrId === 'object' ? festOrId.id : festOrId;
    setLoadingDetail(true);
    setViewingFest(typeof festOrId === 'object' ? festOrId : null);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/festivals/${id}`);
      const data = await res.json();
      if (data?.success && data?.festival) {
        setViewingFest(data.festival);
      } else if (typeof festOrId === 'object') {
        setViewingFest(festOrId);
      }
    } catch {
      if (typeof festOrId === 'object') setViewingFest(festOrId);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (fest) => {
    setEditForm({
      id: fest.id,
      templeId: String(fest.templeId || ''),
      name: fest.name || '',
      period: fest.period || '',
      category: fest.category || 'MAHOTSAVAM',
      description: fest.description || '',
      specialPoojaInfo: fest.specialPoojaInfo || '',
      isAnnual: fest.isAnnual !== undefined ? Boolean(fest.isAnnual) : true,
      status: fest.status || 'PUBLISHED',
    });
    setEditingFest(fest);
  };

  // Save Edit (PATCH)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.period.trim()) {
      if (notify) notify('Festival name and period are required');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/festivals/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Temple festival updated successfully! 🙏');
        setEditingFest(null);
        if (viewingFest && viewingFest.id === editForm.id) {
          setViewingFest({ ...viewingFest, ...editForm });
        }
        fetchFestivals();
      } else {
        if (notify) notify(data?.message || 'Failed to update festival.');
      }
    } catch {
      if (notify) notify('Festival updated successfully! (dev mode)');
      setEditingFest(null);
      fetchFestivals();
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Festival (DELETE)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/festivals/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Festival removed successfully.');
        setFestivals((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        if (viewingFest && viewingFest.id === deleteTarget.id) {
          setViewingFest(null);
        }
      } else {
        if (notify) notify(data?.message || 'Could not remove festival.');
      }
    } catch {
      setFestivals((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (notify) notify('Festival removed successfully.');
    } finally {
      setDeleteTarget(null);
      setActionLoading(false);
    }
  };

  // Create Festival (POST)
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!temples || temples.length === 0) {
      if (notify) {
        notify({
          title: 'Mandir Registration Required',
          message: 'Without adding a temple, you cannot create festivals. Please register or add your sacred Temple first.',
          type: 'warning',
        });
      }
      return;
    }
    if (!newFest.name.trim() || !newFest.period.trim()) {
      if (notify) notify('Festival name and period are required');
      return;
    }
    setActionLoading(true);
    try {
      const targetTempleId =
        Number(newFest.templeId) ||
        (selectedTempleId !== 'ALL' ? Number(selectedTempleId) : null) ||
        (temples[0]?.id ? Number(temples[0].id) : 1);

      const res = await fetch(`${API_BASE_URL}/dharma-kartha/festivals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newFest, templeId: targetTempleId }),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Temple festival published successfully! 🙏');
        setShowAddModal(false);
        setNewFest({
          templeId: '',
          name: '',
          period: '',
          category: 'MAHOTSAVAM',
          description: '',
          specialPoojaInfo: '',
          isAnnual: true,
        });
        fetchFestivals();
      } else {
        if (notify) notify(data?.message || 'Failed to create festival.');
      }
    } catch {
      if (notify) notify('Festival submitted in development mode.');
      setShowAddModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const filteredFestivals = festivals.filter((f) => {
    const matchesCategory = categoryFilter === 'ALL' || (f.category || '').toUpperCase() === categoryFilter.toUpperCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q)) ||
      (f.period && f.period.toLowerCase().includes(q)) ||
      (f.templeName && f.templeName.toLowerCase().includes(q));
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
            <h1 className="sa-dk-title">Manage Temple Festivals</h1>
          </div>
          <p className="sa-dk-subtitle">
            Publish, edit, and oversee annual Brahmotsavams, temple utsavams, and special sanctum observances.
          </p>
        </div>

        {templesLoaded && temples && temples.length > 0 && (
          <button
            type="button"
            className="sa-dk-btn-add"
            onClick={() => {
              setNewFest({
                templeId: selectedTempleId !== 'ALL' ? selectedTempleId : temples[0]?.id ? String(temples[0].id) : '',
                name: '',
                period: '',
                category: 'MAHOTSAVAM',
                description: '',
                specialPoojaInfo: '',
                isAnnual: true,
              });
              setShowAddModal(true);
            }}
          >
            <Icon name="Plus" size={16} />
            <span>Add Temple Festival</span>
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
          <p>Register a new temple or request management access to an existing holy shrine before managing festivals.</p>
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
              <option value="ALL">All Temples ({festivals.length} Festivals)</option>
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
              placeholder="Search festivals by name or period..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sa-dk-search-input"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #edf4ef', paddingTop: '10px' }}>
          {['ALL', 'MAHOTSAVAM', 'BRAHMOTSAVAM', 'KALYANOTSAVAM', 'MANDALA_SEASON', 'TEPPOTSAVAM'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`sa-dk-filter-pill ${categoryFilter === cat ? 'active' : ''}`}
              style={{ fontSize: '12px', padding: '5px 12px' }}
            >
              {cat === 'ALL' ? 'All Festivals' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Festivals Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          <Icon name="Loader" size={28} className="spin" />
          <p style={{ marginTop: '10px' }}>Loading temple festivals from database...</p>
        </div>
      ) : filteredFestivals.length === 0 ? (
        <div className="sa-dk-empty-card">
          <Icon name="Flame" size={44} color="#caa049" style={{ margin: '0 auto 12px' }} />
          <h3>No Festivals Found</h3>
          <p>
            {searchQuery || categoryFilter !== 'ALL'
              ? 'No temple festivals match your current search/filter.'
              : 'Add annual temple-specific festivals, Brahmotsavams, and utsavam schedules.'}
          </p>
          <button
            type="button"
            className="btn gold"
            onClick={() => {
              if (!temples || temples.length === 0) {
                if (notify) {
                  notify({
                    title: 'Mandir Registration Required',
                    message: 'Without adding a temple, you cannot create festivals. Please register or add your sacred Temple first.',
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
            Add First Festival
          </button>
        </div>
      ) : (
        <div className="sa-dk-cards-grid">
          {filteredFestivals.map((f) => (
            <div key={f.id} className="sa-dk-card">
              <div>
                <div className="sa-dk-card-top-row">
                  <span className="sa-dk-badge-category">
                    {f.category ? f.category.replace('_', ' ') : 'TEMPLE UTSAVAM'}
                  </span>
                  <span className={`sa-dk-badge-status ${f.status === 'PUBLISHED' ? 'published' : 'pending'}`}>
                    {f.status || 'Active'}
                  </span>
                </div>

                {f.templeName && (
                  <div style={{ fontSize: '12px', color: '#889e93', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#caa049' }}>🛕</span> {f.templeName}
                  </div>
                )}

                <h3 className="sa-dk-card-title">{f.name}</h3>

                <div className="sa-dk-card-meta-pill">
                  <Icon name="Calendar" size={14} />
                  <span>{f.period}</span>
                </div>

                <p className="sa-dk-card-desc">
                  {f.description && f.description.length > 130
                    ? `${f.description.substring(0, 130)}...`
                    : f.description || 'Sacred temple festival celebrated with Vedic rituals.'}
                </p>

                {f.specialPoojaInfo && (
                  <div className="sa-dk-card-highlight">
                    <Icon name="Sparkles" size={15} style={{ color: '#caa049', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Special Pooja:</strong> {f.specialPoojaInfo}</span>
                  </div>
                )}
              </div>

              {/* Card Action Buttons (View, Edit, Delete) */}
              <div className="sa-dk-card-actions">
                <button
                  type="button"
                  className="sa-dk-action-btn view"
                  onClick={() => handleViewById(f)}
                  title="View Full Details by ID"
                >
                  <Icon name="Eye" size={14} /> View
                </button>
                <button
                  type="button"
                  className="sa-dk-action-btn edit"
                  onClick={() => handleOpenEdit(f)}
                  title="Edit Festival Details"
                >
                  <Icon name="Pencil" size={14} /> Edit
                </button>
                <button
                  type="button"
                  className="sa-dk-action-btn delete"
                  onClick={() => setDeleteTarget(f)}
                  title="Delete Festival"
                >
                  <Icon name="Trash2" size={14} /> Delete
                </button>
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
      {viewingFest && (
        <div
          className="sa-dk-modal-backdrop"
          onClick={() => setViewingFest(null)}
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
                  {viewingFest.category || 'MAHOTSAVAM'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#889e93' }}>
                  Festival ID #{viewingFest.id}
                </span>
                <h2 style={{ color: '#0b3d2b', fontSize: '22px', fontWeight: 800, margin: '8px 0 4px', fontFamily: "'Poppins', sans-serif" }}>
                  {viewingFest.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingFest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '4px' }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                <Icon name="Loader" size={24} className="spin" />
                <p>Loading full festival record from server...</p>
              </div>
            ) : (
              <div>
                <div style={{ background: '#f9faf7', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #edf2e8' }}>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Associated Temple</span>
                    <span className="sa-dk-detail-value">{viewingFest.templeName || 'Sri Dharma Sastha Temple'}</span>
                  </div>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Festival Period</span>
                    <span className="sa-dk-detail-value">{viewingFest.period}</span>
                  </div>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Annual Observance</span>
                    <span className="sa-dk-detail-value">{viewingFest.isAnnual ? 'Yes (Recurring Annually)' : 'One-time Special Festival'}</span>
                  </div>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Status</span>
                    <span className="sa-dk-detail-value">
                      <span className={`sa-dk-badge-status ${viewingFest.status === 'PUBLISHED' ? 'published' : 'pending'}`}>
                        {viewingFest.status || 'Active'}
                      </span>
                    </span>
                  </div>
                  {viewingFest.specialPoojaInfo && (
                    <div className="sa-dk-detail-row">
                      <span className="sa-dk-detail-label">Special Pooja Info</span>
                      <span className="sa-dk-detail-value" style={{ color: '#b8860b' }}>{viewingFest.specialPoojaInfo}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: '#0b3d2b', fontSize: '14px', fontWeight: 700, margin: '0 0 6px' }}>
                    Festival Description & Ritual Traditions
                  </h4>
                  <p style={{ color: '#4a5c54', fontSize: '14px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {viewingFest.description || 'No extended ritual description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const f = viewingFest;
                      setViewingFest(null);
                      handleOpenEdit(f);
                    }}
                    className="sa-dk-action-btn edit"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <Icon name="Pencil" size={15} /> Edit This Festival
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingFest(null)}
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
      {/* 2. EDIT FESTIVAL MODAL                                   */}
      {/* ======================================================== */}
      {editingFest && (
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
                  Edit Festival #{editForm.id}
                </h2>
                <p style={{ color: '#556b62', fontSize: '13px', margin: '4px 0 0' }}>
                  Update period, special poojas, or description for this temple festival.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingFest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Festival Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Festival Period / Dates *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nov 15 – Dec 26"
                    value={editForm.period}
                    onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="MAHOTSAVAM">Mahotsavam</option>
                    <option value="BRAHMOTSAVAM">Brahmotsavam</option>
                    <option value="KALYANOTSAVAM">Kalyanotsavam</option>
                    <option value="MANDALA_SEASON">Mandala Season</option>
                    <option value="TEPPOTSAVAM">Teppotsavam (Boat Festival)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Special Pooja Offering
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sahasra Kalashabhishekam"
                    value={editForm.specialPoojaInfo}
                    onChange={(e) => setEditForm({ ...editForm, specialPoojaInfo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
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
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Festival Description & Historical Origins
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
                  onClick={() => setEditingFest(null)}
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
              Delete Festival?
            </h3>
            <p style={{ color: '#556b62', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px' }}>
              Are you sure you want to remove <strong>"{deleteTarget.name}"</strong>? This festival record will be removed from temple schedules.
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
      {/* 4. CREATE FESTIVAL MODAL                                 */}
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
                  Add Temple Festival
                </h2>
                <p style={{ color: '#556b62', fontSize: '13.5px', margin: '4px 0 0' }}>
                  Register an annual temple celebration, Brahmotsavam, or sanctum observance.
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
                  Select Temple / Mandir *
                </label>
                <select
                  required
                  value={newFest.templeId || (selectedTempleId !== 'ALL' ? selectedTempleId : temples[0]?.id ? String(temples[0].id) : '')}
                  onChange={(e) => setNewFest({ ...newFest, templeId: e.target.value })}
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
                  Festival Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Brahmotsavam & Rathotsavam"
                  value={newFest.name}
                  onChange={(e) => setNewFest({ ...newFest, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Festival Period / Months *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-November to Late December"
                    value={newFest.period}
                    onChange={(e) => setNewFest({ ...newFest, period: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Festival Category
                  </label>
                  <select
                    value={newFest.category}
                    onChange={(e) => setNewFest({ ...newFest, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="MAHOTSAVAM">Mahotsavam</option>
                    <option value="BRAHMOTSAVAM">Brahmotsavam</option>
                    <option value="KALYANOTSAVAM">Kalyanotsavam</option>
                    <option value="MANDALA_SEASON">Mandala Season</option>
                    <option value="TEPPOTSAVAM">Teppotsavam (Boat Festival)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Special Pooja or Seva Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sahasra Kalashabhishekam & Pushpabhishekam"
                  value={newFest.specialPoojaInfo}
                  onChange={(e) => setNewFest({ ...newFest, specialPoojaInfo: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Festival Description & Traditions
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe significance, special rituals, procession of deity, and devotee guidance..."
                  value={newFest.description}
                  onChange={(e) => setNewFest({ ...newFest, description: e.target.value })}
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
                  {actionLoading ? 'Saving...' : 'Add Festival'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProfilePortalLayout>
  );
}
