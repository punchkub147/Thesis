import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'

import Tabbar from '../layouts/Tabs'

import WorkItem2 from '../components/WorkItem2'
import Content from '../components/Content'
import Carousel from '../components/Carousel'

import Slider from '../components/Slider'

import edit from '../img/edit.png'

import { db, getUser } from '../api/firebase'
import { browserHistory } from 'react-router/lib';
import TopStyle from '../components/TopStyle'
import ToolBar from '../layouts/ToolBar';


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

    let recommended = []
    _.map(worksList, work => 
      (user.data.abilities[work.ability] === true)&& 
        recommended.push(work)
    )
      if(recommended.length === 0){
      _.map(worksList, work => 
        (!work.ability || work.ability === 'general')&& 
          recommended.push(work)
      )}
    //////////////////////////////////////////////////
    let workmanship = []
    _.map(worksList, work => 
      (work.ability && work.ability !== 'general')&& 
        workmanship.push(work)
    )
    //////////////////////////////////////////////////
    let general = []
    _.map(worksList, work => 
      (!work.ability || work.ability === 'general') && 
        general.push(work)
    )
    //////////////////////////////////////////////////
    let sameAbility = ''
    _.map(worksList, work => {
      if(work._id==this.props.params.id){
        sameAbility = work.ability
      }
    })
    let sameAbilityList = []
    _.map(worksList, work => 
      (work.ability == sameAbility && work._id!=this.props.params.id) && 
        sameAbilityList.push(work)
    )
    //////////////////////////////////////////////////
    
    return (
      <Style>
        <ToolBar 
          title='งานแนะนำ'
          left={() => browserHistory.goBack()} 
          //right={this.handleUpdateAbilities}
        />

        <Content>
          <div className='t'>งานเดิม</div>
          {_.map(worksList, (work, i) => 
            work._id==this.props.params.id&&
            <WorkItem2 data={work} i={0}/>
          )}

          <div className='t'>งานประเภทเดียวกัน</div>
          {_.map(sameAbilityList, (work, i) => 
            <WorkItem2 data={work} i={i}/>
          )}

          <div className='t'>งานแนะนำ</div>
          {_.map(recommended, (work, i) => 
            <WorkItem2 data={work} i={i}/>
          )}
        </Content>
        <TopStyle/>
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