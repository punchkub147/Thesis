import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Slider from 'react-slick'
import _ from 'lodash'

export default class extends Component {

  componentDidMount() {

  }


  render() {
    const { datas } = this.props

    const setting = {
      className: 'slider variable-width',
      dots: false,
      infinite: true,
      slidesToShow: 3,
      centerPadding: '60px',
      swipeToSlide: true,
      variableWidth: true,
      adaptiveHeight: true
    }
    return (
      <Style>
      <Slider {...setting}>
        {_.map(datas, (data, i) => 
          <div className='card'>
            {data.name}
          </div>
        )}
      </Slider>
      </Style>
    );
  }
}

const Style = Styled.div`
  margin-left: 0px;
  margin-right: -10px;
  .card{
    width: 200px;
    height: 220px;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
    margin-bottom: 10px;
    margin-right: 10px;
  }
`