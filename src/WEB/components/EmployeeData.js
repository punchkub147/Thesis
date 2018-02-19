import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import { Table, Icon, Divider } from 'antd';
import { db } from '../../api/firebase'

import phone from '../../img/phone2.png'
import profile from '../../img/profile2.png'
import address from '../../img/address2.png'
import edit from '../../img/edit.png'
import education from '../../img/profile2.png'

import { phoneFormatter, personIdFormatter } from '../../functions'

export default class extends Component {

  state = {
    employee: {}
  }

  componentDidMount() {
    const { uid } = this.props
    db.collection('employee').doc(uid).get()
    .then(doc =>
      this.setState({
        employee: Object.assign(doc.data(),{employee_id: doc.id})
      })
    )
  }

  render() {
    const data = this.state.employee

    return (
      <Style>
        <div className="row justify-content-center" style={{margin: '0 10px'}}>
          <img className="profileImage" alt='' src={_.get(data,'profileImage')}/>
        </div>

        <div className="name">
          {`${_.get(data,'tname')}${_.get(data,'fname')} ${_.get(data,'lname')}`}
        </div>

        <div className="detail card"> 
          <div className="row list">
            <div className="col-2">
              <img className="icon" alt='' src={phone}/>
            </div>
            <div className="col-8 text">{phoneFormatter(_.get(data,'phone'))}</div>
          </div>
          <div className="row list">
            <div className="col-2">
              <img className="icon" alt='' src={profile}/>
            </div>
            <div className="col-10 text">{personIdFormatter(_.get(data,'personId'))}</div>
          </div>
          <div className="row list">
            <div className="col-2">
              <img className="icon" alt='' src={education}/>
            </div>
            <div className="col-10 text">การศึกษา{_.get(data,'education')}</div>
          </div>
          <div className="row list">
            <div className="col-2">
              <img className="icon" alt='' src={address}/>
            </div>
            <div className="col-10 text">
              {data.homeNo&&`${data.homeNo} `}
              {data.road&&`ถ. ${data.road} `}
              {data.area&&`ข. ${data.area} `}
              {data.district&&`ข. ${data.district} `}
              {data.province&&`จ. ${data.province} `}
              {data.postcode&&`${data.postcode} `}
            </div>
          </div>
        </div>
        {/*
        <div className="card">
          <div className="row">
            <div className="col-12">
              ความสามารถ<br/>
              {data.abilities&&
                _.map(userAbilities,(data,key) => 
                <div style={{float: 'left'}}>{_.get(data,'name') + ', '}</div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row">
            <div className="col-12">
              เครื่องมือ<br/>
              {data.tools&&
                _.map(userTools,(data,key) => 
                <div style={{float: 'left'}}>{_.get(data,'name') + ', '}</div>
              )}
            </div>
          </div>
        </div>
        */}
      </Style>
    );
  }
}

const Style = Styled.div`
color: ${AppStyle.color.text};
    padding: 10px 0;
    .profileImage{
      width: 140px;
      height: 140px;
      background: ${AppStyle.color.white};
      border-radius: 100%;
      object-fit: cover;
      ${AppStyle.shadow.lv1}
    }
    .name{
      height: 40px;
      line-height: 40px;
      text-align: center;
      ${AppStyle.font.menu}
    }
    .detail{
      .list{
        min-height: 30px;
        margin-bottom: 10px;
      }
      .icon{
        width: 30px;
        margin: 0 auto;
      }
      .text{
        padding: 0;
        margin-top: 4px;

      }
    }
    .card{
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      margin-bottom: 10px;
      background: ${AppStyle.color.card};
      ${AppStyle.shadow.lv1}
    }
`