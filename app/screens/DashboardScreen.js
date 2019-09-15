import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableHighlight } from 'react-native';
import { Constants, BarCodeScanner, Permissions } from 'expo';

import app from 'firebase/app';
import 'firebase/firestore';

export default class DashboardScreen extends Component {
  state = {
    hasCameraPermission: null,
    visibleScanner: false,
    borrowButtonTitle: 'BORROW'
  };

  db = app.firestore();

  firestoreCollection = {
    transaction: this.db.collection('transaction'),
    team: this.db.collection('team'),
    history: this.db.collection('history')
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
      this._startStopScanner();
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

        let addDoc = transactionCollection.add(data).then(ref => {
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

  _handleBarCodeRead = data => {
    if (!data || !data.data) {
      Alert.alert(
        'Scan fail!',
        'Scan fail. Please try again!'
      );

      return;
    }

    const deviceId = data.data;

    try {
      this.firestoreCollection.team.where('email', '==', this.props.navigation.state.params.email).get()
        .then(snapshot => {
          if (snapshot.empty) {
            console.log('No matching documents.');
            Alert.alert('Invalid user', 'You not belong any team!');
            return;
          }

          this._updateBorrowUser(deviceId);
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    } catch (e) {
      console.log(e);
    }
  };

  _startStopScanner = () => {
    if (this.state.visibleScanner) {
      this.setState({ visibleScanner: false, borrowButtonTitle: 'BORROW' });
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
          <TouchableHighlight style={styles.startButton} onPress={this._startStopScanner}>
            <Text style={styles.buttonText}>{this.state.borrowButtonTitle}</Text>
          </TouchableHighlight>

          <TouchableHighlight style={styles.signoutButton} onPress={() => firebase.auth().signOut()}>
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableHighlight>
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
  }
});
