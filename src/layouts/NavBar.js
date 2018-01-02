import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';
import AppStyle from '../config/style'
import Styled from 'styled-components'

import search from '../img/search.png'
import tasks from '../img/tasks.png'
import dashboard from '../img/dashboard.png'
import notification from '../img/notification.png'
import profile from '../img/profile.png'

const menuList = [
  {
    name: "Search",
    path: "/search",
    icon: search,
  },{
    name: "Tasks",
    path: "/tasks",
    icon: tasks,
  },{
    name: "Dashboard",
    path: "/dashboard",
    icon: dashboard,
  },{
    name: "Notification",
    path: "/notification",
    icon: notification,
  },{
    name: "Profile",
    path: "/profile",
    icon: profile,
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
                  <div className={`list ${menu.path===this.props.route.path?'border':'border-t'}`}>
                    <img src={menu.icon} className={effect? "effect": ""}/>
                  </div>
                </Link>
              )}
            </div>
        </div>
        <div style={{height: '50px'}}/>
      </Style>
    );
  }
}

export default NavBar;

const Style = Styled.div`
  #Navbar{
    height: 50px;
    background: ${AppStyle.color.card};
    ${AppStyle.shadow.lv1}
    position: fixed;
    z-index: 99;
    width: 100%;
    box-sizing: border-box;
    .menu{
      width: 100%;
      background: red;
      .list{
        display: flex;
        align-items: center;
        justify-content: center;
        height: 50px;
        float: left;
        width: ${100/menuList.length}%;
        line-height: 50px;
        text-align: center;
        list-style-type: none;
        //padding-top: 12.5px;
        img{
          width: 25px;
          height: 25px;
        }
      }
    }
    .border{
      border-bottom: solid 2px ${AppStyle.color.sub};
    }
    .border-t{
      border-bottom: solid 2px transparent;
    }
    .effect{
      // animation-name: pulse;
      // animation-duration: 0.3s;
    }
  }

`