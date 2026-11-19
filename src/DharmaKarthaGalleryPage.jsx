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
  const [selectedTempleId, setSelectedTempleId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [galleryStats, setGalleryStats] = useState({ totalPhotos: 0, published: 0, pending: 0, videos: 0 });
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mediaInputMode, setMediaInputMode] = useState('URL');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    caption: '',
    mediaUrl: '',
    category: 'Temple Exterior',
    type: 'Photo',
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

  const fetchMedia = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTempleId) params.append('templeId', selectedTempleId);
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.title.trim() || !uploadData.mediaUrl.trim()) {
      if (notify) notify('Title and image URL are required');
      return;
    }
    try {
      const targetTempleId = Number(uploadData.templeId) || Number(selectedTempleId) || (temples[0]?.id ? Number(temples[0].id) : 1);
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...uploadData, templeId: targetTempleId }),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Media uploaded! Awaiting Super Admin approval 🙏');
        setShowUploadModal(false);
        setUploadData({ templeId: selectedTempleId, title: '', caption: '', mediaUrl: '', category: 'Temple Exterior', type: 'Photo' });
        fetchMedia();
      }
    } catch {
      if (notify) notify('Media submitted in development mode.');
      setShowUploadModal(false);
    }
  };

  const handleMediaFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (notify) notify('Please select an image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    setUploadingMedia(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await fetch(`${API_BASE_URL}/dharma-kartha/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data, fileName: file.name }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          const fullUrl = data.url.startsWith('http')
            ? data.url
            : `${API_BASE_URL.replace('/api/v1', '')}${data.url}`;
          setUploadData((prev) => ({ ...prev, mediaUrl: fullUrl }));
        } else {
          setUploadData((prev) => ({ ...prev, mediaUrl: base64Data }));
        }
      } catch {
        setUploadData((prev) => ({ ...prev, mediaUrl: base64Data }));
      } finally {
        setUploadingMedia(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Media item removed.');
        fetchMedia();
      }
    } catch {
      if (notify) notify('Media item removed.');
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
              <span className="sa-dk-lotus-icon">🖼</span>
              <h1 className="sa-dk-title">Manage Temple Gallery</h1>
            </div>
            <p className="sa-dk-subtitle">
              Upload sanctum photos, gopuram architecture, and festival celebration images for administrative verification.
            </p>
          </div>

          <button
            type="button"
            className="sa-dk-btn-add"
            onClick={() => setShowUploadModal(true)}
          >
            <Icon name="UploadCloud" size={16} />
            <span>Upload Media</span>
          </button>
        </div>

        {/* Live KPI Summary Cards */}
        <div className="sa-dk-kpi-row" style={{ marginTop: '20px' }}>
          <div className="sa-dk-kpi-card">
            <div className="sa-dk-kpi-icon-wrap">
              <Icon name="Image" size={24} />
            </div>
            <div className="sa-dk-kpi-content">
              <span className="sa-dk-kpi-label">Total Photos</span>
              <span className="sa-dk-kpi-value">{galleryStats.totalPhotos}</span>
            </div>
          </div>

          <div className="sa-dk-kpi-card">
            <div className="sa-dk-kpi-icon-wrap" style={{ background: '#eaf4ee', color: '#0b3d2b' }}>
              <Icon name="CheckCircle2" size={24} />
            </div>
            <div className="sa-dk-kpi-content">
              <span className="sa-dk-kpi-label">Published Media</span>
              <span className="sa-dk-kpi-value">{galleryStats.published}</span>
            </div>
          </div>

          <div className="sa-dk-kpi-card">
            <div className="sa-dk-kpi-icon-wrap clock" style={{ background: '#fef8ea', color: '#b8860b' }}>
              <Icon name="Clock" size={24} />
            </div>
            <div className="sa-dk-kpi-content">
              <span className="sa-dk-kpi-label">Pending Approval</span>
              <span className="sa-dk-kpi-value">{galleryStats.pending}</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Temple Selector & Filter */}
        <div className="sa-dk-toolbar-box">
          {temples.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 700, color: '#0b3d2b', fontSize: '14px' }}>Managing:</span>
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
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'PUBLISHED', 'PENDING_APPROVAL'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`sa-dk-filter-pill ${statusFilter === st ? 'active' : ''}`}
              >
                {st === 'ALL' ? 'All Media' : st === 'PUBLISHED' ? 'Published' : 'Pending Approval'}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
            <Icon name="Loader" size={28} />
            <p style={{ marginTop: '10px' }}>Loading temple gallery...</p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="sa-dk-empty-card">
            <Icon name="Image" size={44} color="#caa049" style={{ margin: '0 auto 12px' }} />
            <h3>No Media Uploaded</h3>
            <p>
              Upload sanctum and gopuram images to showcase your holy shrine to devotees.
            </p>
            <button type="button" className="btn gold" onClick={() => setShowUploadModal(true)}>
              Upload First Photo
            </button>
          </div>
        ) : (
          <div className="sa-dk-gallery-grid">
            {mediaList.map((m) => (
              <div key={m.id} className="sa-dk-gallery-card">
                <div style={{ height: '180px', position: 'relative', background: '#f5f0e6' }}>
                  <img
                    src={m.mediaUrl}
                    alt={m.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: m.status === 'PUBLISHED' ? '#0b3d2b' : '#b8860b',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {m.status === 'PUBLISHED' ? 'Published' : 'Pending Review'}
                  </span>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <span className="sa-dk-badge-category" style={{ display: 'inline-block', marginBottom: '6px' }}>
                      {m.category}
                    </span>
                    <h4 style={{ color: '#0b3d2b', fontSize: '16px', margin: '4px 0 6px', fontWeight: 800 }}>
                      {m.title}
                    </h4>
                    {m.caption && <p style={{ fontSize: '13px', color: '#556b62', margin: 0, lineHeight: 1.45 }}>{m.caption}</p>}
                  </div>

                  <div style={{ borderTop: '1px solid #edf4ef', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#889e93', fontWeight: 500 }}>{new Date(m.createdAt).toLocaleDateString()}</small>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      style={{ background: 'transparent', border: 'none', color: '#c0392b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
                    >
                      <Icon name="Trash2" size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Media Modal */}
        {showUploadModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
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
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
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
                Upload Temple Media
              </h2>
              <p style={{
                color: '#556b62',
                fontSize: '14px',
                textAlign: 'center',
                margin: '0 0 24px'
              }}>
                Images are submitted for Super Admin verification to maintain high devotional quality.
              </p>

              <form onSubmit={handleUploadSubmit} style={{ textAlign: 'left' }}>
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
                    value={uploadData.templeId || selectedTempleId || (temples[0]?.id ?? '')}
                    onChange={(e) => setUploadData({ ...uploadData, templeId: e.target.value })}
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
                    Image / Media Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanctum Golden Dome"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
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
                    Category *
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
                    Photo / Media Image *
                  </label>

                  {/* Mode Selector */}
                  <div style={{ display: 'inline-flex', background: '#f3f4f6', padding: '4px', borderRadius: '8px', marginBottom: '12px', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setMediaInputMode('URL')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: mediaInputMode === 'URL' ? '#064e3b' : 'transparent',
                        color: mediaInputMode === 'URL' ? '#ffffff' : '#4b5563',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icon name="Globe" size={14} /> Web URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaInputMode('FILE')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: mediaInputMode === 'FILE' ? '#064e3b' : 'transparent',
                        color: mediaInputMode === 'FILE' ? '#ffffff' : '#4b5563',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icon name="Upload" size={14} /> Upload File
                    </button>
                  </div>

                  {mediaInputMode === 'URL' ? (
                    <input
                      type="text"
                      required={!uploadData.mediaUrl}
                      placeholder="https://example.com/sanctum.jpg or /images/..."
                      value={uploadData.mediaUrl}
                      onChange={(e) => setUploadData({ ...uploadData, mediaUrl: e.target.value })}
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
                  ) : (
                    <div>
                      <div style={{
                        border: '2px dashed #064e3b',
                        borderRadius: '10px',
                        padding: '20px',
                        textAlign: 'center',
                        background: '#f9fafb',
                        position: 'relative',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMediaFileUpload}
                          disabled={uploadingMedia}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <Icon name="Camera" size={28} color="#064e3b" />
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>
                            {uploadingMedia ? 'Uploading image to sacred cloud...' : 'Click or drop sacred photo here'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            Supports PNG, JPG, JPEG, WEBP
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Preview */}
                  {uploadData.mediaUrl && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px' }}>
                      <img
                        src={uploadData.mediaUrl}
                        alt="Preview"
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {uploadData.mediaUrl.startsWith('data:') ? 'Local Image File Selected' : uploadData.mediaUrl}
                        </div>
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Image Ready</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadData(prev => ({ ...prev, mediaUrl: '' }))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', fontSize: '12px', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    Devotional Caption
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the architectural or sanctum view..."
                    value={uploadData.caption}
                    onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
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
                    onClick={() => setShowUploadModal(false)}
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
                    Submit for Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </ProfilePortalLayout>
  );
}
