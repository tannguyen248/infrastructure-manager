import React from 'react';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

const useStyle = makeStyles(theme => ({
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '20px'
  }
}));

const ErrorPage = () => {
  const classes = useStyle();

  return (
    <React.Fragment>
      <Container fixed className={classes.container}>
        <Typography variant="h3" component="h3">
          Ahhhhhhhh! This page doesn't exist
        </Typography>
      </Container>
    </React.Fragment>
  );
};

export default ErrorPage;
