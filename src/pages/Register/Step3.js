import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 

import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

import FormAbilities from '../../components/FormAbilities';
import Bg from '../../components/Bg'

class Register3 extends Component {

  render() {
    return (
      <Bg>
        <Style>
            <ToolBar 
              title={this.props.route.title} 
              left={() => browserHistory.push('/register2')} 
              //right={this.handleUpdateAbilities}
              />
            <div className='card'>
              <Step step='3'/>
              <FormAbilities push='/register4' />
            </div>
        </Style>
      </Bg>
    );
  }
}

export default Register3;

const Style = Styled.div`
  .card{
    position: relative;
    width: 100%;
    background: ${AppStyle.color.bg};
    ${AppStyle.shadow.lv1}
  }
`
