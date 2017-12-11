import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

class Dashboard extends Component {

  render() {

    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Dashboard">
            Dashboard
          </div>
        </Style>
      </Layout>
    );
  }
}

export default Dashboard;

const Style = Styled.div`
  #Dashboard{
    color: ${AppStyle.color.main}
  }

`