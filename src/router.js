import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';

import Login from './pages/Login'
import Register from './pages/Register/index'
import Register2 from './pages/Register/Step2'
import Register3 from './pages/Register/Step3'
import Search from './pages/Search'
import Tasks from './pages/Tasks'
import Dashboard from './pages/Dashboard'
import Notification from './pages/Notification'
import Profile from './pages/Profile'
import Work from './pages/Work'
import EditAbilities from './pages/EditAbilities'
import EditProfile from './pages/EditProfile';

import Web from './WEB/Web'
import WebAddWork from './WEB/pages/AddWork' 
import WebLogin from './WEB/pages/Login'
import WebRegister from './WEB/pages/Register' 
import WebWorks from './WEB/pages/Works'
import WebWorkOnHome from './WEB/pages/WorkOnHome'
import WebNeedWork from './WEB/pages/NeedWork'

class AppRouter extends Component {

  render() {
    const routes = [
      { path: '/',
        exact: true,
        page: Login,
        title: "เข้าสู่ระบบ",
      },
      { path: '/index.html',
        exact: true,
        page: Login,
        title: "เข้าสู่ระบบ",
      },
      { path: '/login',
        exact: false,
        page: Login,
        title: "เข้าสู่ระบบ",
      },
      { path: '/register',
        exact: false,
        page: Register,
        title: "สมัครสมาชิก",
      },
      { path: '/register2',
        exact: false,
        page: Register2,
        title: "ประวัติ",
      },
      { path: '/register3',
        exact: false,
        page: Register3,
        title: "ความถนัด",
        },
      { path: '/search',
        exact: false,
        page: Search,
        title: "Extra Inhome",
      },
      { path: '/tasks',
        exact: false,
        page: Tasks,
        title: "งาน",
      },
      { path: '/dashboard',
        exact: false,
        page: Dashboard,
        title: "สถิติ",
      },
      { path: '/notification',
        exact: false,
        page: Notification,
        title: "แจ้งเตือน",
      },
      { path: '/profile',
        exact: false,
        page: Profile,
        title: "ข้อมูลส่วนตัว",
      },
      { path: '/work/:id',
        exact: false,
        page: Work,
        title: "งาน",
      },
      { path: '/editabilities',
        exact: false,
        page: EditAbilities,
        title: "ความสามารถ",
      },
      { path: '/editprofile',
        exact: false,
        page: EditProfile,
        title: "ข้อมูลส่วนตัว",
      },
      

      /////////////////////////////// WEB ////////////////////////////////////

      { path: '/web',
        exact: false,
        page: WebLogin,
        title: "เข้าสู่ระบบ",
      },
      { path: '/web/login',
        exact: false,
        page: WebLogin,
        title: "เข้าสู่ระบบ",
      },
      { path: '/web/register',
        exact: false,
        page: WebRegister,
        title: "ลงทะเบียน",
      },
      { path: '/web/works',
        exact: false,
        page: WebWorks,
        title: "งาน",
      },
      { path: '/web/workonhome',
        exact: false,
        page: WebWorkOnHome,
        title: "งาน",
      },
      { path: '/web/needwork',
        exact: false,
        page: WebNeedWork,
        title: "งาน",
      },
      { path: '/web/addwork',
        exact: false,
        page: WebAddWork,
        title: "เพิ่มงาน",
      },
    ]

    return (
      <Router history={browserHistory}>
        <div>
          {routes.map(route =>
            <Route
              key={route.path}
              path={route.path}
              title={route.title}
              exact={route.exact}
              component={route.page}
              data={route.data}
            />
          )}
        </div>
      </Router>
    );
  }
}

export default AppRouter;