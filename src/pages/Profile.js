import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import icon from '../img/next.png'

import Layout from '../layouts'
import Content from '../components/Content'

import { getUser, auth } from '../api/firebase'
import Button from '../components/Button';

class Profile extends Component {

  state = {
    user: {
      uid: '',
      data: {
        abilities: {}
      },
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    // db.collection('employee').where('abilities.ทอ', '==', true).get()
    // .then( snap => {
    //   snap.forEach(data => {
    //     console.log(data.data().fname)
    //   })
    // })

    if(!store.get('employee'))browserHistory.push('login')

    this.setState({
      user: store.get('employee')
    })
    getUser('employee', user => {
      store.set('employee',user)
      this.setState({user})
    })
  }

  logout = () => {
    auth.signOut()
    store.remove('user')
    store.remove('employee')
    store.remove('tasks')
    store.remove('notifications')
    browserHistory.push('/login')
  }

  render() {
    const { data } = this.state.user
    console.log('abibibibqweqwei',data.abilities)
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Profile">
            <Content>
              <div className="row justify-content-center" style={{margin: '0 10px'}}>
                <img className="profileImage" alt='' src={_.get(data,'profileImage')}/>
              </div>

              <div className="name">
                {`${_.get(data,'fname')} ${_.get(data,'lname')}`}
              </div>

              <div className="detail card"> 
                <Link to='/editprofile'>แก้ไข</Link> 
                <div className="row">
                  <div className="col-2">
                    <img className="icon" alt='' src={icon}/>
                  </div>
                  <div className="col-10">{_.get(data,'phone')}</div>
                </div>
                <div className="row">
                  <div className="col-2">
                    <img className="icon" alt='' src={icon}/>
                  </div>
                  <div className="col-10">{_.get(data,'personId')}</div>
                </div>
                <div className="row">
                  <div className="col-2">
                    <img className="icon" alt='' src={icon}/>
                  </div>
                  <div className="col-10">
                  {/*
                    เลขที่บ้าน {data.homeNo&&`${data.homeNo}`}
                    ถนน {data.road?data.road:'-'}{' '}
                    เขต {data.area?data.area:'-'}{' '}
                    แขวง {data.district?data.district:'-'}{' '}
                    จังหวัด {data.province?data.province:'-'}{' '}
                    รหัสไปษณีย์ {data.postcode?data.postcode:'-'}{' '}
                  */}
                    {data.homeNo&&`เลขที่บ้าน ${data.homeNo} `}
                    {data.road&&`ถนน ${data.road} `}
                    {data.area&&`เขต ${data.area} `}
                    {data.district&&`แขวง ${data.district} `}
                    {data.province&&`จังหวัด ${data.province} `}
                    {data.postcode&&`รหัสไปรษณีย์ ${data.postcode} `}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="row">
                  <div className="col-12">
                    ความสามารถ
                    <Link to="/editabilities">แก้ไข</Link>
                    {data.abilities&&
                      _.map(data.abilities,(data,key) => 
                      <div>{key}</div>
                    )}
                  </div>
                </div>
              </div>

            </Content>
            <Button onClick={this.logout}>ออกจากระบบ</Button>


          </div>
        </Style>
      </Layout>
    );
  }
}

export default Profile;

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
    .icon{
      width: 25px;
      margin: 0 auto;
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