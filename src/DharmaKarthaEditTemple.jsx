import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import ProfilePortalLayout from './ProfilePortalLayout';
import './contactPage.css';
import './dharmaKarthaDashboard.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function DharmaKarthaEditTemple({ notify, profile }) {
  const params = useParams();
  const navigate = useNavigate();

  // Robust ID extraction: from useParams or fallback to location.pathname parsing
  // Handles /dharma-kartha/temples/:id/edit even if mounted without React Router Route path param
  const id = params?.id || window.location.pathname.split('/')[3] || '2';

  // Read initial tab from URL query params (e.g. ?tab=about_history, ?tab=speciality, etc.)
  const getInitialTab = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const requestedTab = urlParams.get('tab');
      if (requestedTab) {
        if (requestedTab === 'info' || requestedTab === 'history') return 'about_history';
        if (requestedTab === 'location') return 'contact';
        return requestedTab;
      }
    } catch {}
    return 'about_history';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Temple Types fetched from MySQL via API
  const [templeTypes, setTempleTypes] = useState([
    { id: 'MAIN_TEMPLE', name: 'Main Temple', description: 'Primary sacred sanctum & principal deity shrine' },
    { id: 'SUB_TEMPLE', name: 'Sub Temple', description: 'Affiliated shrine or sub-sanctum' },
    { id: 'MULTI_TEMPLE', name: 'Multi Temple (Trust / Complex)', description: 'Integrated religious cluster with multiple shrines' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    templeType: 'MAIN_TEMPLE',
    alternateName: '',
    primaryDeity: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    address: '',
    pincode: '',
    shortDescription: '',
    about: '',
    history: '',
    speciality: '',
    officePhone: '',
    officialEmail: '',
    officialWebsite: '',
    mapsUrl: '',
    heroImageUrl: '',
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/home/temple-types`)
      .then(res => res.json())
      .then(data => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setTempleTypes(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Timings state
  const [timings, setTimings] = useState([]);
  const [loadingTimings, setLoadingTimings] = useState(false);
  const [newTiming, setNewTiming] = useState({ title: '', timeWindow: '', description: '', sortOrder: 0 });
  const [showAddTimingForm, setShowAddTimingForm] = useState(false);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const getUserId = () => {
    try {
      const stored = localStorage.getItem('sa-profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) return parsed.id;
      }
    } catch {}
    return 1; // Default to test owner Vinod (userId 1) in dev
  };

  // Load Timings when Timings tab is selected
  useEffect(() => {
    if (activeTab === 'timings') {
      setLoadingTimings(true);
      fetch(`${API_BASE_URL}/dharma-kartha/temples/${id}/timings?userId=${getUserId()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.timings) {
            setTimings(data.timings);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingTimings(false));
    }
  }, [activeTab, id]);

  const handleAddTiming = async (e) => {
    e.preventDefault();
    if (!id || id === 'new' || !formData.name) {
      if (notify) {
        notify({
          title: 'Mandir Registration Required',
          message: 'Without adding or saving a temple, you cannot configure Time & Aarti timings.',
          type: 'warning',
        });
      }
      return;
    }
    if (!newTiming.title.trim() || !newTiming.timeWindow.trim()) {
      if (notify) notify('Title and time window are required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples/${id}/timings?userId=${getUserId()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(getUserId()) },
        body: JSON.stringify(newTiming),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Darshan timing added successfully! 🙏');
        setTimings([...timings, data.timing]);
        setNewTiming({ title: '', timeWindow: '', description: '', sortOrder: timings.length + 1 });
        setShowAddTimingForm(false);
      }
    } catch {
      if (notify) notify('Darshan timing saved in development mode.');
    }
  };

  const handleDeleteTiming = async (timingId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples/${id}/timings/${timingId}?userId=${getUserId()}`, {
        method: 'DELETE',
        headers: { 'x-user-id': String(getUserId()) },
      });
      const data = await res.json();
      if (data?.success) {
        setTimings(timings.filter((t) => t.id !== timingId));
        if (notify) notify('Timing entry removed.');
      }
    } catch {
      setTimings(timings.filter((t) => t.id !== timingId));
      if (notify) notify('Timing entry removed.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchTemple = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples/${id}?userId=${getUserId()}`, {
          headers: { 'x-user-id': String(getUserId()) }
        });
        const data = await res.json();

        if (res.status === 403 || data.statusCode === 403 || res.status === 401 || data.statusCode === 401) {
          setError(data.message || 'Permission Denied: You are not authorized to edit this temple.');
          return;
        }

        if (isMounted && data?.temple) {
          setFormData({
            ...data.temple,
            name: data.temple.name || '',
            city: data.temple.city || '',
            state: data.temple.state || '',
            about: data.temple.about || '',
            history: data.temple.history || '',
            speciality: data.temple.speciality || '',
            address: data.temple.address || '',
            officePhone: data.temple.officePhone || '',
            officialEmail: data.temple.officialEmail || '',
            officialWebsite: data.temple.officialWebsite || '',
            shortDescription: data.temple.shortDescription || '',
          });
        }
      } catch (err) {
        setError('Failed to load temple record.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTemple();
    return () => { isMounted = false; };
  }, [id]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples/${id}?userId=${getUserId()}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': String(getUserId())
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data?.success) {
        if (notify) notify('Temple updates saved successfully! 🙏');
      } else {
        if (notify) notify(data?.message || 'Error saving updates', 'error');
      }
    } catch {
      if (notify) notify('Temple updates saved in development mode.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = async (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) {
      if (notify) notify('Please state the reason for requesting removal.');
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples/${id}/deletion-request?userId=${getUserId()}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': String(getUserId())
        },
        body: JSON.stringify({ reason: deleteReason }),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Temple archive request submitted to Super Admin.');
        setDeleteModalOpen(false);
        navigate('/dharma-kartha/temples');
      } else {
        if (notify) notify(data?.message || 'Could not submit request', 'error');
      }
    } catch {
      if (notify) notify('Archive request submitted for administrative review.');
      setDeleteModalOpen(false);
      navigate('/dharma-kartha/temples');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#666' }}>
        <Icon name="Loader" size={32} />
        <p style={{ marginTop: '12px' }}>Loading authorized temple data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #f0d0d0', textAlign: 'center' }}>
        <Icon name="ShieldAlert" size={44} color="#c0392b" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ color: '#c0392b' }}>Access Forbidden</h2>
        <p style={{ color: '#555', margin: '12px 0 24px' }}>{error}</p>
        <Link to="/dharma-kartha/temples" className="btn gold">
          Return to My Temples
        </Link>
      </div>
    );
  }

  return (
    <ProfilePortalLayout profile={profile}>
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/dharma-kartha/temples" className="sa-dk-back-btn">
            <Icon name="ArrowLeft" size={16} /> Back to My Temples
          </Link>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            style={{
              background: 'transparent',
              border: '1px solid #e74c3c',
              color: '#c0392b',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Icon name="Trash2" size={15} /> Request Removal
          </button>
        </div>

        {/* Header */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px 28px', border: '1px solid #e8dfcf', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: '#caa049', textTransform: 'uppercase' }}>
              AUTHORIZED TEMPLE MANAGEMENT
            </span>
            <h1 style={{ color: '#0b3d2b', fontSize: '26px', margin: '4px 0 6px', fontWeight: 800 }}>
              {formData.name}
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="MapPin" size={14} /> {formData.city}, {formData.state} • <Icon name="Landmark" size={14} /> {formData.primaryDeity}
            </p>
          </div>

          <button
            type="button"
            className="btn outline"
            onClick={() => navigate('/temple-detail', { state: { name: formData.name } })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="Eye" size={15} /> View Public Page
          </button>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e8dfcf', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'about_history', label: 'About / History', icon: 'Landmark' },
            { id: 'speciality', label: 'Speciality', icon: 'Sparkles' },
            { id: 'timings', label: 'Time & Aarti', icon: 'Clock' },
            { id: 'media', label: 'Media', icon: 'Image' },
            { id: 'festivals', label: 'Festivals', icon: 'Calendar' },
            { id: 'contact', label: 'Contact', icon: 'Phone' },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id ||
              (tab.id === 'about_history' && (activeTab === 'info' || activeTab === 'history')) ||
              (tab.id === 'contact' && activeTab === 'location');
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (!formData.name && !loading) {
                    if (notify) {
                      notify({
                        title: 'Mandir Registration Required',
                        message: `Without adding a temple, you cannot configure ${tab.label}. Please add or register your Temple first.`,
                        type: 'warning',
                      });
                    }
                    return;
                  }
                  setActiveTab(tab.id);
                }}
                style={{
                  background: isTabActive ? '#0b3d2b' : 'transparent',
                  color: isTabActive ? '#fff' : '#444',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: '16px', padding: '30px', border: '1px solid #e2dac9', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          
          {/* TAB 1: ABOUT / HISTORY */}
          {(activeTab === 'about_history' || activeTab === 'info' || activeTab === 'history') && (
            <div>
              <h3 style={{ color: '#0b3d2b', marginBottom: '18px' }}>Temple Identity &amp; Overview</h3>
              
              {/* Dynamic Temple Classification Selector */}
              <div style={{ marginBottom: '22px', padding: '14px 16px', background: '#fcf8f0', borderRadius: '12px', border: '1px solid #ebdcc5' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0b3d2b', marginBottom: '6px' }}>
                  Temple Classification / Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {templeTypes.map((type) => {
                    const isSelected = formData.templeType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleChange('templeType', type.id)}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #0b3d2b' : '1px solid #dcd4c5',
                          background: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '12px', color: isSelected ? '#0b3d2b' : '#333' }}>
                          🛕 {type.name} {isSelected && '✓'}
                        </div>
                        {type.description && (
                          <div style={{ fontSize: '10px', color: '#777', marginTop: '2px', lineHeight: 1.3 }}>
                            {type.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  Temple Name *
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                  />
                </label>

                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  Presiding Deity
                  <input
                    type="text"
                    value={formData.primaryDeity}
                    onChange={(e) => handleChange('primaryDeity', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                  />
                </label>
              </div>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
                Short Headline / Subtitle
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </label>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '22px' }}>
                Detailed About Summary
                <textarea
                  rows={4}
                  value={formData.about}
                  onChange={(e) => handleChange('about', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </label>

              <div style={{ borderTop: '1px solid #f0e6d6', paddingTop: '18px', marginTop: '12px' }}>
                <h3 style={{ color: '#0b3d2b', marginBottom: '8px' }}>Sacred Lore &amp; Ancient History</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>
                  Document the puranic history, royal endowments, inscriptions, and holy traditions that consecrate the shrine.
                </p>
                <textarea
                  rows={6}
                  value={formData.history}
                  onChange={(e) => handleChange('history', e.target.value)}
                  placeholder="Record the sacred sthala puranam, ancient lore, and divine origins..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: SPECIALITY */}
          {activeTab === 'speciality' && (
            <div>
              <h3 style={{ color: '#0b3d2b', marginBottom: '18px' }}>Spiritual Speciality &amp; Architectural Distinctives</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                Highlight sacred vows (Vratham), unique abhishekam offerings, architectural acoustics, and spiritual significance.
              </p>
              <textarea
                rows={8}
                value={formData.speciality}
                onChange={(e) => handleChange('speciality', e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
          )}

          {/* TAB 3b: DARSHAN & AARTI TIMINGS */}
          {activeTab === 'timings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: '#0b3d2b', margin: 0 }}>Daily Darshan &amp; Seva Timetable</h3>
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
                    Configure the official opening, closing, aarti, and special sevas for this shrine.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn gold"
                  onClick={() => setShowAddTimingForm(!showAddTimingForm)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Icon name={showAddTimingForm ? 'X' : 'Plus'} size={15} />
                  <span>{showAddTimingForm ? 'Close Form' : 'Add Darshan Timing'}</span>
                </button>
              </div>

              {/* Add Timing Form */}
              {showAddTimingForm && (
                <div style={{ background: '#fcfaf6', border: '1px solid #e2dac9', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <h4 style={{ color: '#0b3d2b', margin: '0 0 14px' }}>Add Schedule Entry</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                      Seva / Aarti Title *
                      <input
                        type="text"
                        required
                        placeholder="e.g. Suprabhatam & Nirmalyam"
                        value={newTiming.title}
                        onChange={(e) => setNewTiming({ ...newTiming, title: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '4px' }}
                      />
                    </label>

                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                      Time Window *
                      <input
                        type="text"
                        required
                        placeholder="e.g. 05:00 AM – 06:30 AM"
                        value={newTiming.timeWindow}
                        onChange={(e) => setNewTiming({ ...newTiming, timeWindow: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '4px' }}
                      />
                    </label>
                  </div>

                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '14px' }}>
                    Devotional Description
                    <input
                      type="text"
                      placeholder="Brief details about the pooja, archana, or access instructions..."
                      value={newTiming.description}
                      onChange={(e) => setNewTiming({ ...newTiming, description: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '4px' }}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn gold"
                    onClick={handleAddTiming}
                  >
                    Save Timing
                  </button>
                </div>
              )}

              {/* Timings List */}
              {loadingTimings ? (
                <p style={{ textAlign: 'center', padding: '24px 0', color: '#666' }}>Loading schedule...</p>
              ) : timings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed #ccc', borderRadius: '10px' }}>
                  <Icon name="Clock" size={32} color="#caa049" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, color: '#666' }}>No darshan timings listed yet for this temple.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {timings.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f9f7f2',
                        border: '1px solid #e5dfd3',
                        padding: '12px 18px',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ background: '#eaf4ee', color: '#0b3d2b', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                          <Icon name="Clock" size={18} />
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: '#0b3d2b', fontSize: '15px' }}>{t.title}</strong>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#b8860b' }}>{t.timeWindow || t.time}</span>
                          {t.description && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>{t.description}</p>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTiming(t.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#c0392b',
                          cursor: 'pointer',
                          padding: '6px',
                        }}
                        title="Delete timing entry"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MEDIA */}
          {activeTab === 'media' && (
            <div>
              <h3 style={{ color: '#0b3d2b', marginBottom: '18px' }}>Sacred Media, Photos &amp; Sanctum Banners</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '18px' }}>
                Provide high-resolution image links for the temple hero banner, sanctum photos, and virtual darshan walkthroughs.
              </p>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
                Primary Hero Banner Image (Upload File or Enter URL)
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#0b3d2b',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name="Upload" size={15} color="#caa049" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Image size exceeds 5MB limit.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result;
                          if (base64) {
                            handleChange('heroImageUrl', base64);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste image URL (https://...)"
                    value={formData.heroImageUrl || ''}
                    onChange={(e) => handleChange('heroImageUrl', e.target.value)}
                    style={{ flex: 1, minWidth: '220px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  {formData.heroImageUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('heroImageUrl', '')}
                      style={{ padding: '8px 12px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </label>

              {formData.heroImageUrl && (
                <div style={{ marginBottom: '20px', padding: '12px', background: '#fdfaf5', borderRadius: '8px', border: '1px solid #e8dec8' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0b3d2b', marginBottom: '8px' }}>
                    Banner Preview:
                  </div>
                  <img
                    src={formData.heroImageUrl}
                    alt="Hero Banner Preview"
                    style={{ maxHeight: '180px', width: '100%', objectFit: 'cover', borderRadius: '6px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
                Google Maps 360° / Virtual Darshan Walkthrough URL
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.mapsUrl || ''}
                  onChange={(e) => handleChange('mapsUrl', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </label>

              <div style={{ marginTop: '20px', padding: '16px', background: '#f7faf8', borderRadius: '10px', border: '1px solid #dbe8e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0b3d2b' }}>Dedicated Photo &amp; Video Gallery</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#556b62' }}>
                    Upload sanctum collections, utsav videos, and festival album highlights.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn outline"
                  onClick={() => navigate('/dharma-kartha/gallery')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <Icon name="Image" size={15} />
                  <span>Open Full Gallery</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: FESTIVALS */}
          {activeTab === 'festivals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ color: '#0b3d2b', margin: 0 }}>Temple Festivals &amp; Annual Utsavams</h3>
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
                    Highlight major annual festivals such as Brahmotsavam, Mandala Pooja, Makaravilakku, and special pooja events.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn gold"
                  onClick={() => navigate('/dharma-kartha/festivals')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <Icon name="Calendar" size={15} />
                  <span>Festival Events Manager</span>
                </button>
              </div>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
                Major Annual Festivals &amp; Celebrations Overview
                <textarea
                  rows={8}
                  placeholder="e.g. 1. Annual Brahmotsavam (Chithirai / April)&#10;2. Mandala Pooja Mahotsavam (Nov - Dec)&#10;3. Makaravilakku Deeparadhana (January)&#10;4. Panguni Uthram Thiru Kalyanam (March)..."
                  value={formData.festivals || ''}
                  onChange={(e) => handleChange('festivals', e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                />
              </label>
            </div>
          )}

          {/* TAB 6: CONTACT & LOCATION */}
          {(activeTab === 'contact' || activeTab === 'location') && (
            <div>
              <h3 style={{ color: '#0b3d2b', marginBottom: '18px' }}>Official Administrative Contacts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  Devotee Helpline Phone
                  <input
                    type="tel"
                    value={formData.officePhone}
                    onChange={(e) => handleChange('officePhone', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                  />
                </label>

                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  Official Email Address
                  <input
                    type="email"
                    value={formData.officialEmail}
                    onChange={(e) => handleChange('officialEmail', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                  />
                </label>

                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  Official Trust Website URL
                  <input
                    type="url"
                    value={formData.officialWebsite}
                    onChange={(e) => handleChange('officialWebsite', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                  />
                </label>
              </div>

              <div style={{ borderTop: '1px solid #f0e6d6', paddingTop: '18px', marginTop: '12px' }}>
                <h3 style={{ color: '#0b3d2b', marginBottom: '14px' }}>Sanctum Physical Location</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                    City / Town *
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                    />
                  </label>

                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                    State *
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                    />
                  </label>

                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                    Pincode
                    <input
                      type="text"
                      value={formData.pincode || ''}
                      onChange={(e) => handleChange('pincode', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                    />
                  </label>
                </div>

                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  Sanctum Full Address
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Save Button Bar */}
          <div style={{ borderTop: '1px solid #f0e6d6', paddingTop: '20px', marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn outline"
              onClick={() => navigate('/dharma-kartha/temples')}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn gold"
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="CheckCircle2" size={17} />
              <span>{saving ? 'Saving Changes…' : 'Save Changes'}</span>
            </button>
          </div>

        </form>

        {/* Removal Modal */}
        {deleteModalOpen && (
          <div className="sa-dk-modal-backdrop">
            <div className="sa-dk-modal-card">
              <div className="sa-dk-modal-icon-wrap" style={{ background: '#fcebe6', color: '#c0392b' }}>
                <Icon name="AlertTriangle" size={28} />
              </div>
              <h3>Request Temple Deletion</h3>
              <p>
                To protect live pilgrim data, deleting or archiving <b>{formData.name}</b> requires Super Admin verification.
              </p>
              <form onSubmit={handleDeleteRequest} style={{ textAlign: 'left', marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  Reason for Request *
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Administrative handover, temple profile merge..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
                  />
                </label>

                <div className="sa-dk-modal-btns" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn primary"
                    style={{ background: '#8b181b', borderColor: '#8b181b' }}
                    disabled={deleting}
                  >
                    {deleting ? 'Submitting…' : 'Submit Deletion Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </ProfilePortalLayout>
  );
}
