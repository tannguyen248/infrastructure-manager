import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useEffect, useState } from 'react';
import { withFirebase } from '../../../Firebase/context';
import Table from '../../components/devices/Table';

const updateDevice = firebase => async (deviceId, data) => {
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

const getDeviceWithId = firebase => async deviceId => {
    return await firebase.device(deviceId).then(snapshot => {
      return snapshot.data();
    });
}

const Devices = ({ firebase, auth }) => {
  const [devicesState, setDevices] = useState(null);

  useEffect(() => {
    if (!devicesState) {
      const getData = async () => {
        const transactions = await firebase.db
          .collection('transaction')
          .get()
          .then(querySnapshot => {
            var transaction = [];
            querySnapshot.forEach(function(doc) {
              transaction.push(doc.data());
            });

            console.log('transaction', transaction);
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

          const getDevices =  await firebase.devices().get().then(snapshot => {
              const devices = [];
                snapshot.forEach(doc => {
                  const data = doc.data();
                  if (doc.id && data) {
                    const transaction = transactions.find(
                      x => x.deviceId === doc.id
                    );
                    const user =
                      (transaction &&
                        users.find(x => x.id === transaction.ownerId)) ||
                      null;

                  devices.push({
                    id: doc.id,
                    name: data.name,
                    imeiNumber: data.imeiNumber,
                    model: data.model,
                    transaction:
                      (transaction && {
                        email: user && user.email,
                        lendingDate: transaction.lendingDate,
                        returnDate: transaction.returnDate,
                        status: transaction.status
                      }) ||
                      null
                  });
                }});
              return devices;
            });


        firebase
          .devices()
          .onSnapshot(querySnapshot => {
            const devices = [];
            querySnapshot.forEach(doc => {
              if (doc) {
                const data = doc.data();
                if (doc.id && data) {
                  const transaction = transactions.find(
                    x => x.deviceId === doc.id
                  );
                  const user =
                    (transaction &&
                      users.find(x => x.id === transaction.ownerId)) ||
                    null;
                  devices.push({
                    id: doc.id,
                    name: data.name,
                    imeiNumber: data.imeiNumber,
                    model: data.model,
                    transaction:
                      (transaction && {
                        email: user && user.email,
                        lendingDate: transaction.lendingDate,
                        returnDate: transaction.returnDate,
                        status: transaction.status
                      }) ||
                      null
                  });
                }
              }
          });
            setDevices(devices);
          });

          firebase.transaction().onSnapshot(snapshot => {
            const devices = [];

            snapshot.forEach(async doc => {
              if (doc) {
                const storage = getDevices;
                const data = doc.data();
                if (doc.id && data) {
                  const { deviceId, status, lendingDate, returnDate, ownerId } = data;
                  if (storage) {
                    const device = storage.find(x => x.id === deviceId);
                    if (device) {
                      // if (device.transaction) {
                      //   device.transaction.status = status;
                      // }
                      device['transaction'] = {};
                      device.transaction['status'] = status;
                      device.transaction['lendingDate'] = lendingDate;
                      device.transaction['returnDate'] = returnDate;

                      const user = users.find(x => x.id === ownerId);

                      device.transaction['email'] = user ? user.email : device.transaction['email'];
                      devices.push(device);
                    }
                  }
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
          auth={auth}
        />
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default withFirebase(Devices);
