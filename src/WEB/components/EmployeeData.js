import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import { Table, Icon, Divider } from 'antd';
import { db } from '../../api/firebase'

export default class extends Component {

  state = {
    employee: {}
  }
  componentDidMount() {
    db.collection('employee').doc(this.props.uid)
    .onSnapshot(doc => {
      this.setState({
        employee: Object.assign(doc.data(), {employee_id: doc.id})
      })
    })
  }

  render() {
    const {employee} = this.state
    console.log(employee)
    return (
      <Style>
        <div className='card'>
          <div className='image'>
            <img src={employee.profileImage}/>
          </div>
          <div className='name'>
            {employee.tname}{employee.fname} {employee.lname}
          </div>
          {employee.phone}<br/>
          <span className='like'><Icon type="like" /> {employee.workSuccess}0</span>
          <span className='dislike'><Icon type="dislike" /> {employee.workFail}0</span>
        </div>
      </Style>
    );
  }
}

const Style = Styled.div`
  .card{
    ${AppStyle.shadow.lv1}
    padding: 10px;
    .image{
      width: calc(100%+20px);
      margin: -10px;
      margin-bottom: 10px;
      img{
        width: 100%;
        height: 160px;
        object-fit: cover;
      }
    }
    .name{
      ${AppStyle.font.read1};
    }
    .like{
      margin-right: 10px;
    }
  }
`