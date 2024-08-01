export type SnackbarAlertProps = {
  snackbarMessage: string
  open: boolean
  handleClose: () => void
  severity: 'error' | 'warning' | 'info' | 'success'
}
