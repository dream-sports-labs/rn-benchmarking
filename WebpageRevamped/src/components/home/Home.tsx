import React, { useState } from 'react';
import './Home.css';
import Header from '../header/Header';
import GraphContainer from '../graph/GraphContainer';
import { GenerateReportProps } from '../../RnBenchmarkingWebPage.interface';
import SelectionContainer from '../selection/SelectionContainer';
import OtherBenchmarks from '../otherBenchmarks/OtherBenchmarks';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ChartIcon, CompareIcon, ZapIcon, ArrowRightIcon } from '../ui/Icons';

const Home = () => {
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [showSelection, setShowSelection] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'rn-benchmarks' | 'other-benchmarks'>('rn-benchmarks');
  const [graphData, setGraphData] = useState<GenerateReportProps>({
    labels: [],
    fifteenHundredViewDataLabels: [],
    fifteenHundredTextDataLabels: [],
    fifteenHundredImageDataLabels: [],
    fiveThousandViewDataLabels: [],
    fiveThousandTextDataLabels: [],
    fiveThousandImageDataLabels: [],
  });

  const isMobile = useIsMobile();

  const handleGenerateReport = ({
    labels,
    fifteenHundredViewDataLabels,
    fifteenHundredTextDataLabels,
    fifteenHundredImageDataLabels,
    fiveThousandViewDataLabels,
    fiveThousandTextDataLabels,
    fiveThousandImageDataLabels,
  }: GenerateReportProps) => {
    setGraphData({
      labels,
      fifteenHundredViewDataLabels,
      fifteenHundredTextDataLabels,
      fifteenHundredImageDataLabels,
      fiveThousandViewDataLabels,
      fiveThousandTextDataLabels,
      fiveThousandImageDataLabels,
    });
    setShowGraph(true);
    if (isMobile) {
      setShowSelection(false);
    }
  };

  const toggleSelection = () => {
    setShowSelection(!showSelection);
  };

  const handleClose = () => {
    setShowSelection(false);
  };

  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleSelection={toggleSelection}
      />

      <main className="app-main">
        {activeTab === 'rn-benchmarks' ? (
          <div className="benchmark-layout">
            {/* Sidebar */}
            {(!isMobile || showSelection) && (
              <SelectionContainer
                onGenerateReport={handleGenerateReport}
                hideSelection={handleClose}
              />
            )}

            {/* Main Content */}
            <div className="benchmark-content">
              {showGraph ? (
                <GraphContainer {...graphData} />
              ) : (
                <div className="benchmark-empty">
                  <div className="benchmark-empty__content">
                    {/* Hero Illustration */}
                    <div className="benchmark-empty__hero">
                      <div className="benchmark-empty__hero-icon">
                        <ChartIcon size={48} />
                      </div>
                      <div className="benchmark-empty__hero-rings">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>

                    <h2 className="benchmark-empty__title">React Native Performance Benchmarks</h2>
                    <p className="benchmark-empty__description">
                      Compare rendering performance across different React Native versions, 
                      architectures, and platforms to make informed decisions.
                    </p>

                    {/* Steps */}
                    <div className="benchmark-empty__steps">
                      <div className="benchmark-empty__step">
                        <div className="benchmark-empty__step-number">1</div>
                        <div className="benchmark-empty__step-content">
                          <h4>Select Versions</h4>
                          <p>Choose up to 4 React Native versions from the sidebar</p>
                        </div>
                      </div>
                      <div className="benchmark-empty__step-arrow">
                        <ArrowRightIcon size={16} />
                      </div>
                      <div className="benchmark-empty__step">
                        <div className="benchmark-empty__step-number">2</div>
                        <div className="benchmark-empty__step-content">
                          <h4>Configure Tests</h4>
                          <p>Pick platforms (Android/iOS) and architectures (Old/New)</p>
                        </div>
                      </div>
                      <div className="benchmark-empty__step-arrow">
                        <ArrowRightIcon size={16} />
                      </div>
                      <div className="benchmark-empty__step">
                        <div className="benchmark-empty__step-number">3</div>
                        <div className="benchmark-empty__step-content">
                          <h4>View Results</h4>
                          <p>Analyze side-by-side performance comparisons</p>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="benchmark-empty__features">
                      <div className="benchmark-empty__feature">
                        <div className="benchmark-empty__feature-icon">
                          <CompareIcon size={18} />
                        </div>
                        <span>Compare up to 4 configurations</span>
                      </div>
                      <div className="benchmark-empty__feature">
                        <div className="benchmark-empty__feature-icon">
                          <ZapIcon size={18} />
                        </div>
                        <span>Old vs New Architecture</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Overlay */}
            {isMobile && showSelection && (
              <div className="sidebar-overlay" onClick={handleClose} />
            )}
          </div>
        ) : (
          <OtherBenchmarks />
        )}
      </main>
    </div>
  );
};

export default Home;
