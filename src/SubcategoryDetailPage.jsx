import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { API_BASE_URL } from './apiConfig';
import { DEFAULT_SCRIPTURES, DEFAULT_CHILDREN } from './defaultScriptures';
import './devotionalCleanList.css';
import './subcategoryDetail.css';

// Scripture Content Parser to faithfully format scripture text matching reference design
export function parseScriptureContent(fullText) {
  if (!fullText) return { instruction: '', invocations: [], sections: [] };

  const paragraphs = fullText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  let instruction = '';
  const invocations = [];
  const sections = [];
  let startIdx = 0;

  // 1. Extract introductory instruction note (సూచన)
  if (paragraphs.length > 0 && (paragraphs[0].includes('సూచన') || paragraphs[0].length > 140)) {
    instruction = paragraphs[0].replace(/^సూచన\s*:\s*/, '').trim();
    startIdx = 1;
  }

  // 2. Extract central invocations (శ్రీ మహాగణాధిపతయే నమః / శ్రీ గురుభ్యోనమః హరిః ఓం)
  if (
    paragraphs[startIdx] &&
    (paragraphs[startIdx].includes('మహాగణాధిపతయే') || paragraphs[startIdx].includes('గురుభ్యోనమః'))
  ) {
    const invLines = paragraphs[startIdx].split('\n').map((l) => l.trim()).filter(Boolean);
    invocations.push(...invLines);
    startIdx++;
  }

  for (let i = startIdx; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (/^[.\-—_·•\s]{5,}$/.test(p)) continue;

    // Detect section headings vs verses
    const isHeading =
      p.length < 55 && !p.includes('|') && !p.includes('||') && !p.includes('\n');

    // Traditional headings for primary slokas matching reference
    if (p.includes('సరస్వతీ నమస్తుభ్యం') && !paragraphs[i - 1]?.includes('సరస్వతీ')) {
      sections.push({ type: 'heading', text: 'శ్రీ సరస్వతీ శ్లోకం' });
    } else if (p.includes('గురుర్బ్రహ్మ') && !paragraphs[i - 1]?.includes('గురు')) {
      sections.push({ type: 'heading', text: 'గురు శ్లోకం' });
    }

    if (isHeading) {
      sections.push({ type: 'heading', text: p.replace(/^[\[\(]|[\]\)]$/g, '').trim() });
    } else {
      sections.push({ type: 'verse', text: p });
    }
  }

  return { instruction, invocations, sections };
}

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

// Comprehensive Devotional Subcategories Knowledgebase for All Gods
export const SUBCATEGORY_DETAILS = {
  // --- AYYAPPA SUBCATEGORIES ---
  'ayyappa-pooja': {
    id: 'ayyappa-pooja',
    deityId: 'ayyappa',
    deityName: 'Lord Ayyappa',
    deityTelugu: 'శ్రీ అయ్యప్ప స్వామి',
    category: 'pooja',
    title: 'Ayyappa Pooja Vidhanam',
    titleTelugu: 'శ్రీ అయ్యప్ప పూజా విధానం',
    subtitle: 'Sacred step-by-step daily and mandala worship for Lord Sastha.',
    heroImage: '/images/pooja/card-banner-ayyappa-hd.png',
    badge: 'Mandala Special',
    badgeClass: 'badge-festival',
    duration: '35 mins',
    difficulty: 'All Devotees',
    bestTime: 'Brahma Muhurtham (4:30 AM – 6:00 AM) or Sandhya Samayam (6:00 PM – 7:30 PM)',
    overview: `Ayyappa Pooja is the quintessential devotional worship observed with utmost purity, discipline, and devotion, especially during the 41-day Mandala Kalam. This sacred worship brings peace, removes all negative vibrations, cures physical ailments, and bestows the benevolent grace of Manikanta.`,
    procedure: [
      {
        step: 1,
        title: 'Shuddi & Deeparadhana',
        desc: 'Bathe with cold water, apply sacred Vibhuti and Chandanam, wear black or saffron deeksha vastram, and light brass oil lamps with pure sesame or ghee.',
        mantra: 'ఓం దీపజ్యోతిః పరబ్రహ్మ దీపజ్యోతిర్జనార్దనః | దీపో హరతు మే పాపం సంధ్యాదీప నమోऽస్తుతే ||',
      },
      {
        step: 2,
        title: 'Ganesha Prarthana & Sankalpam',
        desc: 'Invoke Lord Vigneshwara with turmeric Ganapathi, offer fresh Garika grass, and make the solemn sankalpam for spiritual purity, family well-being, and peaceful pilgrimage.',
        mantra: 'శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజం | ప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే ||',
      },
      {
        step: 3,
        title: 'Shodashopachara Ayyappa Pooja',
        desc: 'Invoke Lord Dharma Sastha upon a sacred peetham adorned with fresh jasmine and thulasi. Perform 16 divine upacharas: Dhyanam, Asanam, Padyam, Arghyam, Snanam, Vastram, Upaveetam, Gandham, Pushpam, Dhoopam, Deepam, Naivedyam, Thamboolam, Neerajanam, Pradakshina, and Namaskaram.',
        mantra: 'ధ్యానశ్లోకం: భూతనాథ సదానంద సర్వభూత దయాపర | రక్ష రక్ష మహాబాహో శాస్త్రే తుభ్యం నమో నమః ||',
      },
      {
        step: 4,
        title: 'Ashtothra Sata Namavali Archana',
        desc: 'Recite the 108 Holy Names of Lord Ayyappa while gently showering fragrant Kumkum, Bilva leaves, and Thulasi petals at the holy lotus feet of the deity.',
        mantra: 'ఓం మహాశాస్త్రే నమః | ఓం విశ్వేశ్వర్యాయ నమః | ఓం లోకవీరాయ నమః | ఓం ధర్మశాస్త్రే నమః | ఓం హరిహరపుత్రాయ నమః ...',
      },
      {
        step: 5,
        title: 'Maha Naivedyam & Karpoora Harathi',
        desc: 'Offer sweet jaggery Payasam (Aravana), sweet rice appams, pure ghee, and coconuts. Conclude with waving camphor harathi while chanting Harivarasanam.',
        mantra: 'హరివరాసనం విశ్వమోహనం | హరిదధీశ్వరం ఆరాధ్యపాదుకం | అరివిమర్దనం నిత్యనర్తనం | హరిహరాత్మజం దేవమాశ్రయే ||',
      },
    ],
    materials: [
      { name: 'Pure Cow Ghee / Sesame Oil for Deepam', qty: '200 ml', icon: 'Flame' },
      { name: 'Fresh Cotton Wicks (Vattulu)', qty: '1 Packet', icon: 'Sparkles' },
      { name: 'Pure Vibhuti, Kumkum & Sandalwood (Gandham)', qty: '50g each', icon: 'Flower2' },
      { name: 'Fresh Fragrant Flowers & Thulasi Leaves', qty: '2 Garlands, 1 Basket', icon: 'Flower2' },
      { name: 'Raw Coconuts & Betel Leaves with Supari', qty: '3 Coconuts, 9 Betel Leaves', icon: 'Layers' },
      { name: 'Raw Rice with Turmeric (Akshintalu)', qty: '1 Bowl', icon: 'Sparkles' },
      { name: 'Sweet Jaggery Payasam or Ghee Rice (Naivedyam)', qty: '1 Pot', icon: 'Soup' },
      { name: 'Pure Camphor (Karpooram) & Dhoop Sticks', qty: '1 Box each', icon: 'Flame' },
    ],
    mantras: [
      {
        title: 'Moola Mantra',
        script: 'ఓం ఘ్రూం స్వామియే శరణం అయ్యప్ప ||',
        transliteration: 'Om Ghroom Swamiye Saranam Ayyappa ||',
        meaning: 'I surrender mind, heart, and soul to the divine Lord Ayyappa, embodiment of Dharma and compassion.',
      },
      {
        title: 'Ayyappa Gayathri Mantra',
        script: 'ఓం భూతనాథాయ విద్మహే భవపుత్రాయ ధీమహి | తన్నో శాస్తా ప్రచోదయాత్ ||',
        transliteration: 'Om Bhootanaathaya Vidmahe Bhavaputraya Dheemahi | Tanno Saasta Prachodayaat ||',
        meaning: 'May the Lord of all living beings, son of Shiva and Vishnu, illuminate our intellect with divine wisdom.',
      },
    ],
    benefits: [
      'Removes planetary afflictions and Shani (Saturn) doshams completely.',
      'Instills inner peace, razor-sharp focus, and unwavering self-discipline.',
      'Blesses the household with harmony, good health, and spiritual protection.',
      'Paves the auspicious path for a blissful pilgrimage to holy Sabarimala.',
    ],
    audioTrack: {
      title: 'Ayyappa Harivarasanam & Moola Chants',
      duration: '06:15',
      ragam: 'Madhyamavathi',
    },
  },

  // --- SHIVA SUBCATEGORIES ---
  'rudrabhishekam': {
    id: 'rudrabhishekam',
    deityId: 'shiva',
    deityName: 'Lord Shiva',
    deityTelugu: 'పరమశివుడు',
    category: 'pooja',
    title: 'Maha Rudrabhishekam Vidhanam',
    titleTelugu: 'మహా రుద్రాభిషేక విధానం',
    subtitle: 'The supreme sacred bath offered to Shiva Linga with Vedic Sri Rudram.',
    heroImage: '/images/pooja/card-banner-ayyappa-hd.png',
    badge: 'Maha Shivaratri & Somavaram',
    badgeClass: 'badge-festival',
    duration: '45 mins',
    difficulty: 'All Devotees',
    bestTime: 'Pradosha Kalam (5:30 PM – 7:00 PM) or Monday Mornings',
    overview: `Rudrabhishekam is the most potent Vedic worship to Lord Shiva. Chanting Sri Rudram and Chamakam while bathing the holy Shiva Lingam in Panchamritams dissolves karmic bondages, neutralizes malefic astrological effects, and bestows supreme peace and longevity.`,
    procedure: [
      {
        step: 1,
        title: 'Sankalpam & Linga Shuddhi',
        desc: 'Place the Shiva Linga facing North or East in a copper/silver Abhishekha vessel. Cleanse with pure water chanting the Shiva Panchakshara.',
        mantra: 'ఓం నమః శివాయ ||',
      },
      {
        step: 2,
        title: 'Panchamrita Abhishekam',
        desc: 'Offer sequential holy bath with Cow Milk, Curd, Pure Ghee, Pure Honey, and Sugarcane juice/Sugar, washing with pure water in between each offering.',
        mantra: 'ఆప్యాయస్వ సమేతు తే విశ్వతః సోమ వృష్ణ్యమ్ | భవా వాజస్య సంగథే ||',
      },
      {
        step: 3,
        title: 'Bhasma & Vibhuti Abhishekam',
        desc: 'Gently sprinkle consecrated holy Vibhuti over the Lingam, followed by fragrant sandalwood paste and rose water (Panneru).',
        mantra: 'ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్ | ఉర్వారుకమివ బంధనాన్మృత్యోర్ముక్షీయ మాऽమృతాత్ ||',
      },
      {
        step: 4,
        title: 'Bilvarchana & 108 Shiva Namavali',
        desc: 'Perform archana with trifoliate Bilva leaves chanting Sri Shiva Ashtothra Sata Namavali. Offer lotus and white Arka flowers.',
        mantra: 'త్రిదళం త్రిగుణాకారం త్రినేత్రం చ త్రియాయుధమ్ | త్రిజన్మ పాపసంహారం ఏకబిల్వం శివార్పణమ్ ||',
      },
      {
        step: 5,
        title: 'Maha Harathi & Chamakam Recitation',
        desc: 'Wave five-wicked brass lamp (Pancha Harathi) and camphor flame while singing the sacred Shiva Thandava Stotram and concluding prayers.',
        mantra: 'కర్పూర గౌరం కరుణావతారం సంసారసారం భుజగేంద్రహారమ్ | సదావసంతం హృదయారవిందే భవం భవానీసహితం నమామి ||',
      },
    ],
    materials: [
      { name: 'Fresh Cow Milk (Pasupu Aavu Paalu)', qty: '500 ml', icon: 'Soup' },
      { name: 'Pure Curd & Ghee', qty: '100g each', icon: 'Layers' },
      { name: 'Pure Natural Honey & Sugarcane Juice', qty: '100 ml each', icon: 'Sparkles' },
      { name: 'Fresh Green Bilva Leaves (Maredu Dalamulu)', qty: '108 Leaves', icon: 'Flower2' },
      { name: 'Holy Bhasmam / Vibhuti', qty: '1 Pack', icon: 'Sparkles' },
      { name: 'Pure Sandalwood (Gandham) & Rose Water', qty: '50g', icon: 'Flower2' },
      { name: 'Fruits & Dry Coconut (Naivedyam)', qty: '5 Types', icon: 'Soup' },
      { name: 'Pure Camphor for Maha Harathi', qty: '1 Box', icon: 'Flame' },
    ],
    mantras: [
      {
        title: 'Maha Mrityunjaya Mantra',
        script: 'ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్ | ఉర్వారుకమివ బంధనాన్మృత్యోర్ముక్షీయ మాऽమృతాత్ ||',
        transliteration: 'Om Tryambakam Yajaamahe Sugandhim Pushtivardhanam | Urvaarukamiva Bandhanaan Mrityor Muksheeya Maamritaat ||',
        meaning: 'We worship the Three-Eyed Lord Shiva, who is fragrant and nourishes all beings. May He liberate us from death and suffering, as a ripe cucumber effortlessly separates from its vine.',
      },
      {
        title: 'Shiva Panchakshara Stotram',
        script: 'నాగేంద్రహారాయ త్రిలోచనాయ భస్మాంగరాగాయ మహేశ్వరాయ | నిత్యాయ శుద్ధాయ దిగంబరాయ తస్మై నకారాయ నమః శివాయ ||',
        transliteration: 'Naagendra Haaraaya Trilocanaaya Bhasmaanga Raagaaya Maheshvaraaya | Nityaaya Shuddhaaya Digambaraaya Tasmai Nakaaraaya Namah Shivaaya ||',
        meaning: 'Salutations to the letter "Na", Lord Shiva, adorned with serpent garlands, three-eyed, besmeared with holy ash.',
      },
    ],
    benefits: [
      'Alleviates chronic health conditions and brings vibrant vitality and mental clarity.',
      'Clears deep karmic blockages, fear of death, and negative energy.',
      'Bestows family harmony, prosperity, and liberation (Moksha).',
    ],
    audioTrack: {
      title: 'Sri Rudram & Maha Mrityunjaya Japa',
      duration: '18:45',
      ragam: 'Vedic Chanting',
    },
  },

  // --- SHIVA STOTRA ---
  'shiva-tandava': {
    id: 'shiva-tandava',
    deityId: 'shiva',
    deityName: 'Lord Shiva',
    deityTelugu: 'పరమశివుడు',
    category: 'stotras',
    title: 'Shiva Tandava Stotram',
    titleTelugu: 'శివ తాండవ స్తోత్రం',
    subtitle: 'The cosmic rhythmic hymn sung by Ravana celebrating Shiva’s ecstatic dance.',
    heroImage: '/images/pooja/card-banner-ayyappa-hd.png',
    badge: 'Powerful Stotram',
    badgeClass: 'badge-popular',
    duration: '12 mins',
    difficulty: 'Intermediate',
    bestTime: 'Pradosha or Evening Sandhya',
    overview: `Composed by the scholarly King Ravana in ecstasy, the Shiva Tandava Stotram depicts the awe-inspiring cosmic dance (Ananda Tandava) of Lord Shiva. Rhythmic and filled with alliteration, chanting it awakens high spiritual vibrations and absolute fearlessness.`,
    procedure: [
      { step: 1, title: 'Achamanam & Deepam', desc: 'Light a ghee lamp in front of Shiva Linga or Nataraja idol and sit in Padmasana facing North.' },
      { step: 2, title: 'Dhyana Sloka', desc: 'Meditate on the cosmic form of Lord Shiva holding the Damaru, Trident, and crescent moon in His matted locks.' },
      { step: 3, title: 'Chanting with Meter', desc: 'Recite all 15 verses in resonant rhythmic meter, focusing on the cadence and meaning of each verse.' },
      { step: 4, title: 'Karpura Harathi', desc: 'Conclude with a wave of camphor flame and prostrations seeking spiritual power and removal of ego.' },
    ],
    materials: [
      { name: 'Pure Ghee Lamp', qty: '1 Lamp', icon: 'Flame' },
      { name: 'Bilva Leaves & White Flowers', qty: '11 Pieces', icon: 'Flower2' },
      { name: 'Camphor for Harathi', qty: '1 Piece', icon: 'Flame' },
    ],
    mantras: [
      {
        title: 'Opening Verse',
        script: 'జటాటవీగలజ్జలప్రవాహపావితస్థలే గలేऽవలంబ్య లంబితాం భుజంగతుంగమాలికామ్ | డమడ్డమడ్డమడ్డమన్నినాదవడ్డమర్వయం చకార చండతాండవం తనోతు నః శివః శివమ్ ||',
        transliteration: 'Jataatavee Galajjala Pravaha Paavitasthale Galevalambya Lambitaam Bhujanga Tunga Maalikaam | Damad Damad Damad Damanni Naada Vaddamarvayam Chakaara Canda Taandavam Tanotu Nah Shivah Shivam ||',
        meaning: 'With His neck consecrated by the flow of water that trickles from His dense matted locks, wearing a mighty serpent garland, playing His Damaru with the sound "Damad Damad", Lord Shiva performed the fierce cosmic dance — may He shower auspiciousness upon us!',
      },
    ],
    benefits: [
      'Infuses boundless courage, physical vigor, and mental resilience.',
      'Clears speech defects and bestows mastery over oratory and concentration.',
      'Directly invokes the protective grace of Nataraja against negative influences.',
    ],
    audioTrack: {
      title: 'Shiva Tandava Stotram — Rhythmic Chants',
      duration: '09:30',
      ragam: 'Rhythmic Stotra',
    },
  },

  // --- GANESHA SUBCATEGORIES ---
  'ganapathi-pooja': {
    id: 'ganapathi-pooja',
    deityId: 'ganesha',
    deityName: 'Lord Ganesha',
    deityTelugu: 'శ్రీ మహాగణపతి',
    category: 'pooja',
    title: 'Ganapathi Pooja & Homam Vidhanam',
    titleTelugu: 'గణపతి పూజ & హోమ విధానం',
    subtitle: 'Foundational worship of Vigneshwara for removing all obstacles.',
    heroImage: '/images/pooja/card-banner-ganapathi-hd.png',
    badge: 'Auspicious Beginnings',
    badgeClass: 'badge-daily',
    duration: '25 mins',
    difficulty: 'Beginner Friendly',
    bestTime: 'Morning before starting any venture or Sankashti Chaturthi',
    overview: `Lord Ganesha is Prathama Vandya — worshiped first before any ritual, venture, or celebration. Ganapathi Pooja ensures smooth completion of endeavors, sharp intellect for students, and harmony in the home.`,
    procedure: [
      { step: 1, title: 'Deepa Prajwalana & Achamanam', desc: 'Light two oil lamps with cotton wicks and perform holy Achamanam.' },
      { step: 2, title: 'Pasupu Ganapathi Sthapana', desc: 'Make an idol of Ganesha using pure turmeric and water, place it on betel leaves.' },
      { step: 3, title: 'Durva (Garika) & Red Hibiscus Archana', desc: 'Offer 21 shoots of Durva grass and red flowers chanting Ganesha Namavali.' },
      { step: 4, title: 'Modaka Naivedyam', desc: 'Offer sweet jaggery modakas, laddus, bananas, and coconut.' },
      { step: 5, title: 'Mangala Harathi', desc: 'Wave glowing camphor lamp and seek blessings for hindrance-free life.' },
    ],
    materials: [
      { name: 'Pure Turmeric Powder (Pasupu)', qty: '50g', icon: 'Sparkles' },
      { name: 'Fresh Durva Grass (Garika)', qty: '21 Shoots', icon: 'Flower2' },
      { name: 'Red Hibiscus or Flowers', qty: '21 Flowers', icon: 'Flower2' },
      { name: 'Modakas or Laddus', qty: '5 or 21 Nos', icon: 'Soup' },
      { name: 'Betel Leaves & Supari', qty: '5 Leaves', icon: 'Layers' },
      { name: 'Coconuts', qty: '2 Coconuts', icon: 'Layers' },
    ],
    mantras: [
      {
        title: 'Prarthana Sloka',
        script: 'వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ | నిర్విఘ్నం కురు మే దేవ సర్వకార్యేషు సర్వదా ||',
        transliteration: 'Vakratunda Mahaakaaya Sooryakoti Samaprabha | Nirvighnam Kuru Me Deva Sarvakaaryeshu Sarvadaa ||',
        meaning: 'O Lord with the curved trunk and immense form, radiant as millions of suns, please make all my tasks obstacle-free forever.',
      },
    ],
    benefits: [
      'Removes all hurdles from business, education, marriage, and work.',
      'Grants sharp intellect, focus, and academic excellence to students.',
      'Brings joy, peace, and spiritual protection to the residence.',
    ],
    audioTrack: {
      title: 'Ganapathi Atharvashirsha & Namavali',
      duration: '08:20',
      ragam: 'Devotional Chants',
    },
  },

  // --- VENKATESWARA SUBCATEGORIES ---
  'satyanarayana-vratham': {
    id: 'satyanarayana-vratham',
    deityId: 'venkateswara',
    deityName: 'Lord Venkateswara / Vishnu',
    deityTelugu: 'శ్రీ వేంకటేశ్వర స్వామి',
    category: 'pooja',
    title: 'Sri Satyanarayana Swamy Vratham',
    titleTelugu: 'శ్రీ సత్యనారాయణ స్వామి వ్రత విధానం',
    subtitle: 'The timeless narrative vratham bringing abundant wealth, joy, and fulfillment.',
    heroImage: '/images/pooja/card-banner-ganapathi-hd.png',
    badge: 'Purnima & Auspicious Occasions',
    badgeClass: 'badge-popular',
    duration: '50 mins',
    difficulty: 'Family Ritual',
    bestTime: 'Full Moon Day (Purnima) or Any Auspicious Morning/Evening',
    overview: `Satyanarayana Swamy Vratham, detailed in the Reva Khanda of Skanda Purana, is the most universally performed family vrata. By worshiping Truth (Satya) in the form of Lord Narayana, families overcome adversity, achieve prosperity, and celebrate auspicious milestones.`,
    procedure: [
      { step: 1, title: 'Mandapa & Kalasha Sthapana', desc: 'Set up the wooden peetham, make rice pile with Navadhanyas, and place copper Kalash with mango leaves and coconut.' },
      { step: 2, title: 'Pancha Loka Palaka & Navagraha Pooja', desc: 'Invoke the guardian deities and nine planetary devatas seeking their favorable alignment.' },
      { step: 3, title: 'Satyanarayana Swamy Pooja', desc: 'Offer 16 upacharas to Lord Satyanarayana with fragrant tulasi, yellow flowers, and Panchamritams.' },
      { step: 4, title: 'Five Chapters (Katha) Recitation', desc: 'Listen to the 5 inspiring chapters demonstrating the power of unshakeable faith and honoring vows.' },
      { step: 5, title: 'Prasada Vitarana & Harathi', desc: 'Offer the sapadha prasadam (wheat rava, jaggery, ghee, milk, banana) and distribute to all gathered devotees.' },
    ],
    materials: [
      { name: 'Wheat Rava / Sooji', qty: '1 kg', icon: 'Soup' },
      { name: 'Pure Cow Ghee', qty: '500g', icon: 'Flame' },
      { name: 'Jaggery / Sugar & Ripe Bananas', qty: '1 kg Jaggery, 1 Dozen Bananas', icon: 'Soup' },
      { name: 'Fresh Thulasi Leaves & Flowers', qty: '2 Baskets', icon: 'Flower2' },
      { name: 'Copper or Brass Kalash', qty: '1 Set', icon: 'Layers' },
      { name: 'Mango Leaves & Betel Leaves', qty: '1 Bunch', icon: 'Layers' },
    ],
    mantras: [
      {
        title: 'Moola Mantra',
        script: 'ఓం నమో భగవతే సత్యనారాయణాయ స్వామినే నమః ||',
        transliteration: 'Om Namo Bhagavate Satyanarayanaya Swamine Namah ||',
        meaning: 'Salutations to the Supreme Lord Satyanarayana, embodiment of truth and cosmic protector.',
      },
    ],
    benefits: [
      'Brings immense peace, harmony, and joy into married life and household.',
      'Ensures success in newly initiated businesses, new home warming (Grihapravesham), and careers.',
      'Clears all sins and fulfills genuine heartfelt aspirations.',
    ],
    audioTrack: {
      title: 'Sri Satyanarayana Swamy Katha & Harathi',
      duration: '22:10',
      ragam: 'Devotional Narration',
    },
  },

  // --- DEVI / DURGA / LAKSHMI SUBCATEGORIES ---
  'lakshmi-pooja': {
    id: 'lakshmi-pooja',
    deityId: 'devi',
    deityName: 'Goddess Lakshmi / Devi',
    deityTelugu: 'శ్రీ దుర్గా / లక్ష్మీ దేవి',
    category: 'pooja',
    title: 'Sri Mahalakshmi Pooja Vidhanam',
    titleTelugu: 'శ్రీ మహాలక్ష్మీ పూజా విధానం',
    subtitle: 'Sacred worship for eternal prosperity, abundance, auspiciousness, and spiritual light.',
    heroImage: '/images/pooja/card-banner-lakshmi-hd.png',
    badge: 'Varalakshmi & Friday Special',
    badgeClass: 'badge-popular',
    duration: '30 mins',
    difficulty: 'All Devotees',
    bestTime: 'Friday Mornings / Evenings or Diwali / Varalakshmi Vratham',
    overview: `Goddess Mahalakshmi is the divine source of wealth, virtue, nourishment, and grace. Performing Mahalakshmi Pooja with devotion, lighting cow-ghee deepams, and offering lotus blossoms invites radiant prosperity (Ashtalakshmi blessings) into every corner of the dwelling.`,
    procedure: [
      { step: 1, title: 'Deeparadhana & Rangoli', desc: 'Draw a lotus rangoli with rice flour at the entrance and altar, light twin brass lamps filled with cow ghee.' },
      { step: 2, title: 'Kalasha Sthapana & Goddess Invocation', desc: 'Decorate Goddess Lakshmi with auspicious turmeric, red kumkum, gold ornaments, and silk saree.' },
      { step: 3, title: 'Sri Suktam Recitation', desc: 'Chant the ancient Vedic Sri Suktam invoking the golden-hued, lotus-seated Mother of the universe.' },
      { step: 4, title: 'Ashtothra Archana with Lotus Petals', desc: 'Chant Sri Lakshmi Ashtothram showering fragrant pink lotus petals or coins.' },
      { step: 5, title: 'Ksheerannam Naivedyam & Harathi', desc: 'Offer sweet milk kheer, fruits, and panakam, waving a luminous camphor deepam.' },
    ],
    materials: [
      { name: 'Cow Ghee for Lamps', qty: '250 ml', icon: 'Flame' },
      { name: 'Fresh Pink Lotuses & Jasmine', qty: '8 Lotuses, 1 Garland', icon: 'Flower2' },
      { name: 'Kumkum, Pasupu & Haldi Sticks', qty: '100g', icon: 'Sparkles' },
      { name: 'Milk Kheer (Paramannam)', qty: '1 Bowl', icon: 'Soup' },
      { name: 'Coins for Kanakadhara Archana', qty: '9 or 108 Coins', icon: 'Sparkles' },
    ],
    mantras: [
      {
        title: 'Maha Lakshmi Gayathri',
        script: 'ఓం మహాలక్ష్మ్యై చ విద్మహే విష్ణుపత్న్యై చ ధీమహి | తన్నో లక్ష్మీః ప్రచోదయాత్ ||',
        transliteration: 'Om Mahalakshmyai Cha Vidmahe Vishnupatnyai Cha Dheemahi | Tanno Lakshmih Prachodayaat ||',
        meaning: 'May we know the great Goddess Mahalakshmi, consort of Vishnu; we meditate upon Her divine glory. May Lakshmi illuminate our minds.',
      },
    ],
    benefits: [
      'Eliminates debts, poverty (Daridrya Nivaran), and financial anxieties.',
      'Blesses families with longevity, healthy offspring, and cordial relationships.',
      'Elevates home atmosphere with purity, elegance, and divine positivity.',
    ],
    audioTrack: {
      title: 'Sri Suktam & Kanakadhara Stotram',
      duration: '14:20',
      ragam: 'Vedic Melodic Chants',
    },
  },

  'morning-prayers': {
    id: 'morning-prayers',
    deityId: 'all',
    deityName: 'All Deities',
    deityTelugu: 'సకల దేవతలు',
    category: 'slokas',
    title: 'Morning Prayers',
    titleTelugu: 'ప్రాతఃకాల ప్రార్థనలు',
    subtitle: 'Sacred morning verses, Karadarshanam & Bhumi Vandanam chanted upon awakening.',
    heroImage: '/images/subcategories/slokas/morning-prayers.webp',
    badge: 'Daily Essential',
    badgeClass: 'badge-daily',
    duration: '10 mins',
    difficulty: 'All Devotees',
    bestTime: 'Immediately upon awakening (Brahma Muhurtham)',
    overview: `Pratah Smaranam slokas invoked immediately upon waking up set a positive, pure, and spiritually vibrant foundation for the entire day. Chanting Karadarshanam and Bhumi Prarthana aligns the mind with cosmic divinity.`,
    procedure: [
      { step: 1, title: 'Karadarshanam', desc: 'Look at the palms of your hands upon waking and invoke Lakshmi, Saraswati and Gouri.', mantra: 'కరాగ్రే వసతే లక్ష్మీః కరమధ్యే సరస్వతీ | కరమూలే స్థితా గౌరీ ప్రభాతే కరదర్శనమ్ ||' },
      { step: 2, title: 'Bhumi Vandanam', desc: 'Touch the mother earth seeking forgiveness before placing feet on the ground.', mantra: 'సముద్రవసనే దేవి పర్వతస్తనమండలే | విష్ణుపత్ని నమస్తుభ్యం పాదస్పర్శం క్షమస్వ మే ||' },
      { step: 3, title: 'Pratah Smaranam', desc: 'Remember Lord Ganesha, Shiva, Vishnu and Ayyappa for auspicious guidance.', mantra: 'ప్రాఃతస్మరామి భవభీతిహరం సురేశం | వందారులోకసులభం కరుణాకటాక్షం ||' }
    ],
    materials: [
      { name: 'Pure Water for Achamanam', qty: '1 Vessel', icon: 'Flame' },
      { name: 'Vibhuti / Kumkum / Chandanam', qty: 'For Tilakam', icon: 'Sparkles' }
    ],
    mantras: [
      {
        title: 'Karadarshana Sloka',
        script: 'కరాగ్రే వసతే లక్ష్మీః కరమధ్యే సరస్వతీ | కరమూలే స్థితా గౌరీ ప్రభాతే కరదర్శనమ్ ||',
        transliteration: 'Karagre Vasate Lakshmih Kara-Madhye Saraswati | Kara-Moole Sthita Gouri Prabhate Kara-Darshanam ||',
        meaning: 'At the tips of the fingers resides Goddess Lakshmi; in the middle resides Goddess Saraswati; at the base resides Goddess Gouri. Thus, look at your palms in the morning.'
      }
    ],
    benefits: [
      'Removes laziness, dullness and negative morning thoughts.',
      'Blesses with wisdom, prosperity and divine protection throughout the day.'
    ]
  },

  'meal-prayers': {
    id: 'meal-prayers',
    deityId: 'all',
    deityName: 'All Deities',
    deityTelugu: 'సకల దేవతలు',
    category: 'slokas',
    title: 'Meal Prayers',
    titleTelugu: 'భోజన ప్రార్థనలు',
    subtitle: 'Sacred verses and gratitude prayers recited before taking sanctified food (Prasadam).',
    heroImage: '/images/subcategories/slokas/meal-prayers.webp',
    badge: 'Annadanam & Daily',
    badgeClass: 'badge-daily',
    duration: '5 mins',
    difficulty: 'All Devotees',
    bestTime: 'Before lunch and dinner',
    overview: `Sanctifying food before eating transforms physical sustenance into sacred medicine and divine energy. Chanting Annapoorna Stotram and Brahmarpanam invokes Goddess Annapoorna and offers the meal to the indwelling Lord.`,
    procedure: [
      { step: 1, title: 'Shuddhi & Achamanam', desc: 'Cleanse hands, sit calmly facing East or North with the meal served.' },
      { step: 2, title: 'Annapoorna Vandanam', desc: 'Chant Annapoorna Stotram with gratitude to the provider of food.', mantra: 'అన్నపూర్ణే సదాపూర్ణే శంకరప్రాణవల్లభే | జ్ఞానవైరాగ్యసిద్ధ్యర్థం భిక్షాం దేహి చ పార్వతి ||' },
      { step: 3, title: 'Brahmarpanam Recitation', desc: 'Offer food to Brahman as described in the sacred Bhagavad Gita.', mantra: 'బ్రహ్మార్పణం బ్రహ్మ హవిర్ బ్రహ్మాగ్నౌ బ్రహ్మణా హుతమ్ | బ్రహ్మైవ తేన గంతవ్యం బ్రహ్మకర్మసమాధినా ||' }
    ],
    materials: [
      { name: 'Pure Water', qty: '1 Tumbler', icon: 'Flame' },
      { name: 'Sanctified Vegetarian Food', qty: 'Meal Plate', icon: 'Soup' }
    ],
    mantras: [
      {
        title: 'Brahmarpanam Mantra (Gita 4.24)',
        script: 'బ్రహ్మార్పణం బ్రహ్మ హవిర్ బ్రహ్మాగ్నౌ బ్రహ్మణా హుతమ్ | బ్రహ్మైవ తేన గంతవ్యం బ్రహ్మకర్మసమాధినా ||',
        transliteration: 'Brahmaarpanam Brahma Havir Brahmaagnau Brahmanaahutam | Brahmaiva Tena Gantavyam Brahma Karma Samaadhinaa ||',
        meaning: 'The offering is Brahman; the clarified butter is Brahman; offered by Brahman into the fire of Brahman. Brahman alone shall be reached by him who is absorbed in Brahman as the act.'
      }
    ],
    benefits: [
      'Eliminates impurities in food and enhances digestion.',
      'Instills contentment, humility, and gratitude for daily sustenance.'
    ]
  },

  'night-prayers': {
    id: 'night-prayers',
    deityId: 'all',
    deityName: 'All Deities',
    deityTelugu: 'సకల దేవతలు',
    category: 'slokas',
    title: 'Night Prayers',
    titleTelugu: 'రాత్రి ప్రార్థనలు',
    subtitle: 'Protective bedside verses and peace chants for peaceful sleep and protection from bad dreams.',
    heroImage: '/images/subcategories/slokas/night-prayers.webp',
    badge: 'Night Essential',
    badgeClass: 'badge-daily',
    duration: '5 mins',
    difficulty: 'All Devotees',
    bestTime: 'Bedtime before sleeping',
    overview: `Night prayers purify subconscious thoughts, surrender all actions performed throughout the day to God, and protect the soul with divine guardianship during restful sleep.`,
    procedure: [
      { step: 1, title: 'Smaranam & Surrender', desc: 'Sit quietly on the bed, breathe deeply and surrender all daily actions.', mantra: 'కరచరణకృతం వా కాయజం కర్మజం వా శ్రవణనయనజం వా మానసం వాऽపరాధం | విహితమవిహితం వా సర్వమేతత్ క్షమస్వ జయ జయ కరుణాబ్ధే శ్రీమహాదేవ శంభో ||' },
      { step: 2, title: 'Du-swapna Nashana Mantra', desc: 'Remember Rama, Skanda, Hanuman and Garuda for peaceful sleep free of nightmares.', mantra: 'రామస్కందం హనూమంతం వైనతేయం వృకోదరమ్ | శయనే యః స్మరేన్నిత్యం దుఃస్వప్నం తస్య నశ్యతి ||' }
    ],
    materials: [
      { name: 'Clean Peaceful Bedding', qty: 'Bedside space', icon: 'Sparkles' }
    ],
    mantras: [
      {
        title: 'Peaceful Sleep Mantra',
        script: 'రామస్కందం హనూమంతం వైనతేయం వృకోదరమ్ | శయనే యః స్మరేన్నిత్యం దుఃస్వప్నం తస్య నశ్యతి ||',
        transliteration: 'Rama-Skandam Hanumantam Vainateyam Vrikodaram | Shayane Yah Smaren-Nityam Duh-Swapnam Tasya Nashyati ||',
        meaning: 'Whoever remembers Rama, Skanda, Hanuman, Garuda, and Bhima before sleep shall have all bad dreams destroyed and enjoy peaceful rest.'
      }
    ],
    benefits: [
      'Grants peaceful, undisturbed and rejuvenating sleep.',
      'Wipes away stress, negative thoughts and nighttime anxieties.'
    ]
  },
};

export default function SubcategoryDetailPage({ defaultCategory = 'pooja' }) {
  const { currentLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract ID and God from URL query
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const subcategoryId = searchParams.get('id') || 'ayyappa-pooja';
  const godParam = searchParams.get('god');

  // Load subcategory fallback data from catalog or generate clean dynamic structure
  const fallbackData = useMemo(() => {
    if (SUBCATEGORY_DETAILS[subcategoryId]) {
      return SUBCATEGORY_DETAILS[subcategoryId];
    }

    // Dynamic fallback for any DB-driven subcategory
    const formattedTitle = subcategoryId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const isAyyappa = /ayyap|sastha|harivarasanam|shabarimala|irumudi|sharanu/.test(subcategoryId.toLowerCase());
    const isShiva = /shiv|linga|rudra|bilva|mrityunjaya/.test(subcategoryId.toLowerCase());
    const isGanesh = /ganesh|vinayak|ganapath/.test(subcategoryId.toLowerCase());
    const isMurugan = /subrahmanya|murugan|kartikeya/.test(subcategoryId.toLowerCase());
    const isDevi = /devi|durga|lakshmi|gomatha/.test(subcategoryId.toLowerCase());
    const isVishnu = /vishnu|venkates|koodalmanikya/.test(subcategoryId.toLowerCase());

    const dName = isAyyappa ? 'Lord Ayyappa' : isShiva ? 'Lord Shiva' : isGanesh ? 'Lord Ganesha' : isMurugan ? 'Lord Murugan' : isDevi ? 'Goddess Lakshmi / Durga' : isVishnu ? 'Lord Venkateswara' : 'Lord Shiva & All Deities';
    const dTelugu = isAyyappa ? 'శ్రీ అయ్యప్ప స్వామి' : isShiva ? 'పరమశివుడు' : isGanesh ? 'శ్రీ మహాగణపతి' : isMurugan ? 'శ్రీ సుబ్రహ్మణ్యేశ్వర స్వామి' : isDevi ? 'శ్రీ దేవి అమ్మవారు' : isVishnu ? 'శ్రీ వేంకటేశ్వర స్వామి' : 'సర్వ దేవతలు';

    return {
      id: subcategoryId,
      deityId: godParam || (isAyyappa ? 'ayyappa' : isShiva ? 'shiva' : isGanesh ? 'ganesha' : isMurugan ? 'murugan' : isDevi ? 'devi' : isVishnu ? 'venkateswara' : 'all'),
      deityName: dName,
      deityTelugu: dTelugu,
      category: 'pooja',
      title: formattedTitle,
      titleTelugu: formattedTitle,
      subtitle: `Sacred vidhanam, procedure and verses for ${formattedTitle}.`,
      heroImage: '/images/pooja/pooja-card-1-ref.png',
      badge: 'Daily Devotion',
      badgeClass: 'badge-daily',
      duration: '15 mins',
      difficulty: 'All Devotees',
      bestTime: 'Morning (Pratah Kalam) or Evening (Sandhya)',
      overview: `${formattedTitle} brings peace of mind, removes obstacles, and bestows divine blessings and protective spiritual vibrations upon devotees and their families.`,
      procedure: [
        { step: 1, title: 'Prarthana & Invocation', desc: 'Light a deepam, sit facing East with a calm and pure mind, and offer prostrations.', mantra: 'ఓం దీపజ్యోతిః పరబ్రహ్మ దీపజ్యోతిర్జనార్దనః | దీపో హరతు మే పాపం సంధ్యాదీప నమోస్తుతే ||' },
        { step: 2, title: 'Sacred Sloka Chanting', desc: 'Chant the holy verses with heartfelt devotion and clear pronunciation.', mantra: 'శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజం | ప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే ||' },
        { step: 3, title: 'Samarpanam & Blessings', desc: 'Surrender all fruits of the prayer to the deity and receive divine peace and blessings.', mantra: 'స్వామియే శరణం అయ్యప్ప | శ్రీ గురుభ్యో నమః' }
      ],
      materials: [
        { name: 'Pure Cow Ghee / Sesame Oil for Deepam', qty: '100 ml', icon: 'Flame' },
        { name: 'Fresh Cotton Wicks (Vattulu)', qty: '1 Packet', icon: 'Sparkles' },
        { name: 'Pure Vibhuti, Kumkum & Sandalwood (Gandham)', qty: '50g each', icon: 'Flower2' },
        { name: 'Fresh Fragrant Flowers & Thulasi / Bilva Leaves', qty: '1 Basket', icon: 'Flower2' },
        { name: 'Raw Coconuts & Betel Leaves with Supari', qty: '2 Coconuts, 5 Betel Leaves', icon: 'Layers' },
        { name: 'Raw Rice with Turmeric (Akshintalu)', qty: '1 Bowl', icon: 'Sparkles' },
        { name: 'Fresh Fruits or Naivedyam Prasad', qty: '1 Bowl', icon: 'Soup' },
        { name: 'Pure Camphor (Karpooram) & Dhoop Sticks', qty: '1 Box', icon: 'Flame' }
      ],
      mantras: [
        {
          title: `${formattedTitle} Sacred Chants`,
          script: 'స్వామియే శరణం అయ్యప్ప | శ్రీ గురుభ్యో నమః',
          transliteration: 'Swamiye Saranam Ayyappa | Sri Gurubhyo Namah',
          meaning: 'I surrender completely to the divine Lord, the protector and guide.'
        }
      ],
      benefits: [
        'Destroys mental restlessness and brings calmness and spiritual focus.',
        'Bestows divine protection, good health, and family prosperity.',
        'Removes obstacles and paves the path for peace and fulfillment.'
      ],
      audioTrack: {
        title: `${formattedTitle} Sacred Chants`,
        duration: '05:30',
        ragam: 'Madhyamavathi'
      }
    };
  }, [subcategoryId, godParam]);

  // Dynamically fetch detail from DB via API
  const [apiDetail, setApiDetail] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchApiDetail = async () => {
      try {
        // 1. Primary: Subcategory detail endpoint
        let res = await fetch(`${API_BASE_URL}/categories/subcategories/${encodeURIComponent(subcategoryId)}?lang=${currentLanguage}&god=${encodeURIComponent(godParam || '')}`);
        let json = await res.json().catch(() => null);

        // 2. Fallback: Stotras detail endpoint
        if (!json || !json.success || !json.data) {
          res = await fetch(`${API_BASE_URL}/categories/stotras/${encodeURIComponent(subcategoryId)}?lang=${currentLanguage}`);
          json = await res.json().catch(() => null);
        }

        // 3. Fallback: Generic category detail endpoint
        if (!json || (!json.data && !json.contents && !json.title)) {
          res = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(subcategoryId)}?lang=${currentLanguage}`);
          json = await res.json().catch(() => null);
        }

        if (!isCancelled && json && (json.data || json.contents || json.title)) {
          const d = json.data || json;
          setApiDetail(d);
        }
      } catch (err) {
        console.warn('API fetch error for subcategory detail:', err);
      }
    };
    fetchApiDetail();
    return () => { isCancelled = true; };
  }, [subcategoryId, currentLanguage, godParam]);

  // Combine DB data with UI defaults
  const data = useMemo(() => {
    if (!apiDetail) return fallbackData;

    const formattedMantras = [];

    // Case A: API returns structured mantras array
    if (Array.isArray(apiDetail.mantras) && apiDetail.mantras.length > 0) {
      formattedMantras.push(...apiDetail.mantras);
    }
    // Case B: API returns sacredText string
    else if (apiDetail.sacredText) {
      const verses = apiDetail.sacredText.split(/\n\s*\n/).filter(Boolean);
      const meanings = (apiDetail.meaning || '').split(/\n\s*\n/).filter(Boolean);
      verses.forEach((v, idx) => {
        formattedMantras.push({
          title: `Verse / శ్లోకం #${idx + 1}`,
          script: v,
          transliteration: '',
          meaning: meanings[idx] || apiDetail.meaning || 'Devotional verse.'
        });
      });
    }
    // Case C: API returns contents array from DB
    else if (Array.isArray(apiDetail.contents) && apiDetail.contents.length > 0) {
      apiDetail.contents.forEach((item, idx) => {
        if (item.sacredText) {
          formattedMantras.push({
            title: item.title || `Verse #${idx + 1}`,
            script: item.sacredText,
            transliteration: '',
            meaning: item.meaning || 'Sacred verse from scriptures.'
          });
        }
      });
    }

    const procedureSteps = (Array.isArray(apiDetail.procedure) && apiDetail.procedure.length > 0)
      ? apiDetail.procedure
      : fallbackData.procedure;

    const materialsList = (Array.isArray(apiDetail.materials) && apiDetail.materials.length > 0)
      ? apiDetail.materials
      : fallbackData.materials;

    const benefitsList = (Array.isArray(apiDetail.benefits) && apiDetail.benefits.length > 0)
      ? apiDetail.benefits
      : fallbackData.benefits;

    const scriptureText =
      apiDetail.fullScriptureText ||
      apiDetail.sacredText ||
      DEFAULT_SCRIPTURES[subcategoryId] ||
      DEFAULT_SCRIPTURES[fallbackData.id] ||
      DEFAULT_SCRIPTURES['daily-pooja'] ||
      DEFAULT_SCRIPTURES['nithyapooja'] ||
      apiDetail.description ||
      fallbackData.overview;

    return {
      ...fallbackData,
      title: apiDetail.title || fallbackData.title,
      titleTelugu: apiDetail.titleTelugu || apiDetail.title || fallbackData.titleTelugu,
      subtitle: apiDetail.subtitle || apiDetail.description || fallbackData.subtitle,
      overview: apiDetail.overview || apiDetail.introduction || apiDetail.description || fallbackData.overview,
      fullScriptureText: scriptureText,
      instructionNote: apiDetail.instructionNote || '',
      heroImage: apiDetail.heroImage || apiDetail.imageUrl || fallbackData.heroImage,
      deityName: apiDetail.deityName || fallbackData.deityName,
      deityTelugu: apiDetail.deityTelugu || fallbackData.deityTelugu,
      duration: apiDetail.duration || fallbackData.duration,
      badge: apiDetail.badge || fallbackData.badge,
      badgeClass: apiDetail.badgeClass || fallbackData.badgeClass,
      procedure: procedureSteps,
      materials: materialsList,
      mantras: formattedMantras.length > 0 ? formattedMantras : fallbackData.mantras,
      benefits: benefitsList
    };
  }, [fallbackData, apiDetail, subcategoryId]);

  const [selectedChild, setSelectedChild] = useState(null);
  const [fontSize, setFontSize] = useState(17);
  const [showSamagri, setShowSamagri] = useState(false);

  // Check if this subcategory has child types (e.g. Mahaganapathi 4 types, Sri Subrahmanyeswara 4 types)
  const resolvedChildren = useMemo(() => {
    if (Array.isArray(apiDetail?.children) && apiDetail.children.length > 0) {
      return apiDetail.children;
    }
    const matchKey = (subcategoryId || fallbackData.id || '').toLowerCase();
    if (DEFAULT_CHILDREN[matchKey]) {
      return DEFAULT_CHILDREN[matchKey];
    }
    if (
      matchKey.includes('subramanya') ||
      matchKey.includes('subrahmanya') ||
      matchKey.includes('murugan') ||
      matchKey.includes('kartikeya') ||
      matchKey === '7'
    ) {
      return DEFAULT_CHILDREN['sri-subramanya-ashtottara'];
    }
    if (
      matchKey.includes('ganapa') ||
      matchKey.includes('vignesh') ||
      matchKey.includes('mahaganapati') ||
      matchKey === '6'
    ) {
      return DEFAULT_CHILDREN['ganapathi-pooja'];
    }
    return [];
  }, [apiDetail, subcategoryId, fallbackData.id]);

  // Active scripture text (from selected child or main subcategory)
  const activeScriptureText = useMemo(() => {
    if (selectedChild) {
      return (
        DEFAULT_SCRIPTURES[selectedChild.slug] ||
        DEFAULT_SCRIPTURES[selectedChild.id] ||
        selectedChild.description ||
        selectedChild.sacredText ||
        data.fullScriptureText
      );
    }
    return data.fullScriptureText;
  }, [selectedChild, data.fullScriptureText]);

  const parsedScripture = useMemo(() => {
    return parseScriptureContent(activeScriptureText);
  }, [activeScriptureText]);

  // ── VIEW 1: 4-TYPES SUBCATEGORY LIST VIEW (EXACT MATCH TO REFERENCE IMAGE 1) ──
  if (resolvedChildren.length > 0 && !selectedChild) {
    return (
      <div className="sa-types-list-page">
        {/* Saffron Sticky Top Bar */}
        <div className="sa-scripture-top-bar">
          <button
            type="button"
            className="scripture-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Back to Categories"
            title="Back"
          >
            <Icon name="ArrowLeft" size={24} />
          </button>
          <h1 className="scripture-top-title">
            {currentLanguage === 'te' ? data.titleTelugu : data.title}
          </h1>
        </div>

        {/* 4 Types Vertical List matching Reference Screenshot */}
        <div className="sa-types-list-wrap">
          <div className="sa-types-list-container">
            {resolvedChildren.map((item, idx) => (
              <div
                key={item.id || idx}
                className="sa-type-item-row"
                onClick={() => setSelectedChild(item)}
              >
                <div className="sa-type-avatar-wrap">
                  <img
                    src={item.imageUrl || '/images/deities/card_ganesha.jpg'}
                    alt={item.title}
                    className="sa-type-avatar-img"
                  />
                </div>
                <span className="sa-type-title">{item.title}</span>
                <Icon name="ChevronRight" size={18} className="sa-type-chevron" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 2: SACRED SCRIPTURE PARCHMENT READER (EXACT MATCH TO REFERENCE IMAGE 2) ──
  return (
    <div className="sa-subcat-detail-page sa-scripture-view-mode">
      {/* 1. Saffron Sticky Top Bar */}
      <div className="sa-scripture-top-bar">
        <button
          type="button"
          className="scripture-back-btn"
          onClick={() => {
            if (selectedChild) {
              setSelectedChild(null);
            } else {
              navigate(-1);
            }
          }}
          aria-label="Back"
          title="Back"
        >
          <Icon name="ArrowLeft" size={24} />
        </button>

        <h1 className="scripture-top-title">
          {selectedChild ? selectedChild.title : (currentLanguage === 'te' ? data.titleTelugu : data.title)}
        </h1>

        <div className="scripture-top-actions">
          <button
            type="button"
            className="scripture-font-btn"
            onClick={() => setFontSize((s) => Math.max(14, s - 1))}
            title="Decrease font size"
            aria-label="Decrease font size"
          >
            A-
          </button>
          <button
            type="button"
            className="scripture-font-btn"
            onClick={() => setFontSize((s) => Math.min(26, s + 1))}
            title="Increase font size"
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>
      </div>

      {/* 2. Scripture Parchment Sheet */}
      <div className="sa-scripture-reader-wrap">
        <article className="sa-scripture-parchment-sheet">
          {/* Temple Crown Arch Ornament */}
          <div className="scripture-crown-ornament" aria-hidden="true">
            <svg
              className="scripture-crown-svg"
              viewBox="0 0 160 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M80 2C70 14 55 18 35 18C15 18 0 28 0 28H160C160 28 145 18 125 18C105 18 90 14 80 2Z"
                fill="#f59e0b"
                opacity="0.3"
              />
              <path
                d="M80 6L84 16H94L86 22L89 32L80 26L71 32L74 22L66 16H76L80 6Z"
                fill="#d97706"
              />
              <circle cx="80" cy="4" r="3" fill="#b45309" />
              <circle cx="40" cy="24" r="2.5" fill="#f59e0b" />
              <circle cx="120" cy="24" r="2.5" fill="#f59e0b" />
            </svg>
          </div>

          {/* Title Header inside Sheet */}
          <h2
            className="scripture-sec-heading"
            style={{
              fontSize: `${fontSize + 3}px`,
              color: '#8b0000',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            {selectedChild ? selectedChild.title : (currentLanguage === 'te' ? data.titleTelugu : data.title)}
          </h2>

          {/* Introductory Instruction Box (సూచన) */}
          {parsedScripture.instruction && (
            <div className="scripture-instruction-box" style={{ fontSize: `${fontSize - 1.5}px` }}>
              <p>{parsedScripture.instruction}</p>
            </div>
          )}

          {/* Central Invocations */}
          {parsedScripture.invocations.length > 0 && (
            <div className="scripture-invocations-box">
              {parsedScripture.invocations.map((inv, idx) => (
                <div
                  key={idx}
                  className="scripture-invocation-line"
                  style={{ fontSize: `${fontSize + 1.5}px` }}
                >
                  {inv}
                </div>
              ))}
            </div>
          )}

          {/* Sequential Slokas, Section Headings & Dotted Dividers */}
          <div className="scripture-content-flow">
            {parsedScripture.sections.map((sec, idx) => {
              if (sec.type === 'heading') {
                return (
                  <React.Fragment key={idx}>
                    <div className="scripture-dotted-sep" aria-hidden="true">
                      ··················································
                    </div>
                    <h2
                      className="scripture-sec-heading"
                      style={{ fontSize: `${fontSize + 0.5}px` }}
                    >
                      {sec.text}
                    </h2>
                  </React.Fragment>
                );
              }
              return (
                <p
                  key={idx}
                  className="scripture-sloka-paragraph"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {sec.text}
                </p>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="sa-scripture-bottom-tabs">
            {data.materials && data.materials.length > 0 && (
              <button
                type="button"
                className={`bottom-tab-pill ${showSamagri ? 'active' : ''}`}
                onClick={() => setShowSamagri(!showSamagri)}
              >
                <Icon name="Layers" size={16} />
                <span>{showSamagri ? 'Hide Samagri Checklist' : 'View Pooja Samagri Checklist'}</span>
              </button>
            )}

            <button
              type="button"
              className="bottom-tab-pill"
              onClick={() => {
                if (selectedChild) {
                  setSelectedChild(null);
                } else {
                  navigate(-1);
                }
              }}
            >
              <Icon name="ArrowLeft" size={16} />
              <span>{selectedChild ? 'Back to Pooja List' : 'Back to Subcategories'}</span>
            </button>
          </div>

          {/* Expandable Samagri Drawer */}
          {showSamagri && data.materials && (
            <div className="scripture-samagri-drawer" style={{ marginTop: '24px' }}>
              <h3 className="pane-heading" style={{ textAlign: 'center', marginBottom: '16px' }}>
                Required Sacred Pooja Samagri Checklist
              </h3>
              <div className="samagri-grid">
                {data.materials.map((item, idx) => (
                  <div key={idx} className="samagri-item-card">
                    <div className="samagri-icon-circle">
                      <Icon name={item.icon || 'CheckCircle2'} size={18} />
                    </div>
                    <div className="samagri-info">
                      <span className="samagri-name">{item.name}</span>
                      <span className="samagri-qty">
                        Quantity: <strong>{item.qty}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
