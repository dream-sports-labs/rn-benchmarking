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
} from '@mui/material'
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface'
import {SnackbarAlert} from '../SnackbarAlert/SnackbarAlert'
import {maxCheckboxSelection} from "../../RnBenchmarkingWebPage.constant";
import GithubLogo from '../../assets/icons/GitHubMark.png'

type SelectionContainerProps = {
    onGenerateReport: (params: GenerateReportProps) => void;
    hideSelection?: () => void; // Add this line to define the prop type
}

export const SelectionContainer = ({
  onGenerateReport, hideSelection,
}: SelectionContainerProps) => {
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
                   rel="noopener noreferrer">
                    <img src={GithubLogo}
                         alt="GitHub Logo"
                         style={{width: '20px'}}/>Access To GitHub Repo</a>
                <div className="Note">*Benchmarking numbers are generated from debug builds.</div>
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
