import React, { Component } from 'react';
import './App.css';


class Chat extends Component {
  render() {
    return (
      <div className="Chat" style={{position: "absolute", left: "0px", bottom: "0px", backgroundColor: "#00000052", width: "300px"}}>

        <div style={{height: "150px", textAlign: "left", overflow: "auto", overflowWrap: "break-word"}}>
        {this.props.messageList.map((o) => {return(<p>{o.sender}: {o.message}</p>)})}
        </div>
        <input
        value={this.props.chatMessage}
        onChange={this.props.handleChat}
        onKeyPress ={(e) => {if(e.key === 'Enter') this.props.sendMessage()}}
        style={{position: "relative", bottom: "0px", width: "85%"}}/>

      </div>
    );
  }
}

export default Chat;
