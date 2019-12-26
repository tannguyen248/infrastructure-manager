import React, { useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
  Devices,
  ErrorPage,
  Histories,
  Login,
  Page,
  UserHistoriesList,
  Users
} from '../pages';

const LoginRoute = ({
  auth,
  pagename,
  component: Component,
  login,
  history,
  ...rest
}) => {
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
          <Component auth={auth} {...rest} />
        </Page>
      )}
    />
  );
};

const Routes = ({ auth, ...rest }) => {
  
  return (
    <Switch>
      <PrivateRoute
        auth={auth}
        exact
        path='/'
        pagename='User Manager'
        component={Users}
        {...rest}
      />
      <LoginRoute path='/login' auth={auth} pagename='Login' {...rest} />
      <PrivateRoute
        auth={auth}
        path='/users'
        pagename='User Manager'
        component={Users}
        {...rest}
      />
      <PublicRoute
        auth={auth}
        path='/devices'
        pagename='Device Manager'
        component={Devices}
        {...rest}
      />
      <PublicRoute
        auth={auth}
        path='/histories/:deviceId'
        pagename='User Histories'
        component={UserHistoriesList}
        {...rest}
      />
      <PublicRoute
        auth={auth}
        path='/histories'
        pagename='Histories'
        component={Histories}
        {...rest}
      />

      <PublicRoute component={ErrorPage} />
    </Switch>
  );
};

export default Routes;
