import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import { phoneFormatter } from '../../functions/index';

import Layout from '../layouts'

import { auth, db } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import { sendWork, cancelWork, getedWork } from '../functions/work'
import { secToText } from '../../functions/moment'

import { Menu, Icon } from 'antd';

const chart = require("react-chartjs")
const DoughnutChart = chart.Doughnut;
const BarChart = chart.Bar;

export default class extends Component {

  state = {
    user: store.get('employer'),
    works: [],
    working: [],
    needWork: [],
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const { user } = this.state

    await db.collection('works').where('employer_id', '==', user.uid)
    .onSnapshot(snap => { 
      let works = []
      snap.forEach(doc => 
        works.push(_.assign(doc.data(), {work_id: doc.id}))
      )
      this.setState({works})
    })

    await db.collection('working').where('employer_id', '==', user.uid)
    .onSnapshot(snap => { 
      let working = []
      let expenditure = 0
      snap.forEach(doc => {
        working.push(_.assign(doc.data(), {work_id: doc.id}))
        if(doc.data().success){
          expenditure += +doc.data().finished_piece*+doc.data().price
        }

        // if(doc.data().do_piece){
        //   db.collection('working').doc(doc.id).update({
        //     finished_piece: _.sumBy(doc.data().do_piece, 'piece')
        //   })
        //   console.log('updated')
        // }

      })
      this.setState({
        working,
        expenditure
      })
    })

    await db.collection('needWork').where('employer_id', '==', user.uid)
    .onSnapshot(snap => { 
      let needWork = []
      snap.forEach(doc => 
        needWork.push(_.assign(doc.data(), {work_id: doc.id}))
      )
      this.setState({needWork})
    })
  }

  render() {
    const { works, working, expenditure, needWork } = this.state

    console.table(works)

    let successWork = 0
    let failWork = 0
    _.map(working, work => {
      work.success&&
      work.total_piece-work.finished_piece == 0
        ?successWork+=1
        :failWork+=1
    })

    const chartData = [
      {
        value: successWork,
        color: AppStyle.color.sub,
        highlight: AppStyle.color.sub,
        label: "Success"
      },
      {
        value: failWork,
        color: AppStyle.color.main,
        highlight: AppStyle.color.main,
        label: "Fail"
      },
    ]

    let arrayMonth = []
    let arrayFinished = []
    let arrayTotal = []
    const minMonth = _.minBy(working, work => work.endAt)
    const countMonth = -moment(_.get(minMonth,'endAt')).diff(moment(),'months')

    for(let i=0; i<countMonth; i++){
      const month = moment().add(i-countMonth, 'M').locale('en').format('MMM').toLowerCase()
      if(!arrayFinished[i])arrayFinished[i]=0
      if(!arrayTotal[i])arrayTotal[i]=0
      _.map(working, work => {
        if(moment(work.endAt).locale('en').format('MMM').toLowerCase()==month){
          const price = work.price?work.price:0
          const finished_piece = work.finished_piece?work.finished_piece:0
          const total_piece = work.total_piece?work.total_piece:0

          arrayFinished[i] += finished_piece*price
          arrayTotal[i] += total_piece*price
        }
      })
      arrayMonth.push(moment().add(i-countMonth, 'M').format('MMM'))
    }

    const lineChartData = {
      labels: ['ต.ค.','พ.ค.','ธ.ค.','ม.ค.','ก.พ.'],
      datasets: [
        {
          label: "งานที่เสร็จ",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: AppStyle.color.sub,
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: arrayFinished
        },
        {
          label: "งานทั้งหมด",
          fillColor: "rgba(151,187,205,0.2)",
          strokeColor: AppStyle.color.main,
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
          data: arrayTotal
        }
      ]
    }

    const chartOptions = []

    return (
      <Style>
        <Layout {...this.props}>
          <div className='row'>
            <div className='col-xs-12 col-md-3 gutter'>
              <Link to='/web/works'>
                <div className='card'>
                  <div className='icon'>
                    <Icon type={'shop'} style={{fontSize: 48}} />
                  </div>
                  <div className='detail'>
                    <div className='title'>งานที่ประกาศ</div>
                    <div className='line'/>
                    <div className='title'>จำนวน {works.length} งาน</div>
                  </div>
                  <div style={{clear: 'both'}}/>
                </div>
              </Link>
            </div>
            <div className='col-xs-12 col-md-3 gutter'>
              <Link to='/web/workonhome'>
                <div className='card'>
                  <div className='icon'>
                    <Icon type={'schedule'} style={{fontSize: 48}} />
                  </div>
                  <div className='detail'>
                    <div className='title'>งานที่มอบหมาย</div>
                    <div className='line'/>
                    <div className='title'>จำนวน {_.filter(working,work => !work.success).length} งาน</div>
                  </div>
                  <div style={{clear: 'both'}}/>
                </div>
              </Link>
            </div>
            <div className='col-xs-12 col-md-3 gutter'>
              <Link to='/web/needwork'>
                <div className='card'>
                  <div className='icon'>
                    <Icon type={'solution'} style={{fontSize: 48}} />
                  </div>
                  <div className='detail'>
                    <div className='title'>คำร้องขอรับงาน</div>
                    <div className='line'/>
                    <div className='title'>จำนวน {needWork.length} งาน</div>
                  </div>
                  <div style={{clear: 'both'}}/>
                </div>
              </Link>
            </div>
            <div className='col-xs-12 col-md-3 gutter'>
              <div className='card'>
                <div className='icon'>
                  <Icon type={'flag'} style={{fontSize: 48}} />
                </div>
                <div className='detail'>
                  <div className='title'>รายจ่าย</div>
                  <div className='line'/>
                  <div className='title'>รวม {expenditure} บาท</div>
                </div>
                <div style={{clear: 'both'}}/>
              </div>
            </div>
          </div>

          
          <div className='row'>

            <div className='col-xs-12 col-md-4 gutter'>
              <div className='card'>
                <div className='title'>ผลลัพธ์</div>
                <div className='line'/>
                <div className='chart'>
                  <DoughnutChart data={chartData} options={chartOptions}/>
                </div>
                <div className='label'>
                  <div className='success'></div><span>สำเร็จ</span>
                  <div className='fail'></div><span>ไม่สำเร็จ</span>
                </div>
                <div style={{clear: 'both'}}/>
              </div>
            </div>

            <div className='col-xs-12 col-md-8 gutter'>
              <div className='card'>
                <div className='title'>สถิติแต่ละเดือน</div>
                <div className='line'/>
                <div className='linechart'>
                <BarChart data={lineChartData} options={[]}/>
                </div>
              </div>
            </div>

            

          </div>

        </Layout>
      </Style>
    );
  }
}

const Style = Styled.div`
  .row{
    padding: 0 10px;
  }
  .card{
    width: 100%;
    //height: 160px;
    background: ${AppStyle.color.bg};
    .title{
      ${AppStyle.font.read1}
    }
    padding: 10px;
    ${AppStyle.shadow.lv1}
    .icon{
      float: left;
      width: 30%;
      color: ${AppStyle.color. main};
      padding-top: 15px;
    }
    .detail{
      float: left;
      width: 70%;
    }
  }
  .line{
    width: 100%;
    height: 1px;
    background: ${AppStyle.color.bg2};
    margin-bottom: 10px;
  }
  .gutter{
    padding: 5px;
  }

  .chart{
    width: 60%;
    float: left;
    canvas{
      width: 100%;
      
    }
  }
  .label{
    width: 40%;
    float: left;
    .success{
      width: 10px;
      height: 10px;
      background: ${AppStyle.color.sub};
    }
    .fail{
      width: 10px;
      height: 10px;
      background: ${AppStyle.color.main};
    }
  }

  .linechart{

  }
`