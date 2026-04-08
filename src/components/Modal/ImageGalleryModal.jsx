import React, { useState, useEffect, useCallback } from 'react';
import './ImageGalleryModal.css';

const ImageGalleryModal = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [touchStart, setTouchStart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentImage = images[currentIndex];

  // Navigate to next image
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Navigate to previous image
  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  // Handle touch/swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe left to next, swipe right to prev
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      goToPrev();
    }

    setTouchStart(null);
  };

  return (
    <div
      className="image-gallery-modal"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop */}
      <div className="gallery-backdrop" onClick={onClose} />

      {/* Gallery Container */}
      <div className="gallery-container">
        {/* Close Button */}
        <button className="gallery-close" onClick={onClose} title="Close (Esc)">
          ✕
        </button>

        {/* Image Frame */}
        <div className="gallery-frame">
          {isLoading && <div className="gallery-loading">Loading...</div>}
          <img
            src={currentImage.previewUrl || currentImage.url}
            alt={currentImage.name}
            className="gallery-image"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              className="gallery-arrow gallery-prev"
              onClick={goToPrev}
              title="Previous (← Arrow Key)"
              aria-label="Previous image"
            >
              ❮
            </button>
            <button
              className="gallery-arrow gallery-next"
              onClick={goToNext}
              title="Next (→ Arrow Key)"
              aria-label="Next image"
            >
              ❯
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="gallery-counter">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Image Info */}
        <div className="gallery-info">
          <div className="gallery-title">{currentImage.name}</div>
          {currentImage.description && (
            <div className="gallery-description">{currentImage.description}</div>
          )}
          <div className="gallery-meta">
            <span>{(currentImage.size / 1024).toFixed(2)} KB</span>
            <span>
              {new Date(currentImage.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Thumbnails Strip (for galleries with multiple images) */}
        {images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((img, idx) => (
              <button
                key={img._id}
                className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                title={img.name}
              >
                <img
                  src={img.thumbnailUrl || img.url}
                  alt={img.name}
                />
              </button>
            ))}
          </div>
        )}

        {/* Keyboard hints */}
        <div className="gallery-hints">
          <span>← → or Swipe to navigate</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;
