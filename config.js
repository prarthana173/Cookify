// Cookify configuration for local development.
// NOTE: TheMealDB API is free and doesn't require an API key.
// This configuration is kept for potential future API integrations.

window.COOKIFY_CONFIG = window.COOKIFY_CONFIG || {
  // TheMealDB API base URL (free, no API key required)
  THEMEALDB_BASE_URL: 'https://www.themealdb.com/api/json/v1/1',
  // Flask backend API base URL
  API_BASE_URL: 'http://localhost:5000/api'
};

// Flask-based authentication system
window.COOKIFY_AUTH = {
  async authenticateUser(email, password) {
    try {
      const response = await fetch(`${window.COOKIFY_CONFIG.API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session management
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  async registerUser(email, password, name) {
    try {
      const response = await fetch(`${window.COOKIFY_CONFIG.API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session management
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  async checkAuthStatus() {
    try {
      const response = await fetch(`${window.COOKIFY_CONFIG.API_BASE_URL}/check-auth`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Auth check error:', error);
      return { authenticated: false };
    }
  },

  async logout() {
    try {
      const response = await fetch(`${window.COOKIFY_CONFIG.API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  }
};
