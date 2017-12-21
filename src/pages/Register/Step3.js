import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { register } from '../../api/firebase'
import { getToken } from '../../api/notification'

import Layout from '../../layouts'
import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

class Register3 extends Component {

  render() {
    const data = ['เย็บ', 'ถัก', 'ทอ', 'สาน', 'ประกอบ', 'ประดับ']

    return (
      <Style>
        <div id="Register3">
          <ToolBar 
            title={this.props.route.title} 
            left={() => browserHistory.push('/register2')} 
            right={() => browserHistory.push('/search')}/>

          <Step step='3'/>
          
          <div className=" content">
            <div className="">
              {data.map(data =>
                <div className="category">
                  <div className="card">{data}</div>
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
      animation-name:fadeInRight;
      animation-duration: 0.3s;
    }
    .category{
      width: 50%;
      height: 100px;
      text-align: center;
      line-height: 100px;
      float: left;
      background: #ccc;
      padding: 10px 5px;
    }
    .card{
      background: white;

    }
  }
`