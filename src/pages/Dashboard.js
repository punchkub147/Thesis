import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../config/style' 

import Layout from '../layouts'
import Content from '../components/Content'

import { browserHistory, Link } from 'react-router';

import _ from 'lodash'
import moment from 'moment'
import store from 'store'
import { db } from '../api/firebase'

import back from '../img/back2.png'

class Dashboard extends Component {

  state = {
    user: store.get('employee'),
    working: store.get('working'),
    page: 0,
    selectMonth: 0,
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const { user } = this.state

    await db.collection('working')
    .where('employee_id', '==', user.uid)
    .onSnapshot(snap => {
      let working = []
      snap.forEach(doc => {
        working.push(Object.assign(doc.data(), {
          working_id: doc.id,
          total_price: doc.data().total_piece*doc.data().price,
          total_time: doc.data().total_piece*doc.data().worktime
        }))
      })
      this.setState({working})
      store.set('working', working)
    })

    this.setGraph()
  }

  setGraph = () => {

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
    working = _.orderBy(working, ['endAt'], ['asc']); //เรียงวันที่

    let chartData = []
    _.map(working, work => {
      const date = moment(work.endAt).format('MMM/YY')
      const keyDate = _.findKey(chartData, {'date': date})
      if(!keyDate){
        chartData.push({
          date,
          price: work.total_piece*work.price
        })
      }else{
        chartData[keyDate].price += work.total_piece*work.price
      }
    })
      
    let chart = _.chunk(chartData, 5)
    const maxPrice = _.get(_.maxBy(chartData, 'price'), 'price')

    let workMonth = []
    {_.map(working, work => {
      const date = moment(work.endAt).format('MMM/YY')
      if(date === selectMonth)
        workMonth.push(work)
    })}
    
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
              {_.map(chart[page], (data, i) =>
                <Bar 
                  data={data.price} 
                  max={maxPrice} 
                  selected={this.state.selectMonth===data.date}
                  onClick={() => this.selectMonth(data)}>
                  <div className='stat'>
                    {data.price}.-
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
            {_.map(selectMonth!==0?workMonth:working, work =>
              <List>
                <div className='name'><Link to={`/work/${work.work_id}`}>{work.work_name}</Link></div>
                <div className='piece'>
                  {(work.total_time)>60*60
                    ?Math.floor(work.total_time/60/60) + ' ชม.'
                    :Math.floor(work.total_time/60) + ' น.'
                  }
                </div>
                <div className='price'>{work.total_price}.-</div>

                <div className='total'>{(work.total_price)/((work.total_time)/60)} #</div>
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
    );
  }
}

export default Dashboard;

const Style = Styled.div`

.cardGraph{
  background: ${AppStyle.color.bg};
  width: 300px;
  min-height: 260px;
  ${AppStyle.shadow.lv1}
  overflow: hidden;
  position: fixed;
  top: 100px;
  padding-top: 10px;
  padding-left: 10px;
}
.statlist{
  width: 100%;
  min-height: 300px;
  background: ${AppStyle.color.bg};
  position: relative;
  z-index: 1;
  ${AppStyle.shadow.lv1}
  padding: 10px 0;
}
`

const Bar = Styled.div`
  width: 48px;
  height: 220px;
  background: ${props => props.selected?AppStyle.color.white:AppStyle.color.bg2};
  float: left;
  position: relative;
  margin-right: 10px;
  margin-bottom: 30px;
  box-sizing: border-box;
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
  .date{
    position: absolute;
    width: 100%;
    bottom: -30px;
    text-align: center;
    color: ${props => props.selected?AppStyle.color.main:AppStyle.color.text};
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
  width: 100%;
  height: 40px;
  line-height: 40px;
  margin-bottom: 2px;
  background: ${AppStyle.color.card};
  padding: 0 10px;
  .name{
    float: left;
    width: 40%;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow:ellipsis;
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
`