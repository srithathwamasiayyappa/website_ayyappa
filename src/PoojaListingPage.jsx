import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { API_BASE_URL } from './apiConfig';
import DeitySelectionModal from './DeitySelectionModal';
import './poojaListing.css';
import './devotionalCleanList.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export function resolveDeityId(slug = '', title = '', serverDeityId = '') {
  if (serverDeityId && serverDeityId !== 'all' && serverDeityId !== '') {
    const s = serverDeityId.toLowerCase().replace(/^(lord-|goddess-)/, '');
    if (s.includes('ayyap') || s.includes('sastha')) return 'ayyappa';
    if (s.includes('shiv') || s.includes('linga') || s.includes('bilva')) return 'shiva';
    if (s.includes('venkat') || s.includes('vishnu') || s.includes('achyuta') || s.includes('koodalmanikya')) return 'venkateswara';
    if (s.includes('ganesh') || s.includes('vignesh') || s.includes('vinayak') || s.includes('ganapath')) return 'ganesha';
    if (s.includes('devi') || s.includes('durga') || s.includes('lakshmi') || s.includes('lalitha') || s.includes('kanaka')) return 'devi';
    if (s.includes('hanuman') || s.includes('anjaneya')) return 'hanuman';
    if (s.includes('subrahmanya') || s.includes('murugan') || s.includes('kartikeya') || s.includes('saravana')) return 'murugan';
    return s;
  }
  const str = `${slug} ${title}`.toLowerCase();
  if (/ayyap|sastha|harivarasanam|shabarimala|uthara|sannidhanam|padi|maaladharan|sharanu/.test(str)) return 'ayyappa';
  if (/shiva|linga|bilva|rudra|natara|mrityunjaya/.test(str)) return 'shiva';
  if (/venkates|vishnu|koodalmanikya|achyuta|govinda|narayana|perumal/.test(str)) return 'venkateswara';
  if (/ganesh|vignesh|vinayak|ganapath|modak/.test(str)) return 'ganesha';
  if (/devi|durga|lakshmi|lalitha|kanakadhara|mahalakshmi|meenakshi|kamakshi|saraswathi|gomatha/.test(str)) return 'devi';
  if (/hanuman|anjaneya|maruti|bajrang|sundarakanda/.test(str)) return 'hanuman';
  if (/subrahmanya|murugan|kartikeya|saravana|shanmukha|vel|skanda/.test(str)) return 'murugan';
  return 'all';
}

export const DEITIES = [
  { id: 'all', name: 'All Deities', te: 'అన్ని దైవాలు', kn: 'ಎಲ್ಲಾ ದೇವತೆಗಳು', ta: 'அனைத்து தெய்வங்கள்', hi: 'सभी देवी-देवता', emblem: '🕉️' },
  { id: 'ayyappa', name: 'Lord Ayyappa', te: 'శ్రీ అయ్యప్ప స్వామి', kn: 'ಶ್ರೀ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ', ta: 'ஸ்ரீ ஐயப்ப சுவாமி', hi: 'भगवान अय्यप्पा', emblem: '🛕' },
  { id: 'shiva', name: 'Lord Shiva', te: 'పరమశివుడు', kn: 'ಪರಮಶಿವ', ta: 'பரமசிவன்', hi: 'भगवान शिव', emblem: '🔱' },
  { id: 'venkateswara', name: 'Lord Venkateswara', te: 'శ్రీ వేంకటేశ్వర స్వామి', kn: 'ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ', ta: 'ஸ்ரீ வெங்கடேஸ்வர சுவாமி', hi: 'भगवान वेंकटेश्वर', emblem: '☀️' },
  { id: 'ganesha', name: 'Lord Ganesha', te: 'శ్రీ మహాగణపతి', kn: 'ಶ್ರೀ ಮಹಾಗಣಪತಿ', ta: 'ஸ்ரீ மகாகணபதி', hi: 'भगवान गणेश', emblem: '🐘' },
  { id: 'devi', name: 'Goddess Lakshmi / Durga', te: 'శ్రీ దుర్గా / లక్ష్మీ దేవి', kn: 'ಶ್ರೀ ದುರ್ಗಾ / ಲಕ್ಷ್ಮೀ ದೇವಿ', ta: 'ஸ்ரீ துர்கா / லட்சுமி தேவி', hi: 'देवी दुर्गा / लक्ष्मी', emblem: '🌸' },
  { id: 'hanuman', name: 'Lord Hanuman', te: 'శ్రీ ఆంజనేయ స్వామి', kn: 'ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ', ta: 'ஸ்ரீ ஆஞ்சநேய சுவாமி', hi: 'भगवान हनुमान', emblem: '🐒' },
  { id: 'murugan', name: 'Lord Murugan', te: 'శ్రీ సుబ్రహ్మణ్య స్వామి', kn: 'ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ', ta: 'ஸ்ரீ சுப்பிரமணிய சுவாமி', hi: 'भगवान मुरुगन', emblem: '🦚' },
];

// Comprehensive subcategory configurations for each devotional domain filtered by Deity
export const subcategoryConfigs = {
  pooja: {
    title: 'Pooja Vidhanam',
    subtitle: 'Traditional worship procedures, required materials and sacred chants.',
    breadcrumb: 'POOJA VIDHANAM',
    badgeCount: 'Sacred Guides',
    searchPlaceholder: 'Search poojas, vrathams, or rituals...',
    filterChips: [
      { label: 'All', icon: 'Sparkles' },
      { label: 'Beginner', icon: 'UserCheck' },
      { label: 'Festival', icon: 'CalendarDays' },
      { label: 'Daily', icon: 'Sun' },
      { label: 'Popular', icon: 'Flame' },
    ],
    infoLeft: 'Choose a pooja to view materials, steps, chants and timing.',
    infoRight: 'Includes: materials, procedure, mantrā, benefits',
    detailBase: '/subcategory-detail',
    items: [
      // Ayyappa Poojas
      {
        id: 'ayyappa-pooja',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Ayyappa Pooja Vidhanam',
        desc: 'Complete step-by-step worship procedure for Sastha',
        duration: '25 minutes',
        badge: 'Beginner',
        badgeClass: 'badge-beginner',
        type: 'Pooja',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Beginner',
        popularity: 100,
        durationMinutes: 25,
      },
      {
        id: 'mandala-pooja',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Mandala Pooja',
        desc: 'Daily devotion during the holy 41-day Mandala season',
        duration: '40 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Festival',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Festival',
        popularity: 95,
        durationMinutes: 40,
      },
      {
        id: 'makaravilakku-pooja',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Makaravilakku Special Pooja',
        desc: 'Special festival rituals and sacred ghee abhishekams',
        duration: '35 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Festival',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Festival',
        popularity: 90,
        durationMinutes: 35,
      },
      {
        id: 'vratham-vidhanam',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Ayyappa Vratham Vidhanam',
        desc: 'Preparation, deeksha observance and ritual practices',
        duration: '15 minutes',
        badge: 'Beginner',
        badgeClass: 'badge-beginner',
        type: 'Vratham',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Beginner',
        popularity: 85,
        durationMinutes: 15,
      },

      // Shiva Poojas
      {
        id: 'rudrabhishekam',
        deityId: 'shiva',
        deityName: 'Lord Shiva',
        title: 'Maha Rudrabhishekam',
        desc: 'Sacred bath with Panchamrita & Vedic Sri Rudram recitation',
        duration: '45 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Abhishekam',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Popular',
        popularity: 98,
        durationMinutes: 45,
      },
      {
        id: 'bilvashtaka-pooja',
        deityId: 'shiva',
        deityName: 'Lord Shiva',
        title: 'Bilvarchana Pooja',
        desc: 'Offering of 108 sacred trifoliate Bilva leaves to Shiva Linga',
        duration: '20 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Pooja',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Daily',
        popularity: 92,
        durationMinutes: 20,
      },
      {
        id: 'pradosha-pooja',
        deityId: 'shiva',
        deityName: 'Lord Shiva',
        title: 'Pradosha Pooja Vidhanam',
        desc: 'Twilight worship dissolving deep karmas on Trayodashi',
        duration: '35 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Pooja',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Festival',
        popularity: 94,
        durationMinutes: 35,
      },

      // Ganesha Poojas
      {
        id: 'ganapathi-pooja',
        deityId: 'ganesha',
        deityName: 'Lord Ganesha',
        title: 'Ganapathi Pooja & Homam',
        desc: 'Traditional prayers before auspicious beginnings',
        duration: '25 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Pooja',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Daily',
        popularity: 96,
        durationMinutes: 25,
      },
      {
        id: 'sankashtahara-pooja',
        deityId: 'ganesha',
        deityName: 'Lord Ganesha',
        title: 'Sankashti Chaturthi Vratham',
        desc: 'Observance for elimination of life difficulties & obstacles',
        duration: '30 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Vratham',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Festival',
        popularity: 91,
        durationMinutes: 30,
      },

      // Venkateswara Poojas
      {
        id: 'satyanarayana-vratham',
        deityId: 'venkateswara',
        deityName: 'Lord Venkateswara',
        title: 'Satyanarayana Swamy Vratham',
        desc: 'The sacred narrative vrata for abundant wealth & joy',
        duration: '50 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Vratham',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Popular',
        popularity: 99,
        durationMinutes: 50,
      },
      {
        id: 'venkateswara-kalyanam',
        deityId: 'venkateswara',
        deityName: 'Lord Venkateswara',
        title: 'Srinivasa Kalyana Utsavam',
        desc: 'Divine celestial wedding ritual of Lord Venkateswara & Padmavathi',
        duration: '45 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Pooja',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Festival',
        popularity: 95,
        durationMinutes: 45,
      },

      // Devi Poojas
      {
        id: 'lakshmi-pooja',
        deityId: 'devi',
        deityName: 'Goddess Devi / Lakshmi',
        title: 'Sri Mahalakshmi Pooja',
        desc: 'Worship procedure for wealth, prosperity and harmony',
        duration: '30 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Pooja',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Popular',
        popularity: 98,
        durationMinutes: 30,
      },
      {
        id: 'varalakshmi-vratham',
        deityId: 'devi',
        deityName: 'Goddess Devi / Lakshmi',
        title: 'Varalakshmi Vratham',
        desc: 'Sacred Friday vratham observed by married women for family welfare',
        duration: '40 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Vratham',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Festival',
        popularity: 97,
        durationMinutes: 40,
      },

      // Hanuman Poojas
      {
        id: 'hanuman-pooja',
        deityId: 'hanuman',
        deityName: 'Lord Hanuman',
        title: 'Hanuman Vadamala Pooja',
        desc: 'Sindhoora and Vadamala offering for courage and protection',
        duration: '25 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Pooja',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Daily',
        popularity: 93,
        durationMinutes: 25,
      },

      // Murugan Poojas
      {
        id: 'skanda-sashti-pooja',
        deityId: 'murugan',
        deityName: 'Lord Murugan',
        title: 'Skanda Sashti Vratham',
        desc: 'Observance commemorating victory of Lord Kartikeya over Surapadman',
        duration: '35 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Vratham',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Festival',
        popularity: 90,
        durationMinutes: 35,
      },
    ],
  },

  stotras: {
    title: 'Astothrams & Stotras',
    subtitle: 'Sacred 108 names, thousand divine praises and timeless devotional hymns.',
    breadcrumb: 'ASTOTHRAMS & STOTRAS',
    badgeCount: 'Sacred Hymns',
    searchPlaceholder: 'Search astothrams, sahasranamam, or stotras...',
    filterChips: [
      { label: 'All', icon: 'Sparkles' },
      { label: 'Astothram', icon: 'Flower2' },
      { label: 'Sahasranamam', icon: 'BookOpen' },
      { label: 'Daily', icon: 'Sun' },
      { label: 'Popular', icon: 'Flame' },
    ],
    infoLeft: 'Choose an astothram or stotra to view sacred verses and chanting guidance.',
    infoRight: 'Includes: sanskrit slokas, transliteration, audio, spiritual benefits',
    detailBase: '/subcategory-detail',
    items: [
      // Ayyappa
      {
        id: 'ayyappa-ashtothram',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Sri Ayyappa Ashtothram',
        desc: '108 sacred names chanted during daily pooja and vratham',
        duration: '15 minutes',
        badge: 'Beginner',
        badgeClass: 'badge-beginner',
        type: 'Astothram',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Astothram',
        popularity: 100,
        durationMinutes: 15,
      },
      {
        id: 'ayyappa-sahasranamam',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Sri Ayyappa Sahasranamam',
        desc: '1,000 divine names reciting the glory and virtues of Lord Sastha',
        duration: '45 minutes',
        badge: 'Festival',
        badgeClass: 'badge-festival',
        type: 'Sahasranamam',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Sahasranamam',
        popularity: 95,
        durationMinutes: 45,
      },

      // Shiva
      {
        id: 'shiva-tandava',
        deityId: 'shiva',
        deityName: 'Lord Shiva',
        title: 'Shiva Tandava Stotram',
        desc: 'Rhythmic cosmic hymn sung by Ravana celebrating Shiva’s dance',
        duration: '12 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Stotras',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Popular',
        popularity: 98,
        durationMinutes: 12,
      },
      {
        id: 'lingashtakam',
        deityId: 'shiva',
        deityName: 'Lord Shiva',
        title: 'Sri Lingashtakam',
        desc: 'Eight divine verses honoring the eternal cosmic Linga',
        duration: '8 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Stotras',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Daily',
        popularity: 94,
        durationMinutes: 8,
      },

      // Ganesha
      {
        id: 'ganesha-pancharatnam',
        deityId: 'ganesha',
        deityName: 'Lord Ganesha',
        title: 'Ganesha Pancharatnam',
        desc: 'Five divine jewels composed by Adi Shankaracharya',
        duration: '7 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Stotras',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Daily',
        popularity: 96,
        durationMinutes: 7,
      },

      // Venkateswara
      {
        id: 'venkateswara-suprabhatam',
        deityId: 'venkateswara',
        deityName: 'Lord Venkateswara',
        title: 'Sri Venkateswara Suprabhatam',
        desc: 'Awakening hymns chanted daily at Tirumala Tirupati Devasthanam',
        duration: '22 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Stotras',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Popular',
        popularity: 99,
        durationMinutes: 22,
      },
      {
        id: 'vishnu-sahasranamam',
        deityId: 'venkateswara',
        deityName: 'Lord Venkateswara',
        title: 'Vishnu Sahasranamam',
        desc: '1,000 supreme names of Lord Mahavishnu revealed by Bhishma',
        duration: '35 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Sahasranamam',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Sahasranamam',
        popularity: 97,
        durationMinutes: 35,
      },

      // Devi
      {
        id: 'mahishasura-mardini',
        deityId: 'devi',
        deityName: 'Goddess Devi / Lakshmi',
        title: 'Mahishasura Mardini Stotram',
        desc: 'Ayigiri Nandini rhythmic celebration of Goddess Durga’s victory',
        duration: '15 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Stotras',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Popular',
        popularity: 98,
        durationMinutes: 15,
      },
      {
        id: 'sri-suktam',
        deityId: 'devi',
        deityName: 'Goddess Devi / Lakshmi',
        title: 'Sri Suktam',
        desc: 'Vedic hymn for wealth, divine mother’s grace and abundance',
        duration: '14 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Stotras',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Daily',
        popularity: 96,
        durationMinutes: 14,
      },

      // Hanuman
      {
        id: 'hanuman-chalisa',
        deityId: 'hanuman',
        deityName: 'Lord Hanuman',
        title: 'Sri Hanuman Chalisa',
        desc: 'Forty devotional chaupais composed by Goswami Tulsidas',
        duration: '10 minutes',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Stotras',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Popular',
        popularity: 100,
        durationMinutes: 10,
      },
    ],
  },

  slokas: {
    title: 'Daily Slokas',
    subtitle: 'Sacred verses, powerful mantras and daily meditative chants.',
    breadcrumb: 'DAILY SLOKAS',
    badgeCount: 'Sacred Verses',
    searchPlaceholder: 'Search slokas, gayathri, or mantras...',
    filterChips: [
      { label: 'All', icon: 'Sparkles' },
      { label: 'Daily', icon: 'Sun' },
      { label: 'Popular', icon: 'Flame' },
    ],
    infoLeft: 'Select a sloka to read sanskrit lyrics, meaning and listen to audio.',
    infoRight: 'Includes: devanagari, telugu, english transliteration, audio player',
    detailBase: '/subcategory-detail',
    items: [
      // Ayyappa
      {
        id: 'ayyappa-gayathri',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Sri Ayyappa Gayathri Mantra',
        desc: 'Om Bhootanaathaya Vidmahe sacred illumination chant',
        duration: '5 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Slokas',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Daily',
        popularity: 95,
        durationMinutes: 5,
      },
      // Shiva
      {
        id: 'maha-mrityunjaya',
        deityId: 'shiva',
        deityName: 'Lord Shiva',
        title: 'Maha Mrityunjaya Mantra',
        desc: 'Supreme healing & immortality mantra from the Rigveda',
        duration: '8 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Slokas',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Daily',
        popularity: 98,
        durationMinutes: 8,
      },
      // Ganesha
      {
        id: 'vakratunda-sloka',
        deityId: 'ganesha',
        deityName: 'Lord Ganesha',
        title: 'Vakratunda Mahakaya Sloka',
        desc: 'Universal obstacle-remover sloka chanted before start of day',
        duration: '3 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Slokas',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Daily',
        popularity: 99,
        durationMinutes: 3,
      },
      // Venkateswara
      {
        id: 'namo-narayanaya',
        deityId: 'venkateswara',
        deityName: 'Lord Venkateswara',
        title: 'Om Namo Narayanaya Ashtakshari',
        desc: 'Sacred eight-syllable Mahamantra of Lord Narayana',
        duration: '6 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Slokas',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Daily',
        popularity: 96,
        durationMinutes: 6,
      },
      // Devi
      {
        id: 'sarva-mangala',
        deityId: 'devi',
        deityName: 'Goddess Devi / Lakshmi',
        title: 'Sarva Mangala Mangalye',
        desc: 'Auspicious protective verse invoking Goddess Narayani',
        duration: '4 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Slokas',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Daily',
        popularity: 97,
        durationMinutes: 4,
      },
      // Hanuman
      {
        id: 'manojava-sloka',
        deityId: 'hanuman',
        deityName: 'Lord Hanuman',
        title: 'Manojavam Maruta Tulya Vegam',
        desc: 'Speed-of-mind and wind invocation to Lord Anjaneya',
        duration: '3 minutes',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Slokas',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Daily',
        popularity: 94,
        durationMinutes: 3,
      },
    ],
  },

  songs: {
    title: 'Bhajans & Songs',
    subtitle: 'Soulful devotional melodies, traditional harathis and sacred kirtans.',
    breadcrumb: 'BHAJANS & SONGS',
    badgeCount: 'Sacred Melodies',
    searchPlaceholder: 'Search bhajans, harathis, kirtans, or songs...',
    filterChips: [
      { label: 'All', icon: 'Sparkles' },
      { label: 'Bhajans', icon: 'Music2' },
      { label: 'Harathis', icon: 'Flame' },
      { label: 'Popular', icon: 'Flame' },
    ],
    infoLeft: 'Choose a devotional song or harathi to stream audio and read lyrical chants.',
    infoRight: 'Includes: audio player, synchronized lyrics, ragam, devotional meaning',
    detailBase: '/subcategory-detail',
    items: [
      // Ayyappa
      {
        id: 'ayyappa-bhajan',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Ayyappa Bhajan — Swamiye Saranam',
        desc: 'Heartfelt chorus invoking the divine grace of Lord Ayyappa',
        duration: '04:38',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Bhajans',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Bhajans',
        popularity: 100,
        durationMinutes: 5,
      },
      {
        id: 'harivarasanam-song',
        deityId: 'ayyappa',
        deityName: 'Lord Ayyappa',
        title: 'Harivarasanam Viswamohanam',
        desc: 'Sacred bedtime lullaby sung during temple closure at Sabarimala',
        duration: '06:10',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Songs',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Songs',
        popularity: 100,
        durationMinutes: 6,
      },
      // Shiva
      {
        id: 'om-namah-shivaya',
        deityId: 'shiva',
        deityName: 'Lord Shiva',
        title: 'Om Namah Shivaya Dhun',
        desc: 'Continuous meditative chanting of the holy Panchakshari',
        duration: '08:15',
        badge: 'Daily',
        badgeClass: 'badge-daily',
        type: 'Bhajans',
        image: '/images/pooja/card-banner-ayyappa-hd.png',
        filterTag: 'Bhajans',
        popularity: 98,
        durationMinutes: 8,
      },
      // Ganesha
      {
        id: 'ganesha-sharanam',
        deityId: 'ganesha',
        deityName: 'Lord Ganesha',
        title: 'Ganesha Sharanam Sharanam Ganesha',
        desc: 'Upbeat chorus chant seeking refuge at the elephant Lord’s feet',
        duration: '05:22',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Bhajans',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Bhajans',
        popularity: 96,
        durationMinutes: 5,
      },
      // Venkateswara
      {
        id: 'govinda-hari-govinda',
        deityId: 'venkateswara',
        deityName: 'Lord Venkateswara',
        title: 'Govinda Hari Govinda Venkataramana',
        desc: 'Soulful Tirumala sankirtan echoing the holy Seven Hills',
        duration: '07:40',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Bhajans',
        image: '/images/pooja/card-banner-ganapathi-hd.png',
        filterTag: 'Bhajans',
        popularity: 99,
        durationMinutes: 8,
      },
      // Devi
      {
        id: 'bhagyada-lakshmi',
        deityId: 'devi',
        deityName: 'Goddess Devi / Lakshmi',
        title: 'Bhagyada Lakshmi Baramma',
        desc: 'Celebrated Purandara Dasa devaranama inviting Goddess of fortune',
        duration: '05:45',
        badge: 'Popular',
        badgeClass: 'badge-popular',
        type: 'Songs',
        image: '/images/pooja/card-banner-lakshmi-hd.png',
        filterTag: 'Songs',
        popularity: 98,
        durationMinutes: 6,
      },
    ],
  },
};

export default function PoojaListingPage({ category: categoryProp }) {
  const { currentLanguage, t } = useLanguage();
  const location = useLocation();

  // Detect category from prop or pathname
  const activeCategory = useMemo(() => {
    if (categoryProp) return categoryProp;
    const p = location.pathname.toLowerCase();
    const q = new URLSearchParams(location.search).get('category');
    if (q) return q;
    if (p.includes('/stotras') || p.includes('/astothram')) return 'stotras';
    if (p.includes('/slokas')) return 'slokas';
    if (p.includes('/songs') || p.includes('/bhajans')) return 'songs';
    return 'pooja';
  }, [categoryProp, location.pathname, location.search]);

  const config = subcategoryConfigs[activeCategory] || subcategoryConfigs.pooja;

  // Dynamically fetch subcategories from DB via API to stay 100% in sync with Admin panel
  const [dbItems, setDbItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const fetchSubcategories = async () => {
      try {
        let res = await fetch(`${API_BASE_URL}/categories/subcategories?parent=${activeCategory}&lang=${currentLanguage}&limit=100`);
        let json = await res.json().catch(() => null);
        if (!json || !Array.isArray(json.data) || json.data.length === 0) {
          res = await fetch(`${API_BASE_URL}/admin/subcategories?parentId=${activeCategory}&lang=${currentLanguage}&limit=100`);
          json = await res.json().catch(() => null);
        }
        if (!isCancelled && json && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((item, idx) => {
            const rawSlug = item.slug || String(item.id);
            const titleFormatted = item.title && item.title !== rawSlug
              ? item.title
              : rawSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            const resolvedDeity = resolveDeityId(rawSlug, titleFormatted, item.deityId);

            return {
              id: rawSlug,
              rawId: item.id,
              deityId: resolvedDeity,
              deityName: item.deityName || resolvedDeity,
              title: titleFormatted,
              desc: item.description || item.desc || `Complete sacred verses, meaning and guidance for ${titleFormatted}.`,
              duration: item.duration || '10 minutes',
              badge: item.badge || 'Daily',
              badgeClass: item.badgeClass || 'badge-daily',
              type: item.isAudio ? 'Audio / Bhajan' : (item.parentTitle || 'Slokas'),
              image: item.imageUrl || item.image || `/images/subcategories/${activeCategory}/${rawSlug}.webp`,
              filterTag: item.filterTag || 'Daily',
              popularity: item.displayOrder ? (100 - item.displayOrder) : (95 - idx),
              durationMinutes: item.durationMinutes || 10,
            };
          });
          setDbItems(mapped);
        } else if (!isCancelled) {
          setDbItems([]);
        }
      } catch (err) {
        console.warn('Failed to fetch subcategories from DB via API:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchSubcategories();
    return () => { isCancelled = true; };
  }, [activeCategory, currentLanguage]);

  // Determine if popup should open:
  // 1. If URL has selectDeity=true OR selectDeity=1
  // 2. OR if location.state?.openDeityModal is true
  // 3. OR if user has not chosen/dismissed deity in this category during this session
  const checkShouldOpenModal = () => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('selectDeity') === 'true' || params.get('selectDeity') === '1' || location.state?.openDeityModal) {
        return true;
      }
      const sessionSeen = sessionStorage.getItem(`sa_deity_modal_seen_${activeCategory}`);
      if (!sessionSeen) {
        return true;
      }
      return false;
    } catch {
      return true;
    }
  };

  const [isDeityModalOpen, setIsDeityModalOpen] = useState(checkShouldOpenModal);

  // Watch for navigation changes (e.g. user clicks on category in navbar, home, or categories page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('selectDeity') === 'true' || params.get('selectDeity') === '1' || location.state?.openDeityModal) {
      setIsDeityModalOpen(true);
    }
  }, [location.pathname, location.search, location.state, activeCategory]);

  // Read deity from URL search parameter (default to saved deity or 'all')
  const [selectedGod, setSelectedGod] = useState(() => {
    const fromUrl = new URLSearchParams(location.search).get('god');
    if (fromUrl) return fromUrl;
    try {
      return localStorage.getItem('sa_selected_deity') || localStorage.getItem('sa-selected-god') || 'all';
    } catch {
      return 'all';
    }
  });

  // Keep selected god in sync if URL changes
  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get('god');
    if (fromUrl && fromUrl !== selectedGod) {
      setSelectedGod(fromUrl);
    }
  }, [location.search]);

  const handleSelectGod = (godId) => {
    setSelectedGod(godId);
    try {
      localStorage.setItem('sa_selected_deity', godId);
      localStorage.setItem('sa-selected-god', godId);
      localStorage.setItem('selected_deity', godId);
      sessionStorage.setItem(`sa_deity_modal_seen_${activeCategory}`, 'true');
    } catch {}
  };

  const handleCloseModal = () => {
    try {
      sessionStorage.setItem(`sa_deity_modal_seen_${activeCategory}`, 'true');
    } catch {}
    setIsDeityModalOpen(false);
  };

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Popular');

  const itemsToUse = (dbItems && dbItems.length > 0) ? dbItems : (config.items || []);

  // Filtering & Sorting (STRICTLY FILTERED BASED ON SELECTED GOD)
  const filteredList = useMemo(() => {
    let list = itemsToUse.filter((item) => {
      // 1. GOD / DEITY FILTER: If a specific God is selected, show only that God's subcategories
      if (selectedGod !== 'all' && item.deityId !== selectedGod && item.deityId !== 'all') {
        return false;
      }

      // 2. Search query filter
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        (item.deityName && item.deityName.toLowerCase().includes(q));

      // 3. Subcategory tag filter
      const matchesFilter =
        filter === 'All' ||
        item.filterTag === filter ||
        item.badge === filter ||
        item.type === filter ||
        (filter === 'Popular' && item.popularity >= 90);

      return matchesSearch && matchesFilter;
    });

    if (sort === 'Name') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'Shortest') {
      return [...list].sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sort === 'Longest') {
      return [...list].sort((a, b) => b.durationMinutes - a.durationMinutes);
    }

    return list;
  }, [itemsToUse, selectedGod, search, filter, sort]);

  const currentGodObj = DEITIES.find((d) => d.id === selectedGod);

  return (
    <main className="sa-pooja-page">
      {/* Devotional Watermark Background with Soft Opacity */}
      <div className="sa-pooja-bg-watermark" aria-hidden="true">
        <img
          src="/images/ayyappa-watermark-transparent.png"
          alt=""
          className="sa-pooja-bg-watermark-img"
        />
      </div>

      <div className="sa-pooja-page__content">
        {/* Centered Breadcrumb */}
        <nav className="sa-pooja-breadcrumb" aria-label="Breadcrumb">
          <Link to="/home">HOME</Link>
          <span className="sep">/</span>
          <Link to="/categories">DEVOTIONAL SERVICES</Link>
          <span className="sep">/</span>
          <span className="current">{config.breadcrumb}</span>
        </nav>

        {/* Heading Header Group & Sacred Guides Badge */}
        <header className="sa-pooja-header-wrap">
          <div className="sa-pooja-header-center">
            <div className="sa-pooja-title-row">
              <img
                src="/images/pooja/lotus-heading-left-trans.png"
                alt=""
                className="sa-pooja-heading-lotus"
                aria-hidden="true"
              />
              <h1 className="sa-pooja-title">{config.title}</h1>
              <img
                src="/images/pooja/lotus-heading-right-trans.png"
                alt=""
                className="sa-pooja-heading-lotus"
                aria-hidden="true"
              />
            </div>
            <p className="sa-pooja-subtitle">{config.subtitle}</p>
          </div>

          <div className="sa-pooja-badge-wrap">
            <span className="sa-pooja-guides-badge">
              {filteredList.length} {config.badgeCount}
            </span>
          </div>
        </header>

        {/* ── STEP 2 & 3: SELECT GOD / DEITY FILTER BAR ── */}
        <div className="sa-pooja-god-bar" role="region" aria-label="Select God to Filter Subcategories">
          <div className="sa-pooja-god-bar-header">
            <div className="god-prompt-title">
              <span className="god-sparkle">✨</span>
              <strong>{t('filterByGod', 'Which God do you want to select?')}</strong>
              {selectedGod !== 'all' && (
                <span className="god-active-tag">
                  {t('showingSubcategoriesFor', 'Showing subcategories for:')} <strong>{(currentLanguage !== 'en' && currentGodObj?.[currentLanguage]) ? currentGodObj[currentLanguage] : currentGodObj?.name}</strong>
                </span>
              )}
            </div>

            <div className="god-actions-row">
              <button
                type="button"
                className="god-change-modal-btn"
                onClick={() => setIsDeityModalOpen(true)}
                title="Open God / Goddess Selection Popup"
              >
                <Icon name="Sparkles" size={14} />
                <span>Change Deity</span>
              </button>

              {selectedGod !== 'all' && (
                <button
                  type="button"
                  className="god-reset-btn"
                  onClick={() => handleSelectGod('all')}
                >
                  Reset to All Gods
                </button>
              )}
            </div>
          </div>

          <div className="sa-pooja-god-chips">
            {/* All Deities dropdown chip matching reference image */}
            <button
              type="button"
              onClick={() => setIsDeityModalOpen(true)}
              className={`sa-pooja-god-chip sa-pooja-god-chip-dropdown ${selectedGod === 'all' ? 'active' : ''}`}
              title="Click to choose a God / Goddess"
            >
              <span className="deity-emblem">🕉️</span>
              <span className="deity-name">{selectedGod === 'all' ? 'All Deities' : (currentGodObj?.name || 'Change Deity')}</span>
              <Icon name="ChevronDown" size={14} className="deity-chevron" />
            </button>

            {DEITIES.filter((d) => d.id !== 'all').map((deity) => {
              const isSelected = selectedGod === deity.id;
              const deityLabel = (currentLanguage !== 'en' && deity[currentLanguage]) ? deity[currentLanguage] : deity.name;
              return (
                <button
                  key={deity.id}
                  type="button"
                  onClick={() => handleSelectGod(deity.id)}
                  className={`sa-pooja-god-chip ${isSelected ? 'active' : ''}`}
                >
                  <span className="deity-emblem">{deity.emblem}</span>
                  <span className="deity-name">{deityLabel}</span>
                  {isSelected && <span className="deity-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Card Frame with Controls, Informational Strip & Devotional Clean List */}
        <section className="sa-pooja-card-frame">
          <div className="sa-pooja-inner-board">
            {/* Top Toolbar: Search & Sort */}
            <div className="sa-pooja-toolbar">
              <div className="sa-pooja-search-box">
                <Icon
                  name="Search"
                  size={18}
                  className="sa-pooja-search-icon"
                />
                <input
                  type="text"
                  placeholder={config.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search devotional guides"
                />
                {search && (
                  <button
                    type="button"
                    className="sa-pooja-clear-btn"
                    onClick={() => setSearch('')}
                  >
                    <Icon name="X" size={15} />
                  </button>
                )}
              </div>

              <div className="sa-pooja-sort-box">
                <span className="sa-pooja-sort-label">Sort By:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="sa-pooja-sort-select"
                  aria-label="Sort guides"
                >
                  <option value="Popular">Most Popular</option>
                  <option value="Name">Alphabetical (A-Z)</option>
                  <option value="Shortest">Duration: Shortest</option>
                  <option value="Longest">Duration: Longest</option>
                </select>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className="sa-pooja-sort-arrow"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="sa-pooja-filters-row" role="tablist">
              {config.filterChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className={`sa-pooja-filter-chip ${
                    filter === chip.label ? 'active' : ''
                  }`}
                  onClick={() => setFilter(chip.label)}
                >
                  <Icon name={chip.icon} size={15} />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Informational Strip */}
            <div className="sa-pooja-info-strip">
              <div className="sa-pooja-info-left">
                <span className="sa-pooja-info-icon">❀</span>
                <span>{config.infoLeft}</span>
              </div>
              <div className="sa-pooja-info-right">
                <Icon
                  name="Layers"
                  size={15}
                  className="sa-pooja-info-icon"
                />
                <span>{config.infoRight}</span>
              </div>
            </div>

            {/* Clean Devotional Subcategories Listing */}
            <div className="sa-pooja-clean-list">
              {filteredList.map((item) => (
                <Link
                  key={item.id}
                  to={`/subcategory-detail?id=${item.id}&god=${item.deityId}&category=${activeCategory}`}
                  className="sa-pooja-list-item"
                >
                  <div className="sa-pooja-list-main">
                    {/* Left: God Avatar / Sacred Thumbnail */}
                    <div className="sa-pooja-god-thumb">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => { e.target.src = '/images/hero-deity.jpg'; }}
                      />
                    </div>

                    {/* Middle: Title, Subtitle, Deity Tag, Duration & Difficulty Badge */}
                    <div className="sa-pooja-item-info">
                      <div className="sa-pooja-item-title-row">
                        <h2 className="sa-pooja-item-title">{item.title}</h2>
                        {item.deityName && (
                          <span className="sa-pooja-item-deity-pill">
                            {item.deityName}
                          </span>
                        )}
                        <span className={`sa-pooja-item-badge ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="sa-pooja-item-desc">{item.desc}</p>
                    </div>
                  </div>

                  {/* Right: Duration & View Complete Details Button */}
                  <div className="sa-pooja-list-side">
                    <div className="sa-pooja-item-time">
                      <Icon name="Clock" size={14} className="sa-pooja-time-icon" />
                      <span>{item.duration}</span>
                    </div>

                    <span className="sa-pooja-btn-view">
                      <span>View Details</span>
                      <Icon name="ArrowRight" size={14} />
                    </span>
                  </div>
                </Link>
              ))}

              {filteredList.length === 0 && (
                <div className="sa-pooja-empty-filter">
                  <span className="empty-icon">🕉️</span>
                  <h3>No content available for {currentGodObj?.name || 'this Deity'} in this section right now.</h3>
                  <p>You can choose another God or view content for all Deities.</p>
                  <div className="sa-empty-actions-row">
                    <button
                      type="button"
                      className="btn-reset-filters"
                      onClick={() => { handleSelectGod('all'); setSearch(''); setFilter('All'); }}
                    >
                      View All Deities
                    </button>
                    <button
                      type="button"
                      className="btn-change-deity-modal"
                      onClick={() => setIsDeityModalOpen(true)}
                    >
                      Choose Another Deity
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── GOD / GODDESS SELECTION POPUP MODAL ── */}
      <DeitySelectionModal
        isOpen={isDeityModalOpen}
        onClose={handleCloseModal}
        currentDeityId={selectedGod}
        targetPageTitle={config.title}
        onSelectDeity={(deity) => {
          handleSelectGod(deity.id);
          handleCloseModal();
        }}
      />
    </main>
  );
}
