import React, { useState } from 'react'
import favicon from '../../assets/icons/dream11-logo.svg'
import './Header.css'

interface HeaderProps {
  activeTab?: 'rn-benchmarks' | 'other-benchmarks';
  setActiveTab?: (tab: 'rn-benchmarks' | 'other-benchmarks') => void;
  toggleSelection?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, toggleSelection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={'HeaderContainer'}>
      <div className="header-left">
        <img src={favicon} alt={'Dream11 Logo'} width={24} height={24} />
        <div className={'HeaderTitle'}>
          <span className="title-full">React Native Benchmarking</span>
          <span className="title-short">RN Benchmarking</span>
        </div>
      </div>

      <div className="header-right">
        {/* Navigation Tabs - Desktop */}
        {activeTab && setActiveTab && (
          <>
            <div className="header-nav-tabs desktop-tabs">
              <button 
                className={`nav-tab ${activeTab === 'rn-benchmarks' ? 'active' : ''}`}
                onClick={() => setActiveTab('rn-benchmarks')}
              >
                <span className="tab-full">React Native</span>
                <span className="tab-short">React Native</span>
              </button>
              <button 
                className={`nav-tab ${activeTab === 'other-benchmarks' ? 'active' : ''}`}
                onClick={() => setActiveTab('other-benchmarks')}
              >
                <span className="tab-full">Libraries</span>
                <span className="tab-short">Libraries</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="mobile-menu-container">
              <button 
                className="mobile-menu-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Mobile Dropdown */}
              {isMobileMenuOpen && (
                <div className="mobile-dropdown">
                  <button 
                    className={`mobile-nav-item ${activeTab === 'rn-benchmarks' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('rn-benchmarks');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    RN Benchmarks
                  </button>
                  <button 
                    className={`mobile-nav-item ${activeTab === 'other-benchmarks' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('other-benchmarks');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Other Benchmarks
                  </button>
                  {/* Show sidebar toggle only when on RN Benchmarks tab */}
                  {activeTab === 'rn-benchmarks' && toggleSelection && (
                    <button 
                      className="mobile-nav-item"
                      onClick={() => {
                        toggleSelection();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Toggle Sidebar
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        
        {/* <button 
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="m12 1-1 2-1-2m6.36 1.64L15 6l1.36-1.36M23 12l-2 1 2 1m-1.64 6.36L19 18l1.36 1.36M12 23l1-2 1 2m-6.36-1.64L9 20l-1.36 1.36M1 12l2-1-2-1m1.64-6.36L5 6 3.64 4.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button> */}
      </div>
    </div>
  )
}

export default Header
