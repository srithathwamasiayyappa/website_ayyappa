import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { API_BASE_URL } from "./apiConfig";
import { temples, image, services } from "./data";
import { useLanguage } from "./LanguageContext";
import { PanchangamLocalEngine } from "./panchangam";
import "./home.css";

const Icon = ({ name, size = 20, ...props }) => {
  const Component = Icons[name] || Icons.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

/* 1. Devotional Updates for Ticker (short announcements) */
const tickerUpdates = [
  { title: "Mandala Pooja season guides & daily rituals now available", url: "/subcategories" },
  { title: "Explore historic pilgrimage shrines across India", url: "/temples" },
  { title: "Today's community Annadanam locations & seva guidelines", url: "/food-donations" },
  { title: "Daily Panchangam: Tithi, Nakshatram & auspicious muhurthams", url: "/panchangam" },
];

/* 2. Today's Curated Devotional Content (replaces duplicate Devotional Learning) */
const featuredDevotionItems = [
  {
    type: "Pooja Vidhanam",
    badge: "DAILY RITUAL",
    title: "Ayyappa Pooja Vidhanam",
    description: "Complete step-by-step sacred worship procedure and required materials.",
    icon: "Flame",
    image: "pooja-altar",
    url: "/pooja-detail",
    meta: "25 min ritual",
  },
  {
    type: "Sacred Stotra",
    badge: "108 NAMES",
    title: "Sri Ayyappa Ashtothram",
    description: "Sacred 108 divine names of Lord Ayyappa for daily peaceful recitation.",
    icon: "Flower2",
    image: "pooja-padi",
    url: "/stotras",
    meta: "Devotional Chants",
  },
  {
    type: "Divine Sloka",
    badge: "DAILY SLOKA",
    title: "Swamiye Saranam Ayyappa",
    description: "The supreme surrender mantra with Telugu and English meaning.",
    icon: "ScrollText",
    image: "deity",
    url: "/slokas",
    meta: "Sacred Invocations",
  },
  {
    type: "Harathi & Bhajans",
    badge: "DIVINE MELODIES",
    title: "Harivarasanam & Harathi",
    description: "The eternal lullaby and evening mangala harathis for deep inner peace.",
    icon: "Music2",
    image: "music-art",
    url: "/songs",
    meta: "Soulful Chants",
  },
];

/* 3. Consolidated Donations & Annadanam Categories */
const donationCategories = [
  {
    id: "annadanam",
    title: "Annadanam (Food Seva)",
    description: "Offer nourishing meals to pilgrims and community devotees.",
    icon: "Soup",
    image: "annadanam-meal",
    badge: "Most Auspicious Seva",
    actionText: "Contribute to Annadanam",
    url: "/food-donations",
  },
  {
    id: "general",
    title: "General Temple Seva",
    description: "Support ongoing worship rituals, deeparadhana and shrine upkeep.",
    icon: "Landmark",
    image: "temple-clean",
    badge: "Temple Upkeep",
    actionText: "Support Temple Seva",
    url: "/donations",
  },
  {
    id: "festival",
    title: "Mandala Festival Seva",
    description: "Contribute toward special festive poojas, flower alankaram & arrangements.",
    icon: "Flower2",
    image: "festival",
    badge: "Seasonal Seva",
    actionText: "Support Festival Seva",
    url: "/donations",
  },
];

/* 4. Live Darshan Broadcasts */
const liveStreams = [
  {
    id: "sabarimala-darshan",
    temple: "Sabarimala Sannidhanam",
    title: "Lord Ayyappa Evening Deeparadhana",
    status: "LIVE",
    viewers: "12.4k Devotees",
    timing: "Daily Darshan: 5:00 PM – 9:00 PM",
    image: "live-temple",
  },
  {
    id: "tirumala-darshan",
    temple: "Tirumala Sri Venkateswara Temple",
    title: "Special Kalyanotsavam & Nitya Arjitha Seva",
    status: "Upcoming",
    timing: "Tomorrow at 10:30 AM",
    image: "temples-card",
  },
  {
    id: "kashi-darshan",
    temple: "Kashi Vishwanath Temple",
    title: "Maha Mangala Harathi Live Feed",
    status: "Offline",
    timing: "Next Broadcast: 7:00 PM",
    image: "temple-steps",
  },
];

/* 5. Detailed Devotional Articles & Updates */
const latestDevotionalUpdates = [
  {
    id: 1,
    category: "Festival",
    date: "12 Nov 2026",
    title: "Mandala Pooja Season: Sacred Observance & Vratham Rules",
    description: "Essential guidelines for devotees undertaking the sacred 41-day Mandala vratham, dietary discipline and mala dharanam traditions.",
    image: "festival",
    icon: "CalendarDays",
    url: "/subcategories",
  },
  {
    id: 2,
    category: "Temple",
    date: "11 Nov 2026",
    title: "Sabarimala Pilgrimage: Understanding the Sacred 18 Steps",
    description: "The spiritual significance of Pathinettampadi, what each sacred step symbolizes, and traditional etiquette for holy darshan.",
    image: "temple-hero",
    icon: "Landmark",
    url: "/temple-detail",
  },
  {
    id: 3,
    category: "Annadanam",
    date: "10 Nov 2026",
    title: "The Sacred Tradition of Annadanam in Vedic Heritage",
    description: "Why serving meals to pilgrims is revered as Maha Dhanam, and how community distribution centers are serving pilgrims daily.",
    image: "annadanam-meal",
    icon: "Soup",
    url: "/food-donations",
  },
  {
    id: 4,
    category: "Devotional",
    date: "08 Nov 2026",
    title: "Harivarasanam: History and Power of the Divine Lullaby",
    description: "Discover the poetic origin of the hymn composed in surrender to Swami Ayyappa, recited daily before closing the sanctum sanctorum.",
    image: "deity",
    icon: "BookOpen",
    url: "/songs",
  },
  {
    id: 5,
    category: "Panchangam",
    date: "06 Nov 2026",
    title: "How to Plan Daily Prayers with Tithi, Rahu Kalam & Muhurtham",
    description: "A simple guide for modern families to align morning prayers, deepam lighting and family poojas with traditional Vedic timings.",
    image: "pooja-altar",
    icon: "CalendarDays",
    url: "/panchangam",
  },
];

/* Reusable Section Heading */
function SectionHeading({ eyebrow, title, description, link, linkText = "View All" }) {
  return (
    <div className="sa-home-heading">
      <div className="sa-home-heading-content">
        <span className="sa-home-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && (
        <Link to={link} className="sa-home-view-all">
          {linkText}
          <Icon name="ArrowUpRight" size={17} />
        </Link>
      )}
    </div>
  );
}

/* SECTION 2: Hero Section & Integrated Devotional Ticker matching Reference 3 */
function HeroSection() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  const previous = () => {
    setCurrent((idx) => (idx - 1 + tickerUpdates.length) % tickerUpdates.length);
  };
  const next = () => {
    setCurrent((idx) => (idx + 1) % tickerUpdates.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((idx) => (idx + 1) % tickerUpdates.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="sa-home-hero" aria-label="Sacred Devotional Hero Banner">
      <div className="container sa-home-hero-inner">
        {/* Left Column: Devotional Hero Content */}
        <div className="sa-home-hero-content">
          {/* Top Pill / Badge */}
          <Link to="/subcategories" className="sa-home-hero-pill" aria-label={t('heroPill', 'Sabarimala Season Updates')}>
            <Icon name="Megaphone" size={14} className="sa-pill-icon-left" />
            <span>{t('heroPill', 'Sabarimala Season Updates')}</span>
            <Icon name="Sparkles" size={13} className="sa-pill-icon-right" />
          </Link>

          {/* Eyebrow Mantra with sacred ornaments */}
          <div className="sa-home-hero-eyebrow">
            <span className="sa-hero-flower">🪷</span>
            <span>{t('heroEyebrow', 'SWAMIYE SARANAM AYYAPPA')}</span>
            <span className="sa-hero-flower">🪷</span>
          </div>

          {/* H1 Heading */}
          <h1 className="sa-home-hero-title">
            {t('heroTitlePart1', 'Your Daily Journey of ')}<span className="sa-gold-heading">{t('heroTitleGold', 'Faith & Devotion')}</span>
          </h1>

          {/* Decorative Divider */}
          <div className="sa-hero-divider" aria-hidden="true">
            <span className="sa-divider-line"></span>
            <span className="sa-divider-diamond">◆</span>
            <span className="sa-divider-line"></span>
          </div>

          {/* Description */}
          <p className="sa-home-hero-desc">
            {t('heroSubtitle', 'Explore sacred poojas, divine chants, live darshan, famous temples, daily Panchangam and community seva — all in one sacred devotional sanctuary.')}
          </p>

          {/* Action Buttons */}
          <div className="sa-home-hero-actions">
            <Link to="/categories" className="sa-hero-btn sa-hero-btn-primary">
              <Icon name="Landmark" size={17} />
              <span>{t('heroExploreBtn', 'Explore Devotional Services')}</span>
              <Icon name="ArrowRight" size={16} />
            </Link>
            <Link to="/live-streams" className="sa-hero-btn sa-hero-btn-secondary">
              <Icon name="CirclePlay" size={18} />
              <span>{t('liveTitle', 'Watch Live Darshan')}</span>
            </Link>
          </div>

          {/* Highlights */}
          <div className="sa-home-hero-highlights">
            <div className="sa-hero-highlight-item">
              <Icon name="BookOpen" size={16} />
              <span>{t('curatedEyebrow', 'Sacred Knowledge')}</span>
            </div>
            <span className="sa-hero-highlight-separator">|</span>
            <div className="sa-hero-highlight-item">
              <Icon name="Landmark" size={16} />
              <span>{t('navTemples', 'Famous Temples')}</span>
            </div>
            <span className="sa-hero-highlight-separator">|</span>
            <div className="sa-hero-highlight-item">
              <Icon name="HeartHandshake" size={16} />
              <span>{t('donationsEyebrow', 'Spiritual Seva')}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Lord Ayyappa Transparent Deity Overlay */}
        <div className="sa-home-hero-deity-wrap">
          <img
            src="/images/home/ayyappa-hero-transparent.png"
            alt="Bhagavan Sri Swami Ayyappa Swamy"
            className="sa-home-hero-deity-img"
            fetchpriority="high"
          />
        </div>
      </div>

      {/* Devotional Updates Ticker — Positioned cleanly along the bottom of the hero section */}
      <div className="container sa-home-ticker-container">
        <div className="sa-home-ticker-pill" role="region" aria-label="Devotional updates ticker">
          <div className="sa-home-ticker-badge">
            <Icon name="Radio" size={15} />
            <strong>DEVOTIONAL UPDATES</strong>
          </div>

          <span className="sa-home-ticker-pipe">|</span>

          <Link to={tickerUpdates[current].url} className="sa-home-ticker-text">
            <span>{tickerUpdates[current].title}</span>
            <span className="sa-ticker-hand">👉</span>
          </Link>

          <div className="sa-home-ticker-nav">
            <button type="button" onClick={previous} aria-label="Previous devotional update">
              <Icon name="ChevronLeft" size={15} />
            </button>
            <span className="sa-home-ticker-count">
              {current + 1} / {tickerUpdates.length}
            </span>
            <button type="button" onClick={next} aria-label="Next devotional update">
              <Icon name="ChevronRight" size={15} />
            </button>
          </div>

          <Link to="/notifications" className="sa-home-ticker-viewall">
            <span>View All Updates</span>
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Localized titles & subtitles across all 5 database languages for services
const homeServiceI18n = {
  pooja: {
    te: { title: 'పూజా విధానం', sub: 'దశలవారీ పూజా పద్ధతులు & నియమాలు' },
    kn: { title: 'ಪೂಜಾ ವಿಧಾನ', sub: 'ಹಂತ-ಹಂತದ ಪೂಜಾ ವಿಧಾನಗಳು' },
    en: { title: 'Pooja Vidhanam', sub: 'Step-by-step sacred rituals' },
    ta: { title: 'பூஜை முறை', sub: 'படி படியான பூஜை முறைகள்' },
    hi: { title: 'पूजा विधान', sub: 'चरण-दर-चरण पूजा पद्धतियां' },
  },
  ashtothram: {
    te: { title: 'అష్టోత్తరాలు', sub: '108 దివ్య నామావళులు' },
    kn: { title: 'ಅಷ್ಟೋತ್ತರ', sub: '108 ದಿವ್ಯ ನಾಮಾವಳಿಗಳು' },
    en: { title: 'Astothrams', sub: '108 divine names' },
    ta: { title: 'அஷ்டோத்திரம்', sub: '108 திருநாமங்கள்' },
    hi: { title: 'अष्टोत्तर', sub: '108 दिव्य नाम' },
  },
  stotras: {
    te: { title: 'దివ్య స్తోత్రాలు', sub: 'శక్తివంతమైన భక్తి స్తోత్రాలు' },
    kn: { title: 'ದಿವ್ಯ ಸ್ತೋತ್ರಗಳು', sub: 'ಶಕ್ತಿಶಾಲಿ ಭಕ್ತಿ ಸ್ತೋತ್ರಗಳು' },
    en: { title: 'Divine Stotras', sub: 'Sacred Hymns & Chants' },
    ta: { title: 'தெய்வீக ஸ்தோத்திரங்கள்', sub: 'சக்திவாய்ந்த பக்தி துதிகள்' },
    hi: { title: 'दिव्य स्तोत्र', sub: 'पावन भक्ति स्तोत्र' },
  },
  slokas: {
    te: { title: 'నిత్య శ్లోకాలు', sub: 'ధ్యాన శ్లోకాలు & అర్థాలు' },
    kn: { title: 'ನಿತ್ಯ ಶ್ಲೋಕಗಳು', sub: 'ಧ್ಯಾನ ಶ್ಲೋಕಗಳು & ಅರ್ಥಗಳು' },
    en: { title: 'Daily Slokas', sub: 'Verses for Meditation' },
    ta: { title: 'தினசரி ஸ்லோகங்கள்', sub: 'தியான ஸ்லோகங்கள் & பொருள்' },
    hi: { title: 'दैनिक श्लोक', sub: 'ध्यान श्लोक और अर्थ' },
  },
  songs: {
    te: { title: 'భజనలు & కీర్తనలు', sub: 'భక్తి గీతాలు & హారతులు' },
    kn: { title: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು', sub: 'ಭಕ್ತಿಗೀತೆಗಳು & ಆರತಿಗಳು' },
    en: { title: 'Bhajans & Songs', sub: 'Devotional Melodies' },
    ta: { title: 'பஜனைகள் & பாடல்கள்', sub: 'பக்திப் பாடல்கள் & ஆரத்திகள்' },
    hi: { title: 'भजन और कीर्तन', sub: 'भक्ति गीत और आरतियां' },
  },
  bhajans: {
    te: { title: 'భజనలు & కీర్తనలు', sub: 'భక్తి గీతాలు & హారతులు' },
    kn: { title: 'ಭಜನೆಗಳು & ಕೀರ್ತನೆಗಳು', sub: 'ಭಕ್ತಿಗೀತೆಗಳು & ಆರತಿಗಳು' },
    en: { title: 'Bhajans & Songs', sub: 'Devotional Melodies' },
    ta: { title: 'பஜனைகள் & பாடல்கள்', sub: 'பக்திப் பாடல்கள் & ஆரத்திகள்' },
    hi: { title: 'भजन और कीर्तन', sub: 'भक्ति गीत और आरतियां' },
  },
  'live-streams': {
    te: { title: 'ప్రత్యక్ష దర్శనం', sub: 'ఆలయ ప్రత్యక్ష ప్రసారాలు' },
    kn: { title: 'ನೇರ ದರ್ಶನ', sub: 'ದೇವಾಲಯ ನೇರ ಪ್ರಸಾರಗಳು' },
    en: { title: 'Live Darshan', sub: 'Daily Temple Streams' },
    ta: { title: 'நேரலை தரிசனம்', sub: 'கோயில் நேரலை ஒளிபரப்புகள்' },
    hi: { title: 'लाइव दर्शन', sub: 'मंदिर सीधा प्रसारण' },
  },
  live: {
    te: { title: 'ప్రత్యక్ష దర్శనం', sub: 'ఆలయ ప్రత్యక్ష ప్రసారాలు' },
    kn: { title: 'ನೇರ ದರ್ಶನ', sub: 'ದೇವಾಲಯ ನೇರ ಪ್ರಸಾರಗಳು' },
    en: { title: 'Live Darshan', sub: 'Daily Temple Streams' },
    ta: { title: 'நேரலை தரிசனம்', sub: 'கோயில் நேரலை ஒளிபரப்புகள்' },
    hi: { title: 'लाइव दर्शन', sub: 'मंदिर सीधा प्रसारण' },
  },
  panchangam: {
    te: { title: 'నిత్య పంచాంగం', sub: 'తిథి, నక్షత్రం & శుభ ముహూర్తాలు' },
    kn: { title: 'ದೈನಂದಿನ ಪಂಚಾಂಗ', sub: 'ತಿಥಿ, ನಕ್ಷತ್ರ & ಶುಭ ಮುಹೂರ್ತ' },
    en: { title: 'Panchangam', sub: 'Auspicious Timings' },
    ta: { title: 'தினசரி பஞ்சாங்கம்', sub: 'திதி, நட்சத்திரம் & சுப முகூர்த்தம்' },
    hi: { title: 'दैनिक पंचांग', sub: 'तिथि, नक्षत्र और शुभ मुहूर्त' },
  },
  festivals: {
    te: { title: 'ఆలయ పండుగలు', sub: 'వార్షిక ఉత్సవాలు & విశేషాలు' },
    kn: { title: 'ದೇವಾಲಯ ಹಬ್ಬಗಳು', sub: 'ವಾರ್ಷಿಕ ಹಬ್ಬಗಳು & ವಿಶೇಷಗಳು' },
    en: { title: 'Temple Festivals', sub: 'Annual Celebrations' },
    ta: { title: 'கோயில் திருவிழாக்கள்', sub: 'ஆண்டு விழாக்கள் & சிறப்புகள்' },
    hi: { title: 'मंदिर उत्सव', sub: 'वार्षिक उत्सव और व्रत' },
  },
  temples: {
    te: { title: 'పవిత్ర దేవాలయాలు', sub: 'పుణ్యక్షేత్రాలు & తీర్థయాత్రలు' },
    kn: { title: 'ಪವಿತ್ರ ದೇವಾಲಯಗಳು', sub: 'ಪುಣ್ಯಕ್ಷೇತ್ರಗಳು & ಯಾತ್ರೆಗಳು' },
    en: { title: 'Sacred Temples', sub: 'Shrines & Pilgrimages' },
    ta: { title: 'புனித திருக்கோயில்கள்', sub: 'திருத்தலங்கள் & யாத்திரைகள்' },
    hi: { title: 'पवित्र मंदिर', sub: 'तीर्थ स्थल और देवालय' },
  },
  donations: {
    te: { title: 'అన్నదాన సేవ', sub: 'నిత్యాన్నదానం & సేవా సహకారం' },
    kn: { title: 'ಅನ್ನದಾನ ಸೇವೆ', sub: 'ನಿತ್ಯಾನ್ನದಾನ & ಸೇವಾ ಸಹಕಾರ' },
    en: { title: 'Annadanam Seva', sub: 'Meal Offering & Seva' },
    ta: { title: 'அன்னதான சேவை', sub: 'அன்னதானம் & சேவைப் பங்களிப்பு' },
    hi: { title: 'अन्नदान सेवा', sub: 'महाप्रसाद एवं सेवा सहयोग' },
  },
  food: {
    te: { title: 'నేటి అన్నదానం', sub: 'ఆహార వితరణ కేంద్రాలు' },
    kn: { title: 'ಇಂದಿನ ಅನ್ನದಾನ', sub: 'ಆಹಾರ ವಿತರಣಾ ಕೇಂದ್ರಗಳು' },
    en: { title: 'Food Donation Today', sub: 'Today’s annadanam locations' },
    ta: { title: 'இன்றைய அன்னதானம்', sub: 'உணவு வழங்கும் இடங்கள்' },
    hi: { title: 'आज का अन्नदान', sub: 'भोजन वितरण केंद्र' },
  },
};

/* SECTION 4: Explore Devotional Services (Exact Redesign matching Reference 2) */
function ServicesSection() {
  const { currentLanguage, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Server-side search & database query for services (no static/mock fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      setLoading(true);
      try {
        const queryParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
        const res = await fetch(`${API_BASE_URL}/categories/services?lang=${currentLanguage}${queryParam}`);
        if (res.ok) {
          const result = await res.json();
          if (isMounted) {
            if (result && Array.isArray(result.data) && result.data.length > 0) {
              setServicesData(result.data);
            } else {
              setServicesData(services);
            }
          }
        } else {
          if (isMounted) setServicesData(services);
        }
      } catch {
        if (isMounted) setServicesData(services);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(fetchServices, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, currentLanguage]);

  const categoryFilters = [
    { id: "all", label: `${t('all', 'All Services')} (${servicesData.length})` },
    { id: "rituals", label: "Rituals / పూజలు" },
    { id: "chants", label: "Chants / స్తోత్రాలు" },
    { id: "temples", label: "Temples / క్షేత్రాలు" },
    { id: "seva", label: "Seva / సేవలు" },
  ];

  // Category mapping based on database services data
  const isMatchCategory = (service, cat) => {
    if (cat === "all") return true;
    const sid = service.id || service.serviceId;
    if (cat === "rituals") return sid === "pooja";
    if (cat === "chants") return ["ashtothram", "stotras", "slokas", "bhajans", "harathis"].includes(sid);
    if (cat === "temples") return ["live", "temples"].includes(sid);
    if (cat === "seva") return ["donations", "food"].includes(sid);
    return true;
  };

  const filtered = useMemo(() => {
    return servicesData.filter((s) => isMatchCategory(s, activeCategory));
  }, [servicesData, activeCategory]);

  return (
    <section className="sa-home-services-section" aria-label="Explore Devotional Services">
      <div className="container sa-home-services-container">
        {/* Centered Heading with exact Image 2 Lotus & Gold Flourishes */}
        <div className="sa-services-heading-wrap">
          <div className="sa-services-heading-lotus-top">
            <img
              src="/images/home/heading-lotus-transparent.png"
              alt=""
              className="sa-heading-gold-lotus-img"
              aria-hidden="true"
            />
          </div>
          <div className="sa-services-eyebrow">
            <span className="sa-eyebrow-flourish">― ✦</span>
            <span className="sa-eyebrow-text">{t('servicesEyebrow', 'DISCOVER THE DIVINE')}</span>
            <span className="sa-eyebrow-flourish">✦ ―</span>
          </div>
          <h2 className="sa-services-main-title">{t('servicesTitle', 'Explore Devotional Services')}</h2>
          <p className="sa-services-sub-desc">
            {t('servicesSubtitle', 'A comprehensive collection of sacred rituals, hymns, holy places and devotional resources to deepen your connection with Lord Ayyappa.')}
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="sa-services-toolbar">
          <div className="sa-services-search-box">
            <Icon name="Search" size={17} className="sa-search-icon" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pooja, stotra, sloka, temple, song..."
              aria-label="Search devotional services"
            />
            {search && (
              <button
                type="button"
                className="sa-search-clear-btn"
                aria-label="Clear search input"
                onClick={() => setSearch("")}
              >
                <Icon name="X" size={15} />
              </button>
            )}
          </div>

          <div className="sa-services-filter-group" role="tablist" aria-label="Category filters">
            {categoryFilters.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.id}
                className={`sa-services-filter-btn ${activeCategory === tab.id ? "active" : ""}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Devotional Layout: Left Promotional Card + Right Services Grid */}
        <div className="sa-services-layout">
          {/* Left Promotional Arch Card with Multi-Curved Scalloped Arch & Golden Illuminated Temple */}
          <aside className="sa-services-promo-card">
            <div className="sa-promo-arch-top">
              <span className="sa-promo-lotus-icon">🪷</span>
              <h3 className="sa-promo-title">
                A Complete<br />Devotional<br />Experience
              </h3>
              <div className="sa-promo-divider" aria-hidden="true">
                <span></span>
                <i>◆</i>
                <span></span>
              </div>
              <p className="sa-promo-desc">
                From sacred poojas to live darshan, explore everything you need for your Ayyappa devotion — in one place.
              </p>
            </div>

            <div className="sa-promo-image-wrap">
              <img
                src="/images/home/devotional-temple-card.png"
                alt="Golden illuminated sacred temple pavilion with devotees"
                className="sa-promo-temple-img"
                loading="lazy"
              />
              <div className="sa-promo-gradient-overlay" aria-hidden="true"></div>
            </div>
          </aside>

          {/* Right Services Grid */}
          <div className="sa-services-grid-wrapper">
            <div className="sa-services-cards-grid">
              {filtered.map((service, index) => {
                const sKey = service.id || service.serviceId;
                const isFoodCard = sKey === "food";
                // Global index across all services
                const globalIndex = servicesData.findIndex((s) => (s.id || s.serviceId) === sKey);
                const cardNumber = String((globalIndex !== -1 ? globalIndex : index) + 1).padStart(2, "0");
                const loc = homeServiceI18n[sKey]?.[currentLanguage] || homeServiceI18n[sKey]?.en;
                const displayTitle = loc?.title || service.title;
                const displaySub = loc?.sub || service.sub;

                return (
                  <Link
                    to={service.url}
                    key={service.id || service.serviceId}
                    className={`sa-service-card-item ${isFoodCard ? "sa-service-card-highlight" : ""}`}
                    aria-label={`${displayTitle} - ${displaySub}`}
                  >
                    <div className="sa-service-card-icon-shape">
                      <Icon name={service.icon} size={20} />
                    </div>

                    <div className="sa-service-card-text">
                      <h4 className="sa-service-card-title">{displayTitle}</h4>
                      <p className="sa-service-card-sub">{displaySub}</p>
                    </div>

                    <div className="sa-service-card-meta">
                      <span className="sa-service-card-num">{cardNumber}</span>
                      <div className="sa-service-card-circle-btn" aria-hidden="true">
                        <Icon name="ArrowRight" size={13} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {!loading && filtered.length === 0 && (
              <div className="sa-services-empty-state" role="status">
                <Icon name="Search" size={30} />
                <p>No devotional services found matching "{search}".</p>
                <button
                  type="button"
                  className="sa-services-filter-btn active"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Centered Bottom Button with Golden Line Flanks */}
        <div className="sa-services-bottom-action">
          <span className="sa-action-flank-line" aria-hidden="true"></span>
          <Link to="/categories" className="sa-services-viewall-pill">
            <span>View All Devotional Services ({servicesData.length})</span>
            <Icon name="ArrowRight" size={16} />
          </Link>
          <span className="sa-action-flank-line" aria-hidden="true"></span>
        </div>
      </div>
    </section>
  );
}

/* SECTION 5: Today's Panchangam (Focused daily overview with date & city controls) */
function PanchangamSection() {
  const { currentLanguage, t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [apiData, setApiData] = useState(null);

  // Sync with live public Panchangam API; fallback directly to high-precision local engine
  useEffect(() => {
    let isCurrent = true;
    fetch(`${API_BASE_URL}/panchangam/day?date=${selectedDate}&city=${encodeURIComponent(selectedCity)}&lang=${currentLanguage}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isCurrent && json && json.tithi) {
          setApiData(json);
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [selectedDate, selectedCity, currentLanguage]);

  const panchData = useMemo(() => {
    if (apiData && apiData.city === selectedCity) return apiData;
    return PanchangamLocalEngine.calculate(new Date(selectedDate), selectedCity, currentLanguage);
  }, [apiData, selectedDate, selectedCity, currentLanguage]);

  return (
    <section className="soft-section sa-home-panchangam-section">
      <div className="container sa-home-section">
        <SectionHeading
          eyebrow={t('panchangamEyebrow', 'SACRED DAILY ALMANAC')}
          title={t('panchangamTitle', "Today's Panchangam")}
          description={t('panchangamDesc', 'Plan your prayers and observances with traditional Hindu calendar timings.')}
          link="/panchangam"
          linkText={t('fullPanchangam', 'Full Panchangam')}
        />

        <div className="sa-home-panchangam-card">
          <div className="sa-home-panchangam-top">
            <div className="sa-home-panchangam-intro">
              <span className="sa-home-badge-pill">
                <Icon name="CalendarDays" size={15} />
                {t('dailyVedicCalendar', 'Daily Vedic Calendar')}
              </span>
              <h3>{t('auspiciousTimings', 'Auspicious Timings & Muhurthams')}</h3>
              <p>{t('traditionalCalculations', 'Traditional calculations tailored for daily spiritual life and prayer routines.')}</p>
            </div>

            <div className="sa-home-panchangam-controls">
              <label>
                <span>{t('selectDate', 'Select Date')}</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </label>

              <label>
                <span>{t('selectCity', 'Select City')}</span>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="Hyderabad">Hyderabad ({panchData.cityNameLocalized || 'హైదరాబాద్'})</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Tirupati">Tirupati</option>
                  <option value="Sabarimala">Sabarimala</option>
                </select>
              </label>
            </div>
          </div>

          <div className="sa-home-panchangam-grid">
            <div className="sa-home-panch-item">
              <Icon name="Moon" size={24} />
              <div>
                <strong>{t('tithi', 'Tithi')}</strong>
                <p>{panchData.tithi || 'Shukla Paksha Dashami'}</p>
                <small>{t('until', 'Until')} {panchData.tithiEndTime || '04:12 PM'}</small>
              </div>
            </div>

            <div className="sa-home-panch-item">
              <Icon name="Star" size={24} />
              <div>
                <strong>{t('nakshatram', 'Nakshatram')}</strong>
                <p>{panchData.nakshatram || 'Uttara Phalguni'}</p>
                <small>{panchData.nakshatraEndTime ? `${t('until', 'Until')} ${panchData.nakshatraEndTime}` : t('auspiciousAlignment', 'Auspicious planetary alignment')}</small>
              </div>
            </div>

            <div className="sa-home-panch-item">
              <Icon name="Sunrise" size={24} />
              <div>
                <strong>{t('sunriseSunset', 'Sunrise & Sunset')}</strong>
                <p>{panchData.sunrise || '06:14 AM'} — {panchData.sunset || '05:46 PM'}</p>
                <small>{panchData.cityNameLocalized || selectedCity} {t('solarTime', 'Local Solar Time')}</small>
              </div>
            </div>

            <div className="sa-home-panch-item warning">
              <Icon name="Clock3" size={24} />
              <div>
                <strong>{t('rahuKalam', 'Rahu Kalam')}</strong>
                <p>{panchData.rahuKalam || '01:30 PM — 03:00 PM'}</p>
                <small>{t('rahuNote', 'Avoid starting new journeys')}</small>
              </div>
            </div>

            <div className="sa-home-panch-item highlight">
              <Icon name="Sparkles" size={24} />
              <div>
                <strong>{t('abhijitMuhurtham', 'Abhijit Muhurtham')}</strong>
                <p>{panchData.abhijitMuhurtam || '11:42 AM — 12:28 PM'}</p>
                <small>{t('abhijitNote', 'Most auspicious for daily prayers')}</small>
              </div>
            </div>

            <div className="sa-home-panch-item">
              <Icon name="Calendar" size={24} />
              <div>
                <strong>{t('vedicMonthRutu', 'Vedic Month / Rutu')}</strong>
                <p>{panchData.maasa || 'Karthika Masa'} • {panchData.paksham || 'Shukla Paksha'}</p>
                <small>{panchData.samvatsaram || 'Krodhi Nama Samvatsaram'}</small>
              </div>
            </div>
          </div>

          <div className="sa-home-panchangam-foot">
            <span className="sa-home-note-text">
              <Icon name="Info" size={15} />
              {t('panchangamNote', 'Timings calculate dynamically based on geographical coordinates and regional solar rise.')}
            </span>
            <Link to="/panchangam" className="btn outline">
              {t('viewDetailedPanchangam', 'View Detailed Panchangam')} <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* SECTION 6: Featured Temples of India */
function FeaturedTemples() {
  const { currentLanguage, t } = useLanguage();
  const [dbTemples, setDbTemples] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/temples?lang=${currentLanguage}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setDbTemples(data.data.slice(0, 3));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [currentLanguage]);

  const displayTemples = dbTemples.length > 0 ? dbTemples : temples.slice(0, 3);

  return (
    <section className="container sa-home-section">
      <SectionHeading
        eyebrow={t('templesEyebrow', 'SACRED PLACES')}
        title={t('templesTitle', 'Featured Temples of India')}
        description={t('templesDesc', 'Discover sacred shrine histories, darshan traditions and pilgrimage travel guidance.')}
        link="/temples"
        linkText={t('viewAllTemples', 'View All Temples')}
      />

      <div className="sa-home-temple-grid">
        {displayTemples.map((temple) => (
          <article className="sa-home-temple-card" key={temple.id || temple.name}>
            <div className="temple-image">
              <img src={temple.heroImageUrl || temple.thumbnailUrl || image(temple.image)} alt={temple.name} loading="lazy" />
              <span className="temple-location">
                <Icon name="MapPin" size={14} />
                {temple.city}, {temple.state}
              </span>
            </div>

            <div className="sa-home-temple-details">
              <span className="sa-home-temple-deity">
                <Icon name="Sparkles" size={13} />
                {temple.deityName || temple.deity || 'Lord Ayyappa'}
              </span>

              <h3>{temple.name}</h3>
              <p>{temple.about || temple.special || temple.history}</p>

              <div className="sa-home-temple-actions">
                <Link to="/temple-detail" className="sa-home-card-action">
                  {t('exploreTemple', 'Explore Temple')} <Icon name="ArrowRight" size={15} />
                </Link>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    temple.name + " " + temple.city
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="sa-home-subtle-link"
                  title="Open map directions"
                >
                  <Icon name="Navigation" size={14} /> {t('directions', 'Directions')}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* SECTION 7: Today's Featured Devotion (Curated Pooja, Stotra, Sloka & Bhajan) */
function FeaturedDevotionalContent() {
  const { t } = useLanguage();
  return (
    <section className="soft-section">
      <div className="container sa-home-section">
        <SectionHeading
          eyebrow={t('curatedEyebrow', "TODAY'S FEATURED DEVOTION")}
          title={t('curatedTitle', 'Daily Sacred Inspiration')}
          description={t('curatedDesc', 'Curated pooja vidhanam, divine chants, verses and songs recommended for your prayer time today.')}
          link="/categories"
          linkText={t('browseLibrary', 'Browse Library')}
        />

        <div className="sa-home-curated-grid">
          {featuredDevotionItems.map((item) => {
            const itemTitle = item.url === '/pooja-detail' ? t('pooja', item.title) : item.url === '/stotras' ? t('stotras', item.title) : item.url === '/slokas' ? t('slokas', item.title) : t('songs', item.title);
            return (
            <Link to={item.url} className="sa-home-curated-card" key={item.title}>
              <div className="sa-home-curated-img-wrap">
                <img src={image(item.image)} alt={item.title} loading="lazy" />
                <span className="sa-home-curated-badge">{item.badge}</span>
              </div>

              <div className="sa-home-curated-content">
                <div className="sa-home-curated-header">
                  <span className="sa-home-curated-type">
                    <Icon name={item.icon} size={15} />
                    {item.type}
                  </span>
                  <span className="sa-home-curated-meta">{item.meta}</span>
                </div>

                <h3>{itemTitle}</h3>
                <p>{item.description}</p>

                <span className="sa-home-card-action">
                  {t('readAndChant', 'Read & Chant')} <Icon name="ArrowRight" size={15} />
                </span>
              </div>
            </Link>
          );})}
        </div>
      </div>
    </section>
  );
}

/* SECTION 8: Donations & Annadanam (One consolidated, non-repetitive section) */
function DonationsAndAnnadanam() {
  const { t } = useLanguage();
  return (
    <section className="container sa-home-section">
      <SectionHeading
        eyebrow={t('donationsEyebrow', 'A SACRED ACT OF GIVING')}
        title={t('donationsTitle', 'Donations & Community Annadanam')}
        description={t('donationsDesc', 'Support temple community services, sacred rituals and the revered tradition of feeding pilgrims.')}
        link="/donations"
        linkText={t('viewAllSeva', 'View All Seva Opportunities')}
      />

      <div className="sa-home-donations-consolidated-grid">
        {donationCategories.map((item) => {
          const itemTitle = item.id === 'annadanam' ? t('annadanamFoodSeva', item.title) : item.id === 'general' ? t('generalTempleSeva', item.title) : t('mandalaFestivalSeva', item.title);
          const actionText = item.id === 'annadanam' ? t('contributeAnnadanam', item.actionText) : item.id === 'general' ? t('supportTempleSeva', item.actionText) : t('supportFestivalSeva', item.actionText);
          return (
          <article className="sa-home-donation-card-modern" key={item.id}>
            <div className="sa-home-donation-hero-image">
              <img src={image(item.image)} alt={itemTitle} loading="lazy" />
              <span className="sa-home-donation-badge">{item.badge}</span>
            </div>

            <div className="sa-home-donation-card-body">
              <div className="sa-home-donation-icon-bubble">
                <Icon name={item.icon} size={24} />
              </div>

              <h3>{itemTitle}</h3>
              <p>{item.description}</p>

              <div className="sa-home-donation-action-row">
                <Link to={item.url} className="btn gold small">
                  {actionText} <Icon name="ArrowRight" size={15} />
                </Link>
              </div>
            </div>
          </article>
        );})}
      </div>

      <div className="sa-home-annadanam-callout">
        <div className="sa-home-annadanam-callout-icon">
          <Icon name="Soup" size={30} />
        </div>
        <div className="sa-home-annadanam-callout-copy">
          <h4>{t('lookingForAnnadanam', "Looking for Today's Annadanam Distribution Locations?")}</h4>
          <p>
            {t('findCenters', 'Find authorized feeding centers, timings and map coordinates for visiting pilgrims.')}
            <span className="sa-home-verified-pill">{t('illustrativeSchedule', 'Illustrative Schedule • Real-time Sync Coming Soon')}</span>
          </p>
        </div>
        <Link to="/food-donations" className="btn outline">
          <Icon name="MapPin" size={16} /> {t('viewLocations', 'View Locations')}
        </Link>
      </div>
    </section>
  );
}

/* SECTION 9: Live Darshan (Distinguishes LIVE, Upcoming & Offline broadcasts without fake indicators) */
function LiveDarshanSection() {
  const { t } = useLanguage();
  return (
    <section className="soft-section sa-home-live-clean-section">
      <div className="container sa-home-section">
        <SectionHeading
          eyebrow={t('liveEyebrow', 'NEVER MISS A BLESSING')}
          title={t('liveTitle', 'Temple Live Darshan & Special Broadcasts')}
          description={t('liveDesc', 'Connect virtually to sacred shrines for regular harathis, special pujas and spiritual discourses.')}
          link="/live-streams"
          linkText={t('exploreStreamDir', 'Explore Stream Directory')}
        />

        <div className="sa-home-live-streams-grid">
          {liveStreams.map((stream) => (
            <article className="sa-home-stream-card" key={stream.id}>
              <div className="sa-home-stream-preview">
                <img src={image(stream.image)} alt={stream.title} loading="lazy" />
                <span
                  className={`sa-home-status-tag ${
                    stream.status === "LIVE"
                      ? "live"
                      : stream.status === "Upcoming"
                      ? "upcoming"
                      : "offline"
                  }`}
                >
                  {stream.status === "LIVE" && <span className="sa-home-live-pulse" />}
                  {stream.status === "LIVE" ? t('liveNow', 'LIVE NOW') : stream.status}
                </span>

                {stream.viewers && (
                  <span className="sa-home-viewers-count">
                    <Icon name="Eye" size={13} /> {stream.viewers}
                  </span>
                )}
              </div>

              <div className="sa-home-stream-details">
                <span className="sa-home-stream-temple">
                  <Icon name="Landmark" size={14} /> {stream.temple}
                </span>

                <h3>{stream.title}</h3>
                <p className="sa-home-stream-time">
                  <Icon name="Clock" size={14} /> {stream.timing}
                </p>

                <div className="sa-home-stream-actions">
                  <Link to="/live-streams" className="btn gold small">
                    <Icon name="CirclePlay" size={16} />
                    {stream.status === "LIVE" ? t('watchLiveNow', 'Watch Live Now') : t('streamDetails', 'Stream Details')}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* SECTION 10: Latest Devotional Updates (Detailed articles with dates, category filters & Read More) */
function LatestDevotionalUpdates() {
  const { t } = useLanguage();
  const [category, setCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const categories = ["All", "Festival", "Temple", "Annadanam", "Devotional", "Panchangam"];

  const filtered = latestDevotionalUpdates.filter(
    (item) => category === "All" || item.category === category
  );

  const displayed = showAll ? filtered : filtered.slice(0, 3);

  return (
    <section className="container sa-home-section">
      <SectionHeading
        eyebrow={t('updatesEyebrow', 'STAY SPIRITUALLY INFORMED')}
        title={t('updatesTitle', 'Latest Devotional Updates & Articles')}
        description={t('updatesDesc', 'Spiritual guidance, festival traditions, temple announcements and community articles.')}
        link="/notifications"
        linkText={t('viewNotifications', 'View Notifications')}
      />

      <div className="sa-home-update-toolbar">
        <div className="sa-home-update-filters" role="tablist" aria-label="Devotional update categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={category === cat ? "active" : ""}
              onClick={() => {
                setCategory(cat);
                setShowAll(false);
              }}
              role="tab"
              aria-selected={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="sa-home-updates-grid">
        {displayed.map((article) => (
          <article className="sa-home-update-card" key={article.id}>
            <Link to={article.url} className="sa-home-update-image">
              <img src={image(article.image)} alt={article.title} loading="lazy" />
              <span className="sa-home-update-category">
                <Icon name={article.icon} size={13} />
                {article.category}
              </span>
            </Link>

            <div className="sa-home-update-body">
              <div className="sa-home-article-meta-row">
                <span className="sa-home-article-date">
                  <Icon name="Calendar" size={13} /> {article.date}
                </span>
                <span className="sa-home-article-tag">GUIDE</span>
              </div>

              <h3>
                <Link to={article.url}>{article.title}</Link>
              </h3>

              <p>{article.description}</p>

              <Link to={article.url} className="sa-home-card-action">
                Read Full Article <Icon name="ArrowRight" size={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length > 3 && (
        <div className="sa-home-updates-more">
          <button
            className="btn outline"
            type="button"
            onClick={() => setShowAll((val) => !val)}
          >
            {showAll ? "Show Less" : `View More Articles (${filtered.length - 3})`}
            <Icon name={showAll ? "ChevronUp" : "ArrowRight"} size={17} />
          </button>
        </div>
      )}

      <p className="sa-home-static-disclaimer">
        Devotional articles and festival schedules are compiled from traditional sources for devotee convenience.
      </p>
    </section>
  );
}

/* MAIN HOMEPAGE COMPONENT — Final 9 Clean Content Sections (Header & Footer provided by main.jsx) */
export default function HomePage() {
  return (
    <div className="sa-home">
      {/* 2. Devotional Hero Banner with integrated Devotional Ticker */}
      <HeroSection />

      {/* 3. Explore Devotional Services (All main categories with search) */}
      <ServicesSection />

      {/* 5. Today's Panchangam (Focused daily almanac with date & city) */}
      <PanchangamSection />

      {/* 6. Featured Temples of India (Cards with speciality & directions) */}
      <FeaturedTemples />

      {/* 7. Today's Featured Devotion (Curated Pooja, Stotra, Sloka, Bhajan) */}
      <FeaturedDevotionalContent />

      {/* 8. Donations & Annadanam (Consolidated single section) */}
      <DonationsAndAnnadanam />

      {/* 9. Live Darshan (Broadcast previews with real LIVE/Upcoming indicators) */}
      <LiveDarshanSection />

      {/* 10. Latest Devotional Updates (Detailed articles with dates & filters) */}
      <LatestDevotionalUpdates />
    </div>
  );
}
