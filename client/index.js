import { Provider } from 'react-redux'
import React, { Component, PropTypes } from 'react'
import { createStore, combineReducers } from 'redux'
import { render } from 'react-dom'
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import Login from './components/login/'
import Dashboard from './components/dashboard/'
import Management from './components/management/'
import TaskService from './containers/Tasks'
import ActionServie from './containers/Actions'
import CollectionServie from './containers/Collectios'
import Action from './components/action/'

import reducers from './reducers/'

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
})

// Add the reducer to your store on the `routing` key
const store = createStore(reducer);

const history = syncHistoryWithStore(browserHistory, store)

$.event.props.push('dataTransfer');

Meteor.startup(function() {
  // //console.log('routes-base Meteor.startup entry');
  // //console.log('routes-base Meteor.startup after $(html).attr');
  DashboardService(store);
  TaskService(store);
  ActionServie(store);
  CollectionServie(store)
  render(
    <Provider store={store}>
      <Router history={history}>
        <Route exact path="/" onEnter={()=>browserHistory.push('/Login')} />
        <Route path="/login" component={Login}/>
        <Route path="/dashboard" component={Dashboard}/>
        <Route path="/dashboard/:name" component={Dashboard}/>
        <Route path="/management/:name" component={Management}/>
        <Route path="/action" component={Action}/>
      </Router>
    </Provider>,
    document.getElementById('main')
  )
});

