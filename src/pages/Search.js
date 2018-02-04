import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'
import Tabbar from '../layouts/Tabbar'
import WorkItem from '../components/WorkItem'
import Content from '../components/Content'
import Carousel from '../components/Carousel'

import edit from '../img/edit.png'

import { db, getUser } from '../api/firebase'
import { browserHistory } from 'react-router/lib';

class Search extends Component {
  
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
        worksList.push(
          _.assign(
            doc.data(),
            {
              _id: doc.id,
              abilityName: _.get(this.state.abilities[doc.data().ability],'name'),
            }
          )
        )
      })

      worksList = _.orderBy(worksList, ['startAt'], ['asc']); //เรียงวันที่

      this.setState({worksList})
      store.set('works', worksList)
    })


  }

  render() {
    const { worksList, user, abilities } = this.state

    console.log(worksList,user.data.abilities)

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
      console.log(recommended)
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
    

    const tabs = [
      {
        name: 'สำหรับคุณ',
        render: <Content>
                  <div className="recommended">แนะนำ</div>
                  <Link to="/editabilities" className='edit'>
                    <img alt='' src={edit}/>
                  </Link>
                  <div >
                    <Carousel>
                      {_.map(recommended, (work, i) => 
                        <WorkItem data={work} i={i} big/>
                      )}
                    </Carousel>
                  </div>
                  
                  {_.map(recommended, (work, i) => 
                    <WorkItem data={work} i={i}/>
                  )}
                </Content>,
      },
      {
        name: 'งานฝีมือ',
        render: <Content>
                  {_.map(workmanship, (work, i) => 
                    <WorkItem data={work} i={i}/>
                  )}
                </Content>,
      },
      {
        name: 'งานทั่วไป',
        render: <Content>
                  {_.map(general, (work, i) => 
                    <WorkItem data={work} i={i}/>
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
  }
  .edit{
    position: absolute;
    right: 10px;
    top: 0;
    img{
      width: 25px;
    }
  }
`