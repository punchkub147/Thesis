import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

class Search extends Component {

  render() {
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Search">
            Search SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch SearchSearch Search
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