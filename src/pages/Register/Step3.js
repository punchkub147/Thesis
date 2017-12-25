import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style' 
import _ from 'lodash'

import { db, getUser } from '../../api/firebase'

import ToolBar from '../../layouts/ToolBar'
import Step from '../../components/Step'

import image from '../../img/logo-xl.png'
import BottomButton from '../../components/BottomButton';

class Register3 extends Component {

  state = {
    abilities: []
  }

  async componentDidMount() {
    await getUser('employee', user => {
      this.setState({
        user,
      })
    })

    db.collection('abilities').get()
    .then(snap => {
      let abilities = []
      snap.forEach(data => {
        //abilities.push({ability_id: data.id,data: _.set(data.data(),'selected', false)})
        
        abilities.push({
          ability_id: data.id,
          name: data.data().name,
          image: data.data().image,
          selected: false,
        })
      })
      this.setState({abilities})
    })
  }


  handleSelect = (key) => {
    let { abilities } = this.state
    _.set(abilities[key], `selected`, !this.state.abilities[key].selected);
    this.setState({abilities})

    let userAbilities = []
    abilities.map(data => {
      if(data.selected === true){
        userAbilities.push(data.ability_id)
      }
    })
    this.setState({userAbilities})
  }

  handleUpdateAbilities = () => {
    const { user, userAbilities } = this.state
    db.collection('employee').doc(user.uid).update({
      abilities: userAbilities
    })
    browserHistory.push('/search')
  }

  render() {
    const { abilities } = this.state
    return (
      <Style>
        <div id="Register3">
          <ToolBar 
            title={this.props.route.title} 
            left={() => browserHistory.push('/register2')} 
            //right={this.handleUpdateAbilities}
            />

          <Step step='3'/>
          <div className="container animate">

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

          <BottomButton onClick={this.handleUpdateAbilities} text="ต่อไป"/>
        </div>
      </Style>
    );
  }
}

export default Register3;

const Style = Styled.div`
  #Register3{
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