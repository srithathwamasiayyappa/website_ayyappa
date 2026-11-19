import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import './donations.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

function DonationsBackgroundDecorations() {
  return (
    <div className="sa-donations-decorations" aria-hidden="true">
      <img
        src="/images/categories/cat-decor-left-trans.png"
        alt=""
        className="sa-donations-decor-left"
      />
      <img
        src="/images/categories/cat-decor-right-trans.png"
        alt=""
        className="sa-donations-decor-right"
      />
      <img
        src="/images/categories/cat-decor-bottom.png"
        alt=""
        className="sa-donations-decor-bottom"
      />
    </div>
  );
}

function DonationsPageHeading() {
  const { t } = useLanguage();
  return (
    <header className="sa-donations-header">
      <div className="sa-donations-lotus-wrap">
        <img
          src="/images/donations/don-heading-lotus.png"
          alt=""
          className="sa-donations-lotus"
        />
      </div>
      <div className="sa-donations-eyebrow-row">
        <span className="sa-donations-eyebrow-line"></span>
        <p className="sa-donations-eyebrow">{t('donationsEyebrow', 'SEVA THROUGH COMPASSION')}</p>
        <span className="sa-donations-eyebrow-line"></span>
      </div>
      <h1 className="sa-donations-title">{t('donationsTitle', 'Donations & Annadanam')}</h1>
      <p className="sa-donations-subtitle">
        {t('donationsDesc', 'Explore charitable giving opportunities and the tradition of feeding those in need.')}
      </p>
      <div className="sa-donations-divider-wrap">
        <img
          src="/images/donations/don-gold-divider.png"
          alt=""
          className="sa-donations-gold-divider"
        />
      </div>
    </header>
  );
}

function AnnadanamHeroBanner() {
  const { t } = useLanguage();
  return (
    <section className="sa-annadanam-hero" aria-label="Annadanam Sacred Service Hero">
      {/* Left: 39% Image 1 Original Lord Ayyappa & Annadanam food photograph */}
      <div className="sa-annadanam-hero-photo-wrap">
        <img
          src="/images/donations/ayyappa-annadanam-hero.png"
          alt="Lord Ayyappa with Annadanam offering"
          className="sa-annadanam-hero-img"
        />
        {/* Elegant Curved Gold separator overlay */}
        <img
          src="/images/donations/gold-curve-separator.png"
          alt=""
          className="sa-annadanam-curve-overlay"
        />
      </div>

      {/* Right: 61% Emerald-Green Devotional Text Panel */}
      <div className="sa-annadanam-hero-text-panel">
        <div className="sa-annadanam-mandala-tr" aria-hidden="true" />
        <div className="sa-annadanam-mandala-br" aria-hidden="true" />

        <div className="sa-annadanam-hero-eyebrow">{t('annadanamEyebrow', 'ANNADANAM • SACRED SERVICE')}</div>
        <h2 className="sa-annadanam-hero-title">{t('annadanamBannerTitle', 'A Small Offering, A Lasting Blessing')}</h2>
        <p className="sa-annadanam-hero-desc">
          {t('annadanamBannerDesc', 'Discover giving opportunities and community annadanam initiatives.')}
        </p>

        <div className="sa-annadanam-hero-divider-line">
          <span>✦</span>
        </div>
      </div>
    </section>
  );
}

function DonationCard({ card, onDonate }) {
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState('₹100');
  const [customValue, setCustomValue] = useState('');
  const amounts = ['₹ 1', '₹ 201', '₹ 501', 'Custom'];

  const handleSelect = (amt) => {
    setSelectedAmount(amt);
    if (amt !== 'Custom') {
      setCustomValue('');
    }
  };

  const handleDonateClick = () => {
    const finalAmount = selectedAmount === 'Custom' ? (customValue ? `₹${customValue}` : 'Custom') : selectedAmount;
    onDonate(card.title, finalAmount);
  };

  return (
    <div className="sa-donation-card">
      <img
        src="/images/donations/card-sketch-temple.png"
        alt=""
        className="sa-donation-card-sketch-l"
        aria-hidden="true"
      />
      <img
        src="/images/donations/card-sketch-temple.png"
        alt=""
        className="sa-donation-card-sketch-r"
        aria-hidden="true"
      />

      <div className="sa-donation-card-icon-wrap">
        <img
          src={card.icon}
          alt={card.title}
          className="sa-donation-card-icon"
        />
      </div>

      <h3 className="sa-donation-card-title">{card.title}</h3>
      <p className="sa-donation-card-desc">{card.desc}</p>

      <div className="sa-donation-amounts-wrap">
        {amounts.map((amt) => (
          <button
            key={amt}
            type="button"
            className={`sa-donation-amount-btn ${selectedAmount === amt ? 'active' : ''}`}
            onClick={() => handleSelect(amt)}
          >
            {amt === 'Custom' ? t('customAmount', 'Custom') : amt}
          </button>
        ))}
      </div>

      {selectedAmount === 'Custom' && (
        <div className="sa-donation-custom-input-wrap">
          <span className="sa-donation-custom-currency">₹</span>
          <input
            type="number"
            min="1"
            placeholder={t('enterAmount', 'Enter amount')}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value.replace(/[^0-9]/g, ''))}
            className="sa-donation-custom-input"
            autoFocus
          />
        </div>
      )}

      <button
        type="button"
        className="sa-donation-donate-btn"
        onClick={handleDonateClick}
      >
        {t('donateNow', 'Donate Now')} <Icon name="ArrowRight" size={16} />
      </button>
    </div>
  );
}

function DonationOptionsGrid({ onDonate }) {
  const cards = [
    {
      id: 'temple-donation',
      title: 'Temple Donation',
      desc: 'Support temple and community services',
      icon: '/images/donations/icon-temple-donation.png',
    },
    {
      id: 'annadanam',
      title: 'Annadanam',
      desc: 'Help provide meals for devotees',
      icon: '/images/donations/icon-annadanam.png',
    },
    {
      id: 'festival-seva',
      title: 'Festival Seva',
      desc: 'Contribute to celebrations and special sevas',
      icon: '/images/donations/icon-festival-seva.png',
    },
  ];

  return (
    <section className="sa-donations-grid" aria-label="Devotional Donation Options">
      {cards.map((card) => (
        <DonationCard key={card.id} card={card} onDonate={onDonate} />
      ))}
    </section>
  );
}

function LiveDonationsSection({ donations }) {
  return (
    <section className="sa-live-donations-section" aria-label="Live Devotee Donations">
      <div className="sa-live-donations-header">
        <div className="sa-live-donations-title-group">
          <p className="sa-live-donations-eyebrow">COMMUNITY SEVA CONTRIBUTIONS</p>
          <h2 className="sa-live-donations-title">Recent Devotee Donations</h2>
        </div>

        <div className="sa-live-donations-badge">
          <span className="sa-live-pulse-dot" aria-hidden="true" />
          <span>LIVE DONATIONS</span>
        </div>
      </div>

      <div className="sa-live-donations-grid">
        {donations.map((item) => (
          <article key={item.id} className="sa-live-donor-card">
            <div className="sa-live-donor-card-top">
              <div className="sa-live-donor-info">
                <div className="sa-live-donor-avatar">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h4 className="sa-live-donor-name">{item.name}</h4>
                  <p className="sa-live-donor-city">
                    <Icon name="MapPin" size={12} />
                    <span>{item.city}</span>
                  </p>
                </div>
              </div>

              <span className="sa-live-donor-amount">{item.amount}</span>
            </div>

            <div className="sa-live-donor-card-bottom">
              <span className="sa-live-donor-cause">
                <Icon name="HeartHandshake" size={13} />
                <span>{item.cause}</span>
              </span>
              <span className="sa-live-donor-time">{item.time}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FoodDonationLocationsBanner() {
  return (
    <section className="sa-donations-locations-banner" aria-label="Food Donation Locations">
      <div className="sa-donations-locations-left">
        <div className="sa-donations-locations-icon-wrap">
          <img
            src="/images/donations/icon-location-map.png"
            alt="Map location"
            className="sa-donations-locations-icon"
          />
        </div>
        <div>
          <h3 className="sa-donations-locations-heading">Looking for food donation locations today?</h3>
          <p className="sa-donations-locations-desc">
            View nearby annadanam centers, meal seva timings and details.
          </p>
        </div>
      </div>

      <Link to="/food-donations" className="sa-donations-locations-btn">
        View Locations <Icon name="ArrowRight" size={16} />
      </Link>
    </section>
  );
}

export default function DonationsPage({ notify }) {
  const [liveDonations, setLiveDonations] = useState([
    {
      id: 1,
      name: 'K. Ramakrishna Sharma & Family',
      city: 'Hyderabad, Telangana',
      amount: '₹ 1,001',
      cause: 'Annadanam Seva (101 Meals)',
      time: '2m ago',
    },
    {
      id: 2,
      name: 'Suresh Kumar Nair',
      city: 'Kochi, Kerala',
      amount: '₹ 501',
      cause: 'Sabarimala Temple Seva',
      time: '7m ago',
    },
    {
      id: 3,
      name: 'V. Lakshmi Prasanna',
      city: 'Bengaluru, Karnataka',
      amount: '₹ 2,501',
      cause: 'Nitya Annadanam Contribution',
      time: '15m ago',
    },
    {
      id: 4,
      name: 'P. Sreenivasulu & Sons',
      city: 'Vijayawada, Andhra Pradesh',
      amount: '₹ 5,001',
      cause: 'Mandala Festival Seva',
      time: '28m ago',
    },
    {
      id: 5,
      name: 'Rajesh Gopinath',
      city: 'Chennai, Tamil Nadu',
      amount: '₹ 201',
      cause: 'Temple Deepam & Seva',
      time: '42m ago',
    },
    {
      id: 6,
      name: 'Anonymous Devotee',
      city: 'Coimbatore, Tamil Nadu',
      amount: '₹ 1,116',
      cause: 'Annadanam Mahadanam',
      time: '1h ago',
    },
  ]);

  const handleDonate = (title, amount) => {
    const newDonation = {
      id: Date.now(),
      name: 'You (Devotee)',
      city: 'Online Offering',
      amount: amount,
      cause: `${title} Seva`,
      time: 'Just now',
    };

    setLiveDonations((prev) => [newDonation, ...prev.slice(0, 5)]);

    if (notify) {
      notify(`🙏 Swamiye Saranam Ayyappa! Offering of ${amount} for ${title} received.`);
    } else {
      alert(`Swamiye Saranam Ayyappa! Offering of ${amount} for ${title} received.`);
    }
  };

  return (
    <main className="sa-donations-page">
      <DonationsBackgroundDecorations />
      <div className="sa-donations-container">
        <DonationsPageHeading />
        <AnnadanamHeroBanner />
        <DonationOptionsGrid onDonate={handleDonate} />
        <LiveDonationsSection donations={liveDonations} />
        <FoodDonationLocationsBanner />
      </div>
    </main>
  );
}

