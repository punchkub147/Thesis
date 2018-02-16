import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'

class Step extends Component {

  render() {
    const { step } = this.props
    return (
      <Style>
          <div className="step">
            {step >= 1
              ?<div className="o"/>
              :<div className="x"/>
            }
            {step >= 2
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
            {step >= 3
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
            {step >= 4
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
  padding: 10px;
  .step{
    position: relative;
    width: 25%;
    text-align: center;
    float: left;
    .line-o{
      height: 2px;
      width: 100%;
      position: relative;
      left: 50%;
      top: -18px;
      background: ${AppStyle.color.main};
    }
    .line-x{
      height: 2px;
      width: 100%;
      position: relative;
      left: 50%;
      top: -18px;
      background: ${AppStyle.color.gray};
    }
  }

  .o{
    width: 15px;
    height: 15px;
    margin: 10px auto;
    border-radius: 100%;
    background: ${AppStyle.color.main};
    position: relative;
  }
  .x{
    width: 15px;
    height: 15px;
    margin: 10px auto;
    border-radius: 100%;
    background: ${AppStyle.color.gray};
  }
`