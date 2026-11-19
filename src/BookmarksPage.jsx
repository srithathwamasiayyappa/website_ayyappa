import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { tracks, temples, stotras, poojas } from './data';

const Icon = ({ name = 'Sparkles', size = 18, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

const Tag = ({ children }) => <span className="tag">{children}</span>;

function PageHeading({ eyebrow, title, desc }) {
  return (
    <div className="page-header">
      <Tag>{eyebrow}</Tag>
      <h1>{title}</h1>
      <p>{desc}</p>
      <span className="title-rule">✦ &nbsp; ━━━━━ &nbsp; ❀ &nbsp; ━━━━━ &nbsp; ✦</span>
    </div>
  );
}

// Recommended items to quick-add if bookmarks are empty
const SUGGESTED_ITEMS = [
  { name: 'Swamiye Saranam Ayyappa (Sloka)', type: 'sloka', url: '/sloka-detail', sub: 'Sacred invocation of Lord Ayyappa' },
  { name: 'Harivarasanam', type: 'song', url: '/songs-detail', sub: 'Sacred lullaby of Ayyappa • 06:10' },
  { name: 'Sabarimala Sri Ayyappa Temple', type: 'temple', url: '/temple-detail', sub: 'Pathanamthitta, Kerala • Sacred 18 steps' },
  { name: 'Sri Ayyappa Ashtothram', type: 'stotra', url: '/stotras', sub: '108 divine names of Lord Ayyappa' },
  { name: 'Ayyappa Bhajan — Swamiye Saranam', type: 'song', url: '/songs-detail', sub: 'Traditional Ayyappa Bhajan • 04:38' },
  { name: 'Sri Venkateswara Temple', type: 'temple', url: '/temple-detail', sub: 'Tirumala, Andhra Pradesh • Renowned hill shrine' },
];

export default function BookmarksPage({ favorites = [], toggleFav, notify }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Build structured metadata for saved items
  const enrichedItems = useMemo(() => {
    return favorites.map((favName) => {
      // Check if it's a temple
      const foundTemple = temples.find(t => t.name.toLowerCase() === favName.toLowerCase());
      if (foundTemple) {
        return {
          id: favName,
          title: foundTemple.name,
          category: 'Temples',
          subtitle: `${foundTemple.city}, ${foundTemple.state} • ${foundTemple.deity}`,
          special: foundTemple.special,
          link: '/temple-detail',
          icon: 'Landmark',
          badge: 'Temple Shrine',
        };
      }

      // Check if it's a song/bhajan track
      const foundTrack = tracks.find(t => t[0].toLowerCase() === favName.toLowerCase() || favName.toLowerCase().includes(t[0].toLowerCase()));
      if (foundTrack) {
        return {
          id: favName,
          title: foundTrack[0],
          category: 'Bhajans & Songs',
          subtitle: `${foundTrack[1]} • Duration ${foundTrack[2]}`,
          special: 'Soulful devotional melody',
          link: '/songs-detail',
          icon: 'Music2',
          badge: 'Devotional Track',
        };
      }

      // Check if it's a stotra
      const foundStotra = stotras.find(s => s[0].toLowerCase() === favName.toLowerCase() || favName.toLowerCase().includes(s[0].toLowerCase()));
      if (foundStotra) {
        return {
          id: favName,
          title: foundStotra[0],
          category: 'Slokas & Prayers',
          subtitle: foundStotra[1],
          special: 'Sacred chanting verse',
          link: '/stotras',
          icon: 'BookOpenText',
          badge: 'Divine Stotra',
        };
      }

      // Check if it's a pooja
      const foundPooja = poojas.find(p => p[0].toLowerCase() === favName.toLowerCase() || favName.toLowerCase().includes(p[0].toLowerCase()));
      if (foundPooja) {
        return {
          id: favName,
          title: foundPooja[0],
          category: 'Pooja Vidhanam',
          subtitle: `${foundPooja[1]} • ${foundPooja[2]}`,
          special: 'Sacred step-by-step ritual',
          link: '/pooja-detail',
          icon: 'Flame',
          badge: 'Pooja Vidhi',
        };
      }

      // Generic devotional bookmark
      return {
        id: favName,
        title: favName,
        category: 'Slokas & Prayers',
        subtitle: 'Devotional verse & prayer collection',
        special: 'Saved prayer invocation',
        link: '/sloka-detail',
        icon: 'Bookmark',
        badge: 'Saved Devotion',
      };
    });
  }, [favorites]);

  // Filter and search
  const filteredItems = useMemo(() => {
    return enrichedItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                            item.subtitle.toLowerCase().includes(search.toLowerCase());
      const matchesCat = filter === 'All' || item.category === filter;
      return matchesSearch && matchesCat;
    });
  }, [enrichedItems, search, filter]);

  const categories = ['All', 'Slokas & Prayers', 'Bhajans & Songs', 'Temples', 'Pooja Vidhanam'];

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '10px 0 40px' }}>
      <PageHeading
        eyebrow="YOUR DEVOTIONAL ARCHIVE"
        title="Saved Bookmarks"
        desc="Access your personal collection of sacred prayers, divine bhajans, and favorite temples."
      />

      {/* SEARCH & FILTER CONTROLS */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dce8e0',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '22px',
        boxShadow: '0 4px 16px rgba(11, 61, 43, 0.04)',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div style={{
            flex: '1 1 280px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Icon name="Search" size={17} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your saved bookmarks..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b3d2b' }}>
            Total Saved: <span style={{ color: '#d4a753' }}>{favorites.length}</span>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(c => {
            const count = c === 'All'
              ? enrichedItems.length
              : enrichedItems.filter(i => i.category === c).length;
            const active = filter === c;
            return (
              <button
                type="button"
                key={c}
                onClick={() => setFilter(c)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: active ? '700' : '500',
                  background: active ? '#0b3d2b' : '#f3f4f6',
                  color: active ? '#d4a753' : '#4b5563',
                  border: active ? '1px solid #0b3d2b' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* BOOKMARKS LIST */}
      {filteredItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0b3d2b, #1b5e43)',
                  color: '#d4a753',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon name={item.icon} size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#111827', fontWeight: '700' }}>
                      {item.title}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}>
                      {item.badge}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to={item.link}
                  style={{
                    background: '#0b3d2b',
                    color: '#d4a753',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Open</span>
                  <Icon name="ArrowRight" size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(item.title);
                    notify?.(`Copied "${item.title}" to clipboard`);
                  }}
                  title="Copy Name"
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    color: '#4b5563',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="Copy" size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleFav?.(item.id);
                    notify?.(`Removed "${item.title}" from bookmarks`);
                  }}
                  title="Remove Bookmark"
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="Trash2" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE WITH RECOMMENDATIONS */
        <div className="rich-card" style={{ textAlign: 'center', padding: '36px 20px', borderRadius: '18px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef3c7',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Icon name="Bookmark" size={30} />
          </div>
          <h2 style={{ fontSize: '20px', margin: '0 0 8px', color: '#0b3d2b' }}>
            {search ? 'No bookmarks match your search' : 'No Bookmarks Yet'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            {search
              ? 'Try searching for a different keyword or switch the category filter above.'
              : 'You haven\'t saved any devotional items yet. Click below to add popular devotional verses, prayers, and mandirs to your bookmarks.'}
          </p>

          {!search && (
            <div style={{ textAlign: 'left', marginTop: '20px' }}>
              <h3 style={{ fontSize: '15px', color: '#0b3d2b', marginBottom: '14px', fontWeight: '700' }}>
                🌟 Suggested Devotional Items to Quick Bookmark:
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {SUGGESTED_ITEMS.map((item) => {
                  const isBookmarked = favorites.includes(item.name);
                  return (
                    <div
                      key={item.name}
                      style={{
                        background: '#fdfbf7',
                        border: '1px solid #ebd9ba',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>
                          {item.name}
                        </strong>
                        <small style={{ color: '#7a6344', fontSize: '12px' }}>
                          {item.sub}
                        </small>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to={item.url} style={{ fontSize: '12px', color: '#0b3d2b', fontWeight: '600' }}>
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            toggleFav?.(item.name);
                            notify?.(isBookmarked ? `Removed ${item.name}` : `Saved ${item.name} to bookmarks!`);
                          }}
                          style={{
                            background: isBookmarked ? '#0b3d2b' : '#ffffff',
                            color: isBookmarked ? '#d4a753' : '#0b3d2b',
                            border: '1px solid #0b3d2b',
                            borderRadius: '16px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Icon name={isBookmarked ? "Check" : "Bookmark"} size={13} />
                          <span>{isBookmarked ? 'Bookmarked' : 'Bookmark +'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
