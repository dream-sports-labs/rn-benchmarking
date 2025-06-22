import React, {useEffect, useState} from 'react'
import './SelectionContainer.css'
import Selection from './Selection'
import {
    Checkbox, Chip,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    IconButton,
} from '@mui/material'
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface'
import {SnackbarAlert} from '../SnackbarAlert/SnackbarAlert'
import {maxCheckboxSelection} from "../../RnBenchmarkingWebPage.constant";
import GithubLogo from '../../assets/icons/GitHubMark.png'
import { useTheme } from '../../contexts/ThemeContext'

type SelectionContainerProps = {
    onGenerateReport: (params: GenerateReportProps) => void;
    hideSelection?: () => void; // Add this line to define the prop type
}

export const SelectionContainer = ({
  onGenerateReport, hideSelection,
}: SelectionContainerProps) => {
  const { theme, toggleTheme } = useTheme();
  const {versions} = require('../../supportedVersions.json')
  const versionName = versions
  const [selectedVersion, setSelectedVersion] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  useEffect(() => {
    if (versionName.length > 0) {
      const latestVersion = versionName[versionName.length - 1];
      setSelectedVersion([latestVersion]);
    }
  }, [versionName]);

    const handleChange = (event: SelectChangeEvent<typeof selectedVersion>) => {
        const value = event.target.value;
        if (Array.isArray(value) && value.length <= maxCheckboxSelection) {
            setSelectedVersion(value as string[]);
            const deselectedVersions = selectedVersion.filter(
                (v) => !value.includes(v),
            );
            setSelectedOptions((prevOptions) =>
                prevOptions.filter((option) =>
                    deselectedVersions.every(
                        (deselectedVersion) => !option.startsWith(deselectedVersion),
                    ),
                ),
            );
        }
        if (value.length > maxCheckboxSelection) {
            setSnackbarMessage('You can select a maximum of 4 options.');
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <div className={'SelectionContainer'}>
            <div className={'DeviceContainer'}>
                <div className={'Title'}>Benchmarking Devices :</div>
                <Chip
                    label={
                        <span>
              <strong>Android Emulator:</strong> Pixel 3A API 34
            </span>
                    }
                    sx={{fontSize: '12px'}}
                />
                <Chip
                    label={
                        <span>
              <strong>iOS Simulator:</strong> iPhone 15 Pro (17.2)
            </span>
                    }
                    sx={{fontSize: '12px'}}
                />
            </div>
            <div className={'SelectionContainerHeader'}>
                Select versions to compare
            </div>
            <FormControl variant="outlined">
                <InputLabel id="app-version-select-label">React Native Versions</InputLabel>
                <Select
                    labelId="app-version-select-label"
                    id="app-version-select"
                    value={selectedVersion}
                    onChange={handleChange}
                    label="React Native Versions"
                    renderValue={(selected) => selected.join(', ')}
                    multiple
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 200,
                            },
                        },
                    }}
                >
                    {versionName.map((version: string) => (
                        <MenuItem key={version} value={version}>
                            <Checkbox checked={selectedVersion.indexOf(version) > -1}/>
                            <ListItemText primary={version}/>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {selectedVersion.length > 0 ? (
                <Selection
                    versionName={selectedVersion}
                    onGenerateReport={onGenerateReport}
                    selectedVersion={selectedVersion}
                    selectedOptions={selectedOptions}
                    setSelectedOptions={setSelectedOptions}
                    hideSelection={hideSelection} // Pass the hideSelection prop to Selection
                />
            ) : null}

            <div className="NoteContainer">
                <a className={"Link"} href="https://github.com/dream-sports-labs/rn-benchmarking" target="_blank"
                   rel="noopener noreferrer">Access To GitHub Repo</a>
                <a className={"Link"}
                   href="https://github.com/dream-sports-labs/rn-benchmarking/tree/main/WebpageRevamped/src/Reports">
                    Access All the Reports Here</a>
                <div className="Note">*Benchmarking numbers are generated from debug builds.</div>
                
                {/* Theme Toggle at Bottom */}
                <div className="ThemeToggleContainer">
                    <span className="ThemeToggleLabel">Theme:</span>
                    <IconButton 
                        onClick={toggleTheme}
                        className={'ThemeToggleButton'}
                        size="small"
                        aria-label="Toggle theme"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                                <path d="m12 1-1 2-1-2m6.36 1.64L15 6l1.36-1.36M23 12l-2 1 2 1m-1.64 6.36L19 18l1.36 1.36M12 23l1-2 1 2m-6.36-1.64L9 20l-1.36 1.36M1 12l2-1-2-1m1.64-6.36L5 6 3.64 4.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </IconButton>
                </div>
            </div>

            <SnackbarAlert
                snackbarMessage={snackbarMessage}
                severity={'error'}
                open={openSnackbar}
                handleClose={handleCloseSnackbar}
            />
        </div>
    );
};

export default SelectionContainer;
