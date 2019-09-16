import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import Routes from './routes';

const login = setAuth => (username, password) => {
  if (username === 'admin' && password === 'admin') {
    const user = { username: 'admin' };
    sessionStorage.setItem('user', JSON.stringify(user));
    setAuth(user);
  }
};

const App = () => {
  const [auth, setAuth] = useState(JSON.parse(sessionStorage.getItem('user')));

  useEffect(() => {
    if (!auth || !auth.username) {
      const user = JSON.parse(sessionStorage.getItem('user'));

      if (user && user.username === 'admin') {
        login(setAuth)('admin', 'admin');
      }
    }
  }, [auth]);

  return (
    <>
      <Routes auth={auth} login={login(setAuth)} />
    </>
  );
};

export default withRouter(App);
