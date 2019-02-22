import React, { Component } from 'react';
import './App.css';


class Profile extends Component {
  render() {
    return (
      <div className="Login">

        <p>Welcome {this.props.username}!</p>
        <p>Current Balance:</p>
        <h2>{this.props.balance}uETH</h2>

        <button onClick={() => this.props.handlePanels(1)} className="midnight-blue-flat-button">Top Up</button>
        <div className="divider"/>
        <button onClick={() => this.props.handlePanels(2)} className="midnight-blue-flat-button">Cash Out</button>
        <br/><br/><br/><br/>
        <button onClick={this.props.joinGame} className="midnight-blue-flat-button">JOIN GAME</button>

      </div>
    );
  }
}

export default Profile;
