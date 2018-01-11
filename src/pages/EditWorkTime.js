import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import ToolBar from '../layouts/ToolBar'

import FormWorkTime from '../components/FormWorkTime';

class EditWorkTime extends Component {

  render() {
    return (
      <Style>
        <div id="EditWorkTime">
          <ToolBar 
            title='เวลาทำงาน'
            left={() => browserHistory.goBack()} 
            //right={this.handleUpdateAbilities}
            />
          <FormWorkTime push='/tasks' />
        </div>
      </Style>
    );
  }
}

export default EditWorkTime;

const Style = Styled.div`
  #EditWorkTime{
    // .animate{
    //   animation-name:fadeInUp;
    //   animation-duration: 0.3s;
    // }
    
  }
`