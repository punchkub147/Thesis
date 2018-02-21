import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 

import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'
import FormProfile from '../../components/FormProfile'
import Bg from '../../components/Bg'

class Register2 extends Component {

  render() {
    return (
      <Bg>
        <Style >
          <ToolBar
            title={this.props.route.title} 
            // left={() => browserHistory.push({pathname: '/register', state: { goNext: false }})} 
            // right={e => this.handleProfile(e)}
            />
          

          <div className='card'>
            <Step step='2'/>
            <FormProfile push='/register3'/>
          </div>
        </Style>
      </Bg>
    );
  }
}

export default Register2;

const Style = Styled.div`
  .card{
    position: relative;
    width: 100%;
    background: ${AppStyle.color.bg};
    ${AppStyle.shadow.lv1}
    margin-bottom: 40px;
  }
`
