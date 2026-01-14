import React, { useState, useEffect } from 'react';
import './Selection.css';
import { SelectionProps } from '../../RnBenchmarkingWebPage.interface';
import { SnackbarAlert } from '../SnackbarAlert/SnackbarAlert';
import { Reports } from '../../Reports';
import { maxCheckboxSelection } from '../../RnBenchmarkingWebPage.constant';
import { Button } from '../ui';
import { AndroidIcon, AppleIcon, OldArchIcon, NewArchIcon, ChartIcon } from '../ui/Icons';

const Selection = (props: SelectionProps) => {
  const { versionName, selectedOptions, setSelectedOptions, selectedVersion, onGenerateReport, hideSelection } = props;
  const [selectedCount, setSelectedCount] = useState(0);
  const [autoGenerateReport, setAutoGenerateReport] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    setSelectedCount(selectedOptions.length);
  }, [selectedOptions]);

  useEffect(() => {
    setSelectedCount(selectedOptions.length);
    if (selectedVersion.length > 0 && selectedOptions.length === 0) {
      const latestVersion = selectedVersion;
      setSelectedOptions([
        `${latestVersion}/android/oldarch`,
        `${latestVersion}/android/newarch`,
      ]);
    }
  }, []);

  useEffect(() => {
    if (autoGenerateReport && selectedOptions.length > 0) {
      setAutoGenerateReport(false);
      handleGenerateReport();
    }
  }, [selectedOptions]);

  const handleCheckboxChange = (version: string, architectureType: string) => (event: { target: { checked: boolean } }) => {
    const isChecked = event.target.checked;
    const option = `${version}/${architectureType}`;
    const currentCount = selectedCount + (isChecked ? 1 : -1);

    if (currentCount <= maxCheckboxSelection) {
      setSelectedCount(currentCount);
      if (isChecked) {
        setSelectedOptions((prev) => [...prev, option]);
      } else {
        setSelectedOptions((prev) => prev.filter((item) => item !== option));
      }
    } else {
      setSnackbarMessage('You can select a maximum of 4 configurations.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleGenerateReport = () => {
    const response = selectedOptions.map((value) => Reports[value]);
    const labels: string[] = [];
    selectedOptions.forEach((label) => {
      labels.push(label);
    });
    const fifteenHundredViewDataLabels: number[] = [];
    const fifteenHundredTextDataLabels: number[] = [];
    const fifteenHundredImageDataLabels: number[] = [];
    const fiveThousandViewDataLabels: number[] = [];
    const fiveThousandTextDataLabels: number[] = [];
    const fiveThousandImageDataLabels: number[] = [];
    response.forEach((data) => {
      if (data && data.means) {
        for (const key in data.means) {
          switch (key) {
            case '1500View':
              fifteenHundredViewDataLabels.push(data.means[key]);
              break;
            case '1500Text':
              fifteenHundredTextDataLabels.push(data.means[key]);
              break;
            case '1500Image':
              fifteenHundredImageDataLabels.push(data.means[key]);
              break;
            case '5000View':
              fiveThousandViewDataLabels.push(data.means[key]);
              break;
            case '5000Text':
              fiveThousandTextDataLabels.push(data.means[key]);
              break;
            case '5000Image':
              fiveThousandImageDataLabels.push(data.means[key]);
              break;
            default:
              break;
          }
        }
      } else {
        setSnackbarMessage('Data not found.');
        setOpenSnackbar(true);
      }
    });

    onGenerateReport({
      labels,
      fifteenHundredViewDataLabels,
      fifteenHundredTextDataLabels,
      fifteenHundredImageDataLabels,
      fiveThousandViewDataLabels,
      fiveThousandTextDataLabels,
      fiveThousandImageDataLabels,
    });

    if (window.innerWidth <= 768) {
      if (hideSelection) {
        hideSelection();
      }
    }
  };

  return (
    <div className="selection">
      {versionName.map((version) => (
        <div key={version} className="selection__version-card">
          <div className="selection__version-header">
            <span className="selection__version-number">{version}</span>
          </div>
          
          <div className="selection__platforms">
            {/* Android */}
            <div className="selection__platform">
              <div className="selection__platform-header">
                <div className="selection__platform-icon selection__platform-icon--android">
                  <AndroidIcon size={14} />
                </div>
                <span className="selection__platform-name">Android</span>
              </div>
              <div className="selection__arch-options">
                <label className={`selection__arch-option ${selectedOptions.includes(`${version}/android/oldarch`) ? 'selection__arch-option--selected' : ''}`}>
                  <input
                    type="checkbox"
                    className="selection__checkbox-input"
                    checked={selectedOptions.includes(`${version}/android/oldarch`)}
                    onChange={handleCheckboxChange(version, 'android/oldarch')}
                  />
                  <div className="selection__arch-icon">
                    <OldArchIcon size={14} />
                  </div>
                  <span className="selection__arch-label">Old</span>
                </label>
                <label className={`selection__arch-option ${selectedOptions.includes(`${version}/android/newarch`) ? 'selection__arch-option--selected' : ''}`}>
                  <input
                    type="checkbox"
                    className="selection__checkbox-input"
                    checked={selectedOptions.includes(`${version}/android/newarch`)}
                    onChange={handleCheckboxChange(version, 'android/newarch')}
                  />
                  <div className="selection__arch-icon">
                    <NewArchIcon size={14} />
                  </div>
                  <span className="selection__arch-label">New</span>
                </label>
              </div>
            </div>

            {/* iOS */}
            <div className="selection__platform">
              <div className="selection__platform-header">
                <div className="selection__platform-icon selection__platform-icon--ios">
                  <AppleIcon size={14} />
                </div>
                <span className="selection__platform-name">iOS</span>
              </div>
              <div className="selection__arch-options">
                <label className={`selection__arch-option ${selectedOptions.includes(`${version}/ios/oldarch`) ? 'selection__arch-option--selected' : ''}`}>
                  <input
                    type="checkbox"
                    className="selection__checkbox-input"
                    checked={selectedOptions.includes(`${version}/ios/oldarch`)}
                    onChange={handleCheckboxChange(version, 'ios/oldarch')}
                  />
                  <div className="selection__arch-icon">
                    <OldArchIcon size={14} />
                  </div>
                  <span className="selection__arch-label">Old</span>
                </label>
                <label className={`selection__arch-option ${selectedOptions.includes(`${version}/ios/newarch`) ? 'selection__arch-option--selected' : ''}`}>
                  <input
                    type="checkbox"
                    className="selection__checkbox-input"
                    checked={selectedOptions.includes(`${version}/ios/newarch`)}
                    onChange={handleCheckboxChange(version, 'ios/newarch')}
                  />
                  <div className="selection__arch-icon">
                    <NewArchIcon size={14} />
                  </div>
                  <span className="selection__arch-label">New</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="selection__actions">
        <div className="selection__count">
          {selectedOptions.length} of {maxCheckboxSelection} selected
        </div>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleGenerateReport}
          disabled={selectedOptions.length <= 0}
          icon={<ChartIcon size={16} />}
        >
          Generate Report
        </Button>
      </div>

      <SnackbarAlert
        snackbarMessage={snackbarMessage}
        severity="error"
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default Selection;
