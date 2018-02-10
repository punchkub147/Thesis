import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import { Carousel } from 'antd-mobile';

export default class extends Component {

  state = {
    data: ['1', '2', '3'],
    imgHeight: 176,
    slideIndex: 0,
  }
  componentDidMount() {
    // simulate img loading
    setTimeout(() => {
      this.setState({
        data: ['AiyWuByWklrrUDlFignR', 'TekJlZRVCjLFexlOCuWn', 'IJOtIlfsYdTyaDTRVrLI'],
      });
    }, 100);
  }

  render() {
    return (
      <Style>
        <Carousel className="space-carousel"
          frameOverflow="visible"
          cellSpacing={10}
          slideWidth={0.8}
          autoplay
          infinite
          dots={false}
          afterChange={index => this.setState({ slideIndex: index })}
        >
          {this.props.children}
        </Carousel>
      </Style>
    );
  }
}

const Style = Styled.div`

`