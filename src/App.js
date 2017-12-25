import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import AppRouter from './router'
import Styled from 'styled-components'
import store from 'store'

import NavBar from './layouts/NavBar'

import { setUpNoti } from './api/notification'
import { register, getUser, updateAt, db, auth } from './api/firebase'
import { locale } from 'moment';

window.onbeforeunload = function(){
  // PushSelf({
  //   title: "กลับมาเร็วๆนะ",
  //   body: 'มีงานรออยู่อีกเยอะ'
  // })
}

class App extends Component {

  async componentDidMount() {
    console.log('OPEN APP')
    console.log(localStorage)

    setUpNoti()

    await auth.onAuthStateChanged(async user => {
      if(user){
        store.set('user', {user})

        const employer = await db.collection('employer').doc(user.uid)
        employer.get().then(data => 
          data.exists
            ?store.set('employer',{uid: data.id, data: data.data()})
            :store.set('employer',undefined)
        ) 

        const employee = await db.collection('employee').doc(user.uid)
        employee.get().then(data => 
          data.exists
            ?store.set('employee',{uid: data.id, data: data.data()})
            :store.set('employee',undefined)
        )

      }else{
        store.set('user',undefined)
        store.set('employee',undefined)
        store.set('employer',undefined)
      }
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
