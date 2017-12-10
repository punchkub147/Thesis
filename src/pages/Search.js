import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

class Search extends Component {

  render() {

    return (
      <Layout location={this.props.location}>
        <Style>
          <div id="Search">
            Search
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