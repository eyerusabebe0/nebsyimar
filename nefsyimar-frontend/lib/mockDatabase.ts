// API configuration for backend communication
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      CHECK: '/api/auth/check',
      PROFILE: '/api/auth/profile'
    }
  }
}

// Helper function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  return fetch(url, { ...defaultOptions, ...options })
}
