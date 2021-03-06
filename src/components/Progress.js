import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style'

import { Progress } from 'antd';

export default class extends Component {

  render() {
    const n = 10

    const { now, max } = this.props
    let percent = (now/max)*100
    if(percent>=100)percent=100

    let progress = []
    for(let i = 1; i <= n; i++){
      percent > i
        ?progress[i]=1
        :progress[i]=0
    }
    return (
      <Style percent={percent}>
        {/*progress.map(per =>
          <div className='box' style={{width: `${100/n}%`}}>
            <div className='inbox' style={{background: per==1?`${AppStyle.color.main}`:'#ccc'}}>|</div>
          </div>
        )*/}
        <Progress 
          percent={percent} 
          status={percent<100&&'active'}
          showInfo={false} 
          strokeWidth={15} />
      </Style>
    );
  }
}

const Style = Styled.div`
  .box{
    float: left;
    padding-right: 2px;
    box-sizing: border-box;
    .inbox{
      color: transparent;
    }
  }
  .ant-progress-bg{
    background: ${props => props.percent<100
      ?AppStyle.color.main
      :AppStyle.color.sub
    };
    height: 15px;
    border-radius: 0px;
  }
  .ant-progress-status-success .ant-progress-bg{
    background: ${AppStyle.color.sub};
  }
  .ant-progress-inner{
    background-color: ${AppStyle.color.bg2};
    border-radius: 0px;
  }
  .ant-progress-status-active .ant-progress-bg:before{
    border-radius: 0px;
  }
`