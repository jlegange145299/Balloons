import React, { Component } from 'react';
import './App.css';


class CashOut extends Component {
  render() {
    return (
      <div className="Login">

        <p>Welcome {this.props.username}!</p>
        <p>Current Balance: {this.props.balance}</p>
        <br/><br/>
        <p>Amount</p>
        <input value={this.props.amount} onChange={this.props.handleAmount} type="number"/>
        <br/><br/>
        <p>Receiving Address</p>
        <input value={this.props.coinbase} onChange={this.props.handleAddress}/>
        <br/><br/>
        <button onClick={() => this.props.handlePanels(0)} className="midnight-blue-flat-button">Back</button>
        <div className="divider"/>
        <button onClick={this.props.cashOut} className="midnight-blue-flat-button">Cash Out</button>
        <br/><br/>

      </div>
    );
  }
}

export default CashOut;
