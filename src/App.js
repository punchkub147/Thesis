import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import AppRouter from './router'
import Styled from 'styled-components'

import NavBar from './layouts/NavBar'

import { setUpNoti } from './api/notification'
import { register, getUser, updateAt, db, auth } from './api/firebase'

window.onbeforeunload = function(){
  // PushSelf({
  //   title: "กลับมาเร็วๆนะ",
  //   body: 'มีงานรออยู่อีกเยอะ'
  // })
}

class App extends Component {

  state = {
    user: {
      uid: '',
      user: {
        uid: '',
        data: {
          fname: '',
          lname: '',
          phone: '',
          personId: '',
          address: {
            area: '',
            district: '',
            homeNo: '',
            postCode: '',
            province: '',
            road: '',
          }
        }
      }
    }
  }

  async componentDidMount() {
    setUpNoti()
    auth.onAuthStateChanged(async user => {
      // const docRef = await db.collection("employee").doc(user.uid)
      // docRef.get().then(doc => {
      //   doc.exists
      //     ?this.setState({
      //       user: {
      //         uid: user.uid,
      //         data: doc.data()
      //       }
      //     })
      //     :this.setState({user: undefined})
      // }).catch(error => 
      //     console.log("Error getting document:", error)
      // )
      browserHistory.push(user?'/search':'/login')
    })

  }

  render() {
    return (
      <div>
        <AppRouter/>
      </div>
    );
  }
}

export default App;
