import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';

import Login from './pages/Login'
import Register from './pages/Register'
import Works from './pages/Works'
import AddWork from './pages/AddWork'

class AppRouter extends Component {

  render() {
    const routes = [
      // { path: '/web',
      //   exact: true,
      //   page: Login,
      //   title: "เข้าสู่ระบบ",
      // },
      // { path: '/web/login',
      //   exact: true,
      //   page: Login,
      //   title: "เข้าสู่ระบบ",
      // },
      // { path: '/web/register',
      //   exact: true,
      //   page: Register,
      //   title: "ลงทะเบียน",
      // },
      // { path: '/web/works',
      //   exact: true,
      //   page: Works,
      //   title: "งาน",
      // },
      // { path: '/web/addwork',
      //   exact: true,
      //   page: AddWork,
      //   title: "เพิ่มงาน",
      // },
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