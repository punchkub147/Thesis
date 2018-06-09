import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'
import Layout from '../layouts'
import ToolBar from '../layouts/ToolBar';
import Tabbar from '../layouts/Tabs'
import {WorkItem, WorkItem2, Content, Carousel, Slider} from '../components'
import { db, getUser } from '../api/firebase'
import { browserHistory } from 'react-router/lib';
import { getWorks } from '../functions' 
import { Icon } from 'antd'
import edit from '../img/edit.png'

export default class extends Component {
  state = {
    works: store.get('works'),
    user: store.get('employee'),
    abilities: store.get('abilities'),
  }
  async componentDidMount() {
    window.scrollTo(0, 0)
    await getUser('employee', user => {
      store.set('employee',user)
      this.setState({user})
    })
    await getWorks((works) => {
      this.setState({works})
    })
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
    const bestwork = works.filter( work =>
      (_.indexOf(bestWorking, work._id)!=-1)
    ).slice(0,3)
    recommended = recommended.length>=0?recommended:general
    const workAllList = {recommended, workmanship, general, bestwork}
    const showWork = workAllList[this.props.params.id]
    return (
      <Style>
        <ToolBar 
          title={
            this.props.params.id=='recommended'?'งานที่คุณถนัด'
            :this.props.params.id=='bestwork'?'เคยทำแล้ว'
            :this.props.params.id=='general'?'งานทั่วไป'
            :this.props.params.id=='workmanship'&&'งานฝีมือ'
          }
          left={() => browserHistory.goBack()}
        />
        <Content>
          <div style={{marginTop: 10}}>
            {showWork.map((work, i) =>
              <WorkItem2 data={work}/>
            )}
          </div>
        </Content>
      </Style>
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