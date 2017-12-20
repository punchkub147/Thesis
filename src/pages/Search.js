import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import Layout from '../layouts'

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
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Search">
            {_.map(worksList, work => 
              <div>
                {work.name}
                <Link to={`/work/${work.work_id}`}>View</Link>
              </div>
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
    color: ${AppStyle.color.main}
  }

`