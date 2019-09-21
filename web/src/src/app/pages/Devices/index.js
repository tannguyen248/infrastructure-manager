import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useEffect, useState } from 'react';
import { withFirebase } from '../../../Firebase/context';
import Table from '../../components/devices/Table';

const revokeDevice = firebase => async (deviceId) => {
  const transaction =  await firebase.revoke(deviceId).get().then(snapshot => {
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    return transactions[0];
  });
  console.log('transaction ', transaction);
  const revokeResult = await firebase.transactionWithId(transaction.id).update({
    returnDate: null,
    lendingDate: null,
    status: '',
    ownerId: '',
    email: ''
  }).then(result => {
    return true;
  }).catch(err => {
    console.error('Error while updating transaction', err);
    return false;
  })
}

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
    .then(async device => {
      const addedTransaction = await firebase.transaction().add({
        deviceId: device.id,
        returnDate: null,
        lendingDate: null,
        ownerId: null,
        email: null,
        status: null
      });

      return {
        id: device.id,
        imeiNumber: device.imeiNumber,
        name: device.name,
        model: device.model
      };
    })
    .catch(error => {
      console.error('Error updating document: ', error);
      return false;
    });
};

const removeDevice = firebase => async id => {
  const transactionWithDeviceId = await firebase
    .transaction()
    .where('deviceId', '==', id)
    .get()
    .then(snapshot => {
      const transactions = [];
      snapshot.docs.map(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return transactions;
    });

  console.log('hola', transactionWithDeviceId);

  const isTransactionRemove = await firebase.transactionWithId(transactionWithDeviceId[0].id).delete().then(() => {
    return true;
  }).catch(err => {
    console.error('Error deleting transaction', err);
  });

  if (isTransactionRemove) {
    return await firebase
      .device(id)
      .delete()
      .then(result => {
        console.log(result);
        return true;
      })
      .catch(error => {
        console.error("Error updating document: ", error);
        return false;
      });
  }
  return false;
};

const useDataSource = firebase => {
  const [dataSource, setDataSource] = useState(null);
  const [devices, setDevices] = useState(null);

  useEffect(() => {

    const getDeviceWithId = async (deviceId) => {
      if (devices) {
        return devices.find(device => device.id === deviceId);
      }
      const device = await firebase.device(deviceId).get().then(doc => {
        return {
          id: doc.id,
          ...doc.data()
        };
      }).catch(err => {
        console.error('Error while getting device ', err);
      });
      return device;
    }

    const getUserWithId = async ownerId => {
      if (!ownerId) {
        return;
      }

      if (localStorage.getItem(ownerId)) {
        return JSON.parse(localStorage.getItem(ownerId));
      }

      const user = await firebase
        .user(ownerId)
        .get()
        .then(user => {
          return { id: user.id, ...user.data() };
        });
      localStorage.setItem(ownerId, JSON.stringify(user));
      return user;
    }

    firebase.devices().onSnapshot(snapshot => {
      const devices = [];
      for (const doc of snapshot.docs) {
        devices.push({
          id: doc.id,
          ...doc.data()
        });
      }
      setDevices(devices);
    });

    firebase.transaction().onSnapshot(async snapshot => {
      const devices = [];
      for (const doc of snapshot.docs) {
        const { deviceId, status, lendingDate, returnDate, ownerId } = doc.data();
        const device = await getDeviceWithId(deviceId);
        if (device) {
          device["transaction"] = {};
          device.transaction["status"] = status;
          device.transaction["lendingDate"] = lendingDate;
          device.transaction["returnDate"] = returnDate;

          const user = await getUserWithId(ownerId);

          device.transaction["email"] = user
            ? user.email
            : device.transaction["email"];
          devices.push(device);
        }
      }
      setDataSource(devices);
    });
  }, []);

  return dataSource;
};

const Devices = ({ firebase, auth }) => {
  const devicesState = useDataSource(firebase);
  return (
    <>
      {devicesState ? (
        <Table
          devices={devicesState}
          updateDevice={updateDevice(firebase)}
          addDevice={addDevice(firebase)}
          removeDevice={removeDevice(firebase)}
          revokeDevice={revokeDevice(firebase)}
          auth={auth}
        />
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default withFirebase(Devices);
