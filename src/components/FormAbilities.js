import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../config/style' 
import _ from 'lodash'

import { db, getUser } from '../api/firebase'

import BottomButton from '../components/BottomButton';

class FormAbilities extends Component {

  state = {
    user: {},
    abilities: [],
    userAbilities: [],
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
      let userAbilities = {}
      snap.forEach(data => {
        //abilities.push({ability_id: data.id,data: _.set(data.data(),'selected', false)})
        abilities.push({
          ability_id: data.id,
          name: data.data().name,
          image: data.data().image,
          selected: _.get(user.data.abilities, data.id)!==undefined?true:false
        })
        if(_.get(user.data.abilities, data.id)!==undefined)userAbilities[data.id] = true
      })
      this.setState({abilities})
      this.setState({userAbilities})
    })
  }

  handleSelect = (key) => {
    let { abilities } = this.state
    _.set(abilities[key], `selected`, !this.state.abilities[key].selected);
    this.setState({abilities})

    let userAbilities = {}
    abilities.map(data => {
      if(data.selected === true){
        userAbilities[data.ability_id] = true
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
    
    this.props.push
      ?browserHistory.push(this.props.push)  
      :browserHistory.goBack()
  }

  render() {
    const { abilities } = this.state
    return (
      <Style>
        <div className="container">

          <div className="row" style={{margin: '0 -5px'}}>
            {abilities.map((data, key) =>
              <div onClick={() => this.handleSelect(key)}
                className="col-6 col-xs-6 col-sm-6 col-md-4" style={{padding: '10px 5px 0 5px'}}>

                <Card className="frame" display={data.selected?'block':'none'}>
                  <div className="incard">
                    <div className="cover">
                      <div className="text">เลือกแล้ว</div>
                    </div>
                    <img alt='' src={data.image}/>
                  {data.name}
                  </div>
                </Card>

              </div>
            )}
          </div>

        </div>

        <BottomButton onClick={this.handleUpdateAbilities}>ยืนยัน</BottomButton>
      </Style>
    );
  }
}

export default FormAbilities;

const Style = Styled.div`
  .animate{
    animation-name:fadeInUp;
    animation-duration: 0.3s;
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
      background: rgba(0,0,0,0.5);

      animation-name: fadeIn;
      animation-duration: 0.1s;
      .text{
        font-size: 28px;
        transform: rotate(-10deg);
        margin-top: 50px;
        color: ${AppStyle.color.white};
        font-family: 'Anchan';
        animation-name: zoomIn;
        animation-duration: 0.3s;
      }
    }
`