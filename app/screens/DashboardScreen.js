import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableHighlight, ActivityIndicator } from 'react-native';
import { Constants, BarCodeScanner, Permissions } from 'expo';

import app from 'firebase/app';
import 'firebase/firestore';

export default class DashboardScreen extends Component {
  state = {
    hasCameraPermission: null,
    visibleScanner: false,
    borrowButtonTitle: 'BORROW',
    isProcessing: false
  };

  db = app.firestore();

  firestoreCollection = {
    transaction: this.db.collection('transaction'),
    team: this.db.collection('team'),
    history: this.db.collection('history'),
    devices: this.db.collection('devices')
  };

  componentDidMount() {
    this._requestCameraPermission();
  }

  _writeHistory = (date, data) => {
    const newData = {
      date: date,
      deviceId: data.deviceId,
      event: data.event,
      userId: data.userId
    };

    let addDoc = this.firestoreCollection.history.add(newData).then(ref => {
      console.log('Write history successfylly with id : ', ref.id);
      this._stopProcessing();
    }).catch(e => {
      console.log(e);
    })
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  _updateBorrowUser = (deviceId) => {
    const userId = this.props.navigation.state.params.uid;
    const transactionCollection = this.firestoreCollection.transaction;
    const now = new Date();

    transactionCollection.where('deviceId', '==', deviceId).get().then(snapshot => {
      console.log('================snapshot');

      // Nobody borrowed before
      if (!snapshot || snapshot.empty) {
        console.log('Empty snapshot!');
        const data = {
          assignedDate: now,
          deviceId: deviceId,
          lendingDate: now,
          ownerId: userId,
          status: "assigned"
        };

        transactionCollection.add(data).then(ref => {
          console.log('Added document with ID: ', ref.id);

          const history = {
            deviceId: deviceId,
            event: 'assigned',
            userId: userId
          };

          this._writeHistory(now, history);
        });

        return;
      }

      console.log('Update snapshot!');

      const newData = {
        ownerId: userId,
        assignedDate: now,
        lendingDate: now,
        returnDate: now
      };

      snapshot.forEach(doc => {
        console.log(doc.data().ownerId);

        const returedHistory = {
          deviceId: deviceId,
          event: 'returned',
          userId: doc.data().ownerId
        };

        transactionCollection.doc(doc.id).update(newData).then(() => {
          console.log('Update data successfully!');
          this._writeHistory(now, returedHistory);
        });
      });

      console.log('addHistory');
      const addHistory = {
        deviceId: deviceId,
        event: 'assigned',
        userId: userId
      };

      this._writeHistory(now, addHistory);
    });
  }

  _stopProcessing = () => {
    this.setState({ isProcessing: false });
  }

  _startProcessing = () => {
    this.setState({ isProcessing: true });
  }

  _checkValidDevice = async (deviceId) => {
    this.firestoreCollection.devices.doc(deviceId).get()
    .then(snapshot => {
      if (!snapshot || snapshot.empty || !snapshot.data()) {
        console.log('Invalid device.');
        Alert.alert('Invalid device', 'Not found this device!');
        this._stopProcessing();
        return;
      }

      this._updateBorrowUser(deviceId);
    });
  }

  _handleBarCodeRead = data => {
    if (!data || !data.data) {
      Alert.alert(
        'Scan fail!',
        'Scan fail. Please try again!'
      );

      return;
    }

    this._stopScanner();
    this._startProcessing();

    const deviceId = data.data;

    try {
      this.firestoreCollection.team.where('email', '==', this.props.navigation.state.params.email).get()
        .then(snapshot => {
          if (snapshot.empty) {
            console.log('No matching documents.');
            Alert.alert('Invalid user', 'You not belong any team!');
            this._stopProcessing();
            return;
          }

          this._checkValidDevice(deviceId);
        });
    } catch (e) {
      console.log(e);
      this._stopProcessing();
    }
  };

  _stopScanner = () => {
    this.setState({ visibleScanner: false, borrowButtonTitle: 'BORROW' });
  }

  _startStopScanner = () => {
    if (this.state.visibleScanner) {
      this._stopScanner();
    } else {
      this.setState({ visibleScanner: true, borrowButtonTitle: 'STOP' });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.visibleScanner && (
          <View style={styles.scannerWrapper}>
            {this.state.hasCameraPermission === null ?
              <Text>Requesting for camera permission</Text> :
              this.state.hasCameraPermission === false ?
                <Text>Camera permission is not granted</Text> :
                <BarCodeScanner
                  onBarCodeRead={this._handleBarCodeRead}
                  style={{ height: 200, width: 200 }}
                />
            }
          </View>
        )
        }

        < View style={styles.buttonWrapper}>
          <TouchableHighlight style={styles.startButton} onPress={this._startStopScanner} disabled={this.state.isProcessing}>
            <Text style={styles.buttonText}>{this.state.borrowButtonTitle}</Text>
          </TouchableHighlight>

          <TouchableHighlight style={styles.signoutButton} onPress={() => firebase.auth().signOut()} disabled={this.state.isProcessing}>
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableHighlight>
          {
            this.state.isProcessing && (
              <View style={styles.spinnerWrapper}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Processing...</Text>
              </View>
            )
          }

        </View>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  scannerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    marginTop: 20,
    width: 200
  },
  startButton: {
    backgroundColor: 'blue',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  signoutButton: {
    backgroundColor: 'red',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: {
    fontSize: 24,
    color: 'white'
  },
  spinnerWrapper: {
    alignItems: "center"
  }
});
