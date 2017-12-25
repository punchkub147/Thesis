import React from 'react';
import ReactDOM from 'react-dom';

import './style/animate.css';
import './style/mui.min.css';
import './style/mui.min.js';
import './style/bootstrap-grid.min.css';

import './style/App.css';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
