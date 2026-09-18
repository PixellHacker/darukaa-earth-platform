import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('darukaa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('darukaa_token', res.data.access_token);
      localStorage.setItem('darukaa_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (email, password, full_name, role = 'admin') => {
    const res = await api.post('/auth/register', { email, password, full_name, role });
    if (res.data.access_token) {
      localStorage.setItem('darukaa_token', res.data.access_token);
      localStorage.setItem('darukaa_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('darukaa_token');
    localStorage.removeItem('darukaa_user');
  },
  getStoredUser: () => {
    const raw = localStorage.getItem('darukaa_user');
    return raw ? JSON.parse(raw) : null;
  }
};

// Projects API
export const projectService = {
  getProjects: async () => {
    const res = await api.get('/projects');
    return res.data;
  },
  getProject: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  createProject: async (data) => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  deleteProject: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  }
};

// Sites API
export const siteService = {
  getSites: async () => {
    const res = await api.get('/sites');
    return res.data;
  },
  createSite: async (projectId, data) => {
    const res = await api.post(`/projects/${projectId}/sites`, data);
    return res.data;
  },
  getSite: async (id) => {
    const res = await api.get(`/sites/${id}`);
    return res.data;
  },
  deleteSite: async (id) => {
    const res = await api.delete(`/sites/${id}`);
    return res.data;
  },
  getGeoJSON: async () => {
    const res = await api.get('/geospatial/geojson');
    return res.data;
  }
};

// Analytics API
export const analyticsService = {
  getSiteAnalytics: async (siteId) => {
    const res = await api.get(`/analytics/sites/${siteId}`);
    return res.data;
  },
  getPlatformSummary: async () => {
    const res = await api.get('/analytics/platform-summary');
    return res.data;
  }
};

export default api;
