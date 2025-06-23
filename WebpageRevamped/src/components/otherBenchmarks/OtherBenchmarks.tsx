import React, { useEffect, useState } from 'react';
import './OtherBenchmarks.css';
import { BENCHMARKS, BenchmarkItem } from '../../constants/benchmarks';
import { isUrlAllowed } from '../../utils';
import { useIsMobile } from '../../hooks/useIsMobile';
import IFrameModal from '../iFrameModal/IFrameModal';
import { SnackbarAlert } from '../SnackbarAlert/SnackbarAlert';

const renderLibraryComparison = (libraries: Array<{ name: string; version: string; url: string }>, type: 'single' | 'multiple') => {
  if (!libraries || libraries.length === 0) return null;

  return (
    <div className="library-items">
      <span className="library-label">{type === 'single' ? 'Version:' : 'Libraries:'}</span>
      {libraries.map((lib, index) => (
        <React.Fragment key={lib.name + lib.version}>
          <a 
            href={lib.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="library-link"
            title={`View ${lib.name} documentation`}
          >
            <span className="library-name">{lib.name}</span>
            <span className="library-version">{lib.version}</span>
          </a>
          {index < libraries.length - 1 && <span className="library-vs">vs</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

const OtherBenchmarks: React.FC = () => {
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Only set default benchmark on desktop
  const defaultBenchmark = isMobile ? null : (BENCHMARKS.find(b => b.benchmarkUrl) || BENCHMARKS[0]);
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkItem | null>(defaultBenchmark);

  useEffect(() => {
    if (isMobile) {
      setSelectedBenchmark(null);
    } else {
      setSelectedBenchmark(BENCHMARKS.find(b => b.benchmarkUrl) || BENCHMARKS[0]);
    }
  }, [isMobile]);

  const handleBenchmarkSelect = (benchmark: BenchmarkItem) => {
    if (isMobile && !benchmark.benchmarkUrl) {
      setShowToast(true);
      return;
    }
    
    setSelectedBenchmark(benchmark);
    if (isMobile && benchmark.benchmarkUrl) {
      setIsModalOpen(true);
    }
  };

  const handleViewInNewTab = () => {
    if (selectedBenchmark?.benchmarkUrl) {
      window.open(selectedBenchmark.benchmarkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewRepository = () => {
    if (selectedBenchmark?.repoUrl) {
      window.open(selectedBenchmark.repoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="other-benchmarks-container">
      {/* Side Navigation */}
      <div className="benchmarks-sidebar">
        <div className="sidebar-header">
          <h3>Performance Benchmarks for Libraries</h3>
          <p>Select a benchmark to view</p>
        </div>
        
        <div className="benchmarks-list">
          {BENCHMARKS.map((benchmark) => (
            <div 
              key={benchmark.id}
              className={`benchmark-item ${selectedBenchmark?.id === benchmark.id ? 'active' : ''}`}
              onClick={() => handleBenchmarkSelect(benchmark)}
            >
              <div className="benchmark-item-header">
                <div className="benchmark-item-icon">{benchmark.icon}</div>
                <div className="benchmark-item-category">{benchmark.category}</div>
              </div>
              <div className="benchmark-item-content">
                <h4>{benchmark.title}</h4>
                <p>{benchmark.description}</p>
              </div>
              <div className="benchmark-item-status">
                {benchmark.benchmarkUrl ? (
                  <span className="status-available">Available</span>
                ) : (
                  <span className="status-coming-soon">Coming Soon</span>
                )}
              </div>
            </div>
          ))}
          <div className="benchmark-item-footer"></div>
        </div>
      </div>

      {/* Main Content Area - Only show on desktop and when benchmark is selected */}
      {!isMobile && selectedBenchmark && (
        <div className="benchmarks-main">
          <div className="benchmark-viewer-header">
            <div className="viewer-info">
              <div className="viewer-title-row">
                <h2>{selectedBenchmark.title}</h2>
                {selectedBenchmark.libraries && renderLibraryComparison(selectedBenchmark.libraries, selectedBenchmark.type)}
              </div>
              <p>{selectedBenchmark.description}</p>
            </div>
            <div className="viewer-actions">
              <button 
                className="viewer-btn viewer-btn-secondary"
                onClick={handleViewRepository}
                disabled={!selectedBenchmark.repoUrl}
                title="View Repository"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </button>
              <button 
                className="viewer-btn viewer-btn-primary"
                onClick={handleViewInNewTab}
                disabled={!selectedBenchmark.benchmarkUrl}
                title="Open in New Tab"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="benchmark-iframe-container">
            {selectedBenchmark.benchmarkUrl && isUrlAllowed(selectedBenchmark.benchmarkUrl) ? (
              <iframe
                src={selectedBenchmark.benchmarkUrl}
                title={selectedBenchmark.title}
                className="benchmark-iframe"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                referrerPolicy="no-referrer"
                allow="fullscreen"
                loading="lazy"
              />
            ) : (
              <div className="benchmark-placeholder">
                {!selectedBenchmark.benchmarkUrl ? (
                  <div className="placeholder-content">
                    <div className="placeholder-icon">{selectedBenchmark.icon}</div>
                    <h3>Benchmark Coming Soon</h3>
                    <p>This benchmark is currently under development and will be available soon.</p>
                    {selectedBenchmark.repoUrl && (
                      <button 
                        className="placeholder-btn"
                        onClick={handleViewRepository}
                      >
                        View Repository
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="placeholder-content">
                    <h3>Content Unavailable</h3>
                    <p>We're unable to display this content at the moment. Please try again later.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* IFrame Modal for Mobile */}
      {isMobile && selectedBenchmark && (
        <IFrameModal
          isOpen={isModalOpen}
          url={selectedBenchmark.benchmarkUrl || ''}
          title={selectedBenchmark.title}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBenchmark(null);
          }}
        />
      )}

      {/* Toast for Coming Soon on Mobile */}
      {isMobile && (
          <SnackbarAlert
            open={showToast}
            handleClose={() => setShowToast(false)}
            snackbarMessage="This benchmark is coming soon. Please check back later."
            severity='info'
          />
      )}
    </div>
  );
};

export default OtherBenchmarks; 