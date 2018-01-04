import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

class Progress extends Component {


  render() {
    const n = 10

    const { now, max } = this.props
    const percent = ((now+1)/max)*10

    let progress = []
    for(let i = 1; i <= n; i++){
      percent > i
        ?progress[i]=1
        :progress[i]=0
    }
    return (
      <Style>
        {progress.map(per =>
          <div className='box' style={{width: `${100/n}%`}}>
            <div className='inbox' style={{background: per==1?`${AppStyle.color.main}`:'#ccc'}}>|</div>
          </div>
        )}
      </Style>
    );
  }
}

export default Progress;

const Style = Styled.div`
  .box{
    float: left;
    padding-right: 2px;
    box-sizing: border-box;
    .inbox{
      color: transparent;
    }
  }
`