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
};

const revokeDevice = firebase => async (deviceId, transactionId) => {
  const transaction = await firebase
    .getTransaction(transactionId)
    .get()
    .then(doc => ({ id: doc.id, ...doc.data() }));
  console.log(transactionId);
  console.log('transaction id', transaction.id);
  console.log('transaction owner id', transaction.ownerId);
  console.log('transaction device id', transaction.deviceId);
  const historyAdded = await firebase
    .addDataToHistory({
      date: new Date(),
      deviceId: transaction.deviceId,
      event: 'returned',
      userId: transaction.ownerId
    })
    .then(res => {
      return true;
    })
    .catch(err => {
      return false;
    });

  if (historyAdded) {
    firebase
      .getTransaction(transactionId)
      .update({
        ownerId: '',
        status: '',
        lendingDate: null,
        returnDate: null,
        email: ''
      })
      .then(() => true)
      .catch(err => false);
  }
};

const Devices = ({ firebase, auth }) => {
  const [devicesState, setDevices] = useState(null);
  const [transactionsState, setTransactions] = useState(null);

  useEffect(() => {
    const unsubcribe = firebase.transaction().onSnapshot(snapshot => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTransactions(transactions);
    });

    return () => {
      unsubcribe && unsubcribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = firebase.devices().onSnapshot(snapshot => {
      const devices = [];
      snapshot.forEach(doc => {
        if (doc) {
          const data = doc.data();
          if (doc.id && data) {
            const transaction =
              transactionsState &&
              transactionsState.find(x => x.deviceId === doc.id);

            devices.push({
              id: doc.id,
              name: data.name,
              imeiNumber: data.imeiNumber,
              model: data.model,
              transaction: transaction && { ...transaction }
            });
          }
        }
      });

      setDevices(devices);
    });

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [transactionsState]);

  return (
    <>
      {devicesState ? (
        <>
          <Table
            devices={devicesState}
            updateDevice={updateDevice(firebase)}
            addDevice={addDevice(firebase)}
            removeDevice={removeDevice(firebase)}
            revokeDevice={revokeDevice(firebase)}
            auth={auth}
          />
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default withFirebase(Devices);
