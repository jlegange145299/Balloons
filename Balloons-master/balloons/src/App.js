import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Home from './Home.js';
import GameScreen from './GameScreen.js';

class App extends Component {
  render() {
    return (
      <div className="App">
      <Router>
      <div>
        <Route exact path='/' render={(props) => <Home {...props}
        />}/>
        <Route path='/exchange' render={(props) => <GameScreen {...props}
        /> }/>
        </div>
      </Router>
      </div>
    );
  }
}

export default App;
