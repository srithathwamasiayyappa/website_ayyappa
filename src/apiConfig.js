// Central API Configuration for Saranam Ayyappa Web Application (User Panel)
// Defaulted directly to Production Base URL
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'https://backendapis.saranamayyappa.in/api/v1';

export default API_BASE_URL;
