import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import { useLanguage } from './LanguageContext';
import './notifications.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function NotificationsPage({ notify, onUnreadChange }) {
  const navigate = useNavigate();
  const { currentLanguage, t } = useLanguage();

  // Dynamic notifications fetched live from MariaDB/MySQL database via API
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const getActiveUserId = () => {
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

  const fetchLiveNotifications = async () => {
    if (!activeUserId) {
      setAuthRequired(true);
      setLoading(false);
      setNotifications([]);
      if (onUnreadChange) onUnreadChange(0);
      return;
    }

    try {
      setLoading(true);
      setAuthRequired(false);
      const res = await fetch(`${API_BASE_URL}/notifications?role=CUSTOMER&lang=${currentLanguage}`, {
        headers: {
          'x-user-id': String(activeUserId),
        },
      });

      if (res.status === 401) {
        setAuthRequired(true);
        setNotifications([]);
        if (onUnreadChange) onUnreadChange(0);
        return;
      }

      const json = await res.json();
      const list = json.notifications || json.data || [];
      if (res.ok && Array.isArray(list)) {
        setNotifications(list);
        const unreadCount = json.unreadCount !== undefined ? json.unreadCount : list.filter((n) => !n.read && !n.isRead).length;
        if (onUnreadChange) onUnreadChange(unreadCount);
      } else {
        setNotifications([]);
        if (onUnreadChange) onUnreadChange(0);
      }
    } catch (e) {
      console.warn('Error fetching live notifications:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 15000); // 15-second live polling
    return () => clearInterval(interval);
  }, [activeUserId]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && !n.isRead).length;
  }, [notifications]);

  // Filter pills
  const filters = [
    { id: 'All', label: 'All' },
    { id: 'Unread', label: 'Unread', hasDot: unreadCount > 0 },
    { id: 'Temple Updates', label: 'Temple Updates', cat: 'temple' },
    { id: 'Annadanam', label: 'Annadanam', cat: 'annadanam' },
    { id: 'Festivals', label: 'Festivals', cat: 'festival' },
  ];

  // Filtered & Searched list
  const filteredList = useMemo(() => {
    return notifications.filter((item) => {
      // Category filter
      const isRead = item.read || item.isRead;
      if (filter === 'Unread' && isRead) return false;
      if (filter === 'Temple Updates' && item.category !== 'temple') return false;
      if (filter === 'Annadanam' && item.category !== 'annadanam') return false;
      if (filter === 'Festivals' && item.category !== 'festival') return false;

      // Search
      const q = search.trim().toLowerCase();
      if (q) {
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesDesc = (item.desc || item.message || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc;
      }
      return true;
    });
  }, [notifications, filter, search]);

  const handleMarkAsRead = async (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true, isRead: true } : n))
    );
    if (activeUserId) {
      try {
        await fetch(`${API_BASE_URL}/notifications/${item.id}/read?role=CUSTOMER`, {
          method: 'PATCH',
          headers: { 'x-user-id': String(activeUserId) },
        });
      } catch {}
    }
    if (item.destination || item.linkUrl) {
      navigate(item.destination || item.linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    if (activeUserId) {
      try {
        await fetch(`${API_BASE_URL}/notifications/mark-all-read?role=CUSTOMER`, {
          method: 'PATCH',
          headers: { 'x-user-id': String(activeUserId) },
        });
      } catch {}
    }
    if (notify) {
      notify('All devotional notifications marked as read.');
    }
  };

  return (
    <main className="sa-notifications-page">
      <div className="sa-notifications-container">
        {/* =========================================================
            1. PAGE HEADING WITH FLANKING DIAMONDS & GOLD LOTUS DIVIDER
            ========================================================= */}
        <header className="sa-notif-header">
          <div className="sa-notif-eyebrow-wrap">
            <span className="sa-notif-eyebrow-diamond">✦</span>
            <p className="sa-notif-eyebrow">{t('notificationsEyebrow', 'STAY CONNECTED')}</p>
            <span className="sa-notif-eyebrow-diamond">✦</span>
          </div>

          <h1 className="sa-notif-title">{t('notificationsTitle', 'Notifications')}</h1>

          <p className="sa-notif-subtitle">
            {t('notificationsSubtitle', 'Devotional reminders, festival notices and announcements.')}
          </p>

          <div className="sa-notif-divider" aria-hidden="true">
            <span className="sa-notif-divider-line"></span>
            <span className="sa-notif-divider-lotus">❀</span>
            <span className="sa-notif-divider-line"></span>
          </div>
        </header>

        {/* =========================================================
            2. TOP NOTIFICATION TOOLBAR
            ========================================================= */}
        <div className="sa-notif-toolbar">
          <div className="sa-notif-toolbar-left">
            {/* Unread count badge */}
            <div className="sa-notif-unread-count-badge">
              <span>{unreadCount} unread sample updates</span>
            </div>

            <div className="sa-notif-toolbar-sep" aria-hidden="true" />

            {/* Filter pills */}
            <div className="sa-notif-filters" role="tablist">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`sa-notif-filter-pill ${filter === f.id ? 'active' : ''}`}
                  onClick={() => setFilter(f.id)}
                  role="tab"
                  aria-selected={filter === f.id}
                >
                  <span>{f.label}</span>
                  {f.hasDot && <span className="sa-notif-filter-unread-dot" />}
                </button>
              ))}
            </div>
          </div>

          <div className="sa-notif-toolbar-right">
            {/* Search Box */}
            <div className="sa-notif-search-box">
              <Icon name="Search" size={17} className="sa-notif-search-icon" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                aria-label="Search notifications"
              />
              {search && (
                <button
                  type="button"
                  className="sa-notif-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <Icon name="X" size={15} />
                </button>
              )}
            </div>

            {/* Mark All as Read button */}
            <button
              type="button"
              className="sa-notif-mark-read-btn"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              aria-label="Mark all notifications as read"
            >
              <Icon name="Check" size={16} />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            3. NOTIFICATION CARDS LIST OR AUTH REQUIRED STATE
            ========================================================= */}
        {authRequired ? (
          <div className="sa-notif-empty-state" style={{ background: '#fff', border: '1px solid #e8dfcf', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', margin: '30px 0' }}>
            <Icon name="Lock" size={44} style={{ color: '#b45309', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#1a2e22', marginBottom: '8px' }}>Authentication Required</h3>
            <p style={{ color: '#666', maxWidth: '460px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Please log in with your mobile number to access your personal devotional notifications, Panchangam alerts, and temple pooja updates.
            </p>
            <button
              type="button"
              className="btn primary"
              onClick={() => navigate('/auth-login')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
            >
              <Icon name="LogIn" size={18} />
              <span>Log In to View Notifications</span>
            </button>
          </div>
        ) : (
          <section className="sa-notif-list" aria-label="Notifications List">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
                <Icon name="Loader" size={28} />
                <p style={{ marginTop: '10px' }}>Loading your devotional notifications...</p>
              </div>
            ) : filteredList.map((item) => (
              <article
                key={item.id}
                className={`sa-notif-card ${item.read || item.isRead ? 'read' : 'unread'}`}
                onClick={() => handleMarkAsRead(item)}
                role="button"
                tabIndex={0}
                aria-label={`${item.title} - ${item.read || item.isRead ? 'Read' : 'Unread'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMarkAsRead(item);
                  }
                }}
              >
                <div className="sa-notif-card-left">
                  {/* Left Medallion Icon */}
                  <div className="sa-notif-medallion">
                    <Icon name={item.icon || (item.category === 'festival' ? 'Flame' : item.category === 'panchangam' ? 'Sun' : item.category === 'pooja' ? 'Sparkles' : 'Bell')} size={22} />
                  </div>

                  {/* Text Content */}
                  <div className="sa-notif-card-info">
                    <div className="sa-notif-card-title-row">
                      {!(item.read || item.isRead) && <span className="sa-notif-unread-dot" title="Unread" />}
                      <h3 className="sa-notif-card-title">{item.title}</h3>
                    </div>
                    <p className="sa-notif-card-desc">{item.desc || item.message}</p>
                  </div>
                </div>

                {/* Right: Timestamp & Chevron */}
                <div className="sa-notif-card-right">
                  <span className="sa-notif-card-time">{item.time || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent')}</span>
                  <Icon name="ChevronRight" size={20} className="sa-notif-card-arrow" />
                </div>
              </article>
            ))}

            {/* Empty States */}
            {!loading && filteredList.length === 0 && (
              <div className="sa-notif-empty-state">
                <Icon name="BellOff" size={36} className="sa-notif-empty-icon" />
                {filter === 'Unread' ? (
                  <>
                    <h3>You're all caught up!</h3>
                    <p>Your devotional updates have all been read.</p>
                    <button
                      type="button"
                      className="sa-notif-empty-btn"
                      onClick={() => setFilter('All')}
                    >
                      View All Notifications
                    </button>
                  </>
                ) : (
                  <>
                    <h3>No notifications found</h3>
                    <p>Try another search or choose a different filter.</p>
                    <button
                      type="button"
                      className="sa-notif-empty-btn"
                      onClick={() => {
                        setSearch('');
                        setFilter('All');
                      }}
                    >
                      Reset Filters
                    </button>
                  </>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

