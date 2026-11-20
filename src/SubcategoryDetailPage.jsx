import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { useLanguage } from './LanguageContext';
import './devotionalCleanList.css';
import './subcategoryDetail.css';

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
};

export default function SubcategoryDetailPage({ defaultCategory = 'pooja' }) {
  const { currentLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract ID and God from URL query
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const subcategoryId = searchParams.get('id') || 'ayyappa-pooja';
  const godParam = searchParams.get('god');

  // Load subcategory data from catalog or find best match
  const data = useMemo(() => {
    if (SUBCATEGORY_DETAILS[subcategoryId]) {
      return SUBCATEGORY_DETAILS[subcategoryId];
    }
    // Match by deity
    if (godParam) {
      const match = Object.values(SUBCATEGORY_DETAILS).find((item) => item.deityId === godParam);
      if (match) return match;
    }
    return SUBCATEGORY_DETAILS['ayyappa-pooja'];
  }, [subcategoryId, godParam]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedMantra, setCopiedMantra] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check bookmark status
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('sa-fav-subcategories') || '[]');
      setIsBookmarked(favs.includes(data.id));
    } catch {}
  }, [data.id]);

  const toggleBookmark = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('sa-fav-subcategories') || '[]');
      let updated;
      if (favs.includes(data.id)) {
        updated = favs.filter((id) => id !== data.id);
        setIsBookmarked(false);
      } else {
        updated = [...favs, data.id];
        setIsBookmarked(true);
      }
      localStorage.setItem('sa-fav-subcategories', JSON.stringify(updated));
    } catch {}
  };

  const copyMantraText = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMantra(true);
      setTimeout(() => setCopiedMantra(false), 2200);
    }
  };

  return (
    <div className="sa-subcat-detail-page">
      {/* Background Watermark */}
      <div className="sa-subcat-watermark" aria-hidden="true">
        <img src="/images/ayyappa-tiger-gold-bg.png" alt="" />
      </div>

      <div className="sa-subcat-container">
        {/* Navigation Breadcrumb */}
        <nav className="sa-subcat-nav">
          <Link to="/home">HOME</Link>
          <span className="sep">/</span>
          <Link to="/categories">DEVOTIONAL SERVICES</Link>
          <span className="sep">/</span>
          <Link to={`/subcategories?category=${data.category}&god=${data.deityId}`}>
            {data.deityName.toUpperCase()}
          </Link>
          <span className="sep">/</span>
          <span className="curr">{data.title.toUpperCase()}</span>
        </nav>

        {/* Hero Banner Header */}
        <header className="sa-subcat-hero">
          <div className="sa-subcat-hero-left">
            <div className="sa-subcat-badge-row">
              <span className={`sa-subcat-pill ${data.badgeClass || 'badge-festival'}`}>
                {data.badge}
              </span>
              <span className="sa-subcat-pill-deity">
                <Icon name="Sparkles" size={13} />
                <span>{currentLanguage === 'te' ? data.deityTelugu : data.deityName}</span>
              </span>
            </div>

            <h1 className="sa-subcat-title">{currentLanguage === 'te' ? data.titleTelugu : data.title}</h1>
            <p className="sa-subcat-subtitle">{data.subtitle}</p>

            <div className="sa-subcat-meta-strip">
              <div className="meta-item">
                <Icon name="Clock" size={15} />
                <span>Duration: <strong>{data.duration}</strong></span>
              </div>
              <div className="meta-item">
                <Icon name="Users" size={15} />
                <span>Audience: <strong>{data.difficulty}</strong></span>
              </div>
              <div className="meta-item">
                <Icon name="Calendar" size={15} />
                <span>Auspicious Timings: <strong>{data.bestTime}</strong></span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="sa-subcat-actions">
              <button
                type="button"
                className={`sa-btn-fav ${isBookmarked ? 'active' : ''}`}
                onClick={toggleBookmark}
              >
                <Icon name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Guide'}</span>
              </button>

              <button
                type="button"
                className="sa-btn-print"
                onClick={() => window.print()}
              >
                <Icon name="Printer" size={16} />
                <span>Print Guide</span>
              </button>
            </div>
          </div>

          <div className="sa-subcat-hero-right">
            <div className="hero-img-card">
              <img src={data.heroImage} alt={data.title} />
              <div className="hero-img-tag">Sacred Vidhanam Reference</div>
            </div>
          </div>
        </header>

        {/* Devotional Audio Chants Player Bar */}
        {data.audioTrack && (
          <div className="sa-subcat-audio-bar">
            <div className="audio-left">
              <button
                type="button"
                className="audio-play-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause Chants' : 'Play Chants'}
              >
                <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
              </button>
              <div className="audio-info">
                <span className="audio-title">{data.audioTrack.title}</span>
                <span className="audio-sub">Ragam: {data.audioTrack.ragam} • Duration: {data.audioTrack.duration}</span>
              </div>
            </div>

            <div className="audio-right">
              <span className="audio-status">{isPlaying ? 'Streaming Devotional Audio...' : 'Click to Listen Chants'}</span>
              <Icon name="Volume2" size={18} className="audio-vol-icon" />
            </div>
          </div>
        )}

        {/* Main Content Layout with Interactive Tabs */}
        <div className="sa-subcat-tabs-row">
          {[
            { id: 'overview', label: 'Overview', icon: 'BookOpen' },
            { id: 'procedure', label: 'Step-by-Step Vidhanam', icon: 'ListOrdered' },
            { id: 'materials', label: 'Sacred Materials (Samagri)', icon: 'Layers' },
            { id: 'mantras', label: 'Mantras & Chants', icon: 'Sparkles' },
            { id: 'benefits', label: 'Benefits & Blessings', icon: 'Heart' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`sa-subcat-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Panel Content */}
        <div className="sa-subcat-content-card">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <h2 className="pane-heading">Divine Purpose & Significance</h2>
              <p className="pane-lead">{data.overview}</p>

              <div className="overview-highlights-grid">
                <div className="highlight-box">
                  <span className="box-icon">🕉️</span>
                  <h3>Presiding Deity</h3>
                  <p>{data.deityName} ({data.deityTelugu})</p>
                </div>
                <div className="highlight-box">
                  <span className="box-icon">⏳</span>
                  <h3>Estimated Duration</h3>
                  <p>{data.duration} for complete rituals</p>
                </div>
                <div className="highlight-box">
                  <span className="box-icon">☀️</span>
                  <h3>Optimal Muhurtham</h3>
                  <p>{data.bestTime}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP PROCEDURE (VIDHANAM) */}
          {activeTab === 'procedure' && (
            <div className="tab-pane">
              <h2 className="pane-heading">Sacred Step-by-Step Worship Vidhanam</h2>
              <p className="pane-desc">Follow these authentic traditional steps in reverence with an unobstructed mind.</p>

              <div className="procedure-steps-list">
                {data.procedure.map((step) => (
                  <div key={step.step} className="procedure-step-card">
                    <div className="step-num-col">
                      <div className="step-badge">{step.step}</div>
                      <div className="step-connector" />
                    </div>
                    <div className="step-detail-col">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-desc">{step.desc}</p>
                      {step.mantra && (
                        <div className="step-mantra-box">
                          <span className="mantra-label">Chant during this step:</span>
                          <p className="mantra-text">{step.mantra}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MATERIALS (SAMAGRI) */}
          {activeTab === 'materials' && (
            <div className="tab-pane">
              <h2 className="pane-heading">Required Sacred Pooja Samagri Checklist</h2>
              <p className="pane-desc">Assemble these sacred items before commencing the holy rituals.</p>

              <div className="samagri-grid">
                {data.materials.map((item, idx) => (
                  <div key={idx} className="samagri-item-card">
                    <div className="samagri-icon-circle">
                      <Icon name={item.icon || 'CheckCircle2'} size={18} />
                    </div>
                    <div className="samagri-info">
                      <span className="samagri-name">{item.name}</span>
                      <span className="samagri-qty">Quantity: <strong>{item.qty}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MANTRAS & CHANTS */}
          {activeTab === 'mantras' && (
            <div className="tab-pane">
              <div className="pane-header-with-action">
                <div>
                  <h2 className="pane-heading">Sacred Mantras & Divine Hymns</h2>
                  <p className="pane-desc">Recite with purity, correct pronunciation, and contemplation of meaning.</p>
                </div>
                {copiedMantra && (
                  <span className="copy-toast">✓ Mantra copied to clipboard!</span>
                )}
              </div>

              <div className="mantras-stack">
                {data.mantras.map((m, idx) => (
                  <div key={idx} className="mantra-card">
                    <div className="mantra-header">
                      <h3 className="mantra-title">{m.title}</h3>
                      <button
                        type="button"
                        className="btn-copy-mantra"
                        onClick={() => copyMantraText(`${m.script}\n\n${m.transliteration}\n\nMeaning: ${m.meaning}`)}
                      >
                        <Icon name="Copy" size={14} />
                        <span>Copy Mantra</span>
                      </button>
                    </div>

                    <div className="mantra-script-box">
                      <p className="mantra-sacred-script">{m.script}</p>
                    </div>

                    <div className="mantra-translit-box">
                      <span className="translit-label">Transliteration:</span>
                      <p className="translit-text">{m.transliteration}</p>
                    </div>

                    <div className="mantra-meaning-box">
                      <span className="meaning-label">Devotional Meaning:</span>
                      <p className="meaning-text">{m.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BENEFITS */}
          {activeTab === 'benefits' && (
            <div className="tab-pane">
              <h2 className="pane-heading">Divine Fruits & Spiritual Blessings (Phalasruti)</h2>
              <p className="pane-desc">The traditional spiritual and worldly rewards bestowed upon sincere devotees.</p>

              <div className="benefits-list">
                {data.benefits.map((b, idx) => (
                  <div key={idx} className="benefit-row">
                    <span className="benefit-gold-bullet">◆</span>
                    <p className="benefit-text">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Link Footer */}
        <div className="sa-subcat-footer-nav">
          <button
            type="button"
            className="sa-btn-back-cat"
            onClick={() => navigate(-1)}
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Back to Subcategories</span>
          </button>
        </div>
      </div>
    </div>
  );
}
