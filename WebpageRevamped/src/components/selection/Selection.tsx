import React, {useState, useEffect} from 'react'
import './Selection.css'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  OutlinedInput,
} from '@mui/material'
import {SelectionProps} from '../../RnBenchmarkingWebPage.interface'
import {SnackbarAlert} from '../SnackbarAlert/SnackbarAlert'
import {Reports} from "../../Reports";

const Selection = (props: SelectionProps) => {
  const {versionName, selectedOptions, setSelectedOptions,selectedVersion} = props
  const [selectedCount, setSelectedCount] = useState(0)
  const [autoGenrateReport,setAutoGenrateReport]= useState(true)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  useEffect(() => {
    setSelectedCount(selectedOptions.length)
  }, [selectedOptions])
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

  }, []);

  useEffect(() => {
    if(autoGenrateReport && selectedOptions.length>0){
      setAutoGenrateReport(false)
      handleGenerateReport()
    }
  }, [selectedOptions]);

  const handleCheckboxChange =
    (version: string, architectureType: string) =>
    (event: {target: {checked: boolean}}) => {
      const isChecked = event.target.checked
      const option = `${version}/${architectureType}`
      const currentCount = selectedCount + (isChecked ? 1 : -1)

      if (currentCount <= 4) {
        setSelectedCount(currentCount)
        if (isChecked) {
          setSelectedOptions((prev) => [...prev, option])
        } else {
          setSelectedOptions((prev) => prev.filter((item) => item !== option))
        }
      } else {
        setSnackbarMessage('You can select a maximum of 4 options.')
        setOpenSnackbar(true)
      }
    }
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleGenerateReport = () => {
    const response = selectedOptions.map((value) => Reports[value])
    const labels: string[] = []
    selectedOptions.forEach((label) => {
      labels.push(label)
    })
    const fifteenHundredViewDataLabels: number[] = []
    const fifteenHundredTextDataLabels: number[] = []
    const fifteenHundredImageDataLabels: number[] = []
    const fiveThousandViewDataLabels: number[] = []
    const fiveThousandTextDataLabels: number[] = []
    const fiveThousandImageDataLabels: number[] = []
    response.forEach((data) => {
      if (data && data.means) {
        for (const key in data.means) {
          switch (key) {
            case '1500View':
              fifteenHundredViewDataLabels.push(data.means[key])
              break
            case '1500Text':
              fifteenHundredTextDataLabels.push(data.means[key])
              break
            case '1500Image':
              fifteenHundredImageDataLabels.push(data.means[key])
              break
            case '5000View':
              fiveThousandViewDataLabels.push(data.means[key])
              break
            case '5000Text':
              fiveThousandTextDataLabels.push(data.means[key])
              break
            case '5000Image':
              fiveThousandImageDataLabels.push(data.means[key])
              break
            default:
              break
          }
        }
      } else {
        setSnackbarMessage('Data not found.')
        setOpenSnackbar(true)
      }
    })
    props.onGenerateReport({
      labels,
      fifteenHundredViewDataLabels,
      fifteenHundredTextDataLabels,
      fifteenHundredImageDataLabels,
      fiveThousandViewDataLabels,
      fiveThousandTextDataLabels,
      fiveThousandImageDataLabels,
    })
  }

  return (
    <div className={'Selection'}>
      {versionName.map((version) => (
        <div key={version} className={'VersionContainer'}>
          <FormControl variant="outlined">
            <InputLabel
              htmlFor="outlined-label"
              shrink
              style={{fontSize: 20, color: 'black'}}>
              {version.toString()}
            </InputLabel>
            <OutlinedInput
              id="outlined-label"
              notched
              label={version + `' '`}
              readOnly
              fullWidth
              startAdornment={
                <div>
                  <div className={'PlatformName'}>Android:</div>
                  <div className={'PlatformNameTypeContainer'}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleCheckboxChange(
                            version,
                            'android/oldarch',
                          )}
                          checked={selectedOptions.includes(
                            `${version}/android/oldarch`,
                          )}
                        />
                      }
                      label="Old"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleCheckboxChange(
                            version,
                            'android/newarch',
                          )}
                          checked={selectedOptions.includes(
                            `${version}/android/newarch`,
                          )}
                        />
                      }
                      label="New"
                    />
                  </div>
                  <div className={'PlatformName'}>iOS:</div>
                  <div className={'PlatformNameTypeContainer'}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleCheckboxChange(
                            version,
                            'ios/oldarch',
                          )}
                          checked={selectedOptions.includes(
                            `${version}/ios/oldarch`,
                          )}
                        />
                      }
                      label="Old"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleCheckboxChange(
                            version,
                            'ios/newarch',
                          )}
                          checked={selectedOptions.includes(
                            `${version}/ios/newarch`,
                          )}
                        />
                      }
                      label="New"
                    />
                  </div>
                </div>
              }
            />
          </FormControl>
        </div>
      ))}
      <Button
        variant="contained"
        style={{width: '100%', marginTop: 20}}
        onClick={handleGenerateReport}
        disabled={selectedOptions.length <= 0}>
        Generate Report
      </Button>

      <SnackbarAlert
        snackbarMessage={snackbarMessage}
        severity={'error'}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
      />
    </div>
  )
}

export default Selection
