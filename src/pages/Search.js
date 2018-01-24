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

import { db } from '../api/firebase'
import { browserHistory } from 'react-router/lib';

class Search extends Component {
  
  state = {
    worksList: store.get('works'),
    user: store.get('employee'),
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    // this.setState({
    //   worksList: store.get('works')
    // })

    db.collection('works')
    .where('startAt' ,'>', new Date())
    .onSnapshot(snapshot => {
      let worksList = []
      snapshot.forEach(doc => {
        worksList.push(
          _.assign(doc.data(),{_id: doc.id})
        )
      })
      this.setState({worksList})
      store.set('works', worksList)
    })
  }

  render() {
    //const worksList = store.get('works')
    const { worksList, user } = this.state

    let recommended = []
    _.map(worksList, work => 
      (user.data.abilities[work.ability] === true)&& 
        recommended.push(work)
    )

    let workmanship = []
    _.map(worksList, work => 
      (work.ability && work.ability !== 'general')&& 
        workmanship.push(work)
    )

    let general = []
    _.map(worksList, work => 
      (!work.ability || work.ability === 'general')&& 
        general.push(work)
    )

    const tabs = [
      {
        render: <Content>
                  <div className="recommended">สำหรับคุณ</div>
                  <Link to="/editabilities" className='edit'>
                    <img alt='' src={edit}/>
                  </Link>
                  <div style={{width: '60%', 'margin-left': '-23px'}}>
                    <Carousel>
                      {_.map(worksList, (work, i) => 
                        <WorkItem data={work} i={i} big/>
                      )}
                    </Carousel>
                  </div>
                  
                  {_.map(recommended, (work, i) => 
                    <WorkItem data={work} i={i}/>
                  )}
                </Content>,
        name: 'สำหรับคุณ',
      },
      {
        render: <Content>
                  {_.map(workmanship, (work, i) => 
                    <WorkItem data={work} i={i}/>
                  )}
                </Content>,
        name: 'งานฝีมือ',
      },
      {
        render: <Content>
                  {_.map(general, (work, i) => 
                    <WorkItem data={work} i={i}/>
                  )}
                </Content>,
        name: 'งานทั่วไป',
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