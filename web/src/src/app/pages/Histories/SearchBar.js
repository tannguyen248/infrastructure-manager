import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  }
}));

const CustomizedInputBase = React.memo(({ ...props }) => {
  const classes = useStyles();

  return (
    <Paper component='form' className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder='Search devices'
        inputProps={{ 'aria-label': 'search devices' }}
        onChange={props.onChange}
      />
      <IconButton
        className={classes.iconButton}
        aria-label='search'
        onClick={props.onClick}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
});

export default CustomizedInputBase;
