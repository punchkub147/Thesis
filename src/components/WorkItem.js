import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import moment from 'moment'

class WorkItem extends Component {

  render() {
    const { data, i } = this.props

    return (
      <Style fade={i*0.2}>
        <Link to={`/work/${data.work_id}`}>
          <div className={this.props.big?"WorkItemBig":"WorkItem"}>
            <div className="image">
              <img alt='' src={data.image}/>
            </div>
            
              <div className="data">
                <div className="detail">
                  <div className="name">{data.ability} {data.name}</div>
                  <div className="employer">{data.employer_name}</div>
                  <div className='startDate'>
                    {moment(data.startAt).locale('th').fromNow()}
                  </div>
                </div>

                <div className="price">
                  {`${data.piece} : ${data.piece*data.price}฿`}
                </div>
              </div>
          </div>
        </Link>
      </Style>
    );
  }
}

export default WorkItem;

const Style = Styled.div`
.WorkItem{
  animation-name: fadeInUp;
  animation-duration: ${props => props.fade+0.2}s;

  width: 100%;
  height: 90px;
  clear: both;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}

  margin-bottom: 10px;
  .image{
    width: 30%;
    height: 90px;
    float: left;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .data{
    min-width: 70%;
    height: auto;
    float: right;
  }
  .detail{
    float: left;
    padding: 10px;
    .name{
      ${AppStyle.font.read1}
      text-align: left;
    }
    .employer{
      ${AppStyle.font.read2}
      text-align: left;
    }
    .startDate{
      ${AppStyle.font.read2}
      text-align: left;
    }
  }
  .price{
    float: right;
    padding: 10px;
    ${AppStyle.font.hilight}
  }
}

.WorkItemBig{
  //animation-name: fadeInRight;
  //animation-duration: ${props => props.fade+0.2}s;

  width: 100%;
  height: 220px;
  clear: both;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}

  margin-bottom: 10px;
  .image{
    width: 100%;
    height: 180px;
    float: left;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .data{
    width: 100%;
    height: auto;
    float: right;
  }
  .detail{
    float: left;
    padding: 10px;
    .name{
      ${AppStyle.font.read1}
      text-align: left;
    }
    .employer{
      display: none;
    }
    .startDate{
      display: none;
    }
  }
  .price{
    display: none;
    float: right;
    padding: 10px;
    ${AppStyle.font.hilight}
  }
}

.am-carousel-wrap{
  display: none;
}
`