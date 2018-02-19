import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'

import TopStyle from './TopStyle'

class Step extends Component {

  render() {
    const { step } = this.props
    return (
      <Style>
        <TopStyle/>
          <div className="step">
            {step >= 1
              ?<div className="o"/>
              :<div className="x"/>
            }
            {step >= 1
              ?<div className='line-o'/>     
              :<div className='line-x'/>   
            }     
            ลงทะเบียน
          </div>
          <div className="step">
            {step >= 2
              ?<div className="o"/>
              :<div className="x"/>
            }
            {step >= 2
              ?<div className='line-o'/>     
              :<div className='line-x'/>   
            }  
            ประวัติ
          </div>
          <div className="step">
            {step >= 3
              ?<div className="o"/>
              :<div className="x"/>
            }
            {step >= 3
              ?<div className='line-o'/>     
              :<div className='line-x'/>   
            }  
            ถวามถนัด
          </div>
          <div className="step">
            {step >= 4
              ?<div className="o"/>
              :<div className="x"/>
            }
            วันที่ทำงาน
          </div>
        <div style={{clear:'both'}}/>
      </Style>
    );
  }
}

export default Step;

const Style = Styled.div`
  width: 100%;
  
  .step{
    margin-top: 10px;
    position: relative;
    width: 25%;
    text-align: center;
    float: left;
    .line-o{
      height: 5px;
      width: 100%;
      position: relative;
      left: 50%;
      top: -25px;
      background: ${AppStyle.color.main};
    }
    .line-x{
      height: 5px;
      width: 100%;
      position: relative;
      left: 50%;
      top: -25px;
      background: ${AppStyle.color.bg2};
    }
  }

  .o{
    width: 25px;
    height: 25px;
    margin: 10px auto;
    border-radius: 100%;
    background: ${AppStyle.color.main};
    position: relative;
  }
  .x{
    width: 25px;
    height: 25px;
    margin: 10px auto;
    border-radius: 100%;
    background: ${AppStyle.color.bg2};
  }
`