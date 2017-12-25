import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'
import WorkItem from '../components/WorkItem'

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
          <div id="Search">
            {_.map(worksList, (work, i) => 
              <WorkItem data={work} i={i}/>
            )}
          </div>
        </Style>
      </Layout>
    );
  }
}

export default Search;

const Style = Styled.div`
  #Search{
    padding-top: 10px;
  }

`