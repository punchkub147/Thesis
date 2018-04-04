import React, { Component } from 'react';
import { Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import Layout from '../layouts'

import Tabbar from '../layouts/Tabs'

import WorkItem from '../components/WorkItem'
import WorkItem2 from '../components/WorkItem2'

import Content from '../components/Content'
import Carousel from '../components/Carousel'

import Slider from '../components/Slider'

import edit from '../img/edit.png'

import { db, getUser } from '../api/firebase'
import { browserHistory } from 'react-router/lib';

import { getWorks } from '../functions' 

import { Icon } from 'antd'
import ToolBar from '../layouts/ToolBar';

class Search extends Component {
  
  state = {
    works: store.get('works'),
    user: store.get('employee'),
    abilities: store.get('abilities'),

    bestWorking: []
  }

  async componentDidMount() {
    window.scrollTo(0, 0)

    await getUser('employee', user => {
      store.set('employee',user)
      this.setState({user})

      if(user){
        let bestWorking = store.get('working')
        bestWorking = _.orderBy(bestWorking, ['value'], ['desc'])
        bestWorking = _.map(bestWorking, working => working.work_id)
        bestWorking = _.uniq(bestWorking);
        this.setState({bestWorking})
      }

    })

    await getWorks((works) => {
      this.setState({works})
    })


  }

  render() {
    const { works, user, abilities } = this.state

    let recommended = []
    if(user){
      _.map(works, work => 
        (user.data.abilities[work.ability] === true)&& 
          recommended.push(work)
      )
      
        if(recommended.length === 0){
        _.map(works, work => 
          (!work.ability || work.ability === 'general')&& 
            recommended.push(work)
        )}
    }


    //////////////////////////////////////////////////
    let workmanship = []
    _.map(works, work => 
      (work.ability && work.ability !== 'general')&& 
        workmanship.push(work)
    )
    //////////////////////////////////////////////////
    let general = []
    _.map(works, work => 
      (!work.ability || work.ability === 'general') && 
        general.push(work)
    )
    //////////////////////////////////////////////////
    let bestWork = []
    _.map(works, work => {
      (_.indexOf(this.state.bestWorking, work._id)!=-1) && 
        bestWork.push(work)
    })

    return (
      <Style>
        <ToolBar 
          title={
            this.props.params.id=='recommended'?'งานที่คุณถนัด'
            :this.props.params.id=='bestwork'?'เคยทำแล้ว'
            :this.props.params.id=='general'?'งานทั่วไป'
            :this.props.params.id=='workmanship'&&'งานฝีมือ'
          }
          left={() => browserHistory.goBack()} 
          //right={this.handleUpdateAbilities}
        />
        <Content>
          <div style={{marginTop: 10}}>

          {this.props.params.id=='recommended'&&
            <div>
              {_.map(recommended, (work, i) =>
                <WorkItem2 data={work}/>
              )}
            </div>
          }
          {this.props.params.id=='bestwork'&&
            <div>
              {_.map(bestWork, (work, i) =>
                <WorkItem2 data={work}/>
              )}
            </div>
          }
          {this.props.params.id=='general'&&
            <div>
              {_.map(general, (work, i) =>
                <WorkItem2 data={work}/>
              )}
            </div>
          }
          {this.props.params.id=='workmanship'&&
          <div>
            {_.map(workmanship, (work, i) =>
              <WorkItem2 data={work}/>
            )}
          </div>
        }

          </div>

        </Content>
      </Style>
    );
  }
}

export default Search;

const Style = Styled.div`
  .recommended{
    ${AppStyle.font.main}
    text-align: left;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  .edit{
    position: absolute;
    right: 10px;
    top: 0;
    img{
      width: 25px;
    }
  }
  .seemore{
    float: right;
    margin-top: -35px;
    color: ${AppStyle.color.text};
    font-size: 16px;
  }
  .title{
    ${AppStyle.font.main}
    margin-bottom: 10px;
  }
`