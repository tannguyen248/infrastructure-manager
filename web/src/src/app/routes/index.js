import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Users, Login, ErrorPage, Devices, Page } from '../pages';

const LoginRoute = ({
  auth,
  pagename,
  component: Component,
  login,
  history,
  ...rest
}) => {
  console.log('auth', auth);
  return (
    <Route
      {...rest}
      render={() =>
        !auth || !auth.username ? (
          <Page pagename={pagename}>
            <Login login={login} auth={auth} />
          </Page>
        ) : (
          <Redirect
            to={{
              pathname: '/devices'
            }}
          />
        )
      }
    />
  );
};

const PrivateRoute = ({ auth, pagename, component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={() =>
        auth && auth.username === 'admin' ? (
          <Page pagename={pagename} auth={auth}>
            <Component />
          </Page>
        ) : (
          <Redirect
            to={{
              pathname: '/login'
            }}
          />
        )
      }
    />
  );
};

const PublicRoute = ({ auth, pagename, component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={() => (
        <Page pagename={pagename} auth={auth}>
          <Component auth={auth} />
        </Page>
      )}
    />
  );
};

const Routes = ({ auth, ...rest }) => (
  <Switch>
    <PrivateRoute
      exact
      path="/"
      auth={auth}
      pagename="User Manager"
      component={Users}
      {...rest}
    />
    <LoginRoute path="/login" auth={auth} pagename="Login" {...rest} />
    <PrivateRoute
      path="/users"
      auth={auth}
      pagename="User Manager"
      component={Users}
      {...rest}
    />
    <PublicRoute
      path="/devices"
      auth={auth}
      pagename="Device Manager"
      component={Devices}
      {...rest}
    />
    <PublicRoute component={ErrorPage} />
  </Switch>
);

export default Routes;
