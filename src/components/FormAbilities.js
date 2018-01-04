import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import { db, getUser } from '../api/firebase'

import ToolBar from '../layouts/ToolBar'
import Step from '../components/Step'

import image from '../img/logo-xl.png'
import BottomButton from '../components/BottomButton';

class FormAbilities extends Component {

  state = {
    user: {},
    abilities: []
  }

  async componentDidMount() {
    await getUser('employee', async user => {
      this.setState({user})
      await this.setAbilities(user)
    })
  }

  setAbilities = async (user) => {
    
    await db.collection('abilities').get()
    .then(snap => {
      let abilities = []
      snap.forEach(data => {
        //abilities.push({ability_id: data.id,data: _.set(data.data(),'selected', false)})
        abilities.push({
          ability_id: data.id,
          name: data.data().name,
          image: data.data().image,
          selected: user.data.abilities[data.data().name]&&user.data.abilities[data.data().name]
        })
      })
      this.setState({abilities})
    })
  }

  handleSelect = (key) => {
    let { abilities } = this.state
    _.set(abilities[key], `selected`, !this.state.abilities[key].selected);
    this.setState({abilities})

    let userAbilities = {}
    abilities.map(data => {
      if(data.selected === true){
        userAbilities[data.name] = true
      }
    })
    this.setState({userAbilities})
  }

  handleUpdateAbilities = () => {
    const { user, userAbilities } = this.state

    userAbilities
      ?db.collection('employee').doc(user.uid).update({
        abilities: userAbilities
      })
      :db.collection('employee').doc(user.uid).update({
        abilities: []
      })

    browserHistory.push(this.props.push)
  }

  render() {
    const { abilities } = this.state
    return (
      <Style>
        <div id="FormAbilities">
          <div className="container">

            <div className="row" style={{margin: '0 -5px'}}>
              {abilities.map((data, key) =>
                <div onClick={() => this.handleSelect(key)}
                  className="col-6 col-xs-6 col-sm-6 col-md-4" style={{padding: '5px'}}>

                  <Card className="card" display={data.selected?'block':'none'}>
                    <div className="incard">
                      <div className="cover">
                        <div className="text">เลือกแล้ว</div>
                      </div>
                      <img src={data.image}/>
                    {data.name}
                    </div>
                  </Card>

                </div>
              )}
            </div>

          </div>

          <BottomButton onClick={this.handleUpdateAbilities}>ยืนยัน</BottomButton>
        </div>
      </Style>
    );
  }
}

export default FormAbilities;

const Style = Styled.div`
  #FormAbilities{
    .animate{
      animation-name:fadeInUp;
      animation-duration: 0.3s;
    }
  }
`
const Card = Styled.div`
  background: white;
  padding: 10px;
  box-sizing: border-box;
  text-align: center;
  .incard{
    width: 100%;  
    position: relative;
    img{
      width: 100%;
      height: 140px;
      object-fit: cover;
    }
    .cover{
      display: ${props => props.display};
      position: absolute;
      width: 100%;
      height: 140px;
      background: rgba(0,0,0,0.3);

      animation-name: zoomIn;
      animation-duration: 0.2s;
      .text{
        font-size: 28px;
        transform: rotate(-10deg);
        margin-top: 50px;
        color: ${AppStyle.color.main};
      }
    }
`