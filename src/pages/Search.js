import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'

import Tabbar from '../layouts/Tabs'

import WorkItem from '../components/WorkItem'
import WorkItem2 from '../components/WorkItem2'

import Content from '../components/Content'
import Carousel from '../components/Carousel'

import Slider from '../components/Slider'

import edit from '../img/edit.png'

import { db, getUser } from '../api/firebase'
import { browserHistory } from 'react-router/lib';

import { getWorks } from '../functions' 


class Search extends Component {
  
  state = {
    works: store.get('works'),
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

    await getWorks((works) => {
      this.setState({works})
    })

    let bestWorking = store.get('working')
    bestWorking = _.orderBy(bestWorking, ['value'], ['desc'])
    bestWorking = _.map(bestWorking, working => working.work_id)
    bestWorking = _.uniq(bestWorking);
    bestWorking = _.chunk(bestWorking, 5)[0]
    this.setState({bestWorking})
    // await db.collection('abilities')
    // .onSnapshot(snap => {
    //   const abilities = []
    //   snap.forEach(doc => {
    //     abilities[doc.id] = doc.data()
    //   })
    //   this.setState({abilities})
    //   store.set('abilities',abilities)
    // })
    
    // await db.collection('works')
    // //.where('startAt' ,'>', new Date())
    // .onSnapshot(snapshot => {
    //   let works = []
    //   snapshot.forEach(doc => {
    //     if(doc.data().pack <= 0)return
    //     if(!doc.data().round)return

    //     const nextRound = _.find(doc.data().round, function(o) { return o.startAt > new Date; })
    //     if(!nextRound)return
        
    //     works.push(_.assign(doc.data(),
    //       { 
    //         _id: doc.id,
    //         abilityName: _.get(this.state.abilities[doc.data().ability],'name'),

    //         startAt: nextRound.startAt,
    //         endAt: nextRound.endAt,
    //         workAllTime: doc.data().worktime*doc.data().piece
    //       }
    //     ))
    //   })

    //   works = _.orderBy(works, ['startAt'], ['asc']); //เรียงวันที่

    //   this.setState({works})
    //   store.set('works', works)
    // })


  }

  render() {
    const { works, user, abilities } = this.state

    let recommended = []
    _.map(works, work => 
      (user.data.abilities[work.ability] === true)&& 
        recommended.push(work)
    )
      if(recommended.length === 0){
      _.map(works, work => 
        (!work.ability || work.ability === 'general')&& 
          recommended.push(work)
      )}
    //////////////////////////////////////////////////
    let workmanship = []
    _.map(works, work => 
      (work.ability && work.ability !== 'general')&& 
        workmanship.push(work)
    )
    //////////////////////////////////////////////////
    let general = []
    _.map(works, work => 
      (!work.ability || work.ability === 'general') && 
        general.push(work)
    )
    //////////////////////////////////////////////////
    let bestWork = []
    _.map(works, work => {
      (_.indexOf(this.state.bestWorking, work._id)!=-1) && 
        bestWork.push(work)
    })

    const tabs = [
      {
        name: 'สำหรับคุณ',
        render: <Content>
                  <div className="recommended">งานที่คุณถนัด</div>
                  <Link to="/editabilities" className='edit'>
                    <img alt='' src={edit}/>
                  </Link>
                  {/*
                  <div style={{overflow: 'hidden', 'max-width': '100%'}}>
                    <Carousel>
                      {_.map(recommended, (work, i) => 
                        <WorkItem data={work} i={i} big/>
                      )}
                    </Carousel>
                  </div>
                    */}
                  {_.map(recommended, (work, i) => 
                    <WorkItem2 data={work}/>
                  )}

                  {bestWork.length>0 &&
                  <div>
                    <div className='title'>คุ้มค่าแรง</div>
                    {_.map(bestWork, (work, i) => 
                      <WorkItem2 data={work}/>
                    )}
                  </div>
                  }
                  
                </Content>,
      },
      {
        name: 'งานฝีมือ',
        render: <Content>
                  {_.map(workmanship, (work, i) => 
                    <WorkItem2 data={work} i={i}/>
                  )}
                </Content>,
      },
      {
        name: 'งานทั่วไป',
        render: <Content>
                  {_.map(general, (work, i) => 
                    <WorkItem2 data={work} i={i}/>
                  )}
                </Content>,
      },
    ]

    return (
      <Layout route={this.props.route}>
        <Style>
          <Tabbar tabs={tabs}/>
        </Style>
      </Layout>
    );
  }
}

export default Search;

const Style = Styled.div`
  .recommended{
    ${AppStyle.font.main}
    text-align: left;
    margin-bottom: 10px;
  }
  .edit{
    position: absolute;
    right: 10px;
    top: 0;
    img{
      width: 25px;
    }
  }
  .title{
    ${AppStyle.font.main}
    margin-bottom: 10px;
  }
`