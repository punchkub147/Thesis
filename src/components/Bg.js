import React, { Component } from 'react';
import Styled from 'styled-components'

import bg2 from '../img/bg2.jpg'
import bgRotate from '../img/bgRotate.jpg'

export default props => 
  <div>
    {props.children}
  </div>

const Style = Styled.div`
  // width: 100%;
  // min-height: 100vh;
  // background-image: url('${bg2}');
  // background-size: 50px 10px;
  position: fixed;
  z-index: -99;
  height: 600vh;
  width: 600%;
  margin-left: -250%;
  margin-top: -500%;
  img{
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  animation: spin 100s infinite linear;

  .reverse{
    animation: respin 20s infinite linear;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }
  @keyframes respin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`