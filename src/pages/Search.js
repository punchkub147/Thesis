import React, { Component } from 'react'
import { Link } from 'react-router'
import { browserHistory } from 'react-router/lib'
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'
import Layout from '../layouts'
import {WorkItem2, Content, Carousel, Slider} from '../components'
import edit from '../img/edit.png'
import { db, getUser } from '../api/firebase'
import { getWorks } from '../functions' 
import { Icon } from 'antd'

export default class extends Component {
  state = {
    works: store.get('works')?store.get('works'):[],
    user: store.get('employee'),
    abilities: store.get('abilities'),
    bestWorking: []
  }
  async componentDidMount() {
    window.scrollTo(0, 0)
    await getUser('employee', user => {
      store.set('employee',user)
      this.setState({user})
    })
    await getWorks((works) => this.setState({works}))
  }
  render() {
    const { works, user, abilities } = this.state
    let recommended = works.filter( work => 
      (user.data.abilities[work.ability] === true)
    ).slice(0,3)
    const workmanship = works.filter(work => 
      (work.ability && work.ability !== 'general')
    ).slice(0,3)
    const general = works.filter(work => 
      (!work.ability || work.ability === 'general')
    ).slice(0,3)
    const bestWorking = works
                        .sort((a,b)=>b.value-a.value)
                        .map(working => working.work_id)
                        .slice(0,3)
    const bestWork = works.filter( work =>
      (_.indexOf(bestWorking, work._id)!=-1)
    ).slice(0,3)
    recommended = recommended.length>=0?recommended:general

    return (
      <Layout route={this.props.route}>
        <Style>
          <Content>
            <div className="recommended">งานที่คุณถนัด</div>
            <Link to="/worklist2/recommended" className='seemore'>
              <Icon type='right'/>
            </Link>
            {recommended.map((work, i) =>
              <WorkItem2 data={work}/>
            )}
            {bestWork.length>0 &&
            <div>
              <div className='title'>เคยทำแล้ว</div>
              
              <Link to="/worklist2/bestwork" className='seemore'>
                <Icon type='right'/>
              </Link>
              {bestWork.map((work, i) => 
                <WorkItem2 data={work}/>
              )}
            </div>
            }
            <div className='title'>งานทั่วไป</div>
            <Link to="/worklist2/general" className='seemore'>
              <Icon type='right'/>
            </Link>
            {general.map((work, i) => 
              <WorkItem2 data={work} i={i}/>
            )}
          </Content>
        </Style>
      </Layout>
    )
  }
}

const Style = Styled.div`
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