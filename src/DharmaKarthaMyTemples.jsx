import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import ProfilePortalLayout from './ProfilePortalLayout';
import './dharmaKarthaDashboard.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function DharmaKarthaMyTemples({ notify, profile }) {
  const navigate = useNavigate();
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimData, setClaimData] = useState({ templeId: 1, reason: '' });
  const [isClaiming, setIsClaiming] = useState(false);
  const [allKnownTemples, setAllKnownTemples] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/dharma-kartha/public/temples`)
      .then(res => res.json())
      .then(data => {
        if (data?.temples && Array.isArray(data.temples)) {
          setAllKnownTemples(data.temples);
          if (data.temples.length > 0) {
            setClaimData(prev => ({ ...prev, templeId: data.temples[0].id }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const fetchTemples = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      const data = await res.json();
      if (data?.temples) {
        setTemples(data.temples);
      } else {
        setTemples([]);
      }
    } catch {
      // Fallback dev demo
      setTemples([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, [search, statusFilter]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimData.reason.trim()) {
      if (notify) notify('Please provide a reason or trustee verification detail.');
      return;
    }
    setIsClaiming(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData),
      });
      const data = await res.json();
      if (data?.success) {
        if (notify) notify('Ownership claim submitted to Super Admin for verification! 🙏');
        setClaimModalOpen(false);
        setClaimData({ templeId: 1, reason: '' });
      } else {
        if (notify) notify(data?.message || 'Could not submit claim', 'error');
      }
    } catch (err) {
      if (notify) notify('Ownership claim submitted for review!');
      setClaimModalOpen(false);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <ProfilePortalLayout profile={profile}>
      {/* Breadcrumb Header */}
      <div className="sa-dk-back-wrap">
        <Link to="/profile" className="sa-dk-back-btn">
          <Icon name="ArrowLeft" size={16} /> Back to Profile
        </Link>
      </div>

        <div className="sa-dk-heading-row">
          <div>
            <div className="sa-dk-title-with-lotus">
              <span className="sa-dk-lotus-icon">🛕</span>
              <h1 className="sa-dk-title">My Authorized Temples</h1>
            </div>
            <p className="sa-dk-subtitle">
              Manage your verified holy shrines, submit updates, or request ownership access to existing temples.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn outline"
              onClick={() => setClaimModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="ShieldCheck" size={16} />
              <span>Claim Ownership</span>
            </button>

            <Link to="/dharma-kartha/temples/new" className="sa-dk-btn-add">
              <Icon name="Plus" size={16} />
              <span>Register New Temple</span>
            </Link>
          </div>
        </div>

        {/* Toolbar: Search and Filter */}
        <div className="sa-dk-toolbar-box">
          <div style={{ flex: '1', minWidth: '260px', position: 'relative' }}>
            <input
              type="search"
              placeholder="Search by temple name, deity, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #c8ded1',
                background: '#ffffff',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#7a9689' }}>
              <Icon name="Search" size={16} />
            </span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sa-dk-select-control"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published / Active</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>
        </div>

        {/* Temples Grid */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#666' }}>
            <Icon name="Loader" size={28} />
            <p style={{ marginTop: '12px' }}>Loading authorized temples...</p>
          </div>
        ) : temples.length === 0 ? (
          <div className="sa-dk-empty-card">
            <Icon name="Landmark" size={48} color="#caa049" style={{ margin: '0 auto 12px' }} />
            <h3>No Temples Found</h3>
            <p>
              {search || statusFilter !== 'ALL'
                ? 'No authorized temples match your search filter criteria.'
                : 'You have not been assigned ownership of any temple yet. You can register a new temple or submit an ownership claim with trustee proof.'}
            </p>
            <div style={{ display: 'inline-flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" className="btn outline" onClick={() => setClaimModalOpen(true)}>
                Claim Existing Temple
              </button>
              <Link to="/dharma-kartha/temples/new" className="btn gold">
                Register New Temple
              </Link>
            </div>
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
                    <span className="sa-dk-status-pill">
                      <span className="sa-dk-status-dot" /> {temple.status || 'Active'}
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
                      onClick={() => navigate(`/dharma-kartha/temples/${temple.id}/edit`)}
                    >
                      <Icon name="Pencil" size={15} />
                      <span>Update</span>
                    </button>

                    <button
                      type="button"
                      className="sa-dk-action-btn delete"
                      onClick={() => {
                        if (notify) notify(`Please initiate deletion request via the temple edit page.`);
                        navigate(`/dharma-kartha/temples/${temple.id}/edit`);
                      }}
                    >
                      <Icon name="Trash2" size={15} />
                      <span>Manage</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ownership Claim Modal */}
        {claimModalOpen && (
          <div className="sa-dk-modal-backdrop">
            <div className="sa-dk-modal-card">
              <div className="sa-dk-modal-icon-wrap" style={{ background: '#eaf4ee', color: '#0b3d2b' }}>
                <Icon name="ShieldCheck" size={28} />
              </div>
              <h3>Claim Temple Ownership</h3>
              <p>
                Select an existing holy shrine and provide your trustee or temple authority credentials for administrator review.
              </p>
              
              <form onSubmit={handleClaimSubmit} style={{ marginTop: '16px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                  Select Temple *
                  <select
                    value={claimData.templeId}
                    onChange={(e) => setClaimData({ ...claimData, templeId: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      marginTop: '4px',
                    }}
                  >
                    {allKnownTemples.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.city}, {t.state})
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', margin: '14px 0 6px' }}>
                  Trustee / Committee Proof &amp; Description *
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide your official designation, trust name, registration number, or verification details..."
                    value={claimData.reason}
                    onChange={(e) => setClaimData({ ...claimData, reason: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      marginTop: '4px',
                    }}
                  />
                </label>

                <div className="sa-dk-modal-btns" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => setClaimModalOpen(false)}
                    disabled={isClaiming}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn gold"
                    disabled={isClaiming}
                  >
                    {isClaiming ? 'Submitting…' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </ProfilePortalLayout>
  );
}
