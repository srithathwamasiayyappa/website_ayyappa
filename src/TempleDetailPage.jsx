import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { temples, image } from './data';
import { API_BASE_URL } from './apiConfig';
import './templeDetailPage.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function TempleDetailPage({ notify, favorites = [], toggleFav }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [templeTab, setTempleTab] = useState('About');

  // Selected temple data from navigation state or default to Sabarimala
  const templeName = location.state?.name || 'Sabarimala Sri Ayyappa Temple';
  const initialData = temples.find((t) => t.name === templeName) || temples[0];
  const [templeData, setTempleData] = useState(initialData);
  const [dbTimings, setDbTimings] = useState([]);
  const [dbGallery, setDbGallery] = useState([]);
  const [dbFestivals, setDbFestivals] = useState([]);

  // Fetch verified dynamic database record for this temple
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/dharma-kartha/public/temples/${encodeURIComponent(templeName)}/details`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && data.temple) {
          setTempleData((prev) => ({
            ...prev,
            ...data.temple,
            about: data.temple.about || prev.about,
            history: data.temple.history || prev.history,
            speciality: data.temple.speciality || prev.special,
            special: data.temple.speciality || prev.special,
            city: data.temple.city || prev.city,
            state: data.temple.state || prev.state,
            deity: data.temple.primaryDeity || prev.deity,
            officePhone: data.temple.officePhone || prev.officePhone,
            officialEmail: data.temple.officialEmail || prev.officialEmail,
            officialWebsite: data.temple.officialWebsite || prev.officialWebsite,
          }));
          if (Array.isArray(data.temple.timings) && data.temple.timings.length > 0) {
            setDbTimings(data.temple.timings.map((t) => ({
              title: t.title,
              time: t.timeWindow,
              desc: t.description,
            })));
          }
        }
      })
      .catch(() => { });

    // Fetch dynamic approved gallery media for this temple
    fetch(`${API_BASE_URL}/dharma-kartha/public/temples/${encodeURIComponent(templeName)}/gallery`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.media) && data.media.length > 0) {
          setDbGallery(data.media);
        }
      })
      .catch(() => { });

    // Fetch dynamic approved festivals for this temple
    fetch(`${API_BASE_URL}/dharma-kartha/public/temples/${encodeURIComponent(templeName)}/festivals`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.festivals) && data.festivals.length > 0) {
          setDbFestivals(data.festivals);
        }
      })
      .catch(() => { });

    return () => { isMounted = false; };
  }, [templeName]);

  // Local fallback for favorites if not passed through props
  const [localSaved, setLocalSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sa-favorites') || '[]');
      return saved.includes(templeData.name);
    } catch {
      return false;
    }
  });

  const isFavorited = favorites.length > 0 ? favorites.includes(templeData.name) : localSaved;

  const handleToggleFavorite = () => {
    if (toggleFav) {
      toggleFav(templeData.name);
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem('sa-favorites') || '[]');
        const updated = saved.includes(templeData.name)
          ? saved.filter((item) => item !== templeData.name)
          : [...saved, templeData.name];
        localStorage.setItem('sa-favorites', JSON.stringify(updated));
        setLocalSaved(updated.includes(templeData.name));
        if (notify) {
          notify(
            updated.includes(templeData.name)
              ? `Added ${templeData.name} to your Favorites 🙏`
              : `Removed from Favorites`
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${templeData.name} — Saranam Ayyappa`,
      text: `Explore darshan timings, sacred history, and festivals of ${templeData.name}, ${templeData.city}, ${templeData.state}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (notify) notify('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError' && notify) {
          notify('Link copied to clipboard!');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (notify) notify('Temple link copied to clipboard! 📋');
      } catch {
        if (notify) notify('Could not copy link');
      }
    }
  };

  // Temple official websites and map coordinates mapping
  const templeWebsites = {
    'Sabarimala Sri Ayyappa Temple': 'https://sabarimala.kerala.gov.in',
    'Sri Venkateswara Temple': 'https://ttdevasthanams.ap.gov.in',
    'Kashi Vishwanath Temple': 'https://shrikashivishwanath.org',
    'Meenakshi Amman Temple': 'https://maduraimeenakshi.hrce.tn.gov.in',
    'Kedarnath Temple': 'https://badrinath-kedarnath.gov.in',
    'Kanaka Durga Temple': 'https://kanakadurgamma.org',
  };

  const templeWebsiteUrl = templeWebsites[templeData.name] || 'https://www.temple.org';
  const templeMapQuery = encodeURIComponent(`${templeData.name}, ${templeData.city}, ${templeData.state}`);
  const templeMapUrl = `https://www.google.com/maps/search/?api=1&query=${templeMapQuery}`;

  // Specific data enrichments per temple
  const isSabarimala = templeData.name.includes('Sabarimala');
  const isTirumala = templeData.name.includes('Venkateswara');
  const isKashi = templeData.name.includes('Kashi');
  const isKedarnath = templeData.name.includes('Kedarnath');
  const isMeenakshi = templeData.name.includes('Meenakshi');
  const isKanaka = templeData.name.includes('Kanaka');

  // Temple HD banner mapping
  const templeBannerMap = {
    'Sabarimala Sri Ayyappa Temple': '/images/temples/banner-sabarimala-hd.png',
    'Sri Venkateswara Temple': '/images/temples/banner-venkateswara-hd.png',
    'Kashi Vishwanath Temple': '/images/temples/banner-kashi-hd.png',
    'Meenakshi Amman Temple': '/images/temples/banner-meenakshi-hd.png',
    'Kedarnath Temple': '/images/temples/banner-kedarnath-hd.png',
    'Kanaka Durga Temple': '/images/temples/banner-kanaka-hd.png',
  };
  const templeHeroBanner = templeBannerMap[templeData.name] || image(templeData.image || 'temple-hero');

  // Temple Gopuram / Vimana image mapping
  const templeGopuramMap = {
    'Sabarimala Sri Ayyappa Temple': '/images/live-streams/golden-temple-staircase.png',
    'Sri Venkateswara Temple': '/images/live-streams/sri-venkateswara-temple.png',
    'Kashi Vishwanath Temple': '/images/temple-steps.jpg',
    'Meenakshi Amman Temple': '/images/festival.jpg',
    'Kedarnath Temple': '/images/temples-card.jpg',
    'Kanaka Durga Temple': '/images/pooja-altar.jpg',
  };
  const templeGopuramImg = templeGopuramMap[templeData.name] || '/images/temple-steps.jpg';

  // Highlight darshan hours string
  const darshanHoursStr = isSabarimala
    ? '03:00 AM – 11:00 PM'
    : isTirumala
      ? '03:00 AM – 11:30 PM'
      : isKedarnath
        ? '05:00 AM – 09:00 PM'
        : '05:00 AM – 09:30 PM';

  // Daily Aarti & Darshan Timings (Uses verified DB timings if present, otherwise temple-specific defaults)
  const fallbackSchedule = isSabarimala ? [
    { title: 'Nirmalya Darshanam', time: '03:00 AM – 03:30 AM', desc: 'First divine darshan with sacred chants' },
    { title: 'Ganapathi Homam & Abhishekam', time: '03:30 AM – 07:00 AM', desc: 'Ghee abhishekam of Lord Ayyappa' },
    { title: 'Usha Pooja & Morning Darshan', time: '07:30 AM – 11:30 AM', desc: 'Morning sacred offerings and archana' },
    { title: 'Ucha Pooja (Noon Worship)', time: '12:00 PM – 01:00 PM', desc: 'Maha prasadam offering & afternoon closure' },
    { title: 'Evening Reopening & Deeparadhana', time: '04:00 PM – 06:30 PM', desc: 'Evening grand camphor lamp aarti' },
    { title: 'Pushpabhishekam & Athazha Pooja', time: '07:00 PM – 10:30 PM', desc: 'Sacred flower shower and night pooja' },
    { title: 'Harivarasanam & Nada Thura Closure', time: '11:00 PM', desc: 'The sacred divine lullaby of Lord Ayyappa' },
  ] : [
    { title: 'Suprabhatam & Mangala Aarti', time: '04:30 AM – 05:30 AM', desc: 'Awakening ritual with divine morning hymns' },
    { title: 'Pratah Darshan & Nitya Archana', time: '06:00 AM – 11:30 AM', desc: 'Sacred abhishekam, flower offerings & devotee seva' },
    { title: 'Madhyahna Pooja & Bhog Aarti', time: '12:00 PM – 01:00 PM', desc: 'Midday naivedyam and sanctum closure' },
    { title: 'Sandhya Deeparadhana', time: '06:00 PM – 07:15 PM', desc: 'Evening sacred brass lamp aarti with bells' },
    { title: 'Shayana Aarti & Night Closure', time: '08:30 PM – 09:30 PM', desc: 'Closing prayers, peaceful lullaby and night rest' },
  ];

  const aartiSchedule = dbTimings.length > 0 ? dbTimings : fallbackSchedule;

  // Devotional Media Gallery (Synchronized with approved database records)
  const defaultGallery = [
    { title: 'Temple Sanctum & Golden Dome', type: 'Photo', url: '/images/temple-hero.jpg', caption: 'Sacred architectural view of the holy sanctum' },
    { title: 'Holy Steps & Outer Prakaram', type: 'Photo', url: '/images/temple-steps.jpg', caption: 'The sacred ascent leading devotees to the Lord' },
    { title: 'Devotional Deeparadhana Aarti', type: 'Video', url: '/images/festival.jpg', caption: 'Sacred evening lamp illumination and musical chorus' },
    { title: 'Pilgrim Mountain Pathway', type: 'Photo', url: '/images/temples-card.jpg', caption: 'Misty spiritual forest trail traversed by devotees' },
  ];

  const mediaGallery = dbGallery.length > 0 ? dbGallery : defaultGallery;

  // Annual Festivals & Auspicious Observances
  const fallbackFestivals = isSabarimala ? [
    { name: 'Mandala Pooja Mahotsavam', period: 'Mid-November to Late December', desc: '41 days of austere penance, sacred vratham, fasting and deep devotional sadhana.' },
    { name: 'Makaravilakku & Makara Sankranti', period: '14th January (Annual)', desc: 'The most sacred pilgrimage evening witnessing the divine celestial Makara Jyothi above Ponnambalamedu.' },
    { name: 'Maha Vishu Festival', period: 'Mid-April', desc: 'Auspicious new year darshan and specialized kani offerings at the holy shrine.' },
    { name: 'Panguni Uthiram & Temple Arattu', period: 'March – April', desc: 'Annual temple festival culminating in the sacred Arattu immersion in river Pampa.' },
  ] : [
    { name: 'Brahmotsavam Grand Celebration', period: 'Annual Major Festival', desc: 'Multi-day grand celestial procession featuring royal vahanas, floral canopies and thousands of pilgrims.' },
    { name: 'Maha Shivaratri / Vaikunta Ekadasi', period: 'Auspicious Lunar Day', desc: 'All-night devotional vigilance, continuous chanting, sacred abhishekam, and special darshan lines.' },
    { name: 'Navaratri & Deepotsavam', period: 'Autumn Season', desc: 'Nine days of grand adornment, special musical kirtans, and thousands of oil lamps illuminating the premises.' },
  ];

  const festivalList = dbFestivals.length > 0 ? dbFestivals : fallbackFestivals;

  // Devotee Reviews & Pilgrim Experiences
  const [reviews, setReviews] = useState([
    {
      name: 'Ramesh Guruswamy',
      city: 'Chennai, Tamil Nadu',
      rating: 5,
      date: 'November 2026',
      comment: 'The divine vibration upon ascending the holy 18 steps and witnessing Lord Ayyappa is beyond words. Swamiye Saranam Ayyappa! Very well organized queue management and free annadanam.'
    },
    {
      name: 'Ananthakrishnan K.',
      city: 'Kochi, Kerala',
      rating: 5,
      date: 'October 2026',
      comment: 'An uplifting spiritual atmosphere. The evening Harivarasanam experience touches the deepest corners of the soul. Ensure to carry warm clothes for early morning darshan.'
    },
    {
      name: 'Suresh Kumar Reddy',
      city: 'Hyderabad, Telangana',
      rating: 5,
      date: 'September 2026',
      comment: 'Peaceful and majestic. Every pilgrim is welcomed with kindness and seva. Devotee facilities, drinking water, and prasad distribution are well maintained.'
    }
  ]);

  const [newReview, setNewReview] = useState({ name: '', city: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      if (notify) notify('Please enter your name and devotional experience.');
      return;
    }
    const reviewObj = {
      name: newReview.name.trim(),
      city: newReview.city.trim() || 'India',
      rating: Number(newReview.rating) || 5,
      date: 'Just now',
      comment: newReview.comment.trim()
    };
    setReviews([reviewObj, ...reviews]);
    setNewReview({ name: '', city: '', rating: 5, comment: '' });
    setShowReviewForm(false);
    if (notify) notify('Thank you! Your devotional review has been submitted.');
  };

  // Remaining temples list (excluding the current temple)
  const otherTemples = temples.filter((t) => t.name !== templeData.name);

  const tabs = [
    { id: 'About', label: 'About / History', icon: 'Info' },
    { id: 'Speciality', label: 'Speciality', icon: 'Sparkles' },
    { id: 'Timings', label: 'Time & Aarti', icon: 'Clock' },
    { id: 'Media', label: 'Media', icon: 'Image' },
    { id: 'Festivals', label: 'Festivals', icon: 'CalendarDays' },
    { id: 'Contact', label: 'Contact', icon: 'Phone' },
  ];

  return (
    <section className="container section-block sa-temple-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <Link to="/home">Home</Link>
        <Icon name="ChevronRight" size={13} />
        <Link to="/temples">Temples</Link>
        <Icon name="ChevronRight" size={13} />
        <span>{templeData.name}</span>
      </div>

      {/* Hero Banner — 3 Cards Section: Temple Image (70%), Timings (15%), Gopuram (15%) */}
      <div className="sa-temple-hero-cards-section">
        {/* Card 1: Main Temple Image & Information (70%) */}
        <div className="sa-hero-card sa-hero-card-temple">
          <img
            src={templeHeroBanner}
            alt={templeData.name}
            className="sa-hero-card-img"
            onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }}
          />
          <div className="sa-hero-card-overlay">
            <span className="sa-hero-tag">
              {templeData.state.toUpperCase()} • INDIA
            </span>
            <h1 className="sa-hero-title">{templeData.name}</h1>
            <p className="sa-hero-subtitle">{templeData.special}</p>
          </div>
        </div>

        {/* Card 2: Temple Darshan Timings (15%) */}
        <div className="sa-hero-card sa-hero-card-times" onClick={() => setTempleTab('Timings')} title="Click to view full Aarti schedule">
          <div className="sa-hero-card-badge">
            <Icon name="Clock" size={13} />
            <span>DAILY DARSHAN</span>
          </div>
          <div className="sa-times-icon-wrap">
            <Icon name="Sunrise" size={26} />
          </div>
          <h3 className="sa-times-title">Temple Timings</h3>
          <div className="sa-times-hours">{darshanHoursStr}</div>
          <p className="sa-times-note">Morning &amp; Evening Aarti Sessions</p>
          <span className="sa-times-view-link">
            View Schedule <Icon name="ArrowRight" size={13} />
          </span>
        </div>

        {/* Card 3: Sacred Gopuram / Vimana (15%) */}
        <div className="sa-hero-card sa-hero-card-gopuram" onClick={() => setTempleTab('Media')} title="Click to view Media gallery">
          <img
            src={templeGopuramImg}
            alt={`${templeData.name} Gopuram`}
            className="sa-hero-card-img"
            onError={(e) => { e.target.src = '/images/temple-steps.jpg'; }}
          />
          <div className="sa-hero-card-overlay-compact">
            <div className="sa-gopuram-tag">
              <Icon name="Landmark" size={12} />
              <span>GOPURAM</span>
            </div>
            <h3 className="sa-gopuram-title">Holy Gopuram &amp; Vimanam</h3>
            <span className="sa-gopuram-sub">Sanctified Sanctum</span>
          </div>
        </div>
      </div>

      {/* Devotee Actions Row: Save (Favorite) & Share */}
      <div className="sa-temple-devotee-bar">
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`sa-devotee-pill-btn ${isFavorited ? 'favorited' : ''}`}
          title={isFavorited ? 'Remove from Saved Temples' : 'Save this Temple'}
        >
          <Icon
            name={isFavorited ? 'HeartHandshake' : 'Heart'}
            size={17}
            fill={isFavorited ? '#e11d48' : 'none'}
            color={isFavorited ? '#e11d48' : 'currentColor'}
          />
          <span>{isFavorited ? 'Saved' : 'Save'}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="sa-devotee-pill-btn"
          title="Share Temple with family & devotees"
        >
          <Icon name="Share2" size={17} />
          <span>Share</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="detail-layout">
        <div>
          {/* Enhanced Navigation Tabs */}
          <div className="detail-tabs sa-temple-nav-tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTempleTab(t.id)}
                className={`sa-temple-tab-btn ${templeTab === t.id ? 'active' : ''}`}
              >
                <Icon name={t.icon} size={15} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: ABOUT */}
          {templeTab === 'About' && (
            <article className="rich-card temple-story">
              <h2>About {templeData.name}</h2>
              <p>
                {templeData.about || `${templeData.name} located in ${templeData.city}, ${templeData.state} is one of the most revered and sacred shrines in India. Millions of devotees undertake voluntary pilgrimages here every year, seeking divine grace, spiritual purification, and inner tranquility.`}
              </p>
              <p>
                The temple stands as a testament to profound architectural mastery and living spiritual traditions, maintaining unbroken daily sevas, Vedic chants, and inclusive community welfare through continuous annadanam.
              </p>
              <div className="sa-temple-feature-grid">
                <div className="sa-temple-feature-item">
                  <Icon name="Landmark" size={20} />
                  <div>
                    <b>Presiding Deity</b>
                    <span>{templeData.deity}</span>
                  </div>
                </div>
                <div className="sa-temple-feature-item">
                  <Icon name="MapPin" size={20} />
                  <div>
                    <b>Location</b>
                    <span>{templeData.city}, {templeData.state}</span>
                  </div>
                </div>
                <div className="sa-temple-feature-item">
                  <Icon name="Soup" size={20} />
                  <div>
                    <b>Annadanam</b>
                    <span>Free Sacred Meals Provided Daily</span>
                  </div>
                </div>
                <div className="sa-temple-feature-item">
                  <Icon name="ShieldCheck" size={20} />
                  <div>
                    <b>Pilgrim Guidance</b>
                    <span>Official Queue &amp; Information Desks</span>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* TAB 2: HISTORY */}
          {templeTab === 'History' && (
            <article className="rich-card temple-story">
              <h2>Sacred History &amp; Origins</h2>
              <p>
                {templeData.history || `The sacred lore of ${templeData.name} dates back centuries through ancient Puranas, royal endowments, and revered saint-poets who sang hymns in praise of the Lord.`}
              </p>
              <p>
                Historically, dynasties contributed to the construction of sacred mandapams, ornamental gopurams, and water teerthams. The holy sanctity has been preserved through strict adherence to traditional Agama Shastras and consecrated rituals.
              </p>
              <div className="sa-history-quote">
                <Icon name="Quote" size={24} />
                <p>
                  "In every stone and sanctum bell resonates the unbroken devotion of generations who found solace and liberation at this divine threshold."
                </p>
              </div>
            </article>
          )}

          {/* TAB 3: SPECIALITY */}
          {templeTab === 'Speciality' && (
            <article className="rich-card temple-story">
              <h2>Spiritual Speciality &amp; Architectural Marvel</h2>
              <p>{templeData.special}</p>
              <p>
                Devotees observe sacred vows (Vratham) and prepare offerings including ghee-filled coconuts (Neyyabhishekam), sacred flowers, and sweet prasadam. The divine atmosphere during early morning Nirmalyam and night Harivarasanam is universally recognized as deeply transformative.
              </p>
              <ul className="sa-speciality-list">
                <li>✨ Sacred Sanctum housing the divine consecrated idol radiating spiritual tranquility.</li>
                <li>✨ Traditional architecture engineered with acoustics that elevate Vedic chanting vibrations.</li>
                <li>✨ Consecrated holy steps and walkways sanctified by centuries of pilgrim footsteps.</li>
                <li>✨ Special seasonal sevas that draw spiritual seekers from across the world.</li>
              </ul>
            </article>
          )}

          {/* TAB 4: TIME & AARTI */}
          {templeTab === 'Timings' && (
            <article className="rich-card temple-story">
              <h2>Daily Darshan &amp; Aarti Timings</h2>
              <p>
                Official daily worship timetable and pooja schedule observed at {templeData.name}. Pilgrims are encouraged to arrive 30 minutes before deeparadhana.
              </p>
              <div className="sa-timing-list">
                {aartiSchedule.map((item, idx) => (
                  <div key={idx} className="sa-timing-card">
                    <div className="sa-timing-clock">
                      <Icon name="Clock" size={18} />
                      <strong>{item.time}</strong>
                    </div>
                    <div className="sa-timing-info">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sa-timing-note">
                <Icon name="Info" size={16} />
                <span>Timings may be extended during festival periods and auspicious solar/lunar transitions.</span>
              </div>
            </article>
          )}

          {/* TAB 5: MEDIA GALLERY */}
          {templeTab === 'Media' && (
            <article className="rich-card temple-story">
              <h2>Temple Media, Photos &amp; Video Streams</h2>
              <p>
                Visual glimpses of {templeData.name}, including sanctum architecture, spiritual ceremonies, and pilgrim pathways.
              </p>
              <div className="sa-media-grid">
                {mediaGallery.map((m, idx) => (
                  <div key={idx} className="sa-media-card">
                    <div className="sa-media-thumb">
                      <img src={m.url} alt={m.title} onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }} />
                      <span className="sa-media-badge">
                        <Icon name={m.type === 'Video' ? 'Play' : 'Camera'} size={13} /> {m.type}
                      </span>
                    </div>
                    <div className="sa-media-details">
                      <h4>{m.title}</h4>
                      <p>{m.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* TAB 6: FESTIVALS */}
          {templeTab === 'Festivals' && (
            <article className="rich-card temple-story">
              <h2>Festivals &amp; Auspicious Occasions</h2>
              <p>
                Annual festival calendar and major religious celebrations celebrated with grand pomp and devotion.
              </p>
              <div className="sa-festivals-list">
                {festivalList.map((f, idx) => (
                  <div key={idx} className="sa-festival-card">
                    <div className="sa-festival-icon">
                      <Icon name="Sparkles" size={22} />
                    </div>
                    <div className="sa-festival-copy">
                      <div className="sa-festival-head">
                        <h3>{f.name}</h3>
                        <span className="sa-festival-pill">{f.period}</span>
                      </div>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* TAB 7: LOCATION */}
          {templeTab === 'Location' && (
            <article className="rich-card temple-story">
              <h2>Temple Location &amp; How to Reach</h2>
              <p>
                {templeData.name} is situated in {templeData.city}, in the state of {templeData.state}, India. Pilgrims can reach via regular rail, bus and flight transit connections followed by traditional temple transport routes.
              </p>
              <div className="map-placeholder">
                <Icon name="MapPinned" size={36} />
                <b>{templeData.city}, {templeData.state}, India</b>
                <span>Interactive Pilgrimage Map Coordinates</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(templeData.name + ' ' + templeData.city)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps <Icon name="ExternalLink" size={15} />
                </a>
              </div>
            </article>
          )}

          {/* TAB 8: DEVOTEE REVIEWS */}
          {templeTab === 'Reviews' && (
            <article className="rich-card temple-story">
              <div className="sa-reviews-header">
                <div>
                  <h2>Devotee Experiences &amp; Pilgrim Reviews</h2>
                  <p>Read heartfelt reflections and share your sacred pilgrimage experience.</p>
                </div>
                <button
                  type="button"
                  className="btn gold small"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  <Icon name={showReviewForm ? 'X' : 'Plus'} size={15} />
                  <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form className="sa-review-form" onSubmit={handleAddReview}>
                  <h3>Share Your Devotional Experience</h3>
                  <div className="sa-review-fields">
                    <label>
                      Your Full Name *
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      City / State
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad, Telangana"
                        value={newReview.city}
                        onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                      />
                    </label>
                    <label>
                      Rating
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5 Divine)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5 Very Peaceful)</option>
                        <option value={3}>⭐⭐⭐ (3/5 Good Experience)</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Your Devotional Review / Pilgrim Guidance *
                    <textarea
                      rows={3}
                      placeholder="Describe your darshan, arrangements, temple atmosphere and travel advice..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                    />
                  </label>
                  <button type="submit" className="btn primary" style={{ alignSelf: 'flex-start' }}>
                    <span>Submit Devotee Review</span>
                    <Icon name="CheckCircle2" size={16} />
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="sa-reviews-list">
                {reviews.map((r, idx) => (
                  <div key={idx} className="sa-review-card">
                    <div className="sa-review-top">
                      <div className="sa-review-author">
                        <div className="sa-review-avatar">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <strong>{r.name}</strong>
                          <small>{r.city} • {r.date}</small>
                        </div>
                      </div>
                      <div className="sa-review-stars">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                    <p className="sa-review-text">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* TAB 9: CONTACT */}
          {templeTab === 'Contact' && (
            <article className="rich-card temple-story">
              <h2>Contact the Temple</h2>
              <p>
                Official inquiries, special seva bookings, room reservations, and guidance should be confirmed via authorized temple administrative contacts.
              </p>
              <div className="sa-temple-contact-grid">
                <div className="sa-temple-contact-item">
                  <Icon name="Phone" size={20} />
                  <div>
                    <b>Devotee Enquiry Helpline</b>
                    <span>{templeData.officePhone || '+91 4735 202048 / 1800 425 4747'}</span>
                  </div>
                </div>
                <div className="sa-temple-contact-item">
                  <Icon name="Mail" size={20} />
                  <div>
                    <b>Official Support Email</b>
                    <span>{templeData.officialEmail || `helpdesk@${templeData.city?.toLowerCase() || 'temple'}.org`}</span>
                  </div>
                </div>
                <div className="sa-temple-contact-item">
                  <Icon name="Clock" size={20} />
                  <div>
                    <b>Information Desk Hours</b>
                    <span>06:00 AM – 09:00 PM Daily</span>
                  </div>
                </div>
                <div className="sa-temple-contact-item">
                  <Icon name="Globe" size={20} />
                  <div>
                    <b>Official Trust Administration</b>
                    <span>{templeData.officialWebsite ? <a href={templeData.officialWebsite} target="_blank" rel="noreferrer" style={{ color: '#0b3d2b', textDecoration: 'underline' }}>{templeData.name} Trust</a> : 'Authorized Temple Devaswom Board'}</span>
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Aside Sidebar */}
        <aside className="rich-card side-details">
          <h3>Temple Information</h3>
          <div><Icon name="MapPin" size={17} /> {templeData.city}, {templeData.state}</div>
          <div><Icon name="Landmark" size={17} /> {templeData.deity}</div>
          <div><Icon name="Clock" size={17} /> Daily Darshan &amp; Aartis</div>
          <div><Icon name="Soup" size={17} /> Free Daily Annadanam</div>
          <div><Icon name="ShieldCheck" size={17} /> Verified Holy Shrine</div>

          <div className="sa-side-actions">
            <a
              href={templeMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sa-side-btn location"
            >
              <Icon name="Navigation" size={16} /> Get Location
            </a>
            <a
              href={templeWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sa-side-btn website"
            >
              <Icon name="Globe" size={16} /> Official Website
            </a>
          </div>
        </aside>
      </div>

      {/* Remaining Sacred Temples List Section */}
      <section className="sa-other-temples-section">
        <div className="sa-other-temples-head">
          <div>
            <span className="tag" style={{ color: '#caa049', fontWeight: 700, letterSpacing: '0.12em' }}>
              SACRED PILGRIMAGE DIRECTORY
            </span>
            <h2 className="sa-other-temples-title">Explore Other Sacred Temples</h2>
            <p className="sa-other-temples-desc">
              Discover holy shrines, darshan schedules, divine history, and spiritual observances across India.
            </p>
          </div>
          <Link to="/temples" className="sa-other-temples-all-btn">
            <span>View All Temples</span>
            <Icon name="ArrowRight" size={16} />
          </Link>
        </div>

        <div className="sa-other-temples-grid">
          {otherTemples.map((t) => {
            const bannerImg = templeBannerMap[t.name] || image(t.image || 'temple-hero');
            return (
              <div
                key={t.name}
                className="sa-other-temple-card"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/temple-detail', { state: { name: t.name } });
                }}
              >
                <div className="sa-other-temple-img-wrap">
                  <img
                    src={bannerImg}
                    alt={t.name}
                    className="sa-other-temple-img"
                    onError={(e) => { e.target.src = '/images/temple-hero.jpg'; }}
                  />
                  <span className="sa-other-temple-state-badge">
                    <Icon name="MapPin" size={11} /> {t.city}, {t.state}
                  </span>
                </div>
                <div className="sa-other-temple-info">
                  <span className="sa-other-temple-deity">
                    <Icon name="Landmark" size={13} /> {t.deity}
                  </span>
                  <h3 className="sa-other-temple-name">{t.name}</h3>
                  <p className="sa-other-temple-special">{t.special}</p>
                  <div className="sa-other-temple-footer">
                    <span className="sa-other-temple-link">
                      View Darshan &amp; Timings <Icon name="ChevronRight" size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}
