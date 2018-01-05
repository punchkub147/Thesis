import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

class Content extends Component {

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center" style={{margin: '0 -10px'}}>
          <div className="col-xs-12 col-sm-8 col-md-6 col-lg-5" style={{padding: '0 10px'}}>
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