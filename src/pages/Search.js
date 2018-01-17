import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'
import Tabbar from '../layouts/Tabbar'
import WorkItem from '../components/WorkItem'
import Content from '../components/Content'

import { db } from '../api/firebase'

class Search extends Component {
  
  state = {
    worksList: store.get('works'),
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    // this.setState({
    //   worksList: store.get('works')
    // })
    db.collection('works')
    .onSnapshot(snapshot => {
      let worksList = []
      snapshot.forEach(doc => {
        worksList.push(Object.assign(doc.data(),{work_id: doc.id}))
      })
      this.setState({worksList})
      store.set('works', worksList)
    })
  }

  render() {
    //const worksList = store.get('works')
    const { worksList } = this.state

    const tabs = [
      {
        render: <Content>
                  {_.map(worksList, (work, i) => 
                    <WorkItem data={work} i={i}/>
                  )}
                </Content>,
        name: 'สำหรับคุณ',
      },
      {
        render: <Content>
                  {_.map(worksList, (work, i) => 
                    <WorkItem data={work} i={i}/>
                  )}
                </Content>,
        name: 'งานฝีมือ',
      },
      {
        render: <Content>
                  {_.map(worksList, (work, i) => 
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

`