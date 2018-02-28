import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import moment from 'moment'

import { secToText } from '../functions/moment'

import best from '../img/best.png'

class WorkItem extends Component {

  render() {
    const { data, i } = this.props

    return (
      <Style fade={i+1}>
        <Link to={`/work/${data._id}`}>
          <div className='card'>

            <div className='image'>
              <img src={data.image}/>
            </div>

            <div className='detail'>
              <div className='name'>{data.name}</div>
              <div className='price'>{data.piece} ชิ้น {data.price*data.piece}.-</div>
              <div className='startAt'>วันที่เริ่มงาน {moment(data.startAt).format('DD/MM/YY')}</div>
              <div className='line'/>
              <div className='location'>{data.employer.name} {data.employer.area} {data.employer.province}</div>
            </div>
            <div style={{clear: 'both'}}/>
          </div>
        </Link>
      </Style>
    );
  }
}

export default WorkItem;

const Style = Styled.div`
  animation-name: fadeInUp;
  animation-duration: ${props => props.fade>2?3*0.2:props.fade*0.2}s;
  .card{
    position: relative;
    width: 100%;
    ${AppStyle.shadow.lv1}
    background: ${AppStyle.color.card};
    
    .image{
      width: 30%;
      float: left;
      img{
        width: 100%;
        height: 100px;
        object-fit: cover;
      }
    }


    margin-bottom: 10px;
  }

  .badge{
    position: absolute;
    width: 50px;
    height: 50px;
    top: 0;
    right: 10px;
    background: ${AppStyle.color.card};
    img{
      width: 50px;
      height: 50px;
    }
  }

  .detail{
    padding: 10px 10px 0 10px;
    width: 70%;
    float: left;
    .name{
      ${AppStyle.font.read1}
      width: 60%;
      float: left;
      overflow: hidden; 
      white-space: nowrap; 
      text-overflow:ellipsis;
    }
    .price{
      ${AppStyle.font.hilight}
      width: 40%;
      float: left;
      text-align: right;
    }
    .location{
      ${AppStyle.font.read2}
      float: left;
      overflow: hidden; 
      white-space: nowrap; 
      text-overflow:ellipsis;
      line-height: 35px;
    }
    .startAt{
      ${AppStyle.font.read2}
      float: left;
      line-height: 22px;
    }
  }

  .line{
    height: 1px;
    width: 100%;
    background: ${AppStyle.color.bg2};
    clear: both;
  }
`