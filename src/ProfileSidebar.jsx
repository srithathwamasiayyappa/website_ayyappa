import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import './dharmaKarthaDashboard.css';

const Icon = ({ name = 'Sparkles', size = 18, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.85} {...props} />;
};

export default function ProfileSidebar({ profile: propProfile, god = 'Lord Ayyappa' }) {
  const { t } = useLanguage();
  const location = useLocation();
  const currentPath = location.pathname;

  const [profile, setProfile] = React.useState(propProfile || null);

  React.useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
      return;
    }
    try {
      const stored = localStorage.getItem('sa-profile');
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
  }, [propProfile]);

  const isDharmaKartha = profile?.role === 'DHARMA_KARTHA';
  const userName = profile?.fullName || profile?.name || (isDharmaKartha ? 'Dharma Kartha' : 'Devotee');
  const userCity = profile?.city || profile?.templeCity || 'Hyderabad';
  const avatarSrc = profile?.profileImageUrl || profile?.avatarUrl || '/images/ayyappa-icon.jpg';

  const [favCount, setFavCount] = React.useState(0);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('sa-favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setFavCount(parsed.length);
      }
    } catch {}
  }, [location.pathname]);

  const menuItems = [
    { id: 'edit-profile', label: t('menuEditProfile', 'Edit Profile'), icon: 'UserRoundPen', link: '/edit-profile' },
    { id: 'bookmarks', label: t('menuBookmarks', 'Bookmarks'), icon: 'Bookmark', link: '/bookmarks', badge: favCount > 0 ? favCount : null },
    ...(isDharmaKartha ? [
      { id: 'temples', label: t('menuManageTemples', 'Manage Your Temples'), icon: 'LayoutDashboard', link: '/dharma-kartha/dashboard' },
      { id: 'add-mandir', label: t('menuAddMandir', 'Add New Mandir'), icon: 'Landmark', link: '/dharma-kartha/temples/new' },
      { id: 'events', label: t('menuEvents', 'Events'), icon: 'CalendarDays', link: '/dharma-kartha/events' },
      { id: 'festivals', label: t('navFestivals', 'Festivals'), icon: 'Flame', link: '/dharma-kartha/festivals' },
      { id: 'gallery', label: t('tabGallery', 'Gallery'), icon: 'Image', link: '/dharma-kartha/gallery' },
    ] : []),
    { id: 'notifications', label: t('navNotifications', 'Notifications'), icon: 'Bell', link: isDharmaKartha ? '/dharma-kartha/notifications' : '/notifications' },
    { id: 'terms', label: t('footerTerms', 'Terms & Conditions'), icon: 'FileText', link: '/terms' },
    { id: 'privacy', label: t('footerPrivacy', 'Privacy Policy'), icon: 'ShieldCheck', link: '/privacy' },
    { id: 'refund', label: t('menuRefundPolicy', 'Refund Policy'), icon: 'RotateCcw', link: '/refund-policy' },
    { id: 'about', label: t('about', 'About'), icon: 'Info', link: '/about' },
    { id: 'delete-account', label: t('menuAccountDeletion', 'Delete Account'), icon: 'Trash2', link: '/delete-account', danger: true },
    { id: 'logout', label: t('menuLogout', 'Logout'), icon: 'LogOut', link: '/logout' },
  ];

  const isItemActive = (item) => {
    if (currentPath === item.link) return true;
    if (item.id === 'bookmarks' && currentPath === '/bookmarks') return true;
    if (item.id === 'refund' && (currentPath === '/refund-policy' || currentPath === '/refunds')) return true;
    if (item.id === 'events' && (currentPath === '/dharma-kartha/events' || currentPath === '/events')) return true;
    if (item.id === 'festivals' && currentPath.startsWith('/dharma-kartha/festivals')) return true;
    if (item.id === 'gallery' && currentPath.startsWith('/dharma-kartha/gallery')) return true;
    if (item.id === 'delete-account' && (currentPath === '/delete-account' || currentPath === '/account-deletion')) return true;
    if (item.id === 'temples' && (currentPath === '/dharma-kartha/temples' || currentPath === '/dharma-kartha' || currentPath.startsWith('/dharma-kartha/temples/'))) {
      if (currentPath === '/dharma-kartha/temples/new') return false;
      return true;
    }
    if (item.id === 'add-mandir' && (currentPath === '/dharma-kartha/temples/new' || currentPath === '/add-mandir')) return true;
    if (item.id === 'notifications' && (currentPath === '/notifications' || currentPath === '/dharma-kartha/notifications')) return true;
    return false;
  };

  return (
    <aside className="sa-dk-sidebar-card">
      <div className="sa-dk-profile-header">
        <div className="sa-dk-avatar-ring">
          <img
            src={avatarSrc}
            alt={userName}
            className="sa-dk-avatar-img"
            onError={(e) => { e.target.src = '/images/ayyappa-icon.jpg'; }}
          />
        </div>

        <h2 className="sa-dk-user-name">{userName}</h2>
        <p className="sa-dk-user-location">
          {userCity}, India • {god}
        </p>
      </div>

      <nav className="sa-dk-menu-list">
        {menuItems.map((item) => {
          const active = isItemActive(item);
          return (
            <Link
              key={item.id}
              to={item.link}
              className={`sa-dk-menu-item ${active ? 'active' : ''} ${item.danger ? 'sa-danger-item' : ''}`}
              style={item.danger ? { color: '#dc2626' } : undefined}
            >
              <div className="sa-dk-menu-item-left">
                <Icon name={item.icon} size={18} style={item.danger ? { color: '#dc2626' } : undefined} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge !== null && (
                  <span style={{
                    background: '#0b3d2b',
                    color: '#d4a753',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    marginLeft: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <Icon name="ChevronRight" size={15} className="sa-dk-menu-arrow" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
