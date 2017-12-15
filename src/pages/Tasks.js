import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'

class Tasks extends Component {

  render() {
    return (
      <Layout route={this.props.route}>
        <Style>
          <div id="Tasks">
            Tasks
          </div>
        </Style>
      </Layout>
    );
  }
}


//มีงานที่รับมา งานอยู่ที่ช่วงที่ต้องทำ งานเริ่มวันที่-สุดวันที่ วันที่ 1-7 = 7 วัน งาน100ชิ้น ชิ้นละ 3นาที รวมเป็น 300นาที
// เวลางาน หาร จำนวนวันทำงาน => 300/7 
// หักลบกับวันที่ต้องการหยุด หาชื่อวัน ของวันที่ต่างๆ เสาร์ อาทิตย์ จากวันทำงาน



export default Tasks;

const Style = Styled.div`
  #Tasks{
    color: ${AppStyle.color.main}
  }
`