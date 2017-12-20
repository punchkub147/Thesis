import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import Layout from '../layouts'

import { getUser, auth, db } from '../api/firebase'

class Profile extends Component {

  state = {
    user: {
      uid: '',
      data: '',
    }
  }

  componentDidMount() {
    getUser('employee', user => {
      this.setState({user})
    })
  }

  logout = () => {
    auth.signOut()
    browserHistory.push('/login')
  }

  render() {
    const { data } = this.state.user
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Profile">
            <img src=""/>
            {_.get(data,'fname')}
            {_.get(data,'lname')}
            {_.get(data,'phone')}
            {_.get(data,'personId')}
            {_.get(data.address,'homeNo')}
            {_.get(data.address,'road')}
            {_.get(data.address,'area')}
            {_.get(data.address,'district')}
            {_.get(data.address,'province')}
            {_.get(data.address,'postcode')}
            <button onClick={this.logout}>LOGOUT</button>
          </div>
        </Style>
      </Layout>
    );
  }
}

export default Profile;

const Style = Styled.div`
  #Profile{
    color: ${AppStyle.color.main}
  }

`