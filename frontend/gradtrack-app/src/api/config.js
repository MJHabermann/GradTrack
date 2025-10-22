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
    MILESTONES: '/api/milestones',
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Helper function to build full URL
  buildUrl: (endpoint) => {
    return API_CONFIG.BASE_URL ? `${API_CONFIG.BASE_URL}${endpoint}` : endpoint;
  },
  
  // Helper function to make API calls
  request: async (endpoint, options = {}) => {
    const url = API_CONFIG.buildUrl(endpoint);
    
    const config = {
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
      ...options,
    };
    
    try {
      const response = await fetch(url, config);
      
      // Handle non-2xx responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), create a generic error
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        // Handle 422 validation errors specifically
        if (response.status === 422 && errorData.errors) {
          // Format Laravel validation errors into a readable message
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          throw new Error(validationErrors || errorData.message || 'Validation failed');
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Parse JSON response for successful requests
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn(`Could not parse JSON response for ${endpoint}:`, parseError);
        data = {};
      }
      return { response, data };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  },
};

export default API_CONFIG;
