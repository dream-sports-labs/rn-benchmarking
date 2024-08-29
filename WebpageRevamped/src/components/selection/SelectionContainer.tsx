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

type SelectionContainerProps = {
    onGenerateReport: (params: GenerateReportProps) => void;
    hideSelection?: () => void;
    selectedOptions: string[];
    setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SelectionContainer = ({
                                       onGenerateReport,
                                       hideSelection,
                                       selectedOptions,
                                       setSelectedOptions
                                   }: SelectionContainerProps) => {
    const {versions} = require('../../supportedVersions.json')
    const versionName = versions
    const [selectedVersion, setSelectedVersion] = useState<string[]>([])
    const [openSnackbar, setOpenSnackbar] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [update, setUpdate] = useState(true)

    useEffect(() => {
        if (selectedOptions.length > 0 && update) {
            // Filter versions that match the start of any selected option
            const newSelectedVersion = versionName.filter((version: string) =>
                selectedOptions.some(option => option.startsWith(version))
            );
            if (newSelectedVersion.length > 0) {
                setSelectedVersion(newSelectedVersion);
            }
            setUpdate(false);
        } else if (selectedOptions.length === 0 && update) {
            // If no options are selected, default to the latest version
            const latestVersion = versionName[versionName.length - 1];
            setSelectedVersion([latestVersion]);
            setSelectedOptions([
                `${latestVersion}/android/oldarch`,
                `${latestVersion}/android/newarch`,
            ]);
        }

    }, [selectedOptions, versionName, update, setSelectedOptions]);

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
                            <Checkbox checked={selectedVersion.includes(version)}/>
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
