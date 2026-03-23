import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// ============ CATEGORIES/FOLDERS API ============
export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/folders');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/folders', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/folders/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },

  // ✅ NEW: Get delete info before deleting
  getDeleteInfo: async (id) => {
    const response = await api.get(`/folders/${id}/delete-info`);
    return response.data;
  },

  // ✅ NEW: Get subcategory delete info
  getSubcategoryDeleteInfo: async (categoryId, subId) => {
    const response = await api.get(`/folders/${categoryId}/subcategory/${subId}/delete-info`);
    return response.data;
  },

  addSubcategory: async (categoryId, subcategory) => {
    const response = await api.post(`/folders/${categoryId}/subcategory`, subcategory);
    return response.data;
  },

  updateSubcategory: async (categoryId, subId, data) => {
    const response = await api.put(`/folders/${categoryId}/subcategory/${subId}`, data);
    return response.data;
  },

  deleteSubcategory: async (categoryId, subId) => {
    const response = await api.delete(`/folders/${categoryId}/subcategory/${subId}`);
    return response.data;
  }
};
// ============ FILES API ============
export const fileAPI = {
  // ✅ Get all files with search
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.subcategoryId) params.append('subcategoryId', filters.subcategoryId);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/files?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  upload: async (formData, onProgress) => {
    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(progress);
      }
    });
    return response.data;
  },

  // ✅ Update file metadata
  update: async (id, data) => {
    const response = await api.put(`/files/${id}`, data);
    return response.data;
  },

  getTrash: async () => {
    const response = await api.get('/files/trash/list');
    return response.data;
  },

  moveToTrash: async (id) => {
    const response = await api.patch(`/files/${id}/trash`);
    return response.data;
  },

  restore: async (id) => {
    const response = await api.patch(`/files/${id}/restore`);
    return response.data;
  },

  deletePermanent: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  }
};



export default api;