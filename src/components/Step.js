import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

class Step extends Component {

  render() {
    const { step } = this.props
    return (
      <Style>
        <div id="Step">
          <div className="step">
            <div className="">{step >= 1?'O':'X'}</div>
            ลงทะเบียน
          </div>
          <div className="step">
            <div className="">{step >= 2?'O':'X'}</div>
            ประวัติ
          </div>
          <div className="step">
            <div className="">{step >= 3?'O':'X'}</div>
            ถวามถนัด
          </div>
          <div className="step">
            <div className="">{step >= 4?'O':'X'}</div>
            วันที่ทำงาน
          </div>
        </div>
      </Style>
    );
  }
}

export default Step;

const Style = Styled.div`
#Step{
  width: 100%;
  padding: 16px;
  .step{
    width: 25%;
    margin-bottom: 20px;
    text-align: center;
    float: left;
  }
}
`