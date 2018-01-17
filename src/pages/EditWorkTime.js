import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import ToolBar from '../layouts/ToolBar'

import FormWorkTime from '../components/FormWorkTime';

class EditWorkTime extends Component {
  componentDidMount() {
    window.scrollTo(0, 0)
  }
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