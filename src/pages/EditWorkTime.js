import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import ToolBar from '../layouts/ToolBar'

import FormWorkTime from '../components/FormWorkTime';
import Bg from '../components/Bg';
import Card from '../components/Card';

import TopStyle from '../components/TopStyle';

class EditWorkTime extends Component {
  componentDidMount() {
    window.scrollTo(0, 0)
  }
  render() {
    return (
      <Bg>
        <Style>
          <ToolBar 
            title='เวลาทำงาน'
            left={() => browserHistory.goBack()} 
            //right={this.handleUpdateAbilities}
            />
          
          <Card>
            <TopStyle/>
            <FormWorkTime push='/tasks' />
          </Card>
        </Style>
      </Bg>
    );
  }
}

export default EditWorkTime;

const Style = Styled.div`
  // .animate{
  //   animation-name:fadeInUp;
  //   animation-duration: 0.3s;
  // }
`