import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import { phoneFormatter } from '../../functions/index';

import Layout from '../layouts'

import { auth, db, getUser } from '../../api/firebase'
import { PushFCM } from '../../api/notification'

import { sendWork, cancelWork, getedWork } from '../functions/work'
import { secToText } from '../../functions/moment'

import { Menu, Icon, Rate, Popconfirm } from 'antd';
import Table from '../components/Table'


const chart = require("react-chartjs")
const DoughnutChart = chart.Doughnut;
const BarChart = chart.Bar;

export default class extends Component {

  state = {
    user: store.get('employer'),
    works: store.get('works'),
    working: [],
    needWork: [],
    workSuccessList: [],
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const { user } = this.state

    await getUser('employer', user => {
      store.set('employer',user)
      this.setState({user})
    })

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
      let workSuccessList = []
      let expenditure = 0
      snap.forEach(doc => {
        const finished_piece = doc.data().finished_piece?doc.data().finished_piece:0
        const total_piece = doc.data().total_piece?doc.data().total_piece:0
        const qualityWorking = doc.data().do_piece&&(doc.data().worktime/(_.sumBy(doc.data().do_piece, 'worktime')/_.sumBy(doc.data().do_piece, 'piece'))*100).toFixed(0)

        const data = Object.assign(doc.data(),{
          working_id: doc.id,
          finished_piece,
          total_piece,
          qualityWorking: qualityWorking?qualityWorking:0
        })
        working.push(_.assign(data))
        if(doc.data().success){
          
          expenditure += finished_piece*doc.data().price

          workSuccessList.push(_.assign(data))
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
        expenditure,
        workSuccessList
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
    const { works, working, expenditure, needWork, workSuccessList } = this.state

    console.table('WWWWWWWWWW',working)

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
    console.log('wwwwwwwww',works,_.find(works,(o)=>o.work_id=='xLuqpSepD613uchCAHFP'))
    "nLqb1QzNTs5PIOxVUToz"

    const workSuccessColumns = [
      {
        title: 'ชื่องาน',
        dataIndex: 'work_name',
        key: 'work_name',
        className: 'click',
        render: (text, item) => 
          <span onClick={() => browserHistory.push(`/web/work/${item.work_id}`)}>
          <img src={_.get(_.find(works,(o)=>o.work_id==item.work_id),'image')} className='work_image'/>
          {' '+item.work_name}
          </span>,
        sorter: (a, b) => a.work_name - b.work_name,
      },
      {
        title: 'ผู้รับงาน',
        dataIndex: 'employee',
        key: 'employee_name',
        className: 'click',
        render: (text, item) => 
          <span onClick={() => browserHistory.push(`/web/employee/${item.employee_id}`)} style={{position: 'relative'}}>
            <img src={text.profileImage} className='employee_image'/>
            {' '+text.tname+text.fname+' '+text.lname} <span title={`ทำงานเสร็จ ${text.workSuccess} : ไม่เสร็จ ${text.workFail}`}></span>
          </span>,
        sorter: (a, b) => a.employee.fname - b.employee.fname,
      },
      {
        title: 'ดาว',
        dataIndex: 'employee',
        key: 'star',
        className: 'click',
        render: (text, item) => 
        <div title={`เคยทำงาน เสร็จ ${text.workSuccess} ไม่เสร็จ ${text.workFail}`}><Rate disabled defaultValue={3+Math.floor(text.workSuccess/text.workFail)} style={{color: AppStyle.color.main, fontSize: 10}}/></div>,
      }, 
      {
        title: 'ศักยภาพการทำงาน',
        dataIndex: 'useWorktime',
        key: 'useWorktime',
        render: (text, item) => 
          <div>{item.qualityWorking&&
            <span title={item.qualityWorking&&item.qualityWorking+'%'} style={{color: AppStyle.color.sub, fontWeight: 'bold'}}> {
              item.qualityWorking>=150?'เร็วมาก'
              :item.qualityWorking>=100?'เร็ว'
              :item.qualityWorking>=75?'ปกติ'
              :item.qualityWorking<75&&'ช้า'
            }</span>}
            {item.qualityWorking&& <span style={{color: '#888'}}>{` (${secToText(text)}ต่อชิ้น)`}</span>}
          
          </div>,
        sorter: (a, b) => a.qualityWorking - b.qualityWorking,
      },
      {
        title: 'งานที่ทำเสร็จ / ทั้งหมด',
        dataIndex: 'total_piece',
        key: 'total_piece',
        className: '',
        render: (text, item) => 
          <div>
            <span>{item.finished_piece?item.finished_piece:0}</span> / <span>{item.total_piece?item.total_piece:0}</span> 
          </div>,
        sorter: (a, b) => a.total_piece - b.total_piece,
      },
      {
        title: 'ค่าจ้าง',
        dataIndex: 'price',
        key: 'getPrice',
        className: '',
        render: (text, item) => 
          <div>
            {item.finished_piece*item.price}
          </div>,
        sorter: (a, b) => a.finished_piece - b.finished_piece,
      }, 
      {
        title: 'สถาณะงาน',
        className: '',
        render: (text, item) => (
          <div style={{fontWeight: 'bold'}}>{
            item.success
              ?item.total_piece-item.finished_piece==0
                ?<span style={{color: AppStyle.color.sub}}>เสร็จครบ</span>
                :<span style={{color: AppStyle.color.main}}>ไม่ครบ</span>
              :item.endAt<new Date
                ?<span style={{color: AppStyle.color.main}}>กำลังส่งงาน</span>
                :'กำลังทำงาน'
          }</div>
        ),
        sorter: (a, b) => (a.total_piece-a.finished_piece) - (b.total_piece-b.finished_piece),
      },
      {
        title: 'วันที่ส่ง - เสร็จ',
        dataIndex: 'startAt',
        key: 'startAt',
        className: '',
        render: (text, item) => 
          <div>
            {text&&
              moment(text).locale('en').format('DD/MM/YY')+' - '+moment(item.endAt).locale('en').format('DD/MM/YY')}
          </div>,
        sorter: (a, b) => a.startAt - b.startAt,
      }, 

      // {
      //   title: 'ลบ',
      //   key: 'delete',
      //   render: (text, item) => (
      //     <Popconfirm title="ยืนยันลบ?" onConfirm={ () => db.collection('working').doc(item.working_id).delete()}>
      //       <div className='click'> ลบงาน </div>
      //     </Popconfirm>
      //   ),
      // },
    ];
    const subWorkingColumns = [
      {
        title: 'จำนวนชิ้นที่ทำ',
        dataIndex: 'piece',
        key: 'piece',
        className: '',
        render: (text, item) => <span>{text}</span>,
        sorter: (a, b) => a.piece - b.piece,
      },
      {
        title: 'ใช้เวลาต่อชิ้น',
        dataIndex: 'worktimeOnePiece',
        key: 'worktimeOnePiece',
        className: '',
        render: (text, item) => <span>{secToText(item.worktime/item.piece)}</span>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'ใช้เวลาทั้งหมด',
        dataIndex: 'worktime',
        key: 'worktime',
        className: '',
        render: (text, item) => <span>{secToText(text)}</span>,
        sorter: (a, b) => a.worktime - b.worktime,
      },
      {
        title: 'เวลาที่เริ่มทำ',
        dataIndex: 'startAt',
        key: 'startAt',
        className: '',
        render: (text, item) => <span>{moment(text).format('DD/MM/YY HH:mm')}</span>,
        sorter: (a, b) => a.startAt - b.startAt,
      },
      {
        title: 'เวลาที่บันทึก',
        dataIndex: 'endAt',
        key: 'endAt',
        className: '',
        render: (text, item) => <span>{moment(text).format('DD/MM/YY HH:mm')}</span>,
        sorter: (a, b) => a.endAt - b.endAt,
      },

    ];

    const chartOptions = []

    console.log('TRQWTR',_.filter(working,work => !work.success))

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
                    <div className='title'><span style={{fontSize: 30}}>{works.length}</span> งาน</div>
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
                    <div className='title'>คำขอรับงาน</div>
                    <div className='line'/>
                    <div className='title'><span style={{fontSize: 30}}>{needWork.length}</span> งาน</div>
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
                  <div className='title'>งานที่กำลังทำ</div>
                  <div className='line'/>
                  <div className='title'><span style={{fontSize: 30}}>{_.filter(working,work => !work.success).length}</span> งาน</div>
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
                  <div className='title'>รวมค่าจ้าง</div>
                  <div className='line'/>
                  <div className='title'><span style={{fontSize: 30}}>{expenditure}</span> บาท</div>
                </div>
                <div style={{clear: 'both'}}/>
              </div>
            </div>
          </div>

          
          <div className='row'>
          {/*
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
          */}
          </div>

          <div className='title'>ประวัติงาน</div>
          <Table columns={workSuccessColumns} dataSource={workSuccessList} 
            expandedRowRender={record => 
              <Table 
                columns={subWorkingColumns} 
                dataSource={record.do_piece}
                size='small'
              />
            }
          />

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

  .click{
    cursor: pointer;
  }
  .{
    text-align: right;
  }
  .align-center{
    text-align: center;
  }
  .work_image{
    width: 50px;
    height: 50px;
    margin: -7px 0;
    object-fit: cover;
  }
  .employee_image{
    width: 32px;
    height: 32px;
    margin: -7px 0;
    object-fit: cover;
    border-radius: 100%;
  }
`