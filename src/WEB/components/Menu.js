import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import { auth } from '../../api/firebase'

import { Menu } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

export default class extends Component {

  
  render() {
    const menuList = [
      {
        path: '/web/works',
        name: 'งานทั้งหมด',
      },
      {
        path: '/web/workonhome',
        name: 'งานที่มอบหมาย',
      },
      {
        path: '/web/needwork',
        name: 'คำร้องขอรับงาน',
      },
    ]

    const menuAdmin = [
      {
        path: '/web/admin/user',
        name: 'รายชื่อผู้รับงาน',
      },
    ]
    return (
      <Style>
        <div className="menu">
          {menuList.map(menu => 
            <Link to={menu.path}>
              <div className={`list ${menu.path===this.props.route.path&&'active'}`}>
                {menu.name}
              </div>
            </Link>
          )}

          {//if(user === 'admin')
          <div>
            ADMIN
            {menuAdmin.map(menu => 
              <Link to={menu.path}>
                <div className={`list ${menu.path===this.props.route.path&&'active'}`}>
                  {menu.name}
                </div>
              </Link>
            )}
          </div>
          }

          <div className="list logout" onClick={() => auth.signOut()}>
            ออกจากระบบ
          </div>
        </div>
      </Style>
    );
  }
}


const Style = Styled.div`
  width: 100%;
  height: 100vh;
  background: ${AppStyle.color.main};
  .menu{
    padding-top: 200px;

  }
  .list{
    width: 100%;
    height: 40px;
    line-height: 40px;
    color: white;
    padding-left: 20px;
    box-sizing: border-box;
  }
  .list:hover{
    background: ${AppStyle.color.sub};
  }
  .active{
    background: ${AppStyle.color.sub};
  }
  .logout{
    margin-top: 200px;
  }
`