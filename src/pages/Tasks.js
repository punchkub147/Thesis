import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

class Tasks extends Component {

  render() {
    return (
      <Layout location={this.props.location}>
        <Style>
          <div id="Tasks">
            Tasks
          </div>
        </Style>
      </Layout>
    );
  }
}

export default Tasks;

const Style = Styled.div`
  #Tasks{
    color: ${AppStyle.color.main}
  }

`