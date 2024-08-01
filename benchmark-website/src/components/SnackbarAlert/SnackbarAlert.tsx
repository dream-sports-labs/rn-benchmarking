import {Alert, Snackbar} from '@mui/material'
import {SnackbarAlertProps} from './SnackbarAlert.interface'

export const SnackbarAlert = ({
  snackbarMessage,
  open,
  handleClose,
  severity,
}: SnackbarAlertProps) => {
  return (
    <div className={'SnackbarAlert'}>
      <Snackbar
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}
