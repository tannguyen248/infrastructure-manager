import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBJZbv40pK9aC-Ri_lgdvzUiCVsVn5oQP4',
  authDomain: 'infrastructure-manager-5f00f.firebaseapp.com',
  databaseURL: 'https://infrastructure-manager-5f00f.firebaseio.com',
  projectId: 'infrastructure-manager-5f00f',
  storageBucket: 'infrastructure-manager-5f00f.appspot.com',
  messagingSenderId: '947994363856',
  appId: '1:947994363856:web:e37f9ebf6a375c7866dbd5'
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);

    /* Helper */

    this.fieldValue = app.firestore.FieldValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.firestore();

    /* Social Sign In Method Provider */

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
    this.twitterProvider = new app.auth.TwitterAuthProvider();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider);

  doSignInWithFacebook = () => this.auth.signInWithPopup(this.facebookProvider);

  doSignInWithTwitter = () => this.auth.signInWithPopup(this.twitterProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT
    });

  doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then(snapshot => {
            const dbUser = snapshot.data();

            // default empty roles
            if (!dbUser.roles) {
              dbUser.roles = {};
            }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  db = () => this.db;
  // *** User API ***

  user = uid => this.db.doc(`users/${uid}`);

  users = () => this.db.collection('users');

  device = uid => this.db.doc(`devices/${uid}`);

  devices = () => this.db.collection('devices');

  // *** Message API ***

  message = uid => this.db.doc(`messages/${uid}`);

  messages = () => this.db.collection('messages');

  // Device API
  attachTokenToDevice = (deviceId, token) =>
    this.db.collection('tokens').add({ deviceId, token });

  getDeviceToken = deviceId => this.db.ref('tokens' + deviceId + '/uid');

  assign = (deviceId, userId) =>
    this.db.collection('transaction').add({
      payload: {
        assignDate: this.db.Timestamp.now,
        deviceId: deviceId,
        lendingDate: this.db.Timestamp.now,
        ownerId: userId,
        returnDate: null,
        revokeDate: null,
        status: 'ASSIGNED'
      }
    });

  revoke = (deviceId, userId, uid) =>
    this.db.collection('transaction').add({
      payload: {
        assignDate: null,
        deviceId: deviceId,
        lendingDate: null,
        ownerId: userId,
        returnDate: this.db.Timestamp.now,
        revokeDate: this.db.Timestamp.now,
        status: 'REVOKED'
      }
    });
}

export default Firebase;
