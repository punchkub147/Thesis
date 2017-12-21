import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import Layout from '../layouts'
import WorkItem from '../components/WorkItem'

import { db } from '../api/firebase'

class Search extends Component {
  
  state = {
    worksList: {},
  }

  componentDidMount() {
    db.collection('works').get()
    .then(snapshot => {
      let worksList = []
      snapshot.forEach(doc => {
        worksList.push(Object.assign(doc.data(),{work_id: doc.id}))
      })
      this.setState({worksList})
    })
  }

  render() {
    const { worksList } = this.state
    console.log(worksList)

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