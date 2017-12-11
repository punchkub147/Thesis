import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { register } from '../../api/firebase'
import { getToken } from '../../api/notification'

import Layout from '../../layouts'
import ToolBar from '../../layouts/ToolBar'

class Register3 extends Component {

  render() {
    const moveNext = _.get(this.props.location.state,'goNext')
    const data = ['เย็บ', 'ถัก', 'ทอ', 'สาน', 'ประกอบ', 'ประดับ']

    return (
      <Style moveNext={moveNext}>
        <div id="Register3">
          <ToolBar 
            title={this.props.route.title} 
            left={() => browserHistory.push({pathname: '/register2', state: { goNext: false }})} 
            right={() => browserHistory.push({pathname: '/search', state: { goNext: true }})}/>
          <div className="container content">
            <div className="row">
              {data.map(data =>
                <div className="col-6">
                  <div className="category">{data}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Style>
    );
  }
}

export default Register3;

const Style = Styled.div`
  #Register3{
    .content{
      animation-name: ${props => props.moveNext === true?'fadeInRight':'fadeInLeft'};
      animation-duration: 0.3s;
    }
    .category{
      height: 100px;
      text-align: center;
      line-height: 100px;
      ${AppStyle.shadow.lv1}
      margin-bottom: 20px;
    }
  }
`