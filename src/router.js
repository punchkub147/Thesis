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
      { path: '/login',
        exact: true,
        page: Login,
        title: "เข้าสู่ระบบ",
      },
      { path: '/register',
        exact: true,
        page: Register,
        title: "สมัครสมาชิก",
      },
      { path: '/register2',
        exact: true,
        page: Register2,
        title: "ประวัติ",
      },
      { path: '/register3',
        exact: true,
        page: Register3,
        title: "ความถนัด",
        },
      { path: '/search',
        exact: true,
        page: Search,
        title: "Extra Inhome",
      },
      { path: '/tasks',
        exact: true,
        page: Tasks,
        title: "งาน",
      },
      { path: '/dashboard',
        exact: true,
        page: Dashboard,
        title: "สถิติ",
      },
      { path: '/notification',
        exact: true,
        page: Notification,
        title: "แจ้งเตือน",
      },
      { path: '/profile',
        exact: true,
        page: Profile,
        title: "ข้อมูลส่วนตัว",
      },

      /////////////////////////////// WEB ////////////////////////////////////

      { path: '/web',
        exact: true,
        page: WebLogin,
        title: "เข้าสู่ระบบ",
      },
      { path: '/web/login',
        exact: true,
        page: WebLogin,
        title: "เข้าสู่ระบบ",
      },
      { path: '/web/register',
        exact: true,
        page: WebRegister,
        title: "ลงทะเบียน",
      },
      { path: '/web/works',
        exact: true,
        page: WebWorks,
        title: "งาน",
      },
      { path: '/web/workonhome',
        exact: true,
        page: WebWorkOnHome,
        title: "งาน",
      },
      { path: '/web/needwork',
        exact: true,
        page: WebNeedWork,
        title: "งาน",
      },
      { path: '/web/addwork',
        exact: true,
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