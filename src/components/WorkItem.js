import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style'
import moment from 'moment'

class WorkItem extends Component {

  render() {
    const { data, i } = this.props

    const Small = (
      <div>
      <Style fade={i*0.2} className={"col-xs-12"} style={{float: 'left'}}>
        <Link to={`/work/${data._id}`}>
          <div className={"WorkItem"}>
            <div className="image">
              <img alt='' src={data.image}/>
            </div>
            
              <div className="data">
                <div className="detail">
                  <div className="name">
                    {data.abilityName&&<span style={{color: AppStyle.color.main}}>[{data.abilityName}]</span>}
                    {data.name}
                  </div>
                  <div className="employer">{data.employer_name}</div>
                  <div className='startDate'>
                    {data.startAt>new Date
                      ?'เริ่มส่ง ' + moment(data.startAt).fromNow()
                      :'เลยเวลาส่งแล้ว'
                    }
                  </div>
                </div>

                <div className="price">
                  {`${data.piece} : ${data.piece*data.price}฿`}
                </div>
              </div>
          </div>
        </Link>
      </Style>
      </div>  
    )

    const Big = (
      <div className={''}>
      <Style fade={i*0.2} className={"col-xs-12"} style={{float: 'left'}}>
        <Link to={`/work/${data._id}`}>
          <div className={"WorkItemBig"}>
            <div className="image">
              <img alt='' src={data.image}/>
            </div>
            
              <div className="data">
                <div className="detail">
                  <div className="name">
                    {data.abilityName&&<span style={{color: AppStyle.color.main}}>[{data.abilityName}]</span>}
                    {data.name}
                  </div>
                  <div className="employer">{data.employer_name}</div>
                  <div className='startDate'>
                    {moment(data.startAt)<new Date
                      ?'เริ่มส่ง ' + moment(data.startAt).fromNow()
                      :'เลยเวลาแล้ว'
                    }
                  </div>
                </div>

                <div className="price">
                  {`${data.piece} : ${data.piece*data.price}฿`}
                </div>
              </div>
          </div>
        </Link>
      </Style>
      </div>
    )

    return (
      this.props.big
        ?Big
        :Small
    );
  }
}

export default WorkItem;

const Style = Styled.div`
.WorkItem{
  animation-name: fadeInUp;
  animation-duration: 0.2s;

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
    width: 70%;
    height: auto;
    float: right;
  }
  .detail{
    float: left;
    padding: 10px;
    width: 60%;
    .name{
      ${AppStyle.font.read1}
      text-align: left;
      overflow: hidden; 
      white-space: nowrap; 
      text-overflow:ellipsis;
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
    text-align: right;
    padding: 10px;
    width: 40%;
    ${AppStyle.font.hilight}
  }
}

.WorkItemBig{

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
    width: 100%;
    .name{
      ${AppStyle.font.read1}
      text-align: left;
      overflow: hidden; 
      white-space: nowrap; 
      text-overflow:ellipsis;
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