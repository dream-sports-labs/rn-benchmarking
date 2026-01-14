import React, { useEffect, useState } from 'react';
import './OtherBenchmarks.css';
import { BENCHMARKS, BenchmarkItem } from '../../constants/benchmarks';
import { useIsMobile } from '../../hooks/useIsMobile';
import IFrameModal from '../iFrameModal/IFrameModal';
import { SnackbarAlert } from '../SnackbarAlert/SnackbarAlert';
import { GitHubIcon, ExternalLinkIcon, ChartIcon, CheckIcon, ClockIcon } from '../ui/Icons';

// Icon mapping based on benchmark type
const BenchmarkIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 20 }) => {
  const iconMap: Record<string, React.ReactNode> = {
    navigation: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
    tabs: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
      </svg>
    ),
    component: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    webview: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    modules: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  };
  
  return <>{iconMap[type] || <ChartIcon size={size} />}</>;
};

export const renderLibraryComparison = (libraries: Array<{ name: string; version: string; url: string }>, type: 'single' | 'multiple') => {
  if (libraries.length === 0) return null;

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
  const [isIframeLoading, setIsIframeLoading] = useState(true);

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
    setIsIframeLoading(true);
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

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };

  const showList = isMobile && selectedBenchmark?.id;

  return (
    <div className="other-benchmarks-container">
      {/* Side Navigation */}
      <div className="benchmarks-sidebar">
        <div className="sidebar-header">
          <h3>Library Benchmarks</h3>
          <p>Select a benchmark to view performance data</p>
        </div>
        
        <div className="benchmarks-list">
          {showList || BENCHMARKS.map((benchmark) => (
            <div 
              key={benchmark.id}
              className={`benchmark-item ${selectedBenchmark?.id === benchmark.id ? 'clicked' : ''} ${!benchmark.benchmarkUrl ? 'benchmark-item--disabled' : ''}`}
              onClick={() => handleBenchmarkSelect(benchmark)}
            >
              <div className="benchmark-item-icon-wrapper">
                <BenchmarkIcon type={benchmark.iconType} size={18} />
              </div>
              <div className="benchmark-item-content">
                <div className="benchmark-item-header">
                  <h4>{benchmark.title}</h4>
                  <span className="benchmark-item-category">{benchmark.category}</span>
                </div>
                <p>{benchmark.description}</p>
              </div>
              <div className="benchmark-item-status">
                {benchmark.benchmarkUrl ? (
                  <span className="status-available">
                    <CheckIcon size={12} />
                    <span>Available</span>
                  </span>
                ) : (
                  <span className="status-coming-soon">
                    <ClockIcon size={12} />
                    <span>Soon</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area - Only show on desktop and when benchmark is selected */}
      {!isMobile && selectedBenchmark && (
        <div className="benchmarks-main">
          <div className="benchmark-viewer-header">
            <div className="viewer-info">
              <div className="viewer-title-row">
                <div className="viewer-icon">
                  <BenchmarkIcon type={selectedBenchmark.iconType} size={24} />
                </div>
                <div className="viewer-title-content">
                  <h2>{selectedBenchmark.title}</h2>
                  <p>{selectedBenchmark.description}</p>
                </div>
              </div>
              {selectedBenchmark.libraries && selectedBenchmark.libraries.length > 0 && 
                renderLibraryComparison(selectedBenchmark.libraries!, selectedBenchmark.type || 'multiple')
              }
            </div>
            <div className="viewer-actions">
              <button 
                className="viewer-btn viewer-btn-secondary"
                onClick={handleViewRepository}
                disabled={!selectedBenchmark.repoUrl}
                title="View Repository"
              >
                <GitHubIcon size={18} />
                <span>Repository</span>
              </button>
              <button 
                className="viewer-btn viewer-btn-primary"
                onClick={handleViewInNewTab}
                disabled={!selectedBenchmark.benchmarkUrl}
                title="Open in New Tab"
              >
                <ExternalLinkIcon size={18} />
                <span>Open</span>
              </button>
            </div>
          </div>
          
          <div className="benchmark-iframe-container">
            {selectedBenchmark.benchmarkUrl ? (
              <>
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
                  src={selectedBenchmark.benchmarkUrl}
                  title={selectedBenchmark.title}
                  className={`benchmark-iframe ${isIframeLoading ? 'loading' : 'loaded'}`}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  referrerPolicy="no-referrer"
                  allow="fullscreen"
                  loading="lazy"
                  onLoad={handleIframeLoad}
                />
              </>
            ) : (
              <div className="benchmark-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">
                    <BenchmarkIcon type={selectedBenchmark.iconType} size={48} />
                  </div>
                  <h3>Benchmark Coming Soon</h3>
                  <p>This benchmark is currently under development and will be available soon.</p>
                  {selectedBenchmark.repoUrl && (
                    <button 
                      className="placeholder-btn"
                      onClick={handleViewRepository}
                    >
                      <GitHubIcon size={16} />
                      <span>View Repository</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IFrame Modal for Mobile */}
      {isMobile && selectedBenchmark && (
        <IFrameModal
          libraries={selectedBenchmark.libraries}
          repoUrl={selectedBenchmark.repoUrl}
          description={selectedBenchmark.description}
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
