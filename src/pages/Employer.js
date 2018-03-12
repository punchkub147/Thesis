import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'
import store from 'store'

import phone from '../img/phone2.png'
import profile from '../img/profile2.png'
import address from '../img/address2.png'
import edit from '../img/edit.png'
import Back from '../img/back2.png'
import education from '../img/profile2.png'

import Layout from '../layouts'
import Content from '../components/Content'
import WorkItem2 from '../components/WorkItem2'

import { getUser, db, auth } from '../api/firebase'
import Button from '../components/Button';


import { phoneFormatter, personIdFormatter } from '../functions'

export default class extends Component {

  state = {
    employer: {},
    works: [],
    abilities: store.get('abilities')
  }

  async componentDidMount() {
    window.scrollTo(0, 0)

    await db.collection('employer').doc(this.props.params.id).get()
    .then(snap => {
      if(snap.exists){
        this.setState({
          employer: Object.assign(snap.data(), {employer_id: snap.id})
        })
      }
    })

    await db.collection('abilities')
    .onSnapshot(snap => {
      const abilities = []
      snap.forEach(doc => {
        abilities[doc.id] = doc.data()
      })
      this.setState({abilities})
      store.set('abilities',abilities)
    })

    await db.collection('works').where('employer_id', '==', this.props.params.id).get()
    .then(snap => {
      let works = []
      snap.forEach(doc => {
        if(doc.data().pack <= 0)return
        if(!doc.data().round)return

        const nextRound = _.find(doc.data().round, function(o) { return o.startAt > new Date; })
        if(!nextRound)return
        
        works.push(_.assign(doc.data(),
          { 
            _id: doc.id,
            abilityName: _.get(this.state.abilities[doc.data().ability],'name'),

            startAt: nextRound.startAt,
            endAt: nextRound.endAt,
            workAllTime: doc.data().worktime*doc.data().piece
          }
        ))
      })    
      this.setState({works})
    })

  }

  render() {
    const { employer, works } = this.state

    return (
      <Style>
        <div id='Employer'>
        <div className='goBack' >
          <img src={Back} alt='' onClick={() => browserHistory.goBack()}/>
        </div>
        <div className='cover'>
          <img src='https://png.pngtree.com/thumb_back/fh260/back_pic/00/01/80/73560a545c6ae6b.jpg' ale=''/>
        </div>
        <Content>
          <div className="row justify-content-center" style={{margin: '0 10px'}}>
            <img className="profileImage" alt='' src={_.get(employer,'imageProfile')}/>
          </div>

          <div className="name">
            {`${_.get(employer,'name')}`}
          </div>

          <div className="detail card"> 
          
            <div className="row list">
              <div className="col-2">
                <img className="icon" alt='' src={phone}/>
              </div>
              <div className="col-8 text">{phoneFormatter(_.get(employer,'phone'))}</div>
            </div>
            <div className="row list">
              <div className="col-2">
                <img className="icon" alt='' src={address}/>
              </div>
              <div className="col-10 text">
                {employer.homeNo&&`${employer.homeNo} `}
                {employer.road&&`ถ. ${employer.road} `}
                {employer.area&&`ข. ${employer.area} `}
                {employer.district&&`ข. ${employer.district} `}
                {employer.province&&`จ. ${employer.province} `}
                {employer.postcode&&`${employer.postcode} `}
              </div>
            </div>
          </div>


          <div>งานที่ประกาศ</div>
          {_.map(works, (work, i) => 
            <WorkItem2 data={work} i={i}/>
          )}


        </Content>
        </div>
      </Style>
    );
  }
}

const Style = Styled.div`
#Employer{
  color: ${AppStyle.color.text};
  margin-top: 80px;
  .profileImage{
    width: 140px;
    height: 140px;
    background: ${AppStyle.color.white};
    //border-radius: 100%;
    object-fit: cover;
    ${AppStyle.shadow.lv1}
  }
  .name{
    height: 40px;
    line-height: 40px;
    text-align: center;
    ${AppStyle.font.menu}
  }
  .detail{
    .list{
      min-height: 30px;
      margin-bottom: 10px;
    }
    .icon{
      width: 30px;
      margin: 0 auto;
    }
    .text{
      padding: 0;
      margin-top: 4px;

    }
  }
  .card{
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    margin-bottom: 10px;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
  }
  .edit{
    position: absolute;
    right: 10px;
    img{
      width: 25px;
    }
  }



  .goBack{
    width: 25px;
    height: 25px;
    position: fixed;
    left: 10px;
    top: 10px;
    z-index: 10;
    img{
      width: 100%;
      height: 100%;
    }
  }
  .cover{
    width: 100%;
    height: 150px;
    position: absolute;
    left: 0;
    top: 0;
    img{
      width: 100%;
      height: 100%;
    }
  }
}
`