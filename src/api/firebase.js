import React from 'react';
import _ from 'lodash';
import * as firebase from 'firebase';
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

export const db = firebase.database().ref();
export const storage = firebase.storage().ref();
export const auth = firebase.auth();
export const messaging = firebase.messaging();

///////////////////  ////////////////////////
