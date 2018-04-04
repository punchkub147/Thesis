import React, { Component } from 'react';
import { Router, browserHistory, Route } from 'react-router';

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register/index'
import Register2 from './pages/Register/Step2'
import Register3 from './pages/Register/Step3'
import Register4 from './pages/Register/Step4'
import Search from './pages/Search'
import Tasks from './pages/Tasks'
import Dashboard from './pages/Dashboard'
import Notification from './pages/Notification'
import Profile from './pages/Profile'
import Work from './pages/Work'
import EditAbilities from './pages/EditAbilities'
import EditProfile from './pages/EditProfile'
import EditWorkTime from './pages/EditWorkTime'
import EditTools from './pages/EditTools'
import StopWatch from './pages/StopWatch'
import Employer from './pages/Employer'
import WorkList from './pages/WorkList'
import WorkList2 from './pages/WorkList2'

import WebAddWork from './WEB/pages/AddWork' 
import WebEditWork from './WEB/pages/EditWork'
import WebLogin from './WEB/pages/Login'
import WebRegister from './WEB/pages/Register' 
import WebWorks from './WEB/pages/Works'
import WebWork from './WEB/pages/Work'
import WebWorkOnHome from './WEB/pages/WorkOnHome'
import WebNeedWork from './WEB/pages/NeedWork'
import WebEditProfile from './WEB/pages/EditProfile'
import WebEmployees from './WEB/pages/Employees'
import WebEmployee from './WEB/pages/Employee'
import WebDashboard from './WEB/pages/Dashboard'

/// ADMIN ///
import AdminEmployees from './WEB/pages/Admin/Employees'
import AdminEmployers from './WEB/pages/Admin/Employers'

class AppRouter extends Component {

  render() {
    const routes = [
      { path: '/',
        exact: true,
        page: Landing,
        title: "เข้าสู่ระบบ",
      },
      { path: '/index.html',
        exact: true,
        page: Landing,
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
      { path: '/register4',
        exact: false,
        page: Register4,
        title: "ความถนัด",
      },
      { path: '/search',
        exact: false,
        page: Search,
        title: "โฮมเบสท์",
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
      { path: '/editworktime',
        exact: false,
        page: EditWorkTime,
        title: "เวลาทำงาน",
      },
      { path: '/edittools',
        exact: false,
        page: EditTools,
        title: "อุปกรณ์ทำงาน",
      },
      { path: '/stopwatch/:id',
        exact: false,
        page: StopWatch,
        title: "จับเวลา",
      },
      { path: '/employer/:id',
        exact: false,
        page: Employer,
        title: "บริษัท",
      },
      { path: '/worklist/:id',
        exact: false,
        page: WorkList,
        title: "งานแนะนำ",
      },
      { path: '/worklist2/:id',
        exact: false,
        page: WorkList2,
        title: "งานแนะนำ",
      },
        

      /////////////////////////////// WEB ////////////////////////////////////

      { path: '/web',
        exact: false,
        page: Login,
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
        title: "งานที่ประกาศ",
      },
      { path: '/web/work/:id',
        exact: false,
        page: WebWork,
        title: "",
      },
      { path: '/web/workonhome',
        exact: false,
        page: WebWorkOnHome,
        title: "งานที่กำลังทำ",
      },
      { path: '/web/needwork',
        exact: false,
        page: WebNeedWork,
        title: "คำขอรับงาน",
      },
      { path: '/web/addwork',
        exact: false,
        page: WebAddWork,
        title: "เพิ่มงาน",
      },
      { path: '/web/editwork/:id',
        exact: false,
        page: WebEditWork,
        title: "แก้ไขงาน",
      },
      { path: '/web/profile/:id',
        exact: false,
        page: WebEditProfile,
        title: "แก้โปรไฟล์",
      },
      { path: '/web/employees',
        exact: false,
        page: WebEmployees,
        title: "ลูกจ้าง",
      },
      { path: '/web/employee/:id',
        exact: false,
        page: WebEmployee,
        title: "",
      },
      { path: '/web/dashboard',
        exact: false,
        page: WebDashboard,
        title: "หน้าหลัก",
      },
      
      ///////////////////////////// ADMIN //////////////////
      { path: '/web/admin/',
        exact: false,
        page: AdminEmployees,
        title: "ผู้รับงาน",
      },
      { path: '/web/admin/employees',
        exact: false,
        page: AdminEmployees,
        title: "ผู้รับงาน",
      },
      { path: '/web/admin/employers',
        exact: false,
        page: AdminEmployers,
        title: "ผู้ประกอบการ",
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