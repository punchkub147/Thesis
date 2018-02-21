import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 

import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

import FormWorkTime from '../../components/FormWorkTime'

import bg2 from '../../img/bg2.jpg'
import Bg from '../../components/Bg'

class Register4 extends Component {

  render() {
    return (
      <Bg>
        <Style>
          <ToolBar 
            title={this.props.route.title} 
            left={() => browserHistory.push('/register3')} 
            //right={this.handleUpdateAbilities}
            />
          <div className='card'>
            <Step step='4'/>
            <FormWorkTime  push='/search' />
          </div>
        </Style>
      </Bg>
    );
  }
}

export default Register4;

const Style = Styled.div`
  .card{
    position: relative;
    width: 100%;
    background: ${AppStyle.color.bg};
    ${AppStyle.shadow.lv1}
    margin-bottom: 40px;
  }
`
