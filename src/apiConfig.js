// ==============================================================================
// CENTRAL API CONFIGURATION FOR SARANAM AYYAPPA WEB APPLICATION (USER PANEL)
// Governed globally by VITE_API_BASE_URL in .env
// Changing VITE_API_BASE_URL in the .env file immediately applies
// across the entire user website without needing any component code edits.
// ==============================================================================

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://backendapis.saranamayyappa.in/api/v1'
).replace(/\/+$/, '');

// Base root origin without /api/v1 (for static media assets, uploads & downloads)
export const API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN || API_BASE_URL.replace(/\/api\/v1\/?$/, '')
).replace(/\/+$/, '');

export default API_BASE_URL;
