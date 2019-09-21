import React from 'react';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Box } from '@material-ui/core';
import { shadows } from '@material-ui/system';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100vw',
    height: '100vh'
  },
  container: {
    width: '300px',
    padding: '15px',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxSizing: 'content-box'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px'
  },
  textField: {
    width: '100%'
  },
  button: {
    marginTop: theme.spacing(1)
  }
}));

const Login = ({ login, auth }) => {
  console.log(login);
  const classes = useStyles();
  const [values, setValues] = React.useState({
    username: '',
    password: ''
  });

  const isLogined = auth && auth.username === 'admin';

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  return (
    <div className={classes.root}>
      <Box boxShadow={1} className={classes.container}>
        <form className={classes.form}>
          <TextField
            id="username"
            label="Username"
            className={classes.textField}
            value={values.username}
            onChange={handleChange('username')}
            margin="normal"
            placeholder="Username"
            disabled={isLogined}
          />
          <TextField
            id="password"
            label="Password"
            className={classes.textField}
            value={values.passowrd}
            onChange={handleChange('password')}
            margin="normal"
            placeholder="Password"
            type="password"
            disabled={isLogined}
          />
          <Button
            variant="contained"
            className={classes.button}
            color="primary"
            className={classes.button}
            onClick={() => login(values.username, values.password)}
            disabled={isLogined}
          >
            Login
          </Button>
        </form>
      </Box>
    </div>
  );
};

export default Login;
