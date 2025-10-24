// API Configuration
const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  
  // API endpoints
  ENDPOINTS: {
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    USER_PROFILE: '/api/user/profile',
    DOCUMENTS: '/api/documents',
    DOCUMENTS_UPLOAD: '/api/documents/upload',
    DOCUMENT_DOWNLOAD: (id) => `/api/documents/${id}/download`,
    DOCUMENT_DELETE: (id) => `/api/documents/${id}`,
    MILESTONES: '/api/milestones',
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Get auth token from localStorage
  getAuthToken: () => {
    return localStorage.getItem('auth_token');
  },
  
  // Helper function to build full URL
  buildUrl: (endpoint) => {
    return API_CONFIG.BASE_URL ? `${API_CONFIG.BASE_URL}${endpoint}` : endpoint;
  },
  
  // Helper function to make API calls
  request: async (endpoint, options = {}) => {
    const url = API_CONFIG.buildUrl(endpoint);
    const token = API_CONFIG.getAuthToken();
    
    const config = {
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
      credentials: 'include', // Important for cookies/sessions
      ...options,
    };
    
    // Add authorization token if available
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    try {
      const response = await fetch(url, config);
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  },
};

export default API_CONFIG;