import React from 'react';
import './Header.css';
import { SunIcon, MoonIcon, SettingsIcon, GridIcon, LayersIcon } from '../ui/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useIsMobile } from '../../hooks/useIsMobile';

type HeaderProps = {
  activeTab: 'rn-benchmarks' | 'other-benchmarks';
  setActiveTab: (tab: 'rn-benchmarks' | 'other-benchmarks') => void;
  toggleSelection: () => void;
};

const Header = ({ activeTab, setActiveTab, toggleSelection }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <header className="header">
      <div className="header__left">
        {/* Logo */}
        <div className="header__logo">
          <div className="header__logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#logo-gradient)" />
              <path d="M8 17V7L16 12L8 17Z" fill="white" />
              <defs>
                <linearGradient id="logo-gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00d4aa" />
                  <stop offset="1" stopColor="#00b894" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="header__logo-text">
            <span className="header__logo-name">RN Benchmarks</span>
            <span className="header__logo-tag">Performance Testing</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header__nav">
          <button
            className={`header__tab ${activeTab === 'rn-benchmarks' ? 'header__tab--active' : ''}`}
            onClick={() => setActiveTab('rn-benchmarks')}
          >
            <LayersIcon size={16} />
            <span>RN Benchmarks</span>
          </button>
          <button
            className={`header__tab ${activeTab === 'other-benchmarks' ? 'header__tab--active' : ''}`}
            onClick={() => setActiveTab('other-benchmarks')}
          >
            <GridIcon size={16} />
            <span>Other Benchmarks</span>
          </button>
        </nav>
      </div>

      <div className="header__right">
        {/* Theme Toggle */}
        <button
          className="header__icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        {/* Mobile Config Toggle */}
        {isMobile && activeTab === 'rn-benchmarks' && (
          <button
            className="header__icon-btn header__icon-btn--config"
            onClick={toggleSelection}
            aria-label="Open configuration"
            title="Configuration"
          >
            <SettingsIcon size={18} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
