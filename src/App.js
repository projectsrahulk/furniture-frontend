import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useParams, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import API services
import { authAPI, categoryAPI, fileAPI } from './services/api';

// ========== AUTH PAGES ==========
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      onLogin(data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🛋️</span>
          <h1>श्रीFurniture</h1>
          <p>Furniture Catalog Manager</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Logging in...' : '🔑 Login'}
          </button>
        </form>

        <p className="auth-footer">
          {/* Don't have an account? <NavLink to="/register">Register</NavLink> */}
        </p>
      </div>
    </div>
  );
}

/*
// ========== REGISTER PAGE (HIDDEN FOR NOW) ==========
function RegisterPage({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.register({ name, email, password });
      onLogin(data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🛋️</span>
          <h1>Create Account</h1>
          <p>Join श्रीFurniture today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Creating...' : '✨ Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <NavLink to="/login">Login</NavLink>
        </p>
      </div>
    </div>
  );
}
*/

// ========== 5️⃣ IMAGE LIGHTBOX MODAL ==========
function ImageLightbox({ file, onClose, onEdit, onDelete, onDownload }) {
  if (!file) return null;

  const handleDownload = () => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>

        <div className="lightbox-image-container">
          <img src={file.url} alt={file.name} className="lightbox-image" />
        </div>

        <div className="lightbox-info">
          <h3>{file.name}</h3>
          {file.description && <p className="lightbox-description">{file.description}</p>}
          <div className="lightbox-meta">
            <span>📦 {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
            <span>📅 {new Date(file.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="lightbox-actions">
          <button className="lightbox-btn edit" onClick={() => onEdit(file)}>
            ✏️ Edit
          </button>
          <button className="lightbox-btn download" onClick={handleDownload}>
            ⬇️ Download
          </button>
          <button className="lightbox-btn delete" onClick={() => onDelete(file)}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
// ========== CUSTOM CONFIRM MODAL ==========
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirm action failed:', error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const iconMap = {
    danger: '🗑️',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colorMap = {
    danger: {
      bg: '#fee2e2',
      text: '#dc2626',
      btn: '#dc2626'
    },
    warning: {
      bg: '#fef3c7',
      text: '#d97706',
      btn: '#d97706'
    },
    info: {
      bg: '#dbeafe',
      text: '#2563eb',
      btn: '#2563eb'
    }
  };

  const colors = colorMap[type];

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon" style={{ background: colors.bg, color: colors.text }}>
          {iconMap[type]}
        </div>

        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>

        {details && (
          <div className="confirm-details">
            {details.map((detail, index) => (
              <div key={index} className="confirm-detail-item">
                <span className="detail-icon">{detail.icon}</span>
                <span className="detail-text">{detail.text}</span>
                <span className="detail-count">{detail.count}</span>
              </div>
            ))}
          </div>
        )}

        <div className="confirm-warning">
          <span>⚠️</span>
          <span>Files will be moved to Trash. You can restore them later.</span>
        </div>

        <div className="confirm-actions">
          <button
            className="confirm-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="confirm-btn confirm"
            onClick={handleConfirm}
            disabled={loading}
            style={{ background: colors.btn }}
          >
            {loading ? '⏳ Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== SIMPLE ALERT MODAL ==========
function AlertModal({ isOpen, onClose, title, message, type = 'info' }) {
  if (!isOpen) return null;

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colorMap = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-modal alert-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon" style={{ background: `${colorMap[type]}20`, color: colorMap[type] }}>
          {iconMap[type]}
        </div>

        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions single">
          <button className="confirm-btn confirm" onClick={onClose} style={{ background: colorMap[type] }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
// ========== EDIT FILE MODAL ==========
function EditFileModal({ file, isOpen, onClose, onSave }) {
  const [name, setName] = useState(file?.name || '');
  const [description, setDescription] = useState(file?.description || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name || '');
      setDescription(file.description || '');
    }
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      await onSave({ name, description });
      toast.success('File updated!');
      onClose();
    } catch (error) {
      toast.error('Failed to update file');
    }
    setLoading(false);
  };

  if (!isOpen || !file) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit File</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>File Name *</label>
            <input
              type="text"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter file name"
            />

            <label>Description</label>
            <textarea
              className="text-input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== UPLOAD MODAL ==========
function UploadModal({ isOpen, onClose, categories, onUpload, preSelectedCategory, preSelectedSubcategory }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(preSelectedCategory || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(preSelectedSubcategory || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');

  const currentCategory = categories.find(c => c._id === selectedCategory);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    cat.nameHindi?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter subcategories based on search
  const filteredSubcategories = currentCategory?.subcategories?.filter(sub =>
    sub.name.toLowerCase().includes(subcategorySearch.toLowerCase()) ||
    sub.nameHindi?.toLowerCase().includes(subcategorySearch.toLowerCase())
  ) || [];

  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setSelectedCategory(preSelectedCategory || '');
      setSelectedSubcategory(preSelectedSubcategory || '');
      setUploadProgress(0);
      setCategorySearch('');
      setSubcategorySearch('');
    }
  }, [isOpen, preSelectedCategory, preSelectedSubcategory]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(file)
    }));
    setSelectedFiles(prev => [...prev, ...fileData]);
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files');
      return;
    }
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    if (!selectedSubcategory) {
      toast.error('Please select a subcategory');
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileData = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('name', fileData.name);
        formData.append('categoryId', selectedCategory);
        formData.append('subcategoryId', selectedSubcategory);

        await fileAPI.upload(formData, (progress) => {
          setUploadProgress(Math.round(((i + progress / 100) / selectedFiles.length) * 100));
        });
      }

      toast.success(`${selectedFiles.length} file(s) uploaded!`);
      onUpload();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    }

    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content upload-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 Upload Files</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body upload-modal-body">
          <div
            className="modal-dropzone"
            onClick={() => document.getElementById('modalFileInput').click()}
          >
            <input
              type="file"
              id="modalFileInput"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
            <div className="dropzone-icon">📁</div>
            <h3>Tap to select images</h3>
            <p>PNG, JPG, WebP • Max 10MB each</p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <div className="selected-header">
                <span>📎 {selectedFiles.length} file(s)</span>
                <button className="clear-all-btn" onClick={() => setSelectedFiles([])}>
                  Clear All
                </button>
              </div>
              <div className="files-preview-grid">
                {selectedFiles.map(file => (
                  <div key={file.id} className="file-preview-item">
                    <img src={file.preview} alt={file.name} />
                    <button className="remove-file-btn" onClick={() => removeFile(file.id)}>✕</button>
                    <div className="file-preview-info">
                      <span className="preview-name">{file.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!preSelectedCategory && (
            <div className="category-section">
              <h3>📁 Select Category</h3>
              <SearchBar
                value={categorySearch}
                onChange={setCategorySearch}
                placeholder="Search categories..."
              />
              <div className="category-select-grid">
                {filteredCategories.map(cat => (
                  <button
                    key={cat._id}
                    className={`category-select-btn ${selectedCategory === cat._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat._id);
                      setSelectedSubcategory('');
                      setCategorySearch('');
                      setSubcategorySearch('');
                    }}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-hindi">{cat.nameHindi}</span>
                  </button>
                ))}
              </div>
              {filteredCategories.length === 0 && categorySearch && (
                <div className="no-results">No categories found matching "{categorySearch}"</div>
              )}
            </div>
          )}

          {(selectedCategory || preSelectedCategory) && !preSelectedSubcategory && currentCategory && (
            <div className="category-section">
              <h3>📂 Select Subcategory</h3>
              <SearchBar
                value={subcategorySearch}
                onChange={setSubcategorySearch}
                placeholder="Search subcategories..."
              />
              <div className="subcategory-chips">
                {filteredSubcategories.map(sub => (
                  <button
                    key={sub._id}
                    className={`subcategory-chip ${selectedSubcategory === sub._id ? 'selected' : ''}`}
                    onClick={() => setSelectedSubcategory(sub._id)}
                  >
                    <span className="sub-name">{sub.name}</span>
                    <span className="sub-hindi">{sub.nameHindi}</span>
                  </button>
                ))}
              </div>
              {filteredSubcategories.length === 0 && subcategorySearch && (
                <div className="no-results">No subcategories found matching "{subcategorySearch}"</div>
              )}
            </div>
          )}

          {preSelectedCategory && preSelectedSubcategory && (
            <div className="preselected-info">
              <span>📁 Uploading to:</span>
              <strong>
                {categories.find(c => c._id === preSelectedCategory)?.name} → {' '}
                {categories.find(c => c._id === preSelectedCategory)?.subcategories?.find(s => s._id === preSelectedSubcategory)?.name}
              </strong>
            </div>
          )}

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span>{uploadProgress}%</span>
            </div>
          )}

          {(!selectedCategory || !selectedSubcategory) && selectedFiles.length > 0 && (
            <div className="upload-hint">
              Please select a category and subcategory before uploading.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0 || !selectedCategory || !selectedSubcategory}
          >
            {uploading ? '⏳ Uploading...' : `📤 Upload ${selectedFiles.length} File(s)`}
          </button>
        </div>

      </div>
    </div>
  );
}

// ========== ADD CATEGORY MODAL ==========
function AddCategoryModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [nameHindi, setNameHindi] = useState('');
  const [icon, setIcon] = useState('📁');
  const [subcategories, setSubcategories] = useState([{ name: '', nameHindi: '' }]);
  const [loading, setLoading] = useState(false);

  const icons = ['📁', '🛏️', '🪑', '🛋️', '🚪', '🧰', '🍽️', '📺', '🛕', '🧱', '🪞', '🏠', '✨', '🎨'];

  const addSubcategoryField = () => {
    setSubcategories([...subcategories, { name: '', nameHindi: '' }]);
  };

  const updateSubcategory = (index, field, value) => {
    const updated = [...subcategories];
    updated[index][field] = value;
    setSubcategories(updated);
  };

  const removeSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter category name');
      return;
    }

    const validSubcategories = subcategories.filter(s => s.name.trim());

    setLoading(true);
    try {
      await onAdd({
        name,
        nameHindi,
        icon,
        subcategories: validSubcategories
      });
      toast.success('Category created!');
      setName('');
      setNameHindi('');
      setIcon('📁');
      setSubcategories([{ name: '', nameHindi: '' }]);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create category');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Add Category</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label>Category Name (English) *</label>
          <input
            type="text"
            className="text-input"
            placeholder="e.g., Beds"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Category Name (Hindi)</label>
          <input
            type="text"
            className="text-input"
            placeholder="e.g., Palang"
            value={nameHindi}
            onChange={(e) => setNameHindi(e.target.value)}
          />

          <label>Select Icon</label>
          <div className="icon-picker">
            {icons.map(i => (
              <button
                key={i}
                type="button"
                className={`icon-option ${icon === i ? 'selected' : ''}`}
                onClick={() => setIcon(i)}
              >
                {i}
              </button>
            ))}
          </div>

          <label>Subcategories</label>
          {subcategories.map((sub, index) => (
            <div key={index} className="subcategory-input-row">
              <input
                type="text"
                placeholder="Name (English)"
                value={sub.name}
                onChange={(e) => updateSubcategory(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Name (Hindi)"
                value={sub.nameHindi}
                onChange={(e) => updateSubcategory(index, 'nameHindi', e.target.value)}
              />
              {subcategories.length > 1 && (
                <button type="button" className="remove-sub-btn" onClick={() => removeSubcategory(index)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="add-sub-btn" onClick={addSubcategoryField}>
            ➕ Add Subcategory
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Creating...' : '✅ Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== ADD SUBCATEGORY MODAL ==========
function AddSubcategoryModal({ isOpen, onClose, categoryName, onSubmit }) {
  const [name, setName] = useState('');
  const [nameHindi, setNameHindi] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter subcategory name');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name, nameHindi });
      toast.success('Subcategory added!');
      setName('');
      setNameHindi('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Add Subcategory</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="parent-info">
              <span>Adding to: </span>
              <strong>{categoryName}</strong>
            </div>

            <label>Subcategory Name (English) *</label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g., King Size Bed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <label>Subcategory Name (Hindi)</label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g., Bada Palang"
              value={nameHindi}
              onChange={(e) => setNameHindi(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Adding...' : '✅ Add Subcategory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== EDIT CATEGORY MODAL ==========
function EditCategoryModal({ isOpen, onClose, category, onSubmit }) {
  const [name, setName] = useState(category?.name || '');
  const [nameHindi, setNameHindi] = useState(category?.nameHindi || '');
  const [icon, setIcon] = useState(category?.icon || '📁');
  const [loading, setLoading] = useState(false);

  const icons = ['📁', '🛏️', '🪑', '🛋️', '🚪', '🧰', '🍽️', '📺', '🛕', '🧱', '🪞', '🏠'];

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setNameHindi(category.nameHindi || '');
      setIcon(category.icon || '📁');
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name, nameHindi, icon });
      toast.success('Category updated!');
      onClose();
    } catch (error) {
      toast.error('Failed to update');
    }
    setLoading(false);
  };

  if (!isOpen || !category) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Category</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>Category Name (English) *</label>
            <input
              type="text"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Category Name (Hindi)</label>
            <input
              type="text"
              className="text-input"
              value={nameHindi}
              onChange={(e) => setNameHindi(e.target.value)}
            />

            <label>Select Icon</label>
            <div className="icon-picker">
              {icons.map(i => (
                <button
                  key={i}
                  type="button"
                  className={`icon-option ${icon === i ? 'selected' : ''}`}
                  onClick={() => setIcon(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== FILE CARD ==========
function FileCard({ file, onView, onEdit, onDelete, onDownload, isSelected, onSelect, showCheckbox }) {
  const [showActions, setShowActions] = useState(false);

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  return (
    <div
      className={`file-card ${isSelected ? 'selected' : ''}`}
      onTouchStart={() => setShowActions(true)}
      onTouchEnd={() => setTimeout(() => setShowActions(false), 3000)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => !showCheckbox && onView(file)}
    >
      {showCheckbox && (
        <div className="file-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onSelect(file._id); }}
          />
        </div>
      )}
      <div className="file-preview">
        {file.thumbnailUrl || file.url ? (
          <img src={file.thumbnailUrl || file.url} alt={file.name} />
        ) : (
          <span>🖼️</span>
        )}
      </div>

      <div className={`file-actions ${showActions ? 'show' : ''}`}>
        <button className="action-btn view" onClick={(e) => { e.stopPropagation(); onView(file); }}>👁️</button>
        <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(file); }}>✏️</button>
        <button className="action-btn download" onClick={handleDownload}>⬇️</button>
        <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); onDelete(file); }}>🗑️</button>
      </div>

      <div className="file-info">
        <span className="file-name">{file.name}</span>
        <span className="file-size">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}</span>
      </div>
    </div>
  );
}

// ========== BREADCRUMB ==========
function Breadcrumb({ items }) {
  const navigate = useNavigate();

  return (
    <div className="breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumb-separator">›</span>}
          <button
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            onClick={() => item.path && navigate(item.path)}
            disabled={index === items.length - 1}
          >
            {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// ========== SEARCH BAR ==========
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>✕</button>
      )}
    </div>
  );
}

// ========== DASHBOARD ==========
function Dashboard({ categories, files, onRefresh }) {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState(files);

  useEffect(() => {
    if (searchQuery) {
      const filtered = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(files);
    }
  }, [searchQuery, files]);

  const totalFiles = files.length;
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👋 Welcome to श्रीFurniture</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/folders')}>
          <span className="stat-icon">📁</span>
          <div className="stat-info">
            <span className="stat-number">{totalCategories}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📂</span>
          <div className="stat-info">
            <span className="stat-number">{totalSubcategories}</span>
            <span className="stat-label">Subcategories</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🖼️</span>
          <div className="stat-info">
            <span className="stat-number">{totalFiles}</span>
            <span className="stat-label">Total Files</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="section-header">
        <h2>🔍 Search Files</h2>
      </div>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name or description..."
      />

      {/* Quick Actions */}
      <div className="section-header">
        <h2>⚡ Quick Actions</h2>
      </div>
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => setShowUploadModal(true)}>
          <span className="qa-icon">📤</span>
          <span className="qa-text">Upload Files</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/folders')}>
          <span className="qa-icon">📁</span>
          <span className="qa-text">Categories</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/trash')}>
          <span className="qa-icon">🗑️</span>
          <span className="qa-text">Trash</span>
        </button>
      </div>

      {/* Search Results or Recent Files */}
      {searchQuery ? (
        <>
          <div className="section-header">
            <h2>🔍 Search Results ({filteredFiles.length})</h2>
            {filteredFiles.length > 0 && (
              <button className="see-all-btn" onClick={() => setSearchQuery('')}>Clear</button>
            )}
          </div>
          {filteredFiles.length > 0 ? (
            <div className="file-grid">
              {filteredFiles.map(file => (
                <FileCard
                  key={file._id}
                  file={file}
                  onView={(f) => window.open(f.url, '_blank')}
                  onEdit={() => { }}
                  onDelete={() => { }}
                  onDownload={() => { }}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state small">
              <p>No files found matching "{searchQuery}"</p>
            </div>
          )}
        </>
      ) : files.length > 0 && (
        <>
          <div className="section-header">
            <h2>🕐 Recent Files</h2>
          </div>
          <div className="file-grid">
            {files.slice(0, 6).map(file => (
              <FileCard
                key={file._id}
                file={file}
                onView={(f) => window.open(f.url, '_blank')}
                onEdit={() => { }}
                onDelete={() => { }}
                onDownload={() => { }}
              />
            ))}
          </div>
        </>
      )}

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        categories={categories}
        onUpload={onRefresh}
      />
    </div>
  );
}

// ========== CATEGORIES PAGE ==========
function CategoriesPage({ categories, onAddCategory, onRefresh }) {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.nameHindi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page">
      <Breadcrumb items={[
        { name: 'Home', icon: '🏠', path: '/dashboard' },
        { name: 'Categories', icon: '📁' }
      ]} />

      <div className="page-header">
        <h1 className="page-title">📁 Categories</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories..."
        />
      </div>

      <div className="categories-grid">
        {filteredCategories.map(category => (
          <div
            key={category._id}
            className="category-card"
            onClick={() => navigate(`/category/${category._id}`)}
          >
            <div className="category-icon">{category.icon}</div>
            <div className="category-info">
              <h3>{category.name}</h3>
              <span className="category-hindi">{category.nameHindi}</span>
              <span className="subcategory-count">
                {category.subcategories?.length || 0} subcategories
              </span>
            </div>
            <span className="category-arrow">→</span>
          </div>
        ))}

        {filteredCategories.length === 0 && searchQuery && (
          <div className="no-results-card">
            <div className="no-results-icon">🔍</div>
            <h3>No categories found</h3>
            <p>Try adjusting your search terms</p>
            <button className="btn-secondary" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          </div>
        )}

        {!searchQuery && (
          <div className="category-card add-card" onClick={() => setShowAddModal(true)}>
            <div className="category-icon">➕</div>
            <div className="category-info">
              <h3>Add Category</h3>
              <span className="category-hindi">Nayi Category</span>
            </div>
          </div>
        )}
      </div>

      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (data) => {
          await onAddCategory(data);
          onRefresh();
        }}
      />
    </div>
  );
}

// ========== CATEGORY DETAIL PAGE ==========
function CategoryDetailPage({ categories, files, onRefresh }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete confirmation states
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [showDeleteSubConfirm, setShowDeleteSubConfirm] = useState(false);
  const [deleteSubInfo, setDeleteSubInfo] = useState(null);
  const [subToDelete, setSubToDelete] = useState(null);

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      const data = await categoryAPI.getById(categoryId);
      setCategory(data.data);
    } catch (error) {
      toast.error('Failed to load category');
    }
    setLoading(false);
  };

  const getFileCount = (subId) => {
    return files.filter(f => f.subcategoryId === subId).length;
  };

  const handleAddSubcategory = async (data) => {
    await categoryAPI.addSubcategory(categoryId, data);
    loadCategory();
    onRefresh();
  };

  const handleEditCategory = async (data) => {
    await categoryAPI.update(categoryId, data);
    loadCategory();
    onRefresh();
  };

  // ✅ NEW: Get delete info and show confirmation
  const handleDeleteCategoryClick = async () => {
    try {
      const info = await categoryAPI.getDeleteInfo(categoryId);
      setDeleteInfo(info.data);
      setShowDeleteCategoryConfirm(true);
    } catch (error) {
      toast.error('Failed to get category info');
    }
  };

  // ✅ NEW: Actually delete category
  const handleDeleteCategoryConfirm = async () => {
    try {
      await categoryAPI.delete(categoryId);
      toast.success('Category deleted! Files moved to trash.');
      setShowDeleteCategoryConfirm(false);
      navigate('/folders');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // ✅ NEW: Get subcategory delete info
  const handleDeleteSubcategoryClick = async (sub) => {
    try {
      const info = await categoryAPI.getSubcategoryDeleteInfo(categoryId, sub._id);
      setDeleteSubInfo(info.data);
      setSubToDelete(sub);
      setShowDeleteSubConfirm(true);
    } catch (error) {
      toast.error('Failed to get subcategory info');
    }
  };

  // ✅ NEW: Actually delete subcategory
  const handleDeleteSubcategoryConfirm = async () => {
    try {
      await categoryAPI.deleteSubcategory(categoryId, subToDelete._id);
      toast.success('Subcategory deleted! Files moved to trash.');
      setShowDeleteSubConfirm(false);
      setSubToDelete(null);
      loadCategory();
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete subcategory');
    }
  };

  if (loading || !category) {
    return (
      <div className="page">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <Breadcrumb items={[
        { name: 'Home', icon: '🏠', path: '/dashboard' },
        { name: 'Categories', icon: '📁', path: '/folders' },
        { name: category.name, icon: category.icon }
      ]} />

      <div className="page-header">
        <div className="header-with-icon">
          <span className="header-icon">{category.icon}</span>
          <div>
            <h1 className="page-title">{category.name}</h1>
            <span className="page-subtitle-inline">{category.nameHindi}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowEditModal(true)}>✏️ Edit</button>
          <button className="btn-danger" onClick={handleDeleteCategoryClick}>🗑️ Delete</button>
        </div>
      </div>

      {/* Add Subcategory Button */}
      <button
        className="quick-upload-zone"
        onClick={() => setShowAddSubModal(true)}
      >
        <span className="quick-icon">➕</span>
        <span>Add New Subcategory to {category.name}</span>
      </button>

      {/* Subcategories List */}
      <div className="subcategories-grid">
        {category.subcategories?.map(sub => (
          <div key={sub._id} className="subcategory-card">
            <div
              className="subcategory-main"
              onClick={() => navigate(`/category/${categoryId}/${sub._id}`)}
            >
              <div className="subcategory-folder">📂</div>
              <div className="subcategory-info">
                <h4>{sub.name}</h4>
                <span className="subcategory-hindi">{sub.nameHindi}</span>
              </div>
              <div className="subcategory-meta">
                <span className="file-count-badge">{getFileCount(sub._id)} files</span>
              </div>
            </div>
            <button
              className="subcategory-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSubcategoryClick(sub);
              }}
            >
              🗑️
            </button>
          </div>
        ))}

        {category.subcategories?.length === 0 && (
          <div className="empty-state small">
            <p>No subcategories yet. Click above to add one!</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSubcategoryModal
        isOpen={showAddSubModal}
        onClose={() => setShowAddSubModal(false)}
        categoryName={category.name}
        onSubmit={handleAddSubcategory}
      />

      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        category={category}
        onSubmit={handleEditCategory}
      />

      {/* ✅ Delete Category Confirmation */}
      <ConfirmModal
        isOpen={showDeleteCategoryConfirm}
        onClose={() => setShowDeleteCategoryConfirm(false)}
        onConfirm={handleDeleteCategoryConfirm}
        title={`Delete "${deleteInfo?.category?.name}"?`}
        message="This will delete the category and all its subcategories."
        details={deleteInfo ? [
          { icon: '📂', text: 'Subcategories', count: deleteInfo.subcategoryCount },
          { icon: '🖼️', text: 'Files (will move to trash)', count: deleteInfo.totalFileCount }
        ] : []}
        confirmText="🗑️ Delete Category"
        type="danger"
      />

      {/* ✅ Delete Subcategory Confirmation */}
      <ConfirmModal
        isOpen={showDeleteSubConfirm}
        onClose={() => setShowDeleteSubConfirm(false)}
        onConfirm={handleDeleteSubcategoryConfirm}
        title={`Delete "${deleteSubInfo?.subcategory?.name}"?`}
        message="This will delete the subcategory and move all files to trash."
        details={deleteSubInfo ? [
          { icon: '🖼️', text: 'Files (will move to trash)', count: deleteSubInfo.fileCount }
        ] : []}
        confirmText="🗑️ Delete Subcategory"
        type="danger"
      />
    </div>
  );
}
// ========== FILES PAGE ==========
function FilesPage({ categories, files, onDelete, onRefresh }) {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showEditFile, setShowEditFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const category = categories.find(c => c._id === categoryId);
  const subcategory = category?.subcategories?.find(s => s._id === subcategoryId);

  let filteredFiles = files.filter(f => f.subcategoryId === subcategoryId);

  if (searchQuery) {
    filteredFiles = filteredFiles.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (!category || !subcategory) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">❓</div>
          <h3>Not found</h3>
          <button className="btn-primary" onClick={() => navigate('/folders')}>Go Back</button>
        </div>
      </div>
    );
  }

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setShowLightbox(true);
  };

  const handleEditFile = (file) => {
    setSelectedFile(file);
    setShowEditFile(true);
    setShowLightbox(false);
  };

  const handleSaveFile = async (data) => {
    try {
      await fileAPI.update(selectedFile._id, data);
      onRefresh();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteFile = (file) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
    setShowLightbox(false);
  };
  const confirmDeleteFile = async () => {
    try {
      await fileAPI.moveToTrash(fileToDelete._id);
      toast.success('Moved to trash');
      setShowDeleteConfirm(false);
      setFileToDelete(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f._id));
    }
  };

  const handleMultiDelete = () => {
    if (selectedFiles.length === 0) return;
    setShowMultiDeleteConfirm(true);
  };

  const confirmMultiDelete = async () => {
    try {
      for (const fileId of selectedFiles) {
        await fileAPI.moveToTrash(fileId);
      }
      toast.success(`Moved ${selectedFiles.length} files to trash`);
      setShowMultiDeleteConfirm(false);
      setSelectedFiles([]);
      setSelectionMode(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete some files');
    }
  };
  return (
    <div className="page">
      <Breadcrumb items={[
        { name: 'Home', icon: '🏠', path: '/dashboard' },
        { name: 'Categories', icon: '📁', path: '/folders' },
        { name: category.name, icon: category.icon, path: `/category/${categoryId}` },
        { name: subcategory.name, icon: '📂' }
      ]} />

      <div className="page-header">
        <div className="header-with-icon">
          <span className="header-icon">📂</span>
          <div>
            <h1 className="page-title">{subcategory.name}</h1>
            <span className="page-subtitle-inline">{subcategory.nameHindi}</span>
          </div>
        </div>
        <div className="header-actions">
          {selectionMode && (
            <div className="selection-controls">
              <button className="btn-secondary" onClick={handleSelectAll}>
                {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedFiles.length > 0 && (
                <button className="btn-danger" onClick={handleMultiDelete}>
                  🗑️ Delete Selected ({selectedFiles.length})
                </button>
              )}
              <button className="btn-secondary" onClick={() => { setSelectionMode(false); setSelectedFiles([]); }}>
                Cancel
              </button>
            </div>
          )}
          {!selectionMode && (
            <>
              {filteredFiles.length > 0 && (
                <button className="btn-secondary" onClick={() => setSelectionMode(true)}>
                  ☑️ Select Multiple
                </button>
              )}
              <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
                📤 Upload
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={`Search in ${subcategory.name}...`}
      />

      {/* Quick Upload */}
      <div
        className="quick-upload-zone"
        onClick={() => setShowUploadModal(true)}
      >
        <span className="quick-icon">⚡</span>
        <span>Quick Upload to {subcategory.name}</span>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="file-grid">
          {filteredFiles.map(file => (
            <FileCard
              key={file._id}
              file={file}
              onView={handleViewFile}
              onEdit={handleEditFile}
              onDelete={handleDeleteFile}
              isSelected={selectedFiles.includes(file._id)}
              onSelect={handleSelectFile}
              showCheckbox={selectionMode}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>{searchQuery ? 'No files found' : 'No files yet'}</h3>
          <p>{searchQuery ? `No matches for "${searchQuery}"` : `Upload images to ${subcategory.name}`}</p>
          {!searchQuery && (
            <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
              📤 Upload Files
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        categories={categories}
        onUpload={onRefresh}
        preSelectedCategory={categoryId}
        preSelectedSubcategory={subcategoryId}
      />

      {showLightbox && (
        <ImageLightbox
          file={selectedFile}
          onClose={() => setShowLightbox(false)}
          onEdit={handleEditFile}
          onDelete={handleDeleteFile}
        />
      )}

      <EditFileModal
        file={selectedFile}
        isOpen={showEditFile}
        onClose={() => setShowEditFile(false)}
        onSave={handleSaveFile}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteFile}
        title={`Delete "${fileToDelete?.name}"?`}
        message="This file will be moved to trash."
        confirmText="🗑️ Move to Trash"
        type="warning"
      />

      <ConfirmModal
        isOpen={showMultiDeleteConfirm}
        onClose={() => setShowMultiDeleteConfirm(false)}
        onConfirm={confirmMultiDelete}
        title={`Delete ${selectedFiles.length} files?`}
        message="These files will be moved to trash."
        details={[{ icon: '🖼️', text: 'Files to be deleted', count: selectedFiles.length }]}
        confirmText="🗑️ Move to Trash"
        type="warning"
      />
    </div>


  );
}

// ========== TRASH PAGE ==========
function TrashPage({ onRefresh }) {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const loadTrash = async () => {
    try {
      const data = await fileAPI.getTrash();
      setTrashedFiles(data.data || []);
    } catch (error) {
      toast.error('Failed to load trash');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (file) => {
    try {
      await fileAPI.restore(file._id);
      toast.success('File restored!');
      loadTrash();
      onRefresh();
    } catch (error) {
      toast.error('Failed to restore file');
    }
  };

  const handleDeletePermanent = async (file) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePermanent = async () => {
    try {
      await fileAPI.deletePermanent(fileToDelete._id);
      toast.success('File deleted permanently');
      setShowDeleteConfirm(false);
      setFileToDelete(null);
      loadTrash();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const confirmEmptyTrash = async () => {
    try {
      for (const file of trashedFiles) {
        await fileAPI.deletePermanent(file._id);
      }
      toast.success('Trash emptied!');
      setShowEmptyTrashConfirm(false);
      loadTrash();
    } catch (error) {
      toast.error('Failed to empty trash');
    }
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === trashedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(trashedFiles.map(f => f._id));
    }
  };

  const handleMultiDelete = () => {
    if (selectedFiles.length === 0) return;
    setShowMultiDeleteConfirm(true);
  };

  const confirmMultiDelete = async () => {
    try {
      for (const fileId of selectedFiles) {
        await fileAPI.deletePermanent(fileId);
      }
      toast.success(`Permanently deleted ${selectedFiles.length} files`);
      setShowMultiDeleteConfirm(false);
      setSelectedFiles([]);
      setSelectionMode(false);
      loadTrash();
    } catch (error) {
      toast.error('Failed to delete some files');
    }
  };

  const handleEmptyTrash = async () => {
    setShowEmptyTrashConfirm(true);
  };

  return (
    <div className="page">
      <Breadcrumb items={[
        { name: 'Home', icon: '🏠', path: '/dashboard' },
        { name: 'Trash', icon: '🗑️' }
      ]} />

      <div className="page-header">
        <h1 className="page-title">🗑️ Trash</h1>
        <div className="header-actions">
          {selectionMode && (
            <div className="selection-controls">
              <button className="btn-secondary" onClick={handleSelectAll}>
                {selectedFiles.length === trashedFiles.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedFiles.length > 0 && (
                <button className="btn-danger" onClick={handleMultiDelete}>
                  🗑️ Delete Selected ({selectedFiles.length})
                </button>
              )}
              <button className="btn-secondary" onClick={() => { setSelectionMode(false); setSelectedFiles([]); }}>
                Cancel
              </button>
            </div>
          )}
          {!selectionMode && trashedFiles.length > 0 && (
            <>
              <button className="btn-secondary" onClick={() => setSelectionMode(true)}>
                ☑️ Select Multiple
              </button>
              <button className="btn-danger" onClick={handleEmptyTrash}>
                🗑️ Empty Trash
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : trashedFiles.length > 0 ? (
        <div className="file-grid">
          {trashedFiles.map(file => (
            <div key={file._id} className={`file-card trashed ${selectedFiles.includes(file._id) ? 'selected' : ''}`}>
              {selectionMode && (
                <div className="file-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file._id)}
                    onChange={(e) => { e.stopPropagation(); handleSelectFile(file._id); }}
                  />
                </div>
              )}
              <div className="file-preview">
                {file.thumbnailUrl ? (
                  <img src={file.thumbnailUrl} alt={file.name} />
                ) : (
                  <span>🖼️</span>
                )}
              </div>
              <div className="file-actions show">
                <button className="action-btn restore" onClick={() => handleRestore(file)}>↩️</button>
                <button className="action-btn delete" onClick={() => handleDeletePermanent(file)}>❌</button>
              </div>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🗑️</div>
          <h3>Trash is Empty</h3>
          <p>Deleted files will appear here</p>
        </div>
      )}
      
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmDeletePermanent}
        title={`Permanently delete "${fileToDelete?.name}"?`}
        message="This action cannot be undone. The file will be permanently removed."
        confirmText="🗑️ Delete Permanently"
        type="danger"
      />

      <ConfirmModal
        isOpen={showEmptyTrashConfirm}
        onClose={() => setShowEmptyTrashConfirm(false)}
        onConfirm={confirmEmptyTrash}
        title="Empty Trash?"
        message={`Permanently delete all ${trashedFiles.length} files in trash? This action cannot be undone.`}
        details={trashedFiles.length > 0 ? [{ icon: '🖼️', text: 'Files to be deleted', count: trashedFiles.length }] : null}
        confirmText="🗑️ Empty Trash"
        type="danger"
      />

      <ConfirmModal
        isOpen={showMultiDeleteConfirm}
        onClose={() => setShowMultiDeleteConfirm(false)}
        onConfirm={confirmMultiDelete}
        title={`Permanently delete ${selectedFiles.length} files?`}
        message="This action cannot be undone. The files will be permanently removed."
        details={[{ icon: '🖼️', text: 'Files to be deleted', count: selectedFiles.length }]}
        confirmText="🗑️ Delete Permanently"
        type="danger"
      />
    </div>
  );
}

// ========== SETTINGS PAGE ==========
function SettingsPage({ user, onLogout }) {
  return (
    <div className="page">
      <Breadcrumb items={[
        { name: 'Home', icon: '🏠', path: '/dashboard' },
        { name: 'Settings', icon: '⚙️' }
      ]} />

      <h1 className="page-title">⚙️ Settings</h1>

      <div className="settings-list">
        <div className="settings-card">
          <div className="settings-icon">👤</div>
          <div className="settings-info">
            <h3>{user?.name || 'User'}</h3>
            <p>{user?.email || ''}</p>
          </div>
        </div>

        <div className="settings-card" onClick={onLogout} style={{ cursor: 'pointer' }}>
          <div className="settings-icon">🚪</div>
          <div className="settings-info">
            <h3>Logout</h3>
            <p>Sign out of your account</p>
          </div>
          <span className="settings-arrow">→</span>
        </div>
      </div>
    </div>
  );
}

// ========== SIDEBAR ==========
function Sidebar({ isOpen, onClose, user }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="logo">🛋️</div>
            <h2>श्रीFurniture</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <nav className="nav-menu">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </NavLink>

          <NavLink to="/folders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon">📁</span>
            <span className="nav-text">Categories</span>
          </NavLink>

          <NavLink to="/trash" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon">🗑️</span>
            <span className="nav-text">Trash</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ========== BOTTOM NAV ==========
function BottomNav({ onUploadClick }) {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-text">Home</span>
      </NavLink>

      <NavLink to="/folders" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <span className="bottom-nav-icon">📁</span>
        <span className="bottom-nav-text">Categories</span>
      </NavLink>

      <button className="bottom-nav-item upload-fab" onClick={onUploadClick}>
        <span className="fab-icon">➕</span>
      </button>

      <NavLink to="/trash" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🗑️</span>
        <span className="bottom-nav-text">Trash</span>
      </NavLink>

      <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <span className="bottom-nav-icon">⚙️</span>
        <span className="bottom-nav-text">Settings</span>
      </NavLink>
    </nav>
  );
}

// ========== LAYOUT ==========
function Layout({ children, user, onUploadClick }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div className="brand-mobile">
              <span>🛋️</span>
              <span>श्रीFurniture</span>
            </div>
          </div>

          <div className="topbar-right">
            <button className="btn-primary desktop-only" onClick={onUploadClick}>
              ➕ Upload
            </button>
          </div>
        </header>

        <div className="content-area">
          {children}
        </div>
      </main>

      <BottomNav onUploadClick={onUploadClick} />
    </div>
  );
}

// ========== PROTECTED ROUTE ==========
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ========== MAIN APP ==========
function App() {
  const [user, setUser] = useState(authAPI.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authAPI.isAuthenticated());
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalUploadOpen, setGlobalUploadOpen] = useState(false);

  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const [catData, fileData] = await Promise.all([
        categoryAPI.getAll(),
        fileAPI.getAll()
      ]);
      setCategories(catData.data || []);
      setFiles(fileData.data || []);
    } catch (error) {
      console.error('Load data error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCategories([]);
    setFiles([]);
  };

  const handleAddCategory = async (data) => {
    await categoryAPI.create(data);
    loadData();
  };

  const handleDelete = async (file) => {
    if (!window.confirm('Move this file to trash?')) return;

    try {
      await fileAPI.moveToTrash(file._id);
      toast.success('Moved to trash');
      loadData();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  if (loading && isAuthenticated) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
        } />
        {/* <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage onLogin={handleLogin} />
        } /> */}

        <Route path="/" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onUploadClick={() => setGlobalUploadOpen(true)}>
              <Dashboard categories={categories} files={files} onRefresh={loadData} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onUploadClick={() => setGlobalUploadOpen(true)}>
              <Dashboard categories={categories} files={files} onRefresh={loadData} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/folders" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onUploadClick={() => setGlobalUploadOpen(true)}>
              <CategoriesPage categories={categories} onAddCategory={handleAddCategory} onRefresh={loadData} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/category/:categoryId" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onUploadClick={() => setGlobalUploadOpen(true)}>
              <CategoryDetailPage categories={categories} files={files} onRefresh={loadData} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/category/:categoryId/:subcategoryId" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onUploadClick={() => setGlobalUploadOpen(true)}>
              <FilesPage categories={categories} files={files} onDelete={handleDelete} onRefresh={loadData} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/trash" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onUploadClick={() => setGlobalUploadOpen(true)}>
              <TrashPage onRefresh={loadData} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onUploadClick={() => setGlobalUploadOpen(true)}>
              <SettingsPage user={user} onLogout={handleLogout} />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>

      {isAuthenticated && (
        <UploadModal
          isOpen={globalUploadOpen}
          onClose={() => setGlobalUploadOpen(false)}
          categories={categories}
          onUpload={loadData}
        />
      )}

      <ToastContainer position="top-center" autoClose={2000} theme="colored" />
    </BrowserRouter>
  );
}

export default App;