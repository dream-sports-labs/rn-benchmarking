import React, { useEffect } from 'react';
import './IFrameModal.css';
import { isUrlAllowed } from '../../utils';

interface IFrameModalProps {
  isOpen: boolean;
  url: string;
  title: string;
  onClose: () => void;
}

const IFrameModal: React.FC<IFrameModalProps> = ({ isOpen, url, title, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Check if URL is allowed
  if (!isUrlAllowed(url)) {
    console.error('Invalid URL or domain not allowed:', url);
    return (
      <div className="iframe-modal-overlay" onClick={onClose}>
        <div className="iframe-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="iframe-modal-header">
            <h3>Error</h3>
            <button 
              className="iframe-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="iframe-modal-content">
            <p>Sorry, this content cannot be displayed for security reasons.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="iframe-modal-overlay" onClick={onClose}>
      <div className="iframe-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="iframe-modal-header">
          <h3>{title}</h3>
          <div className="iframe-modal-controls">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="iframe-modal-external-link"
              title="Open in new tab"
            >
              🔗
            </a>
            <button 
              className="iframe-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="iframe-modal-content">
          <iframe
            src={url}
            title={title}
            className="iframe-modal-frame"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer"
            loading="lazy"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
};

export default IFrameModal; 