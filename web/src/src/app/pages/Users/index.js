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

  useEffect(() => {
    if (!usersState) {
      const getData = async () => {
        const histories = await firebase.db
          .collection('history')
          .get()
          .then(querySnapshot => {
            var histories = [];
            querySnapshot.forEach(function(doc) {
              histories.push(doc.data());
            });

            return histories;
          });

        const devices = await firebase.db
          .collection('devices')
          .get()
          .then(querySnapshot => {
            var devices = [];
            querySnapshot.forEach(function(doc) {
              devices.push({ id: doc.id, ...doc.data() });
            });

            return devices;
          });

        firebase
          .users()
          .get()
          .then(querySnapshot => {
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
                      histories
                        .map(x => {
                          if (x.userId === doc.id) {
                            console.log(devices);
                            const device = devices.find(
                              device => device.id === x.deviceId
                            );

                            if (device) {
                              return {
                                name: device.name,
                                imei: device.imeiNumber,
                                date: x.date,
                                event: x.event
                              };
                            }
                          }
                        })
                        .filter(x => x)
                        .splice(0, 10) || []
                  });
                }
              }
            });

            setUsers(users);
          });
      };

      getData();
    }
  }, [usersState]);

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
