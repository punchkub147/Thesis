import React, { Component } from 'react';
import { browserHistory } from 'react-router/lib';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'
import Layout from '../layouts'
import Tabbar from '../layouts/Tabs'
import {WorkItem2, Content, Carousel, Slider} from '../components'
import { db, getUser } from '../api/firebase'
import ToolBar from '../layouts/ToolBar';
import edit from '../img/edit.png'

export default class extends Component {
  state = {
    worksList: store.get('works'),
    user: store.get('employee'),
    abilities: store.get('abilities'),
  }
  async componentDidMount() {
    window.scrollTo(0, 0)
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
    await db.collection('works')
    //.where('startAt' ,'>', new Date())
    .onSnapshot(snapshot => {
      let worksList = []
      snapshot.forEach(doc => {
        if(doc.data().pack <= 0)return
        if(!doc.data().round)return
        const nextRound = _.find(doc.data().round, function(o) { return o.startAt > new Date; })
        if(!nextRound)return
        worksList.push(_.assign(doc.data(),
          { 
            _id: doc.id,
            abilityName: _.get(this.state.abilities[doc.data().ability],'name'),
            startAt: nextRound.startAt,
            endAt: nextRound.endAt,
            workAllTime: doc.data().worktime*doc.data().piece
          }
        ))
      })
      worksList = _.orderBy(worksList, ['startAt'], ['asc']); //เรียงวันที่
      this.setState({worksList})
      store.set('works', worksList)
    })
    !this.props.params.id
      &&browserHistory.push('/search')
  }

  render() {
    const { worksList, user, abilities } = this.state
    let recommended = worksList.filter( work => 
      (user.data.abilities[work.ability] === true)
    ).slice(0,3)
    const workmanship = worksList.filter(work => 
      (work.ability && work.ability !== 'general')
    ).slice(0,3)
    const general = worksList.filter(work => 
      (!work.ability || work.ability === 'general')
    ).slice(0,3)
    recommended = recommended.length>=0?recommended:general
    let sameAbility = ''
    worksList.map(work => {
      if(work._id==this.props.params.id){
        sameAbility = work.ability
      }
    })
    const sameAbilityList = worksList.filter(work => 
      (work.ability == sameAbility && work._id!=this.props.params.id)
    )
    return (
      <Style>
        <ToolBar 
          title='งานแนะนำ'
          left={() => browserHistory.goBack()} 
        />
        <Content>
          <div className='t'>งานเดิม</div>
          {worksList.map((work, i) => 
            work._id==this.props.params.id&&
            <WorkItem2 data={work} i={0}/>
          )}
          <div className='t'>งานประเภทเดียวกัน</div>
          {sameAbilityList.map((work, i) => 
            <WorkItem2 data={work} i={i}/>
          )}
          <div className='t'>งานแนะนำ</div>
          {recommended.map((work, i) => 
            <WorkItem2 data={work} i={i}/>
          )}
        </Content>
      </Style>
    );
  }
}

const Style = Styled.div`
  .t{
    ${AppStyle.font.main}
    margin: 10px 0;
  }
`