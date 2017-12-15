import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import WebRouter from './WebRouter'
import Styled from 'styled-components'

class Web extends Component {

  async componentDidMount() {
    
  }

  render() {
    return (
      <div>
        <WebRouter/>
      </div>
    );
  }
}

export default Web;
