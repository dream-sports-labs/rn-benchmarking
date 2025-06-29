import React, { useState } from 'react';
import './IFrameModal.css';
import { isUrlAllowed } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';
import { renderLibraryComparison } from '../otherBenchmarks/OtherBenchmarks';

interface IFrameModalProps {
  isOpen: boolean;
  url: string;
  title: string;
  onClose: () => void;
  description: string;
  repoUrl: string;
  libraries?: Array<{
    name: string;
    version: string;
    url: string;
  }>;
}

const IFrameModal: React.FC<IFrameModalProps> = ({ isOpen, url, title, onClose, description, repoUrl, libraries }) => {
  const { theme } = useTheme();
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);

  if (!isOpen) return null;

  // Check if URL is allowed
  if (!isUrlAllowed(url)) {
    return (
      <div className="iframe-modal-overlay" onClick={onClose}>
        <div className={`iframe-modal-container ${theme}`}>
          <div className="iframe-modal-header">
            <h3>Error</h3>
            <button 
              className="iframe-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
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
      <div className={`iframe-modal-container ${theme}`} onClick={e => e.stopPropagation()}>
        <div className="iframe-modal-header">
          <div className="iframe-modal-header-content">
            <div className="iframe-modal-title">
              <div className="iframe-modal-title-row">
                <h3>{title}</h3>
              </div>
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
                <a 
                  href={repoUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="iframe-modal-external-link"
                  title="View on GitHub"
                  aria-label="View on GitHub"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" stroke="none" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                  </svg>
                </a>
                <button 
                  className="iframe-modal-close"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="modal-description-container">
              <p className="modal-description">{description}</p>
              <button className="dropdown-toggle" onClick={() => setShowDescription(!showDescription)}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={showDescription ? 'up' : ''}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            {showDescription && libraries && libraries.length > 0 && (
              <div className="libraries-content">
                {renderLibraryComparison(libraries, libraries.length === 1 ? 'single' : 'multiple')}
              </div>
            )}
          </div>
        </div>
        <div className="iframe-modal-content">
          {isIframeLoading && (
            <div className="iframe-loader">
              <div className="loader-spinner">
                <svg width="40" height="40" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="12" cy="12" r="10" strokeDasharray="42" strokeLinecap="round">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </div>
              <p>Loading benchmark data...</p>
            </div>
          )}
          <iframe
            src={url}
            title={title}
            className={`iframe-modal-frame ${isIframeLoading ? 'loading' : 'loaded'}`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer"
            loading="lazy"
            allow="fullscreen"
            onError={() => setIsIframeLoading(false)}
            onLoad={() => setIsIframeLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default IFrameModal; 