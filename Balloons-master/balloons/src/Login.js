import React, { Component } from 'react';
import './App.css';

class Login extends Component {
  constructor(props) {
  super(props);
  this.state = {
    username: "",
    password: "",
  }
  this.handleUsername = this.handleUsername.bind(this)
  this.handlePassword = this.handlePassword.bind(this)
  //this.create = this.create.bind(this);
}

handleUsername(event){
  this.setState({username: event.target.value})
}

handlePassword(event){
  this.setState({password: event.target.value})
}


  render() {
    return (
      <div className="Login">

        <p>Username</p>
        <input value={this.state.username} onChange={this.handleUsername}/>
        <br/>
        <p>Password</p>
        <input type="password" value={this.state.password} onChange={this.handlePassword}/>
        <br/><br/>
        <button className="midnight-blue-flat-button" onClick={() => this.props.login(this.state.username, this.state.password)}>LOGIN</button>
        <div className="divider"/>
        <button className="midnight-blue-flat-button" onClick={() => this.props.register(this.state.username, this.state.password)}>REGISTER</button>

      </div>
    );
  }
}

export default Login;
