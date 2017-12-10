import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import AppRouter from './router'
import Styled from 'styled-components'

import { setUpNoti } from './api/notification'

import NavBar from './layouts/NavBar'

window.onbeforeunload = function(){
  // PushSelf({
  //   title: "กลับมาเร็วๆนะ",
  //   body: 'มีงานรออยู่อีกเยอะ'
  // })
}

class App extends Component {

  async componentDidMount() {
    setUpNoti()
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
