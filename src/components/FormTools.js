import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import { db, getUser } from '../api/firebase'

import BottomButton from '../components/BottomButton';

export default class extends Component {

  render() {
    return (
      <Style>
        Edit Tools
      </Style>
    );
  }
}

const Style = Styled.div`
  .animate{
    animation-name:fadeInUp;
    animation-duration: 0.3s;
  }
`
