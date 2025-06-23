import React, { useEffect } from 'react';
import './IFrameModal.css';
import { isUrlAllowed } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';

interface IFrameModalProps {
  isOpen: boolean;
  url: string;
  title: string;
  onClose: () => void;
}

const IFrameModal: React.FC<IFrameModalProps> = ({ isOpen, url, title, onClose }) => {
  const { theme } = useTheme();

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
    return (
      <div className="iframe-modal-overlay" onClick={onClose}>
        <div className={`iframe-modal-container ${theme}`} onClick={(e) => e.stopPropagation()}>
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
      <div className={`iframe-modal-container ${theme}`} onClick={(e) => e.stopPropagation()}>
        <div className="iframe-modal-header">
          <h3>{title}</h3>
          <div className="iframe-modal-controls">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="iframe-modal-external-link"
              title="Open in new tab"
              aria-label="Open in new tab"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
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