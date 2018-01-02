import React from 'react';
import _ from 'lodash';
import * as firebase from 'firebase';
import '@firebase/firestore'
import cuid from 'cuid';
import moment from 'moment';

//import { userModel } from './model';

//import { Button, notification } from 'antd';

import connect from './connectFirebase';

export const config = {
  apiKey: "AIzaSyA9MUclF6i9c3CnAYPLFrSwuy-l37SI_b8",
  authDomain: "thesis-c3b42.firebaseapp.com",
  databaseURL: "https://thesis-c3b42.firebaseio.com",
  projectId: "thesis-c3b42",
  storageBucket: "thesis-c3b42.appspot.com",
  messagingSenderId: "985022808128"
};

firebase.initializeApp(config)

const offlineEnable = firebase.firestore().enablePersistence()
export const db = firebase.firestore();

export const storage = firebase.storage().ref();
export const auth = firebase.auth();
export const messaging = firebase.messaging();


/////////////////// DATABASE ////////////////////////

export const createUser = async (user, data, collection) => {
  // const firebase = await connect()
  // const db = await firebase.database().ref();
  const userData = user
  console.log('CREATED', user)
  //firebase.database().ref(`users/${user.uid}`).set(userData)
  await db.collection(collection).doc(user.uid).set(data)
}

export const updateAt = async (collection, doc, data) => {
  // const firebase = await connect()
  // const db = await firebase.database().ref();
  await _.set(data, 'updateAt', new Date())
  db.collection(collection).doc(doc).update(data)
  //db.child(ref).child(key).update(data)
}

/////////////////// AUTH ////////////////////////

export const getUser = async (collection, callback) => {
  // const firebase = await connect()
  // const auth = await firebase.auth()
  await auth.onAuthStateChanged(async (user) => {
    if(user){
      const docRef = await db.collection(collection).doc(user.uid)
      docRef.get()
      .then(doc => {
        doc.exists
          ?callback({
            uid: user.uid,
            data: doc.data(),
          })
          :callback(undefined)
      })
      .catch(error => 
          console.log("Error getting document:", error)
      )
    }
  });
}

export const loginWithEmail = async (email, password, callback) => {
  // const firebase = await connect()
  // const auth = await firebase.auth()
  auth.signInWithEmailAndPassword(email, password)
  .catch((error) => {
    callback(error.message);
    //openNotificationWithIcon('error',error.message,'');
  });
}

export const loginWithFacebook = async (callback) => {
  // const firebase = await connect()
  // const auth = await firebase.auth()
  const db = await firebase.database().ref()
  const provider = new firebase.auth.FacebookAuthProvider();
  
  provider.addScope('public_profile');
  provider.addScope('email');
  provider.addScope('user_photos');
  provider.addScope('user_birthday');
  provider.setCustomParameters({
    'display': 'popup'
  });
  auth.signInWithPopup(provider).then((result) => {
    console.log('facebookdatauser', result)
    const userMap = {
      displayName: result.user.displayName,
      // imageUrl: result.user.photoURL,
      email: result.user.email,
      uid: result.user.uid,
    }
    const userDetail = {
      // firstName: result.additionalUserInfo.profile.first_name,
      // lastName: result.additionalUserInfo.profile.last_name,
      age: result.additionalUserInfo.profile.age_range.min,
      gender: result.additionalUserInfo.profile.gender,
      // birthday: result.additionalUserInfo.profile.birthday,
    }
    db.child('users').child(userMap.uid).update(userMap)
    db.child('users').child(userMap.uid).child('detail').update(userDetail)
  }).catch(error => {
    console.log('FACEBOOK ERROR', error)
    callback(error.message)
  });
}

export const logout = async (callback) => {
  // const firebase = await connect()
  // const auth = await firebase.auth()
  auth.signOut().catch((error) => {
    callback(error.message);
    //openNotificationWithIcon('error',error.message,'');
  });
}

export const register = async (email, password, data, collection, callback) => {
  // const firebase = await connect()
  // const auth = await firebase.auth()
  const user = await auth.createUserWithEmailAndPassword(email, password)
  .catch( e => {
    callback(e.message);
    //openNotificationWithIcon('error',error.message,'');
  });
  if(user){
    await createUser(user, data, collection)
  }
}

export const updateUser = async (user) => {
  // const firebase = await connect()
  // const auth = await firebase.auth()
  // const db = await firebase.database().ref()
  await auth.currentUser.updateProfile(user)
  // db.child('users').child(user.uid).update(user)
}
