import React, { useEffect, useState } from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CloseIcon from '@material-ui/icons/Close';
import { green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}));

function MySnackbarContentWrapper(props) {
  const classes = useStyles1();
  const { className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="close"
          color="inherit"
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>
      ]}
      {...other}
    />
  );
}

export default props => {
  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    props.setSnackbar(false);
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      open={props.open}
      autoHideDuration={2000}
      onClose={handleClose}
    >
      <MySnackbarContentWrapper
        onClose={handleClose}
        variant="success"
        message="This is a success message!"
      />
    </Snackbar>
  );
};
