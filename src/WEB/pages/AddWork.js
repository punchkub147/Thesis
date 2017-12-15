import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'

import Layout from '../layouts'

import { auth, db } from '../../api/firebase'

class AddWork extends Component {

  state = {
    work: {},
    user: {},
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      user
        ?this.setState({user})
        :browserHistory.push('/web/login')
    })
  }

  handleInput = (e, ref) => {
    const { work } = this.state
    const { value } = e.target

    this.setState({
      work: {
        ...work,
        [ref]: value,
      }
    })
  }

  handleAddWork = async (e) => {
    e.preventDefault();
    const { work, user } = this.state
    const data = await Object.assign(work, {
      employer_id: user.uid,
      createAt: moment().format()
    })
    await db.collection('works').add(data)
    await browserHistory.push('/web/works')
  }

  render() {
    return (
      <Style>
        <Layout>
          <div id="AddWork">
            <div className="row">
              <div className="col-4">
                <form onSubmit={this.handleAddWork}>
                  <input type="text" placeholder="ชื่องาน" onChange={ e => this.handleInput(e, 'name')}/>
                  <input type="text" placeholder="รายละเอียด" onChange={ e => this.handleInput(e, 'detail')}/>
                  <input type="number" placeholder="จำนวนชิ้นต่อชุด" onChange={ e => this.handleInput(e, 'piece')}/>
                  <input type="number" placeholder="ราคา" onChange={ e => this.handleInput(e, 'price')}/>
                  <input type="number" placeholder="จำนวนชุด" onChange={ e => this.handleInput(e, 'pack')}/>

                  <input type="time" placeholder="เวลาที่ใช้ต่อชิ้น" onChange={ e => this.handleInput(e, 'worktime')}/>
                  <input type="text" placeholder="ส่งด้วย" onChange={ e => this.handleInput(e, 'sendBy')}/>
                  <input type="text" placeholder="อุปกรณ์" onChange={ e => this.handleInput(e, 'tool')}/>
                  <input type="date" placeholder="เริ่มส่งงาน" onChange={ e => this.handleInput(e, 'startAt')}/>
                  <input type="date" placeholder="สิ้นสุดงาน" onChange={ e => this.handleInput(e, 'endAt')}/>

                  <button type="submit" onSubmit={this.handleAddWork}>ยืนยัน</button>
                </form>
              </div>
            </div>
            

          </div>
        </Layout>
      </Style>
    );
  }
}

export default AddWork;

const Style = Styled.div`
  #AddWork{    

  }
`