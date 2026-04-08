import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { fileAPI } from '../../services/api';
import FileCard from './FileCard';
import ImageGalleryModal from '../Modal/ImageGalleryModal';
import { toast } from 'react-toastify';
import './Catalog.css';

const FileGrid = ({ folderId, searchQuery, refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const loadFiles = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const { data } = await fileAPI.getAll({
        folderId: folderId || 'all',
        search: searchQuery,
        page: pageNum,
        limit: 20
      });

      if (reset) {
        setFiles(data.files);
      } else {
        setFiles((prev) => [...prev, ...data.files]);
      }

      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [folderId, searchQuery]);

  useEffect(() => {
    loadFiles(1, true);
  }, [folderId, searchQuery, refreshTrigger, loadFiles]);

  const handleOpenGallery = (fileId) => {
    const index = files.findIndex((f) => f._id === fileId);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

  const handleCloseGallery = () => {
    setSelectedImageIndex(null);
  };

  const fetchMoreData = () => {
    loadFiles(page + 1, false);
  };

  if (loading && page === 1) {
    return <div className="loading">Loading files...</div>;
  }

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <p>No files found. Upload some images to get started!</p>
      </div>
    );
  }

  return (
    <>
      <InfiniteScroll
        dataLength={files.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<div className="loading">Loading more...</div>}
        endMessage={<p className="end-message">You've seen all files!</p>}
      >
        <div className="file-grid">
          {files.map((file) => (
            <FileCard
              key={file._id}
              file={file}
              onOpenGallery={handleOpenGallery}
            />
          ))}
        </div>
      </InfiniteScroll>

      {selectedImageIndex !== null && (
        <ImageGalleryModal
          images={files}
          initialIndex={selectedImageIndex}
          onClose={handleCloseGallery}
        />
      )}
    </>
  );
};

export default FileGrid;