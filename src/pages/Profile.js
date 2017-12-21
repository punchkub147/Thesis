import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import icon from '../img/next.png'

import Layout from '../layouts'

import { getUser, auth, db } from '../api/firebase'

class Profile extends Component {

  state = {
    user: {
      uid: '',
      data: '',
    }
  }

  componentDidMount() {
    getUser('employee', user => {
      this.setState({user})
    })
  }

  logout = () => {
    auth.signOut()
    browserHistory.push('/login')
  }

  render() {
    const { data } = this.state.user
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Profile">
            <div className="row justify-content-center">
              <img className="profileImage" src={_.get(data,'profileImage')}/>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="name">
                  {`${_.get(data,'fname')} ${_.get(data,'lname')}`}
                </div>

                <div className="detail">  
                  <div className="row">
                    <div className="col-2">
                      <img className="icon" src={icon}/>
                    </div>
                    <div className="col-10">{_.get(data,'phone')}</div>
                  </div>
                  <div className="row">
                    <div className="col-2">
                      <img className="icon" src={icon}/>
                    </div>
                    <div className="col-10">{_.get(data,'personId')}</div>
                  </div>
                  <div className="row">
                    <div className="col-2">
                      <img className="icon" src={icon}/>
                    </div>
                    <div className="col-10">
                      เลขที่บ้าน {_.get(data.address,'homeNo')}
                      ถนน {_.get(data.address,'road')}
                      เขต {_.get(data.address,'area')}
                      แขวง {_.get(data.address,'district')}
                      จังหวัด {_.get(data.address,'province')}
                      รหัสไปษณีย์ {_.get(data.address,'postcode')}
                    </div>
                  </div>
                </div>
                
                <button onClick={this.logout}>LOGOUT</button>
              </div>
            </div>
          </div>
        </Style>
      </Layout>
    );
  }
}

export default Profile;

const Style = Styled.div`
  #Profile{
    color: ${AppStyle.color.text};
    padding-top: 20px;
    .profileImage{
      width: 120px;
      height: 120px;
      background: #ccc;
      border-radius: 100%;
      object-fit: cover;
      ${AppStyle.shadow.lv1}
    }
    .name{
      height: 40px;
      line-height: 40px;
      font-size: 18px;
      text-align: center;
    }
    .detail{
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      margin-bottom: 10px;
      background: ${AppStyle.color.card};

      .icon{
        width: 25px;
        margin: 0 auto;
      }
    }
  }
`