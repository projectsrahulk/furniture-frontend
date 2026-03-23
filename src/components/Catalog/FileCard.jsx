
import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './Catalog.css';

const FileCard = ({ file, onDelete, onRestore, isTrash, isSelected, onSelect, showCheckbox }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`file-card ${isSelected ? 'selected' : ''}`}>
      {showCheckbox && (
        <div className="file-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onSelect(file._id); }}
          />
        </div>
      )}
      <div className="file-image-wrapper">
        <LazyLoadImage
          src={file.previewUrl || file.url}
          placeholderSrc={file.thumbnailUrl}
          alt={file.name}
          effect="blur"
          className="file-image"
          afterLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && <div className="image-skeleton" />}
      </div>

      <div className="file-info">
        <h4 className="file-name">{file.name}</h4>
        {file.description && (
          <p className="file-description">{file.description}</p>
        )}
        <div className="file-meta">
          <span className="file-size">
            {(file.size / 1024).toFixed(2)} KB
          </span>
          <span className="file-date">
            {new Date(file.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="file-actions">
        {isTrash ? (
          <>
            <button
              className="btn-icon restore"
              onClick={() => onRestore(file._id)}
              title="Restore"
            >
              ↺
            </button>
            <button
              className="btn-icon delete"
              onClick={() => onDelete(file._id)}
              title="Delete Permanently"
            >
              🗑️
            </button>
          </>
        ) : (
          <>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon view"
              title="View Full Size"
            >
              👁️
            </a>
            <button
              className="btn-icon trash"
              onClick={() => onDelete(file._id)}
              title="Move to Trash"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileCard;