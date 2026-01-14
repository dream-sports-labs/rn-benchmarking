import React, { useEffect, useState } from 'react';
import './SelectionContainer.css';
import Selection from './Selection';
import { GenerateReportProps } from '../../RnBenchmarkingWebPage.interface';
import { SnackbarAlert } from '../SnackbarAlert/SnackbarAlert';
import { maxCheckboxSelection } from '../../RnBenchmarkingWebPage.constant';
import { 
  AndroidIcon, 
  AppleIcon, 
  DeviceIcon, 
  TagIcon, 
  GitHubIcon, 
  FileIcon,
  ChevronDownIcon,
  CheckIcon
} from '../ui/Icons';

type SelectionContainerProps = {
  onGenerateReport: (params: GenerateReportProps) => void;
  hideSelection?: () => void;
};

export const SelectionContainer = ({
  onGenerateReport,
  hideSelection,
}: SelectionContainerProps) => {
  const { versions } = require('../../supportedVersions.json');
  const versionName = versions;
  const [selectedVersion, setSelectedVersion] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (versionName.length > 0) {
      const latestVersion = versionName[versionName.length - 1];
      setSelectedVersion([latestVersion]);
    }
  }, [versionName]);

  const handleVersionToggle = (version: string) => {
    if (selectedVersion.includes(version)) {
      const newSelection = selectedVersion.filter((v) => v !== version);
      setSelectedVersion(newSelection);
      setSelectedOptions((prevOptions) =>
        prevOptions.filter((option) => !option.startsWith(version))
      );
    } else {
      if (selectedVersion.length < maxCheckboxSelection) {
        setSelectedVersion([...selectedVersion, version]);
      } else {
        setSnackbarMessage(`Maximum ${maxCheckboxSelection} versions can be selected`);
        setOpenSnackbar(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar__header">
        <h2 className="sidebar__title">Benchmark Configuration</h2>
        <p className="sidebar__subtitle">Compare React Native rendering performance</p>
      </div>

      {/* Step 1: Device Info */}
      <div className="sidebar__section">
        <div className="sidebar__step">
          <span className="sidebar__step-number">1</span>
          <div className="sidebar__step-content">
            <h3 className="sidebar__step-title">Test Environment</h3>
            <p className="sidebar__step-desc">Benchmarks run on these devices</p>
          </div>
        </div>
        <div className="sidebar__devices">
          <div className="sidebar__device">
            <div className="sidebar__device-icon sidebar__device-icon--android">
              <AndroidIcon size={18} />
            </div>
            <div className="sidebar__device-info">
              <span className="sidebar__device-platform">Android Emulator</span>
              <span className="sidebar__device-spec">Pixel 3A API 34</span>
            </div>
          </div>
          <div className="sidebar__device">
            <div className="sidebar__device-icon sidebar__device-icon--ios">
              <AppleIcon size={18} />
            </div>
            <div className="sidebar__device-info">
              <span className="sidebar__device-platform">iOS Simulator</span>
              <span className="sidebar__device-spec">iPhone 15 Pro (17.2)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Version Selection */}
      <div className="sidebar__section sidebar__section--grow">
        <div className="sidebar__step">
          <span className="sidebar__step-number">2</span>
          <div className="sidebar__step-content">
            <h3 className="sidebar__step-title">Select Versions</h3>
            <p className="sidebar__step-desc">Choose up to {maxCheckboxSelection} versions to compare</p>
          </div>
        </div>

        {/* Dropdown */}
        <div className="sidebar__dropdown">
          <button
            className={`sidebar__dropdown-trigger ${isDropdownOpen ? 'sidebar__dropdown-trigger--open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <TagIcon size={16} />
            <span className="sidebar__dropdown-value">
              {selectedVersion.length > 0
                ? `${selectedVersion.length} version${selectedVersion.length > 1 ? 's' : ''} selected`
                : 'Select versions...'}
            </span>
            <ChevronDownIcon size={16} />
          </button>

          {isDropdownOpen && (
            <div className="sidebar__dropdown-menu">
              <div className="sidebar__dropdown-header">
                <span>Available Versions</span>
                <span className="sidebar__dropdown-count">{selectedVersion.length}/{maxCheckboxSelection}</span>
              </div>
              <div className="sidebar__dropdown-list">
                {[...versionName].reverse().map((version: string) => (
                  <button
                    key={version}
                    className={`sidebar__dropdown-item ${selectedVersion.includes(version) ? 'sidebar__dropdown-item--selected' : ''}`}
                    onClick={() => handleVersionToggle(version)}
                  >
                    <span className="sidebar__checkbox">
                      {selectedVersion.includes(version) && <CheckIcon size={12} />}
                    </span>
                    <span className="sidebar__version-label">{version}</span>
                    {version === versionName[versionName.length - 1] && (
                      <span className="sidebar__version-tag">Latest</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected versions chips */}
        {selectedVersion.length > 0 && (
          <div className="sidebar__selected-versions">
            {selectedVersion.map((version) => (
              <span key={version} className="sidebar__version-chip">
                {version}
                <button 
                  className="sidebar__version-chip-remove"
                  onClick={() => handleVersionToggle(version)}
                  aria-label={`Remove ${version}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Step 3: Architecture Selection */}
        {selectedVersion.length > 0 && (
          <div className="sidebar__step sidebar__step--config">
            <span className="sidebar__step-number">3</span>
            <div className="sidebar__step-content">
              <h3 className="sidebar__step-title">Configure Tests</h3>
              <p className="sidebar__step-desc">Select platform & architecture</p>
            </div>
          </div>
        )}

        {selectedVersion.length > 0 && (
          <Selection
            versionName={selectedVersion}
            onGenerateReport={onGenerateReport}
            selectedVersion={selectedVersion}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            hideSelection={hideSelection}
          />
        )}
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__links">
          <a
            className="sidebar__link"
            href="https://github.com/dream-horizon-org/rn-benchmarking"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon size={14} />
            <span>View Repository</span>
          </a>
          <a
            className="sidebar__link"
            href="https://github.com/dream-horizon-org/rn-benchmarking/tree/main/WebpageRevamped/src/Reports"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileIcon size={14} />
            <span>Raw Data</span>
          </a>
        </div>
        <p className="sidebar__note">
          Debug builds • 30 iterations per test
        </p>
      </div>

      <SnackbarAlert
        snackbarMessage={snackbarMessage}
        severity="error"
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
      />
    </aside>
  );
};

export default SelectionContainer;
