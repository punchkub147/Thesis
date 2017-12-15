import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 

import Layout from '../layouts'

import { loginWithEmail, auth } from '../../api/firebase'

class WorkOnHome extends Component {

  componentDidMount() {

  }

  render() {

    return (
      <Style>
        <Layout>
          <div id="WorkOnHome">
            WorkOnHome
          </div>
        </Layout>
      </Style>
    );
  }
}

export default WorkOnHome;

const Style = Styled.div`
  #WorkOnHome{    

  }
`