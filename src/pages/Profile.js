import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

class Profile extends Component {

  render() {

    return (
      <Layout location={this.props.location}>
        <Style>
          <div id="Profile">
            Profile
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