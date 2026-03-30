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

const MAX_IMAGE_UPLOAD_SIZE = 10 * 1024 * 1024;
const TARGET_IMAGE_UPLOAD_SIZE = 8 * 1024 * 1024;
const MIN_IMAGE_UPLOAD_SIZE = 3 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 3200;

const loadImage = (file) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Unable to process image for upload.'));
  };

  image.src = objectUrl;
});

const canvasToBlob = (canvas, mimeType, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) {
      resolve(blob);
      return;
    }

    reject(new Error('Unable to compress image for upload.'));
  }, mimeType, quality);
});

const compressImageIfNeeded = async (file) => {
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size <= MAX_IMAGE_UPLOAD_SIZE) {
    return file;
  }

  const image = await loadImage(file);
  const longestSide = Math.max(image.width, image.height);
  const baseScale = Math.min(1, MAX_IMAGE_DIMENSION / longestSide);
  const scaleSteps = [1, 0.95, 0.9, 0.85, 0.8, 0.75];
  const mimeType = file.type === 'image/png' || file.type === 'image/webp'
    ? 'image/webp'
    : 'image/jpeg';
  const qualityLevels = mimeType === 'image/webp'
    ? [0.98, 0.96, 0.94, 0.92, 0.9, 0.88]
    : [0.97, 0.95, 0.93, 0.91, 0.89, 0.87];

  let bestCandidate = null;

  for (const step of scaleSteps) {
    const scale = Math.min(1, baseScale * step);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    for (const quality of qualityLevels) {
      const blob = await canvasToBlob(canvas, mimeType, quality);

      if (blob.size <= MAX_IMAGE_UPLOAD_SIZE && (!bestCandidate || blob.size > bestCandidate.size)) {
        bestCandidate = { blob, size: blob.size, width, height };
      }

      if (blob.size >= MIN_IMAGE_UPLOAD_SIZE && blob.size <= TARGET_IMAGE_UPLOAD_SIZE) {
        bestCandidate = { blob, size: blob.size, width, height };
        break;
      }
    }

    if (bestCandidate && bestCandidate.size >= MIN_IMAGE_UPLOAD_SIZE && bestCandidate.size <= TARGET_IMAGE_UPLOAD_SIZE) {
      break;
    }
  }

  if (!bestCandidate) {
    return file;
  }

  const extension = mimeType === 'image/webp' ? '.webp' : '.jpg';
  const fileName = file.name.includes('.')
    ? file.name.replace(/\.[^.]+$/, extension)
    : `${file.name}${extension}`;

  return new File([bestCandidate.blob], fileName, {
    type: mimeType,
    lastModified: file.lastModified
  });
};

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
    const file = formData.get('file');

    if (file instanceof File) {
      const compressedFile = await compressImageIfNeeded(file);
      if (compressedFile !== file) {
        formData.set('file', compressedFile);
      }
    }

    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const total = progressEvent.total || 1;
        const progress = Math.round((progressEvent.loaded * 100) / total);
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