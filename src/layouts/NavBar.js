import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import AppStyle from '../config/style'
import Styled from 'styled-components'

import logo from '../logo.svg'

const menuList = [
  {
    name: "Search",
    path: "/search",
    icon: logo,
  },{
    name: "Tasks",
    path: "/tasks",
    icon: "https://image.flaticon.com/icons/svg/149/149347.svg",
  },{
    name: "Dashboard",
    path: "/dashboard",
    icon: "https://image.flaticon.com/icons/png/128/271/271888.png",
  },{
    name: "Notification",
    path: "/notification",
    icon: "https://image.flaticon.com/icons/png/128/61/61073.png",
  },{
    name: "Profile",
    path: "/profile",
    icon: "https://image.flaticon.com/icons/png/128/149/149452.png",
  },
]

class NavBar extends Component {

  state = {
    effect: false,
  }

  addEffect = () => {
    this.setState({effect: !this.state.effect})
  }

  render() {
    const {effect} = this.state
    return (
      <Style>
        <div id="Navbar">
            <div className="menu">
              {menuList.map(menu => 
                <Link to={menu.path} onClick={this.addEffect}>
                  <li>
                    <img src={menu.icon} className={effect? "effect": ""}/>
                  </li> 
                </Link> 
              )}
            </div>
        </div>
      </Style>
    );
  }
}

export default NavBar;

const Style = Styled.div`
  #Navbar{
    height: 50px;
    background: ${AppStyle.color.main};
    ${AppStyle.shadow.lv1}
    position: relative;
    z-index: 99;
    .menu{
      width: 100%;
      background: red;
      li{
        display: flex;
        align-items: center;
        justify-content: center;
        
        float: left;
        width: ${100/menuList.length}%;
        line-height: 50px;
        text-align: center;
        list-style-type: none;
        padding-top: 12.5px;
        img{
          width: 25px;
          height: 25px;
        }
      }
    }
    .effect{
      animation-name: pulse;
      animation-duration: 0.3s;
    }
  }

`