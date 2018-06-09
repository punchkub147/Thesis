import React, { Component } from 'react'
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import { browserHistory, Link } from 'react-router'
import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import { db } from '../api/firebase'
import Layout from '../layouts'
import {Content} from '../components'
import { overNumber } from '../functions'
import back from '../img/back2.png'
import best from '../img/best.png'

export default class extends Component {
  state = {
    user: store.get('employee'),
    working: store.get('working'),
    page: 0,
    selectMonth: 0,
  }
  async componentDidMount() {
    window.scrollTo(0, 0)
    const { user } = this.state
    let workSuccess = 0
    let workFail = 0

    await db.collection('working')
    .where('employee_id', '==', user.uid)
    .onSnapshot(snap => {
      let working = []
      snap.forEach(doc => {
        const total_piece = doc.data().total_piece?doc.data().total_piece:0
        const finished_piece = doc.data().finished_piece?doc.data().finished_piece:0
        const total_price = finished_piece*doc.data().price
        const total_time = finished_piece*doc.data().worktime
        if(doc.data().endAt<new Date){
          if(doc.data().total_piece-doc.data().finished_piece <= 0){
            workSuccess+=1
          }else{
            workFail+=1
          }
        }// count workSuccess & workFail
        let value = 0
        if(finished_piece!=0)
          value = Number((total_price)/((total_time)/60)).toFixed(1)
        const idAndMonth = doc.data().work_id + moment(doc.data().endAt).format('MMM/YY')
        const sameid = _.findIndex(working, ['idAndMonth', idAndMonth])
        if(sameid == -1){
          working.push(Object.assign(doc.data(), {
            working_id: doc.id,
            total_price,
            total_time,
            value,
            finished_piece,
            count: 1,
            idAndMonth,
            total_piece
          }))
        }else{
          working[sameid].count += 1
          working[sameid].total_price += total_price
          working[sameid].total_piece += total_piece
          working[sameid].total_time += total_time
          working[sameid].finished_piece += finished_piece
          working[sameid].value = Number((working[sameid].total_price)/((working[sameid].total_time)/60)).toFixed(1)
        }
        //Update insert employer to working 
        // db.collection('works').doc(doc.data().work_id).get()
        // .then(d => 
        //   db.collection('working').doc(doc.id).update({
        //     employer_id: d.data().employer_id,
        //     employer: d.data().employer,
        //     employee: Object.assign(user.data, {employee_id: user.uid})
        //   })
        // )
      })
      //อัพเดทงานเสร็จ/ไม่เสร็จ
      // db.collection('employee').doc(user.uid).update({
      //   workSuccess,
      //   workFail,
      // })
      const minMonth = _.get(_.minBy(working, work => work.endAt),'endAt')
      const countMonth = moment().diff(minMonth, 'months')
      const maxMonth = _.get(_.maxBy(working, work => work.endAt),'endAt')
      this.setState({
        working,
        page: Math.floor(countMonth/5),
        selectMonth: moment(maxMonth).format('MMM/YY')
      })
      store.set('working', working)
    })
  }
  backPage = () => {
    const { page } = this.state
    page > 0 &&
      this.setState({
        page: page-1
      })
  }
  nextPage = (max) => {
    const { page } = this.state
    page < max-1 &&
      this.setState({
        page: page+1
      })
  }
  selectMonth = (data,i) => {
    const { selectMonth } = this.state
    this.setState({
      selectMonth: selectMonth===data.date?0:data.date
    })
  }
  render() {
    let { working, page, selectMonth } = this.state
    working = _.orderBy(working, ['endAt'], ['asc']) //เรียงวันที่
    let chartData = []
    working.map( work => {
      const date = moment(work.endAt).format('MMM/YY')
      const keyDate = _.findKey(chartData, {date})
      if(!keyDate){
        chartData.push({
          date,
          price: +work.finished_piece*+work.price,
          total: +work.total_piece*+work.price
        })
      }else{
        chartData[keyDate].price += work.finished_piece*work.price
        chartData[keyDate].total += work.total_piece*work.price
      }
    })
    const chart = _.chunk(chartData, 5)
    const maxPrice = _.get(_.maxBy(chartData, 'total'), 'total')
    const workMonth = working.filter( work => (moment(work.endAt).format('MMM/YY') === selectMonth || selectMonth === 0))
                      .sort((a,b)=>b.value-a.value)
    
    return (
      <Layout route={this.props.route}>
        <Style>
          <div className='row justify-content-center' style={{margin: 0}}>
            <div style={{height: 260}}></div>
            <div onClick={() => this.backPage()} style={{position: 'fixed', left: 5, top: 220}}>
              {page>0&&
                <img src={back} style={{width: 20}}/>
              }
            </div>
            <div className='cardGraph'>
              {!chart[page]&&<div className="title">คุณยังไม่เคยทำงาน</div>}
              {_.map(chart[page], (data, i) =>
                <Bar 
                  data={data.price} 
                  max={maxPrice} 
                  total={data.total}
                  selected={this.state.selectMonth===data.date}
                  onClick={() => this.selectMonth(data)}>
                  <div className='total'>.</div>
                  <div className='stat'>
                    {overNumber(data.price)}.-
                  </div>
                  <div className='date'>{data.date}</div>
                </Bar>
              )}
            </div>
            <div onClick={() => this.nextPage(chart.length)} style={{position: 'fixed', right: 5, top: 220}}>
              {page<chart.length-1&&
                <img src={back} style={{width: 20, transform: 'rotate(180deg)'}}/>
              }
            </div>
          </div>
          <div className='statlist'>
            <Content>
              <List>
                <div className='title'>
                  <div className='name'>ชื่องาน</div>
                  <div className='piece'>จำนวน</div>
                  <div className='price'>รายได้</div>
                  <div className='total'></div>
                </div>
              </List>
            {workMonth.map((work,i) =>
              <List fade={i>2?3:i}>
                <div className='name'><Link to={`/work/${work.work_id}`}>{work.work_name}</Link></div>
                <div className='piece'>
                  {work.finished_piece}/{work.total_piece}
                </div>
                <div className='price'>{work.total_price}.-</div>

                {i==0
                  ?<img className='best' src={best}/>
                  :<div className='total'></div>
                }
              </List>
            )}
            </Content>
          </div>
          <div style={{width: '100%',height: '60px'}}></div>
          <Bottom>
            <div className='text'>รวม</div>
            <div className='piece'>
              {_.sumBy(selectMonth!==0?workMonth:working, 'total_time')>60*60
                ?Math.floor(_.sumBy(selectMonth!==0?workMonth:working, 'total_time')/60/60) + ' ชม.'
                :Math.floor(_.sumBy(selectMonth!==0?workMonth:working, 'total_time')/60) + ' น.'
              }
            </div>
            <div className='price'>{_.sumBy(selectMonth!==0?workMonth:working, 'total_price')}.-</div>
            <div className='total'></div>
          </Bottom>
        </Style>
      </Layout>
    )
  }
}

const Style = Styled.div`

.cardGraph{
  background: ${AppStyle.color.bg};
  width: 300px;
  height: 260px;
  ${AppStyle.shadow.lv1}
  position: fixed;
  top: 100px;
  padding-top: 10px;
  padding-left: 10px;
  overflow: hidden;
  .title{
    ${AppStyle.font.menu}
    width: 100%;
    text-align: center;
    height: 100%;
    line-height: 250px;
    margin-left: -10px;
  }
}
.statlist{
  width: 100%;
  min-height: 200px;
  background: ${AppStyle.color.bg};
  position: relative;
  z-index: 1;
  ${AppStyle.shadow.lv1}
  padding: 10px 0;
}
.title{
  background: transparent;
}
`
const Bar = Styled.div`
  width: 48px;
  height: 220px;
  //background: ${props => 220*(props.data/props.max*100)/100}px;
  float: left;
  position: relative;
  margin-right: 10px;
  margin-bottom: 30px;
  box-sizing: border-box;
  ${props => props.selected&&AppStyle.shadow.lv1}
  .stat{
    width: 100%;
    height: ${props => 220*(props.data/props.max*100)/100}px;
    background: ${props => props.selected?AppStyle.color.main:AppStyle.color.sub};
    position: absolute;
    bottom: 0;
    text-align: center;
    ${AppStyle.font.read1}
    color: ${AppStyle.color.white};
  }
  .total{
    position: absolute;
    bottom: 0;
    background: ${AppStyle.color.bg2};
    width: 48px;
    height: ${props => 220*(props.total/props.max*100)/100}px;
    color: ${AppStyle.color.bg2};
  }
  .date{
    position: absolute;
    width: 100%;
    bottom: -30px;
    text-align: center;
    //color: ${props => props.selected?AppStyle.color.main:AppStyle.color.text};
    font-weight: ${props => props.selected?'bold':'normal'};
  }
`

const Bottom = Styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  background: ${AppStyle.color.card};
  ${AppStyle.shadow.lv1}
  line-height: 20px;
  z-index: 2;
  padding: 0 20px;
  ${AppStyle.font.read1}
  .text{
    float: left;
    line-height: 60px;
    width: 40%;
  }
  .piece{
    float: left;
    width: 20%;
    text-align: right;
    line-height: 60px;
  }
  .price{
    float: left;
    width: 20%;
    text-align: right;
    line-height: 60px;
  }
  .total{
    float: left;
    width: 20%;
    text-align: right;
    line-height: 60px;
  }
`
const List = Styled.div`
  animation-name: fadeInUp; 
  animation-duration: ${props => (props.fade*0.2)}s;
  position: relative;
  width: 100%;
  height: 40px;
  line-height: 40px;
  margin-bottom: 2px;
  background: ${AppStyle.color.card};
  padding: 0 10px;
  border-bottom: solid 1px ${AppStyle.color.bg2}; 
  .title{
    font-weight: bold;
    background: ${AppStyle.color.bg2};
    height: 40px;
    line-height: 40px;
    margin: 0 -20px;
    margin-top: -10px;
    padding: 0 20px;
  }
  .name{
    float: left;
    width: 40%;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
    a{
      ${AppStyle.font.read1}
      color: ${AppStyle.color.main};
    }
  }
  .piece{
    float: left;
    width: 20%;
    text-align: right;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
  }
  .price{
    float: left;
    width: 20%;
    text-align: right;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
  }
  .total{
    float: left;
    width: 20%;
    text-align: right;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
  }
  .best{
    ${AppStyle.font.main}
    float: right;
    padding: 3px;
    width: 60px;
    height: 60px;
    text-align: center;
    border-radius: 100%;
    top: -8px;
    right: 4px;
    position: absolute;
    z-index: 1;
  }
`