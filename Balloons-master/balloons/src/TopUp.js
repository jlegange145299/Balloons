import React, { Component } from 'react';
import './App.css';


class TopUp extends Component {
  render() {
    return (
      <div className="Login">

        <p>Welcome {this.props.username}!</p>
        <p>Current Balance: {this.props.balance}</p>
        <br/><br/>
        <p>Amount</p>
        <input value={this.props.amount} onChange={this.props.handleAmount} type="number"/>
        <br/><br/>
        <p>Private Key</p>
        <input value={this.props.privatekey} onChange={this.props.handleKey} style={{width: "100%"}}/>
        <br/><br/>
        <button onClick={() => this.props.handlePanels(0)} className="midnight-blue-flat-button">Back</button>
        <div className="divider"/>
        <button onClick={this.props.topUp} className="midnight-blue-flat-button">Top Up</button>
        <br/><br/>

      </div>
    );
  }
}

export default TopUp;
