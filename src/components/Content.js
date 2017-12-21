import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

class Content extends Component {

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default Content;

const Style = Styled.div`

`