/**
 * DevDrop API Client
 * A simple, lightweight fetch wrapper for the DevDrop backend API
 *
 * Usage:
 *   import api from '@/services/api'
 *   api.auth.login(email, password)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to build URL
const buildUrl = (path) => `${API_BASE_URL}${path}`;

// Helper to handle response
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || !data.success) {
    const error = new Error(data.message || 'Request failed');
    error.statusCode = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

// Token storage (adjust based on your security preference)
const storage = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: ({ accessToken, refreshToken }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// Axios-like fetch wrapper with interceptors
class APIClient {
  constructor() {
    this.attachToken = this.attachToken.bind(this);
  }

  // Attach Authorization header if token exists
  attachToken(config = {}) {
    const token = storage.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  // Refresh access token using refresh token
  async refreshTokens() {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(buildUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await handleResponse(response);
    storage.setTokens(data.data);
    return data.data;
  }

  // Request interceptor (auto-refresh on 401)
  async request(url, options = {}) {
    let config = this.attachToken({ ...options });

    try {
      const response = await fetch(buildUrl(url), config);
      if (response.status === 401) {
        // Token expired, try refresh
        try {
          const newTokens = await this.refreshTokens();
          config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          const retryResponse = await fetch(buildUrl(url), config);
          return handleResponse(retryResponse);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          storage.clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  // === AUTH MODULE ===
  auth = {
    register: (email, password, role, name) =>
      this.request('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name }),
      }),

    login: (email, password) =>
      this.request('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }),

    logout: (refreshToken) =>
      this.request('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storage.getAccessToken()}`,
        },
        body: JSON.stringify({ refreshToken }),
      }),

    refresh: (refreshToken) =>
      this.request('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }),

    verifyEmail: (token) =>
      fetch(buildUrl(`/api/v1/auth/verify-email?token=${token}`)).then(handleResponse),
  };

  // === USERS MODULE ===
  users = {
    getMe: () =>
      this.request('/api/v1/users/me'),

    updateSettings: (data) =>
      this.request('/api/v1/users/update-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  };

  // === DEVELOPERS MODULE ===
  developers = {
    getProfile: () =>
      this.request('/api/v1/developers/me'),

    updateProfile: (data) =>
      this.request('/api/v1/developers/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  };

  // === STARTUPS MODULE ===
  startups = {
    getProfile: () =>
      this.request('/api/v1/startups/me'),

    updateProfile: (data) =>
      this.request('/api/v1/startups/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),

    getById: (id) =>
      this.request(`/api/v1/startups/${id}`),
  };

  // === JOBS MODULE ===
  jobs = {
    getFeed: (page = 1, limit = 20) =>
      this.request(`/api/v1/jobs/feed?page=${page}&limit=${limit}`),

    getById: (id) =>
      this.request(`/api/v1/jobs/${id}`),

    create: (jobData) =>
      this.request('/api/v1/jobs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      }),
  };

  // === APPLICATIONS MODULE ===
  applications = {
    apply: (jobId, coverLetter = '', resumeSnapshot = '') =>
      this.request('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, coverLetter, resumeSnapshot }),
      }),

    getMyApplications: (page = 1, limit = 10) =>
      this.request(`/api/v1/applications/my-apps?page=${page}&limit=${limit}`),

    getApplicants: (jobId, page = 1, limit = 20) =>
      this.request(`/api/v1/applications/job/${jobId}?page=${page}&limit=${limit}`),

    updateStatus: (applicationId, status) =>
      this.request(`/api/v1/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
  };

  // === PAYMENTS MODULE ===
  payments = {
    createCheckout: (credits) =>
      this.request('/api/v1/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      }),
  };
}

// Export singleton
export default new APIClient();
