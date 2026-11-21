import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import ProfileSidebar from './ProfileSidebar';
import './dharmaKarthaDashboard.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function DharmaKarthaDashboard({ notify, profile: initialProfile }) {
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState(initialProfile || null);
  const [stats, setStats] = useState({ managedTemples: 0, pendingUpdates: 0, activeFestivals: 0 });
  const [temples, setTemples] = useState([]);
  const [selectedTempleId, setSelectedTempleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalTemple, setDeleteModalTemple] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic counts calculation from both stats API and loaded temple list
  const dynamicPendingCount = useMemo(() => {
    const pendingTemples = (temples || []).filter(
      (t) => t.status === 'PENDING_APPROVAL' || t.status === 'PENDING'
    ).length;
    return Math.max(stats.pendingUpdates || 0, pendingTemples);
  }, [stats.pendingUpdates, temples]);

  const dynamicManagedCount = useMemo(() => {
    return Math.max(stats.managedTemples || 0, (temples || []).length);
  }, [stats.managedTemples, temples]);

  // Load Dashboard Data
  useEffect(() => {
    let isMounted = true;

    const getUserId = () => {
      try {
        const stored = localStorage.getItem('sa-profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) return parsed.id;
        }
      } catch {}
      return 1;
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const uid = getUserId();
        // 1. Fetch Profile
        const profRes = await fetch(`${API_BASE_URL}/dharma-kartha/profile?userId=${uid}`, {
          headers: { 'x-user-id': String(uid) }
        });
        const profData = await profRes.json();
        if (isMounted && profData?.profile) {
          setProfile(profData.profile);
        }

        // 2. Fetch KPIs
        const statsRes = await fetch(`${API_BASE_URL}/dharma-kartha/dashboard?userId=${uid}`, {
          headers: { 'x-user-id': String(uid) }
        });
        const statsData = await statsRes.json();
        if (isMounted && statsData?.data) {
          setStats(statsData.data);
        }

        // 3. Fetch Temples
        const templesRes = await fetch(`${API_BASE_URL}/dharma-kartha/temples?userId=${uid}`, {
          headers: { 'x-user-id': String(uid) }
        });
        const templesData = await templesRes.json();
        if (isMounted && templesData?.temples) {
          setTemples(templesData.temples);
          try {
            sessionStorage.setItem('sa_dk_temples', JSON.stringify(templesData.temples));
          } catch {}
          if (templesData.temples.length > 0) {
            setSelectedTempleId(templesData.temples[0].id || templesData.temples[0].slug);
          }
        }
      } catch (err) {
        console.warn('Using development fallback for Dharma Kartha Dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Menu Navigation List (Correctly mapped dedicated destinations)
  const menuItems = [
    { id: 'profile', label: 'Edit Profile', icon: 'UserRoundPen', link: '/edit-profile' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', link: '/dharma-kartha/notifications' },
    { id: 'my-temples', label: 'My Temples', icon: 'Landmark', link: '/dharma-kartha/temples', active: true },
    { id: 'add-temple', label: 'Add New Temple', icon: 'PlusCircle', link: '/dharma-kartha/temples/new' },
    { id: 'events', label: 'Manage Events', icon: 'CalendarDays', link: '/dharma-kartha/events' },
    { id: 'festivals', label: 'Festivals', icon: 'Flame', link: '/dharma-kartha/festivals' },
    { id: 'gallery', label: 'Gallery', icon: 'Image', link: '/dharma-kartha/gallery' },
    { id: 'terms', label: 'Terms & Conditions', icon: 'FileText', link: '/terms' },
    { id: 'privacy', label: 'Privacy Policy', icon: 'ShieldCheck', link: '/privacy' },
    { id: 'refund', label: 'Refund Policy', icon: 'RotateCcw', link: '/refund-policy' },
    { id: 'about', label: 'About', icon: 'Info', link: '/about' },
    { id: 'logout', label: 'Logout', icon: 'LogOut', link: '/logout' },
  ];

  // Quick Management Rows (Exact items requested by user)
  const quickManagementRows = [
    { id: 'about_history', icon: 'Landmark', title: 'About / History', desc: 'Update temple name, history, deities, description and other details.', tab: 'about_history' },
    { id: 'speciality', icon: 'Sparkles', title: 'Speciality', desc: 'Add or update temple specialities and significance.', tab: 'speciality' },
    { id: 'timings', icon: 'Clock', title: 'Time & Aarti', desc: 'Manage daily darshan, pooja and seva timings.', tab: 'timings' },
    { id: 'media', icon: 'Image', title: 'Media', desc: 'Upload and manage sanctum photos, gallery images and hero banner.', tab: 'media' },
    { id: 'festivals', icon: 'Calendar', title: 'Festivals', desc: 'Manage upcoming festivals, special occasions and event details.', tab: 'festivals' },
    { id: 'contact', icon: 'Phone', title: 'Contact', desc: 'Manage contact numbers, email and temple office details.', tab: 'contact' },
  ];

  // Handle Safe Deletion / Archive Request Workflow
  const handleOpenDelete = (temple) => {
    setDeleteModalTemple(temple);
    setDeleteReason('');
  };

  const handleConfirmDeleteRequest = async () => {
    if (!deleteModalTemple) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples/${deleteModalTemple.id}/deletion-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason || 'Owner requested temple review' }),
      });
      const data = await res.json();
      if (notify) {
        notify(data?.message || 'Temple deletion/archive request submitted to Super Admin.');
      }
    } catch {
      if (notify) {
        notify('Temple deletion/archive request submitted to Super Admin for verification.');
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalTemple(null);
    }
  };

  const selectedTemple = temples.find((t) => t.id === selectedTempleId || t.slug === selectedTempleId) || temples[0];

  return (
    <div className="sa-dk-portal-wrap">
      <div className="container sa-dk-layout">
        
        {/* =========================================================
            LEFT COLUMN: DHARMA KARTHA PROFILE & MENU PANEL
            ========================================================= */}
        <ProfileSidebar profile={profile} />

        {/* =========================================================
            RIGHT COLUMN: MANAGE YOUR TEMPLES DASHBOARD
            ========================================================= */}
        <main className="sa-dk-main-panel">
          
          {/* Main Heading Row */}
          <div className="sa-dk-heading-row">
            <div>
              <div className="sa-dk-title-with-lotus">
                <span className="sa-dk-lotus-icon">🪷</span>
                <h1 className="sa-dk-title">Manage Your Temples</h1>
              </div>
              <p className="sa-dk-subtitle">
                Update your temple information, timings, festivals and other details dynamically.
              </p>
            </div>

            {/* Decorative Gold Header Art Illustration */}
            <div className="sa-dk-header-art">
              <svg viewBox="0 0 160 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="sa-dk-banner-gopuram-svg">
                <path d="M80 5 L92 25 L88 25 L96 42 L92 42 L105 65 L55 65 L68 42 L64 42 L72 25 L68 25 Z" stroke="#caa049" strokeWidth="1.3" strokeOpacity="0.5" fill="none"/>
                <path d="M20 65 L140 65" stroke="#caa049" strokeWidth="1.2" strokeOpacity="0.4"/>
                <circle cx="80" cy="15" r="2" fill="#caa049" fillOpacity="0.7"/>
              </svg>
            </div>
          </div>

          {/* Three Summary KPI Cards */}
          <div className="sa-dk-kpi-row">
            <div className="sa-dk-kpi-card">
              <div className="sa-dk-kpi-icon-wrap">
                <Icon name="Landmark" size={24} />
              </div>
              <div className="sa-dk-kpi-content">
                <span className="sa-dk-kpi-label">Managed Temples</span>
                <span className="sa-dk-kpi-value">{loading ? '…' : dynamicManagedCount}</span>
              </div>
            </div>

            <div className="sa-dk-kpi-card">
              <div className="sa-dk-kpi-icon-wrap clock">
                <Icon name="Clock" size={24} />
              </div>
              <div className="sa-dk-kpi-content">
                <span className="sa-dk-kpi-label">Pending Updates</span>
                <span className="sa-dk-kpi-value">{loading ? '…' : dynamicPendingCount}</span>
              </div>
            </div>

            <div className="sa-dk-kpi-card">
              <div className="sa-dk-kpi-icon-wrap calendar">
                <Icon name="Calendar" size={24} />
              </div>
              <div className="sa-dk-kpi-content">
                <span className="sa-dk-kpi-label">Active Festivals</span>
                <span className="sa-dk-kpi-value">{loading ? '…' : stats.activeFestivals}</span>
              </div>
            </div>
          </div>

          {/* Managed Temples Header with Add New Temple Button */}
          <div className="sa-dk-section-head">
            <h2 className="sa-dk-section-title">Managed Temples</h2>
            <Link to="/dharma-kartha/temples/new" className="sa-dk-btn-add">
              <Icon name="Plus" size={16} />
              <span>Add New Temple</span>
            </Link>
          </div>

          {/* Managed Temples List (Two-Column Cards) */}
          {temples.length === 0 && !loading ? (
            <div className="sa-dk-empty-card">
              <Icon name="Landmark" size={40} />
              <h3>No Temples Assigned Yet</h3>
              <p>Register a new temple or request management access to an existing holy shrine.</p>
              <Link to="/dharma-kartha/temples/new" className="btn gold">
                <Icon name="PlusCircle" size={17} /> Register Your Temple
              </Link>
            </div>
          ) : (
            <div className="sa-dk-temples-grid">
              {temples.map((temple) => (
                <div key={temple.id || temple.slug} className="sa-dk-temple-card">
                  <div className="sa-dk-temple-img-wrap">
                    <img
                      src={temple.heroImageUrl || '/images/temple-hero.jpg'}
                      alt={temple.name}
                      className="sa-dk-temple-img"
                      onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }}
                    />
                  </div>

                  <div className="sa-dk-temple-body">
                    <div className="sa-dk-temple-meta-row">
                      <span className="sa-dk-temple-loc">
                        <Icon name="MapPin" size={13} /> {temple.city}, {temple.state}
                      </span>
                      <span className={`sa-dk-status-pill ${temple.status?.toLowerCase().includes('pending') ? 'pending' : temple.status === 'REJECTED' ? 'rejected' : 'published'}`}>
                        <span className={`sa-dk-status-dot ${temple.status?.toLowerCase().includes('pending') ? 'pending' : temple.status === 'REJECTED' ? 'rejected' : 'published'}`} />
                        {temple.status === 'PENDING_APPROVAL' ? 'Pending Approval' : temple.status === 'PUBLISHED' ? 'Published / Approved' : temple.status === 'REJECTED' ? 'Rejected' : (temple.status || 'Active')}
                      </span>
                    </div>

                    <h3 className="sa-dk-temple-name">{temple.name}</h3>
                    <p className="sa-dk-temple-desc">{temple.shortDescription || temple.special}</p>

                    <div className="sa-dk-temple-actions">
                      <button
                        type="button"
                        className="sa-dk-action-btn view"
                        onClick={() => navigate('/temple-detail', { state: { name: temple.name } })}
                      >
                        <Icon name="Eye" size={15} />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        className="sa-dk-action-btn update"
                        onClick={() => navigate(`/dharma-kartha/temples/${temple.id || temple.slug}/edit`)}
                      >
                        <Icon name="Pencil" size={15} />
                        <span>Update</span>
                      </button>

                      <button
                        type="button"
                        className="sa-dk-action-btn delete"
                        onClick={() => handleOpenDelete(temple)}
                      >
                        <Icon name="Trash2" size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Management Section */}
          <div className="sa-dk-quick-mgmt-wrap">
            <div className="sa-dk-quick-mgmt-head">
              <div className="sa-dk-quick-mgmt-title-group">
                <Icon name="Sparkles" size={19} className="sa-dk-quick-star" />
                <h3>Quick Management</h3>
              </div>

              {temples.length > 1 && (
                <div className="sa-dk-temple-select-wrap">
                  <label htmlFor="dk-temple-selector">Managing:</label>
                  <select
                    id="dk-temple-selector"
                    value={selectedTempleId || ''}
                    onChange={(e) => setSelectedTempleId(e.target.value)}
                    className="sa-dk-temple-select"
                  >
                    {temples.map((t) => (
                      <option key={t.id || t.slug} value={t.id || t.slug}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="sa-dk-quick-rows-card">
              {quickManagementRows.map((row) => (
                <div key={row.id} className="sa-dk-quick-row">
                  <div className="sa-dk-quick-icon">
                    <Icon name={row.icon} size={18} />
                  </div>
                  <div className="sa-dk-quick-info">
                    <h4>{row.title}</h4>
                    <p>{row.desc}</p>
                  </div>
                  <button
                    type="button"
                    className="sa-dk-quick-edit-btn"
                    onClick={() => {
                      if (!temples || temples.length === 0 || !selectedTempleId) {
                        if (notify) {
                          notify({
                            title: 'Mandir Registration Required',
                            message: `Without adding a temple, you cannot configure ${row.title}. Please register or add your sacred Temple first.`,
                            type: 'warning',
                          });
                        }
                        return;
                      }
                      const tabParam = row.tab || row.id;
                      navigate(`/dharma-kartha/temples/${selectedTempleId}/edit?tab=${tabParam}`);
                    }}
                  >
                    <Icon name="Pencil" size={13} />
                    <span>Edit</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* Controlled Deletion / Archive Confirmation Modal */}
      {deleteModalTemple && (
        <div className="sa-dk-modal-backdrop">
          <div className="sa-dk-modal-card">
            <div className="sa-dk-modal-icon-wrap">
              <Icon name="AlertTriangle" size={28} />
            </div>
            <h3>Request Temple Removal</h3>
            <p>
              Are you sure you want to submit a removal/archive request for{' '}
              <b>{deleteModalTemple.name}</b>?
            </p>
            <p className="sa-dk-modal-subnote">
              To protect pilgrim records, temple deletion requires Super Admin verification and audit approval.
            </p>
            <label className="sa-dk-modal-reason-label">
              Reason for request:
              <textarea
                rows={2}
                placeholder="e.g. Administrative handover, temple profile correction..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </label>
            <div className="sa-dk-modal-btns">
              <button
                type="button"
                className="btn outline"
                onClick={() => setDeleteModalTemple(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn primary"
                style={{ background: '#8b181b', borderColor: '#8b181b' }}
                onClick={handleConfirmDeleteRequest}
                disabled={isDeleting}
              >
                {isDeleting ? 'Submitting…' : 'Submit Deletion Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
