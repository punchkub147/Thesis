import React, { Component } from 'react';
import { Router, browserHistory, Route, Link } from 'react-router';

import Search from './pages/Search'
import Tasks from './pages/Tasks'
import Dashboard from './pages/Dashboard'
import Notification from './pages/Notification'
import Profile from './pages/Profile'

const routes = [
  { path: '/',
    exact: true,
    page: Search,
  },
  { path: '/search',
    exact: true,
    page: Search,
  },
  { path: '/tasks',
    exact: true,
    page: Tasks,
  },
  { path: '/dashboard',
    exact: true,
    page: Dashboard,
  },
  { path: '/notification',
    exact: true,
    page: Notification,
  },
  { path: '/profile',
    exact: true,
    page: Profile,
  },
]

class AppRouter extends Component {

  render() {
    return (
      <Router history={browserHistory}>
        <div>
          {routes.map(route =>
            <Route
              key={route.path}
              path={route.path}
              exact={route.exact}
              component={route.page}
            />
          )}
        </div>
      </Router>
    );
  }
}

export default AppRouter;