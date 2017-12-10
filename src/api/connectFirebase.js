export default async function connect() {
  const firebase = await import('firebase')
  const config = {
    apiKey: "AIzaSyA9MUclF6i9c3CnAYPLFrSwuy-l37SI_b8",
    authDomain: "thesis-c3b42.firebaseapp.com",
    databaseURL: "https://thesis-c3b42.firebaseio.com",
    projectId: "thesis-c3b42",
    storageBucket: "thesis-c3b42.appspot.com",
    messagingSenderId: "985022808128"
  };
  try {
    firebase.initializeApp(config)
  } catch (err) {
    // we skip the "already exists" message which is
    // not an actual error when we're hot-reloading
    if (!/already exists/.test(err.message)) {
      console.error('Firebase initialization error', err.stack)
    }
  }

  return await firebase
}