import React, { useState, useEffect } from 'react';
import Table from '../../components/devices/Table';
import { withFirebase } from '../../../Firebase/context';
import CircularProgress from '@material-ui/core/CircularProgress';

const updateDevice = firebase => async (deviceId, data) => {
  console.log(deviceId, data);
  return await firebase
    .device(deviceId)
    .update(data)
    .then(() => true)
    .catch(error => {
      console.error('Error updating document: ', error);
      return false;
    });
};

const addDevice = firebase => async data => {
  return await firebase
    .devices()
    .add(data)
    .then(result => ({
      id: result.id,
      imeiNumber: result.imeiNumber,
      name: result.name,
      model: result.model
    }))
    .catch(error => {
      console.error('Error updating document: ', error);
      return false;
    });
};

const removeDevice = firebase => async id => {
  return await firebase
    .device(id)
    .delete()
    .then(() => true)
    .catch(error => {
      console.error('Error updating document: ', error);
      return false;
    });
};

const Devices = ({ firebase }) => {
  const [devicesState, setDevices] = useState(null);

  useEffect(() => {
    if (!devicesState) {
      const getData = async () => {
        const transaction = await firebase.db
          .collection('transaction')
          .get()
          .then(querySnapshot => {
            var transaction = [];
            querySnapshot.forEach(function(doc) {
              transaction.push(doc.data());
            });

            return transaction;
          });

        const users = await firebase.db
          .collection('users')
          .get()
          .then(querySnapshot => {
            var users = [];
            querySnapshot.forEach(function(doc) {
              users.push({ id: doc.id, ...doc.data() });
            });

            return users;
          });

        firebase
          .devices()
          .get()
          .then(querySnapshot => {
            const devices = [];
            querySnapshot.forEach(doc => {
              if (doc) {
                const data = doc.data();
                if (doc.id && data) {
                  devices.push({
                    id: doc.id,
                    name: data.name,
                    imeiNumber: data.imeiNumber,
                    model: data.model,
                    transactions:
                      transaction
                        .map(x => {
                          if (x.deviceId === doc.id) {
                            const user = users.find(
                              user => user.id === x.ownerId
                            );

                            if (user) {
                              return {
                                email: user.email,
                                lendingDate: x.lendingDate,
                                returnDate: x.returnDate
                              };
                            }
                          }
                        })
                        .filter(x => x) || []
                  });
                }
              }
            });

            setDevices(devices);
          });
      };

      getData();
    }
  }, [devicesState]);

  return (
    <>
      {devicesState ? (
        <Table
          devices={devicesState}
          updateDevice={updateDevice(firebase)}
          addDevice={addDevice(firebase)}
          removeDevice={removeDevice(firebase)}
        />
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default withFirebase(Devices);
