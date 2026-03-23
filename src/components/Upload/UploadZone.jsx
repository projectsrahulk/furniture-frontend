import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './UploadZone.css';

const UploadZone = () => {
  const onDrop = useCallback(acceptedFiles => {
    console.log("Files dropped:", acceptedFiles);
    // Logic will connect here
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div 
      {...getRootProps()} 
      className={`spartan-upload-zone ${isDragActive ? 'active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="upload-content">
        <div className="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>
        <h3>Drop your assets here</h3>
        <p>High-res images. WebP, PNG, JPG (Max 10MB)</p>
      </div>
    </div>
  );
};

export default UploadZone;