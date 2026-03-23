import React from 'react';
import './Upload.css';

const UploadProgress = ({ upload }) => {
  return (
    <div className="upload-item">
      <div className="upload-info">
        <span className="upload-name">{upload.name}</span>
        <span className="upload-percent">{upload.progress}%</span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${upload.status}`}
          style={{ width: `${upload.progress}%` }}
        />
      </div>
      {upload.status === 'failed' && (
        <span className="upload-error">Upload failed</span>
      )}
      {upload.status === 'completed' && (
        <span className="upload-success">✓ Completed</span>
      )}
    </div>
  );
};

export default UploadProgress;