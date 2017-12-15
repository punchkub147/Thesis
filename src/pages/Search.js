import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import Layout from '../layouts'

import { db } from '../api/firebase'

class Search extends Component {
  
  state = {
    itemsList: {},
  }

  componentDidMount() {
    db.collection('works').get()
    .then(snapshot => {
      let itemsList = []
      snapshot.forEach(doc => {
        itemsList.push(Object.assign(doc.data(),{item_id: doc.id}))
      })
      this.setState({itemsList})
    })
  }

  render() {
    const { itemsList } = this.state
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Search">
            {_.map(itemsList, item => 
              <div>{item.name}</div>
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