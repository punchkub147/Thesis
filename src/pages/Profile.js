import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import phone from '../img/phone2.png'
import profile from '../img/profile2.png'
import address from '../img/address2.png'
import edit from '../img/edit.png'
import education from '../img/profile2.png'

import defaultImage from '../img/profile2.png'

import Layout from '../layouts'
import Content from '../components/Content'

import { getUser, db, auth } from '../api/firebase'
import Button from '../components/Button';

import { phoneFormatter, personIdFormatter } from '../functions'

class Profile extends Component {

  state = {
    user: store.get('employee'),
    abilities: store.get('abilities')
  }

  async componentDidMount() {
    window.scrollTo(0, 0)

    if(!store.get('employee'))browserHistory.push('login')

    await getUser('employee', user => {
      store.set('employee',user)
      this.setState({user})
    })

    await db.collection('abilities')
    .onSnapshot(snap => {
      const abilities = []
      snap.forEach(doc => {
        abilities[doc.id] = doc.data()
      })
      this.setState({abilities})
      store.set('abilities',abilities)
    })
  }

  logout = () => {
    auth.signOut()
    store.remove('user')
    store.remove('employee')
    store.remove('tasks')
    store.remove('works')
    store.remove('notifications')
    store.clearAll()
    console.log(localStorage)
    browserHistory.push('/login')
  }

  render() {
    const { data } = this.state.user
    const { abilities } = this.state

    const userAbilities = _.pick(abilities, _.keys(data.abilities))
    const userTools = _.pick(abilities, _.keys(data.abilities))

    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Profile">
            <Content>
              <div className="row justify-content-center" style={{margin: '0 10px'}}>
                <img className="profileImage" alt='' src={data['profileImage']?_.get(data,'profileImage'):defaultImage}/>
              </div>

              <div className="name">
                {`${_.get(data,'tname')}${_.get(data,'fname')} ${_.get(data,'lname')}`}
              </div>

              <div className="detail card"> 
                <Link to='/editprofile' className="edit">
                  <img alt='' src={edit}/>
                </Link> 
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
                  {/*
                    เลขที่บ้าน {data.homeNo&&`${data.homeNo}`}
                    ถนน {data.road?data.road:'-'}{' '}
                    เขต {data.area?data.area:'-'}{' '}
                    แขวง {data.district?data.district:'-'}{' '}
                    จังหวัด {data.province?data.province:'-'}{' '}
                    รหัสไปษณีย์ {data.postcode?data.postcode:'-'}{' '}
                  */}
                    {data.homeNo&&`${data.homeNo} `}
                    {data.road&&`ถ. ${data.road} `}
                    {data.area&&`ข. ${data.area} `}
                    {data.district&&`ข. ${data.district} `}
                    {data.province&&`จ. ${data.province} `}
                    {data.postcode&&`${data.postcode} `}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="row">
                  <div className="col-12">
                    <Link to="/editabilities" className='edit'>
                      <img alt='' src={edit}/>
                    </Link>
                    <div className='card-title'>ความสามารถ</div>
                    {_.size(data.abilities)
                      ?_.map(userAbilities,(data,key) => 
                          <div style={{float: 'left'}}>{_.get(data,'name') + ', '}</div>
                      )
                      :'ทั่วไป'
                    }
                    <div className='card-title'>อุปกรณ์ที่มี</div>
                    <div >{data.tool?data.tool:'ไม่ระบุ'}</div>
                  </div>
                </div>
              </div>

              {/*
              <div className="card">
                <div className="row">
                  <div className="col-12">
                    <Link to="/edittools" className='edit'>
                      <img alt='' src={edit}/>
                    </Link>
                    เครื่องมือ<br/>
                    {data.tools&&
                      _.map(userTools,(data,key) => 
                      <div style={{float: 'left'}}>{_.get(data,'name') + ', '}</div>
                    )}
                  </div>
                </div>
              </div>
              */}

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
    background: ${AppStyle.color.card};
    border-radius: 100%;
    object-fit: cover;
    ${AppStyle.shadow.lv1}
    
    animation-name:fadeInUp;
    animation-duration: 0.2s;
  }
  .name{
    height: 40px;
    line-height: 40px;
    text-align: center;
    ${AppStyle.font.menu}
    
    animation-name:fadeInUp;
    animation-duration: 0.2s;
  }
  .detail{
      
    animation-name:fadeInUp;
    animation-duration: 0.2s;
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
    
    animation-name:fadeInUp;
    animation-duration: 0.2s;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    margin-bottom: 10px;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
  }
  .edit{
    position: absolute;
    right: 10px;
    img{
      width: 25px;
    }
  }


  .card-title{
    ${AppStyle.font.read1}
  }
`