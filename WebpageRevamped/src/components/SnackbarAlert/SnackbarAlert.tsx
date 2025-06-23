import {Alert, Snackbar} from '@mui/material'
import {SnackbarAlertProps} from './SnackbarAlert.interface'
import './SnackbarAlert.css'
import {useTheme} from '../../contexts/ThemeContext'

export const SnackbarAlert = ({
  snackbarMessage,
  open,
  handleClose,
  severity = 'info',
}: SnackbarAlertProps) => {
  const {theme} = useTheme()

  return (
    <div className="SnackbarAlert" data-theme={theme}>
      <Snackbar
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        className="top-right-snackbar">
        <Alert 
          onClose={handleClose} 
          severity={severity}
          variant="standard"
          role="alert"
          aria-live="polite">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}
