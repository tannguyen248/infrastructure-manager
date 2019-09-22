import React, { useState, useEffect } from 'react';
import Table from '../../components/users/Table';
import { withFirebase } from '../../../Firebase/context';
import CircularProgress from '@material-ui/core/CircularProgress';

const updateUser = firebase => async (userId, data) => {
  console.log(userId, data);
  return await firebase
    .user(userId)
    .update(data)
    .then(() => true)
    .catch(error => {
      console.error('Error updating document: ', error);
      return false;
    });
};

const Users = ({ firebase }) => {
  const [usersState, setUsers] = useState(null);
  const [historiesState, setHistories] = useState(null);
  const [devicesState, setDevices] = useState(null);

  useEffect(() => {
    const unsubcribe = firebase.db
      .collection('history')
      .onSnapshot(querySnapshot => {
        var histories = [];
        querySnapshot.forEach(function(doc) {
          histories.push(doc.data());
        });

        setHistories(histories);
      });

    return () => {
      unsubcribe && unsubcribe();
    };
  }, []);

  useEffect(() => {
    const unsubcribe = firebase.devices().onSnapshot(querySnapshot => {
      var devices = [];
      querySnapshot.forEach(function(doc) {
        devices.push({ id: doc.id, ...doc.data() });
      });

      setDevices(devices);
    });

    return () => {
      unsubcribe && unsubcribe();
    };
  }, []);

  useEffect(() => {
    const unsubcribe = firebase.users().onSnapshot(querySnapshot => {
      const users = [];
      querySnapshot.forEach(doc => {
        if (doc) {
          const data = doc.data();
          if (doc.id && data) {
            users.push({
              id: doc.id,
              name: data.name,
              email: data.email,
              role: data.role || 'user',
              active: true,
              histories:
                historiesState &&
                historiesState
                  .filter(history => history.userId === doc.id)
                  .map(x => {
                    const device =
                      devicesState &&
                      devicesState.find(device => device.id === x.deviceId);

                    if (device) {
                      return {
                        name: device.name,
                        imei: device.imeiNumber,
                        date: x.date,
                        event: x.event
                      };
                    }
                  })
                  .filter(x => !!x)
            });
          }
        }
      });

      setUsers(users);
    });

    return () => {
      unsubcribe && unsubcribe();
    };
  }, [devicesState, historiesState]);

  return (
    <>
      {usersState ? (
        <Table users={usersState} updateUser={updateUser(firebase)} />
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default withFirebase(Users);
