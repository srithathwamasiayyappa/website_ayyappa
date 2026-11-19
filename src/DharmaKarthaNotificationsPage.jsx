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

export default function DharmaKarthaNotificationsPage({ notify, profile }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const getActiveUserId = () => {
    if (profile?.id) return profile.id;
    try {
      const stored = localStorage.getItem('sa-profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) return parsed.id;
      }
    } catch {}
    return null;
  };

  const activeUserId = getActiveUserId();

  const fetchNotifs = () => {
    if (!activeUserId) {
      setAuthError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthError(false);
    fetch(`${API_BASE_URL}/notifications?role=DHARMA_KARTHA`, {
      headers: {
        'x-user-id': String(activeUserId),
      },
    })
      .then((res) => {
        if (res.status === 401) {
          setAuthError(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data?.notifications) setNotifications(data.notifications);
        if (data?.unreadCount !== undefined) setUnreadCount(data.unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, [activeUserId]);

  const handleMarkRead = async (id) => {
    if (!activeUserId) return;
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read?role=DHARMA_KARTHA`, {
        method: 'PATCH',
        headers: { 'x-user-id': String(activeUserId) },
      });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    if (!activeUserId) return;
    try {
      await fetch(`${API_BASE_URL}/notifications/mark-all-read?role=DHARMA_KARTHA`, {
        method: 'PATCH',
        headers: { 'x-user-id': String(activeUserId) },
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (notify) notify('All notifications marked as read.');
    } catch {}
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'READ') return n.isRead;
    return true;
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
              <span className="sa-dk-lotus-icon">🔔</span>
              <h1 className="sa-dk-title">Dharma Kartha Notifications</h1>
            </div>
            <p className="sa-dk-subtitle">
              Administrative approvals, ownership claim status, festival confirmations, and devotee activity updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="btn outline"
              onClick={handleMarkAllRead}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="CheckCheck" size={16} />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All (${notifications.length})` },
            { id: 'UNREAD', label: `Unread (${unreadCount})` },
            { id: 'READ', label: 'Read' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`sa-dk-filter-pill ${filter === f.id ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {authError ? (
          <div className="sa-dk-empty-card" style={{ background: '#fff', border: '1px solid #e8dfcf', borderRadius: '14px', padding: '50px 20px', textAlign: 'center' }}>
            <Icon name="Lock" size={40} color="#b45309" style={{ margin: '0 auto 12px' }} />
            <h3>Authentication Required</h3>
            <p style={{ color: '#666', margin: '0 auto 20px', maxWidth: '440px' }}>
              Please log in to your registered Dharma Kartha account to view temple notifications, claim status, and administrative alerts.
            </p>
            <button type="button" className="btn primary" onClick={() => navigate('/auth-login?role=DHARMA_KARTHA')}>
              Log In as Dharma Kartha
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
            <Icon name="Loader" size={28} />
            <p style={{ marginTop: '10px' }}>Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sa-dk-empty-card" style={{ background: '#fff', border: '1px solid #e8dfcf', borderRadius: '14px', padding: '50px 20px', textAlign: 'center' }}>
            <Icon name="BellOff" size={40} color="#caa049" style={{ margin: '0 auto 12px' }} />
            <h3>No Notifications</h3>
            <p style={{ color: '#666', margin: '0 auto', maxWidth: '400px' }}>
              You are completely caught up! New approval updates will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                style={{
                  background: n.isRead ? '#fff' : '#f7faf8',
                  border: n.isRead ? '1px solid #e8dfcf' : '1px solid #b7d8c4',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      background: n.type === 'APPROVAL' ? '#eaf4ee' : '#fef8ea',
                      color: n.type === 'APPROVAL' ? '#0b3d2b' : '#caa049',
                      padding: '10px',
                      borderRadius: '10px',
                      display: 'flex',
                    }}
                  >
                    <Icon name={n.type === 'APPROVAL' ? 'ShieldCheck' : 'Bell'} size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ color: '#0b3d2b', fontSize: '16px', margin: 0, fontWeight: 700 }}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0b3d2b' }} />
                      )}
                    </div>
                    <p style={{ color: '#555', fontSize: '14px', margin: '6px 0 8px' }}>
                      {n.message}
                    </p>
                    <small style={{ color: '#888' }}>{new Date(n.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {n.linkUrl && (
                    <button
                      type="button"
                      className="btn outline"
                      onClick={() => {
                        handleMarkRead(n.id);
                        navigate(n.linkUrl);
                      }}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Open Record
                    </button>
                  )}
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      style={{ background: 'transparent', border: 'none', color: '#0b3d2b', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

    </ProfilePortalLayout>
  );
}
