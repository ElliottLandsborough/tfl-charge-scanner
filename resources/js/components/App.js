// resources/assets/js/components/App.js

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Header from './Header'
import Home from './Home'
import Help from './Help'

/**
 * Sleep function, mostly used for debugging purposes e.g 'await sleep(200)'
 * @param  {Integer} ms The number of ms to sleep
 * @return {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Render the whole app, map some routes to some components
 */
class App extends Component {
  render () {
    return (
      <BrowserRouter>
        <div>
          <Header />
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/help' component={Help} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
