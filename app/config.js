const isProduction = false;

export const firebaseConfig = isProduction ?
  {
    apiKey: "AIzaSyBJZbv40pK9aC-Ri_lgdvzUiCVsVn5oQP4",
    authDomain: "infrastructure-manager-5f00f.firebaseapp.com",
    databaseURL: "https://infrastructure-manager-5f00f.firebaseio.com",
    projectId: "infrastructure-manager-5f00f",
    storageBucket: "infrastructure-manager-5f00f.appspot.com",
    messagingSenderId: "947994363856",
    appId: "1:947994363856:web:e37f9ebf6a375c7866dbd5"
  } : {
    apiKey: "AIzaSyCs-2HFwKwJ1vIP7FJZIdvkO2l7PmPDGZU",
    authDomain: "device-management-a36ee.firebaseapp.com",
    databaseURL: "https://device-management-a36ee.firebaseio.com",
    projectId: "device-management-a36ee",
    storageBucket: "device-management-a36ee.appspot.com",
    messagingSenderId: "20620421769",
    appId: "1:20620421769:web:f9ec5b22b351cde116b458",
    measurementId: "G-JJ81SZ45FS"
  };


export const androidClientId = '947994363856-hn1iqnn9on8h8dn7sgsj6j7ibc326uaf.apps.googleusercontent.com';

export const iosClientId = '947994363856-nr8inaqiu4ug53984vjiefj3ld91uuhe.apps.googleusercontent.com';
