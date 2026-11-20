export const nav = [
  ['Sannidhi', '/home'],
  ['Devotional Services', '/categories'],
  ['Festivals', '/festivals'],
  ['Events', '/live-streams'],
  ['Panchangam', '/panchangam']
];
export const services = [
    { id: 'pooja', title: 'Pooja Vidhanam', sub: 'Step-by-step sacred rituals', icon: 'Flame', url: '/subcategories', image: 'pooja-padi' },
    { id: 'ashtothram', title: 'Astothrams', sub: '108 divine names', icon: 'Flower2', url: '/stotras', image: 'deity' },
    { id: 'stotras', title: 'Stotras', sub: 'Powerful devotional hymns', icon: 'BookOpenText', url: '/stotras', image: 'deity' },
    { id: 'slokas', title: 'Slokas', sub: 'Sacred verses & meanings', icon: 'ScrollText', url: '/slokas', image: 'pooja-altar' },
    { id: 'bhajans', title: 'Bhajans', sub: 'Devotional songs', icon: 'Music', url: '/songs', image: 'music-art' },
    { id: 'harathis', title: 'Harathis & Songs', sub: 'Mangala harathi & kirtans', icon: 'Lamp', url: '/songs', image: 'music-art' },
    { id: 'live', title: 'Live Streams', sub: 'Temple darshan & events', icon: 'Radio', url: '/live-streams', image: 'live-temple' },
    { id: 'panchangam', title: 'Panchangam', sub: 'Tithi, muhurtham & festivals', icon: 'CalendarDays', url: '/panchangam', image: 'temple-steps' },
    { id: 'temples', title: 'Temples in India', sub: 'Explore sacred places', icon: 'Landmark', url: '/temples', image: 'temple-hero' },
    { id: 'donations', title: 'Donations', sub: 'Support temple seva', icon: 'HandHeart', url: '/donations', image: 'donation-art' },
    { id: 'food', title: 'Food Donation Today', sub: 'Today’s annadanam locations', icon: 'Soup', url: '/food-donations', image: 'annadanam-meal' },
];
export const deities = [['Lord Ayyappa', 'god-ayyappa'], ['Lord Venkateswara', 'god-venkateswara'], ['Lord Shiva', 'god-shiva'], ['Lord Ganesha', 'god-ganesha'], ['Goddess Durga', 'god-durga'], ['Lord Krishna', 'god-krishna']];
export const languages = [['English', 'English', 'en'], ['Telugu', 'తెలుగు', 'te'], ['Kannada', 'ಕನ್ನಡ', 'kn'], ['Tamil', 'தமிழ்', 'ta'], ['Hindi', 'हिन्दी', 'hi']];
export const poojas = [['Ayyappa Pooja Vidhanam', 'Complete step-by-step worship procedure', '25 minutes'], ['Mandala Pooja', 'Daily devotion during Mandala season', '40 minutes'], ['Makaravilakku Pooja', 'Special festival rituals and offerings', '35 minutes'], ['Vratham Vidhanam', 'Preparation, observance and practices', '15 minutes'], ['Ganapathi Pooja', 'Traditional prayers before auspicious beginnings', '20 minutes']];
export const stotras = [['Sri Ayyappa Ashtothram', '108 sacred names'], ['Sri Ayyappa Sahasranamam', '1000 divine names'], ['Sri Ayyappa Stotram', 'Powerful hymn'], ['Harivarasanam', 'Sacred lullaby of Ayyappa'], ['Vishnu Sahasranamam', 'Traditional Vishnu stotra'], ['Lalitha Sahasranamam', 'Devotional hymn to Devi']];
export const tracks = [['Ayyappa Bhajan — Swamiye Saranam', 'Ayyappa Bhajans', '04:38'], ['Harathi — Sri Ayyappa Swamy', 'Harathis', '05:12'], ['Manasa Smarami — Devotional Song', 'Songs', '03:54'], ['Ayyappa Suprabhatam', 'Bhajans', '07:18'], ['Harivarasanam', 'Songs', '06:10']];
export const temples = [
    { name: 'Sabarimala Sri Ayyappa Temple', state: 'Kerala', city: 'Pathanamthitta', deity: 'Lord Ayyappa', special: 'Pilgrimage through the sacred 18 steps', image: 'temple-hero' },
    { name: 'Sri Venkateswara Temple', state: 'Andhra Pradesh', city: 'Tirumala', deity: 'Lord Venkateswara', special: 'Renowned hill shrine of Lord Balaji', image: 'temples-card' },
    { name: 'Kashi Vishwanath Temple', state: 'Uttar Pradesh', city: 'Varanasi', deity: 'Lord Shiva', special: 'One of the revered twelve Jyotirlingas', image: 'temple-steps' },
    { name: 'Meenakshi Amman Temple', state: 'Tamil Nadu', city: 'Madurai', deity: 'Goddess Meenakshi', special: 'Iconic Dravidian architecture', image: 'festival' },
    { name: 'Kedarnath Temple', state: 'Uttarakhand', city: 'Kedarnath', deity: 'Lord Shiva', special: 'Sacred Himalayan pilgrimage', image: 'temples-card' },
    { name: 'Kanaka Durga Temple', state: 'Andhra Pradesh', city: 'Vijayawada', deity: 'Goddess Durga', special: 'Historic hilltop shrine', image: 'pooja-altar' }
];
export const notices = [['Mandala Pooja Live Today', 'A sample live-stream reminder for devotees', '2h ago'], ['Annadanam Update', 'Food distribution location details refreshed', '4h ago'], ['Temple Timings Change', 'Please confirm current timings with the temple', 'Yesterday'], ['Festival Calendar', 'Explore upcoming observances and fasting days', '2 days ago']];
export const routes = [
    ['Splash', '/'], ['Choose God', '/choose-god'], ['Choose Language', '/choose-language'], ['Login / Registration', '/login'], ['OTP Verification', '/otp'], ['Complete Profile', '/complete-profile'], ['Home Dashboard', '/home'], ['Categories', '/categories'], ['Subcategory List', '/subcategories'], ['Pooja Vidhanam Detail', '/pooja-detail'], ['Astothrams / Stotras', '/stotras'], ['Slokas Detail', '/slokas'], ['Bhajans / Harathis / Songs', '/songs'], ['Live Streams', '/live-streams'], ['Panchangam', '/panchangam'], ['Hindus Temples Listing', '/temples'], ['Temple Profile Detail', '/temple-detail'], ['Donations / Annadanam', '/donations'], ['Today Food Donation Location', '/food-donations'], ['Notifications', '/notifications'], ['Profile', '/profile'], ['Edit Profile', '/edit-profile'], ['Terms & Conditions', '/terms'], ['Privacy Policy', '/privacy'], ['Refund Policy', '/refund-policy'], ['Account Deletion', '/account-deletion'], ['About', '/about'], ['Contact Us', '/contact'], ['Logout Confirmation', '/logout']
];
export const image = (name) => `${import.meta.env.BASE_URL}images/${name}.jpg`;
