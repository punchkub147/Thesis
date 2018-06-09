import React, { Component } from 'react'
import { browserHistory, Link } from 'react-router'
import Styled from 'styled-components'
import AppStyle from '../config/style'
import _ from 'lodash'
import store from 'store' 
import {Button, Content, Loading, TopStyle, WorkItem2} from '../components'
import { auth, db } from '../api/firebase'
import { getToken } from '../api/notification'
import { getWorks } from '../functions' 
import { message, Icon } from 'antd'
import logo from '../img/logo6.png'
import logo2 from '../img/logo3.png'
import bg12 from '../img/bg12.jpg'
import bg3 from '../img/bg3.jpg'

export default class extends Component {

  state = {
    works: store.get('works')?store.get('works'):[],
    user: store.get('employee'),
    abilities: store.get('abilities'),
    loading: false,
  }
  async componentDidMount() {
    window.scrollTo(0, 0)
    await getWorks(async works => {await this.setState({works})})
  }

  render() {
    const { works, user, abilities } = this.state
    const workmanship = works.filter((work,i) => (work.ability && work.ability !== 'general'))
                        .slice(0,3)
    const general = works.filter(work => (!work.ability || work.ability === 'general'))
                    .slice(0,3)

    return (
      <Loading loading={this.state.loading}>  
      <Style>
        <div style={{position: 'fixed', width: '100%'}}>
        <TopStyle/>
        <div className="logo2">
          <img alt='' src={logo2}/>
        </div>
        <div className='logo-text'>หางานรับมาทำที่บ้าน</div>
        <Link to="/login">
          <Button>เข้าใช้งาน</Button> 
        </Link>
        <br/>
        </div>
        <div style={{height: 480}}/>
        <div className='bg'>
          <Content >
            <div className="title">งานฝีมือ</div>
            <Link to="/worklist2/workmanship" className='seemore'>
              <Icon type='right'/>
            </Link>
            {workmanship.map((work, i) =>
              <WorkItem2 data={work}/>
            )}
            <div className='title'>งานทั่วไป</div>
            <Link to="/worklist2/general" className='seemore'>
              <Icon type='right'/>
            </Link>
            {general.map((work, i) => 
              <WorkItem2 data={work} i={i}/>
            )}
          </Content>
        </div>
      </Style>
      </Loading>
    )
  }
}

const Style = Styled.div`
  // transition: 1s;
  // background-image: url('${bg12}');
  // background-size: 50px 10px;
  background-image: url('${bg3}');
  background-position: center -230px;
  background-attachment: fixed;
  background-size: auto 150%;
  min-height: 100vh;
  .content{
    animation-name: fadeInUp;
    animation-duration: 0.3s;
  }
  .bg{
    position: relative;
    z-index: 1;
    background: ${AppStyle.color.bg2};
    padding-top: 10px;
    ${AppStyle.shadow.lv1}
  }
  .card{
    background: ${AppStyle.color.bg};
    padding: 10px;
    ${AppStyle.shadow.lv1}
  }
  .wrap{
    padding: 0 15px;
  }
  .logo{
    width: 100%;
    margin: 0 auto;
    img{
      width: 100%;
    }
  }
  .logo2{
    width: 300px;
    animation-name: jackInTheBox;
    animation-duration: 1s;
    margin: 0 auto;
    img{
      width: 100%;
    }
  }
  .logo-band{
    ${AppStyle.font.tool};
    color: ${AppStyle.color.black};
    font-size: 40px;
    text-align: center;
    margin-top: -40px;
  }
  .logo-text{
    ${AppStyle.font.read1};
    color: ${AppStyle.color.black};
    font-size: 26px;
    text-align: center;
    margin-top: -10px;
    margin-bottom: 20px;
  }
  box-sizing: border-box;
  .register{
    width: 100%;
    text-align: center;
    margin-top: 20px;
    color: ${AppStyle.color.black};
    font-weight: bold;
  }
  .employer{
    margin-top: 10px;
  }
  .recommended{
    ${AppStyle.font.main}
    text-align: left;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  .edit{
    position: absolute;
    right: 10px;
    top: 0;
    img{
      width: 25px;
    }
  }
  .seemore{
    float: right;
    margin-top: -35px;
    color: ${AppStyle.color.text};
    font-size: 16px;
  }
  .title{
    ${AppStyle.font.main}
    margin-bottom: 10px;
  }
`