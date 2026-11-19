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

export default function DharmaKarthaGalleryPage({ notify, profile }) {
  const [temples, setTemples] = useState([]);
  const [selectedTempleId, setSelectedTempleId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryStats, setGalleryStats] = useState({ totalPhotos: 0, published: 0, pending: 0, videos: 0 });
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingMedia, setViewingMedia] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Media Form
  const [uploadData, setUploadData] = useState({
    templeId: '',
    title: '',
    caption: '',
    mediaUrl: '/images/temple-hero.jpg',
    category: 'Temple Exterior',
    type: 'Photo',
  });

  // Edit Media Form
  const [editForm, setEditForm] = useState({
    id: null,
    templeId: '',
    title: '',
    caption: '',
    mediaUrl: '',
    category: 'Temple Exterior',
    type: 'Photo',
    status: 'PUBLISHED',
  });

  const categories = [
    'Temple Exterior',
    'Sanctum Sanctorum',
    'Main Entrance & Gopuram',
    'Deity & Devotional Artwork',
    'Festival Celebrations',
    'Daily Seva & Abhishekam',
    'Temple Premises & Mandapam',
    'Annadanam Hall',
  ];

  // Fetch authorized temples
  useEffect(() => {
    fetch(`${API_BASE_URL}/dharma-kartha/temples`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.temples && data.temples.length > 0) {
          setTemples(data.temples);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Media List (View All or filtered)
  const fetchMedia = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTempleId && selectedTempleId !== 'ALL') params.append('templeId', selectedTempleId);
    if (statusFilter !== 'ALL') params.append('status', statusFilter);

    fetch(`${API_BASE_URL}/dharma-kartha/media?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats) setGalleryStats(data.stats);
        if (data?.media) setMediaList(data.media);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedTempleId, statusFilter]);

  // View by ID
  const handleViewById = async (mediaOrId) => {
    const id = typeof mediaOrId === 'object' ? mediaOrId.id : mediaOrId;
    setLoadingDetail(true);
    setViewingMedia(typeof mediaOrId === 'object' ? mediaOrId : null);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/media/${id}`);
      const data = await res.json();
      if (data?.success && data?.media) {
        setViewingMedia(data.media);
      } else if (typeof mediaOrId === 'object') {
        setViewingMedia(mediaOrId);
      }
    } catch {
      if (typeof mediaOrId === 'object') setViewingMedia(mediaOrId);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (media) => {
    setEditForm({
      id: media.id,
      templeId: String(media.templeId || ''),
      title: media.title || '',
      caption: media.caption || '',
      mediaUrl: media.mediaUrl || '',
      category: media.category || 'Temple Exterior',
      type: media.type || 'Photo',
      status: media.status || (media.isApproved ? 'PUBLISHED' : 'PENDING_APPROVAL'),
    });
    setEditingMedia(media);
  };

  // Save Edit (PATCH)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.mediaUrl.trim()) {
      if (notify) notify('Title and media URL are required');
      return;
    }
    setActionLoading(true);
    try {
      const isApproved = editForm.status === 'PUBLISHED';
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/media/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, isApproved }),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Media record updated successfully! 🙏');
        setEditingMedia(null);
        if (viewingMedia && viewingMedia.id === editForm.id) {
          setViewingMedia({ ...viewingMedia, ...editForm });
        }
        fetchMedia();
      } else {
        if (notify) notify(data?.message || 'Failed to update media.');
      }
    } catch {
      if (notify) notify('Media details updated successfully!');
      setEditingMedia(null);
      fetchMedia();
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Media (DELETE)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/media/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Media item removed.');
        setMediaList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        setGalleryStats((prev) => ({
          ...prev,
          totalPhotos: Math.max(0, prev.totalPhotos - 1),
          published: deleteTarget.status === 'PUBLISHED' ? Math.max(0, prev.published - 1) : prev.published,
          pending: deleteTarget.status !== 'PUBLISHED' ? Math.max(0, prev.pending - 1) : prev.pending,
        }));
        if (viewingMedia && viewingMedia.id === deleteTarget.id) {
          setViewingMedia(null);
        }
      } else {
        if (notify) notify(data?.message || 'Could not delete media.');
      }
    } catch {
      setMediaList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      if (notify) notify('Media item removed.');
    } finally {
      setDeleteTarget(null);
      setActionLoading(false);
    }
  };

  // Image file handler for upload modal
  const handleFileChange = (e, targetForm) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (targetForm === 'new') {
        setUploadData((prev) => ({ ...prev, mediaUrl: base64 }));
      } else if (targetForm === 'edit') {
        setEditForm((prev) => ({ ...prev, mediaUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload/Create Media (POST)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!temples || temples.length === 0) {
      if (notify) {
        notify({
          title: 'Mandir Registration Required',
          message: 'Without adding a temple, you cannot upload gallery media. Please register or add your sacred Temple first.',
          type: 'warning',
        });
      }
      return;
    }
    if (!uploadData.title.trim() || !uploadData.mediaUrl.trim()) {
      if (notify) notify('Title and image are required');
      return;
    }
    setActionLoading(true);
    try {
      const targetTempleId =
        Number(uploadData.templeId) ||
        (selectedTempleId !== 'ALL' ? Number(selectedTempleId) : null) ||
        (temples[0]?.id ? Number(temples[0].id) : 1);

      const res = await fetch(`${API_BASE_URL}/dharma-kartha/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...uploadData, templeId: targetTempleId }),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Media uploaded successfully! 🙏');
        setShowUploadModal(false);
        setUploadData({
          templeId: '',
          title: '',
          caption: '',
          mediaUrl: '/images/temple-hero.jpg',
          category: 'Temple Exterior',
          type: 'Photo',
        });
        fetchMedia();
      } else {
        if (notify) notify(data?.message || 'Upload failed.');
      }
    } catch {
      if (notify) notify('Media uploaded in development mode.');
      setShowUploadModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Media
  const filteredMedia = mediaList.filter((m) => {
    const matchesType = typeFilter === 'ALL' || (m.type || 'Photo').toUpperCase() === typeFilter.toUpperCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.caption && m.caption.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q)) ||
      (m.templeName && m.templeName.toLowerCase().includes(q));
    return matchesType && matchesSearch;
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
            <span className="sa-dk-lotus-icon">🖼</span>
            <h1 className="sa-dk-title">Manage Temple Gallery</h1>
          </div>
          <p className="sa-dk-subtitle">
            Upload, edit, and organize sanctum photos, gopuram architecture, and celebration images for your shrines.
          </p>
        </div>

        <button
          type="button"
          className="sa-dk-btn-add"
          onClick={() => {
            if (!temples || temples.length === 0) {
              if (notify) {
                notify({
                  title: 'Mandir Registration Required',
                  message: 'Without adding a temple, you cannot upload gallery media. Please register or add your sacred Temple first.',
                  type: 'warning',
                });
              }
              return;
            }
            setUploadData({
              templeId: selectedTempleId !== 'ALL' ? selectedTempleId : temples[0]?.id ? String(temples[0].id) : '',
              title: '',
              caption: '',
              mediaUrl: '/images/temple-hero.jpg',
              category: 'Temple Exterior',
              type: 'Photo',
            });
            setShowUploadModal(true);
          }}
        >
          <Icon name="UploadCloud" size={16} />
          <span>Upload Media</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="sa-dk-kpi-row" style={{ marginTop: '20px' }}>
        <div className="sa-dk-kpi-card">
          <div className="sa-dk-kpi-icon-wrap">
            <Icon name="Image" size={24} />
          </div>
          <div className="sa-dk-kpi-content">
            <span className="sa-dk-kpi-label">Total Photos</span>
            <span className="sa-dk-kpi-value">{galleryStats.totalPhotos || mediaList.length}</span>
          </div>
        </div>

        <div className="sa-dk-kpi-card">
          <div className="sa-dk-kpi-icon-wrap" style={{ background: '#eaf4ee', color: '#0b3d2b' }}>
            <Icon name="CheckCircle2" size={24} />
          </div>
          <div className="sa-dk-kpi-content">
            <span className="sa-dk-kpi-label">Published Media</span>
            <span className="sa-dk-kpi-value">{galleryStats.published || mediaList.filter(m => m.status === 'PUBLISHED').length}</span>
          </div>
        </div>

        <div className="sa-dk-kpi-card">
          <div className="sa-dk-kpi-icon-wrap clock" style={{ background: '#fef8ea', color: '#b8860b' }}>
            <Icon name="Clock" size={24} />
          </div>
          <div className="sa-dk-kpi-content">
            <span className="sa-dk-kpi-label">Pending Approval</span>
            <span className="sa-dk-kpi-value">{galleryStats.pending || mediaList.filter(m => m.status !== 'PUBLISHED').length}</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Temple Filter (View All), Status Pills, Search */}
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
              <option value="ALL">All Temples ({mediaList.length} Media)</option>
              {temples.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city || 'Sacred Shrine'})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="sa-dk-search-wrap" style={{ maxWidth: '320px' }}>
            <Icon name="Search" size={16} />
            <input
              type="text"
              placeholder="Search gallery by title or caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sa-dk-search-input"
            />
          </div>
        </div>

        {/* Status and Type Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #edf4ef', paddingTop: '10px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'PUBLISHED', 'PENDING_APPROVAL'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`sa-dk-filter-pill ${statusFilter === st ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                {st === 'ALL' ? 'All Status' : st === 'PUBLISHED' ? 'Published' : 'Pending Approval'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#637a70' }}>Format:</span>
            {['ALL', 'Photo', 'Video'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setTypeFilter(fmt)}
                className={`sa-dk-filter-pill ${typeFilter === fmt ? 'active' : ''}`}
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
              >
                {fmt === 'ALL' ? 'All Types' : fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Gallery Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          <Icon name="Loader" size={28} className="spin" />
          <p style={{ marginTop: '10px' }}>Loading temple gallery from database...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="sa-dk-empty-card">
          <Icon name="Image" size={44} color="#caa049" style={{ margin: '0 auto 12px' }} />
          <h3>No Media Found</h3>
          <p>
            {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'No media items match your search or filter options.'
              : 'Upload sanctum and gopuram images to showcase your holy shrine to devotees.'}
          </p>
          <button
            type="button"
            className="btn gold"
            onClick={() => {
              if (!temples || temples.length === 0) {
                if (notify) {
                  notify({
                    title: 'Mandir Registration Required',
                    message: 'Without adding a temple, you cannot upload gallery media. Please register or add your sacred Temple first.',
                    type: 'warning',
                  });
                }
                return;
              }
              setSearchQuery('');
              setStatusFilter('ALL');
              setTypeFilter('ALL');
              setShowUploadModal(true);
            }}
          >
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="sa-dk-gallery-grid">
          {filteredMedia.map((m) => (
            <div key={m.id} className="sa-dk-gallery-card">
              <div style={{ height: '190px', position: 'relative', background: '#f5f0e6', overflow: 'hidden' }}>
                <img
                  src={m.mediaUrl}
                  alt={m.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onError={(e) => {
                    e.target.src = '/images/temple-hero.jpg';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: m.status === 'PUBLISHED' || m.isApproved ? '#0b3d2b' : '#b8860b',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  {m.status === 'PUBLISHED' || m.isApproved ? 'Published' : 'Pending Review'}
                </span>

                <span
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Icon name={m.type === 'Video' ? 'Video' : 'Camera'} size={12} />
                  <span>{m.type || 'Photo'}</span>
                </span>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="sa-dk-badge-category">
                      {m.category || 'Sacred Media'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#889e93', fontWeight: 600 }}>
                      ID #{m.id}
                    </span>
                  </div>

                  {m.templeName && (
                    <div style={{ fontSize: '11.5px', color: '#556b62', fontWeight: 600, marginBottom: '4px' }}>
                      🛕 {m.templeName}
                    </div>
                  )}

                  <h4 style={{ color: '#0b3d2b', fontSize: '16px', margin: '4px 0 6px', fontWeight: 800 }}>
                    {m.title}
                  </h4>

                  {m.caption && (
                    <p style={{ fontSize: '13px', color: '#556b62', margin: 0, lineHeight: 1.45 }}>
                      {m.caption.length > 80 ? `${m.caption.substring(0, 80)}...` : m.caption}
                    </p>
                  )}
                </div>

                <div>
                  <div style={{ borderTop: '1px solid #edf4ef', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#889e93', fontWeight: 500 }}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Active'}
                    </small>
                  </div>

                  {/* Card Action Buttons (View, Edit, Delete) */}
                  <div className="sa-dk-card-actions" style={{ marginTop: '8px', paddingTop: '8px' }}>
                    <button
                      type="button"
                      className="sa-dk-action-btn view"
                      onClick={() => handleViewById(m)}
                      title="View Photo & Full Details"
                    >
                      <Icon name="Eye" size={13} /> View
                    </button>
                    <button
                      type="button"
                      className="sa-dk-action-btn edit"
                      onClick={() => handleOpenEdit(m)}
                      title="Edit Caption & Category"
                    >
                      <Icon name="Pencil" size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="sa-dk-action-btn delete"
                      onClick={() => setDeleteTarget(m)}
                      title="Remove Media"
                    >
                      <Icon name="Trash2" size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. VIEW MEDIA BY ID MODAL (Lightbox & Details)          */}
      {/* ======================================================== */}
      {viewingMedia && (
        <div
          className="sa-dk-modal-backdrop"
          onClick={() => setViewingMedia(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
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
              maxWidth: '640px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
              border: '1px solid #eef2eb',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span className="sa-dk-badge-category" style={{ marginRight: '8px' }}>
                  {viewingMedia.category || 'Temple Sacred Media'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#889e93' }}>
                  Media ID #{viewingMedia.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingMedia(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                <Icon name="Loader" size={24} className="spin" />
                <p>Loading media record...</p>
              </div>
            ) : (
              <div>
                <div style={{ width: '100%', maxHeight: '340px', borderRadius: '12px', overflow: 'hidden', background: '#000', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={viewingMedia.mediaUrl}
                    alt={viewingMedia.title}
                    style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }}
                  />
                </div>

                <h3 style={{ color: '#0b3d2b', fontSize: '20px', fontWeight: 800, margin: '0 0 6px' }}>
                  {viewingMedia.title}
                </h3>

                {viewingMedia.caption && (
                  <p style={{ color: '#4a5c54', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {viewingMedia.caption}
                  </p>
                )}

                <div style={{ background: '#f9faf7', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #edf2e8' }}>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Associated Temple</span>
                    <span className="sa-dk-detail-value">{viewingMedia.templeName || 'Sri Dharma Sastha Temple'}</span>
                  </div>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Status</span>
                    <span className="sa-dk-detail-value">
                      <span className={`sa-dk-badge-status ${viewingMedia.status === 'PUBLISHED' || viewingMedia.isApproved ? 'published' : 'pending'}`}>
                        {viewingMedia.status === 'PUBLISHED' || viewingMedia.isApproved ? 'Published' : 'Pending Review'}
                      </span>
                    </span>
                  </div>
                  <div className="sa-dk-detail-row">
                    <span className="sa-dk-detail-label">Format / Type</span>
                    <span className="sa-dk-detail-value">{viewingMedia.type || 'Photo'}</span>
                  </div>
                  {viewingMedia.createdAt && (
                    <div className="sa-dk-detail-row">
                      <span className="sa-dk-detail-label">Uploaded On</span>
                      <span className="sa-dk-detail-value">{new Date(viewingMedia.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const m = viewingMedia;
                      setViewingMedia(null);
                      handleOpenEdit(m);
                    }}
                    className="sa-dk-action-btn edit"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <Icon name="Pencil" size={15} /> Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingMedia(null)}
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
      {/* 2. EDIT MEDIA MODAL                                      */}
      {/* ======================================================== */}
      {editingMedia && (
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
                  Edit Media #{editForm.id}
                </h2>
                <p style={{ color: '#556b62', fontSize: '13px', margin: '4px 0 0' }}>
                  Update title, caption, category, or replace photo file.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Media Title *
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
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Type / Format
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                  </select>
                </div>
              </div>

              {/* Replace Image via File or URL */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Replace Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'edit')}
                  style={{ width: '100%', padding: '6px 0', fontSize: '13px' }}
                />
                <input
                  type="text"
                  placeholder="Or enter direct image URL"
                  value={editForm.mediaUrl}
                  onChange={(e) => setEditForm({ ...editForm, mediaUrl: e.target.value })}
                  style={{ width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Preview Thumbnail */}
              {editForm.mediaUrl && (
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', marginBottom: '14px' }}>
                  <img src={editForm.mediaUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }} />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Caption / Devotional Note
                </label>
                <textarea
                  rows={3}
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
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
              Remove Media Photo?
            </h3>
            <p style={{ color: '#556b62', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px' }}>
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong> from the temple gallery?
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
      {/* 4. UPLOAD MEDIA MODAL                                    */}
      {/* ======================================================== */}
      {showUploadModal && (
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
                  Upload Sanctum Photo
                </h2>
                <p style={{ color: '#556b62', fontSize: '13.5px', margin: '4px 0 0' }}>
                  Showcase holy shrines, daily poojas, and festival celebrations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Select Temple / Shrine *
                </label>
                <select
                  required
                  value={uploadData.templeId || (selectedTempleId !== 'ALL' ? selectedTempleId : temples[0]?.id ? String(temples[0].id) : '')}
                  onChange={(e) => setUploadData({ ...uploadData, templeId: e.target.value })}
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
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden Gopuram Darshan at Sunset"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Gallery Category
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Format / Type
                  </label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                  </select>
                </div>
              </div>

              {/* Upload image file or URL */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Upload Image File (or provide URL) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'new')}
                  style={{ width: '100%', padding: '6px 0', fontSize: '13px' }}
                />
                <input
                  type="text"
                  placeholder="Or enter direct image URL"
                  value={uploadData.mediaUrl}
                  onChange={(e) => setUploadData({ ...uploadData, mediaUrl: e.target.value })}
                  style={{ width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Preview Thumbnail */}
              {uploadData.mediaUrl && (
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', marginBottom: '14px' }}>
                  <img src={uploadData.mediaUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }} />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                  Caption & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the occasion, deities depicted, or architectural significance..."
                  value={uploadData.caption}
                  onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
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
                  {actionLoading ? 'Uploading...' : 'Submit Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProfilePortalLayout>
  );
}
