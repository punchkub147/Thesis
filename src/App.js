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

  async componentDidMount() {
    setUpNoti()

    console.log('CDM APP')
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
