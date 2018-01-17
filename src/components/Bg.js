import React, { Component } from 'react';
import Styled from 'styled-components'

import bg2 from '../img/bg2.jpg'

class Bg extends Component {

  render() {
    return (
      <Style>
        {this.props.children}
      </Style>
    );
  }
}

export default Bg;

const Style = Styled.div`
  width: 100%;
  min-height: 100vh;
  background-image: url('${bg2}');
  background-size: 50px 10px;
`