import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

class Step extends Component {

  render() {

    return (
      <Style>
        <div id="Step">
          <div className="step">
            <div className="">O</div>
            ลงทะเบียน
          </div>
          <div className="step">
            <div className="">O</div>
            ประวัติ
          </div>
          <div className="step">
            <div className="">O</div>
            ถวามถนัด
          </div>
          <div className="step">
            <div className="">O</div>
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