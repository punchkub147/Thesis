import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'
import WorkItem from '../components/WorkItem'
import Content from '../components/Content'

import { db } from '../api/firebase'

class Search extends Component {
  
  state = {
    worksList: {},
  }

  componentDidMount() {
    this.setState({
      worksList: store.get('works')
    })
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

    return (
      <Layout route={this.props.route}>
          <Style>
            <Content>
            {_.map(worksList, (work, i) => 
              <WorkItem data={work} i={i}/>
            )}
            </Content>
          </Style>
      </Layout>
    );
  }
}

export default Search;

const Style = Styled.div`
  padding-top: 10px;
`