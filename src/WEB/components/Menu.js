import React, { Component } from 'react';
import { Link, browserHistory, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import { auth, getUser } from '../../api/firebase'
import store from 'store'

import defaultImage from '../../img/profile2.png'

import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

export default class extends Component {

  state = {
    user: store.get('employer')
  }

  async componentDidMount() {
    await getUser('employer', user => {
      store.set('employer',user)
      this.setState({user})
    })

    await auth.onAuthStateChanged(user => {
      if(user){
        // this.setState({user})
      }else{
        browserHistory.push('/login')
      }
    })
  }

  render() {
    const { user } = this.state

    const menuProfile = [
      {
        path: `/web/profile/${user.uid}`,
        name: 'แก้ไขโปรไฟล์',
        icon: 'profile',
      },
    ]

    const menuList = [
      {
        path: '/web/works',
        name: 'งานทั้งหมด',
        icon: 'shop',
      },
      {
        path: '/web/workonhome',
        name: 'งานที่มอบหมาย',
        icon: 'schedule',
      },
      {
        path: '/web/needwork',
        name: 'คำร้องขอรับงาน',
        icon: 'solution',
      },
      {
        path: '/web/employees',
        name: 'ลูกจ้าง',
        icon: 'team',
      },
    ]

    const menuAdmin = [
      {
        path: '/web/admin/employees',
        name: 'รายชื่อผู้รับงาน',
        icon: 'team',
      },
      {
        path: '/web/admin/employers',
        name: 'รายชื่อบริษัท',
        icon: 'shop',
      },
    ]

    return (
      <Style>
        <div className="menu">

          {(!user.data.admin)&&
            <div>

            <Link to={`/web/profile/${user.uid}`}>
              <div className='profile'>
                <img src={user.data.imageProfile?user.data.imageProfile:defaultImage} alt=''/>
                <div className='name'>{user.data.name}</div>
                <div className='edit'>แก้ไขโปรไฟล์</div>
              </div>
            </Link>

            <div className='profile-icon'>
            {menuProfile.map(menu => 
              <Link to={menu.path}>
                <div className={`list ${menu.path===`${this.props.route.path.substr(0, 12)}/${user.uid}`&&'active'}`}>
                  <Icon type={menu.icon} style={{fontSize: 18}} />
                  <span className='menu-name'>{menu.name}</span>
                </div>
              </Link>
            )}
            </div>

            {menuList.map(menu => 
              <Link to={menu.path}>
                <div className={`list ${menu.path===this.props.route.path&&'active'}`}>
                  <Icon type={menu.icon} style={{fontSize: 18}} />
                  <span className='menu-name'>{menu.name}</span>
                </div>
              </Link>
            )}
            </div>
          }

          {(user.data.admin)&&
          <div>
            {menuAdmin.map(menu => 
              <Link to={menu.path}>
                <div className={`list ${menu.path===this.props.route.path&&'active'}`}>
                  <Icon type={menu.icon} style={{fontSize: 18}} />
                  <span className='menu-name'>{menu.name}</span>
                </div>
              </Link>
            )}
          </div>
          }

          <div className="list logout" onClick={() => auth.signOut()}>
            <Icon type={'logout'} style={{fontSize: 18}} />
            <span className='menu-name'>ออกจากระบบ</span>
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
    padding-top: 60px;
    .profile{
      width: 100%;
      margin-bottom: 20px;
      text-align: center;
      img{
        width: 140px;
        height: 140px;
        object-fit: cover;
      }
      .name{
        ${AppStyle.font.tool}
      }
      .edit{
        ${AppStyle.font.read1}
      }

    }
  }
  .menu-name{
    margin-left: 10px;
  }
  .profile-icon{
    display: none;
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
    margin-top: 40px;
  }


  @media screen and (max-width: 400px) {
    .profile{
      display: none;
    }
    .profile-icon{
      display: block;
    }
    .menu-name{
      display: none;
    }
  }
`