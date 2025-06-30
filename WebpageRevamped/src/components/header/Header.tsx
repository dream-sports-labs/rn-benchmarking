import React, { useState } from 'react'
import favicon from '../../assets/icons/dream11-logo.svg'
import './Header.css'
import { useTheme } from '../../contexts/ThemeContext'

interface HeaderProps {
  activeTab?: 'rn-benchmarks' | 'other-benchmarks';
  setActiveTab?: (tab: 'rn-benchmarks' | 'other-benchmarks') => void;
  toggleSelection?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, toggleSelection }) => {
  const { theme, toggleTheme } = useTheme();
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

          {/* Mobile Menu Button and Dropdown */}
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
    </div>
  )
}

export default Header
