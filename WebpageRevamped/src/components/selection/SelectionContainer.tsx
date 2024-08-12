import React, {useEffect, useState} from 'react'
import './SelectionContainer.css'
import Selection from './Selection'
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface'
import {SnackbarAlert} from '../SnackbarAlert/SnackbarAlert'

type SelectionContainerProps = {
  onGenerateReport: (params: GenerateReportProps) => void
}

export const SelectionContainer = ({
  onGenerateReport,
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
    const value = event.target.value
    if (Array.isArray(value) && value.length <= 4) {
      setSelectedVersion(value as string[])
      const deselectedVersions = selectedVersion.filter(
        (v) => !value.includes(v),
      )
      setSelectedOptions((prevOptions) =>
        prevOptions.filter((option) =>
          deselectedVersions.every(
            (deselectedVersion) => !option.startsWith(deselectedVersion),
          ),
        ),
      )
    }
    if (value.length > 4) {
      setSnackbarMessage('You can select a maximum of 4 options.')
      setOpenSnackbar(true)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }
  return (
    <div className={'SelectionContainer'}>
      <div className={'SelectionContainerHeader'}>
        Select versions to compare
      </div>
      <FormControl variant="outlined">
        <InputLabel id="app-version-select-label">App Version</InputLabel>
        <Select
          labelId="app-version-select-label"
          id="app-version-select"
          value={selectedVersion}
          onChange={handleChange}
          label="App Version"
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
              <Checkbox checked={selectedVersion.indexOf(version) > -1} />
              <ListItemText primary={version} />
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
        />
      ) : null}
      <SnackbarAlert
        snackbarMessage={snackbarMessage}
        severity={'error'}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
      />
    </div>
  )
}
export default SelectionContainer
