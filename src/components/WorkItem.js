import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

class WorkItem extends Component {

  render() {
    const { data, i } = this.props

    return (
      <Style fade={i*0.2}>
        <Link to={`/work/${data.work_id}`}>
          <div id="WorkItem">

            <div className="image">
              <img src={data.image}/>
            </div>

            <div className="detail">
              <div className="name">{data.name}</div>
              <div className="employer">{data.employer_name}</div>
            </div>

            <div className="price">
              {`${data.piece} : ${data.piece*data.price}฿`}
            </div>

          </div>
        </Link>
      </Style>
    );
  }
}

export default WorkItem;

const Style = Styled.div`
#WorkItem{
  
  animation-name: fadeInUp;
  animation-duration: ${props => props.fade+0.2}s;

  width: 100%;
  height: 90px;
  clear: both;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}

  margin-bottom: 10px;
  .image{
    width: 90px;
    height: 90px;
    float: left;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .detail{
    float: left;
    padding: 10px;
    .name{
      ${AppStyle.font.read1}
    }
    .employer{
      ${AppStyle.font.read2}
    }
  }
  .price{
    float: right;
    padding: 10px;
    ${AppStyle.font.hilight}
  }

}
`