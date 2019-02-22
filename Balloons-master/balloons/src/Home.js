import React, { Component } from 'react';
import { withAlert } from 'react-alert'
import GameScreen from './GameScreen';
import Login from './Login';
import Profile from './Profile';
import TopUp from './TopUp';
import CashOut from './CashOut';
import Chat from './Chat'
import './App.css';
import getWeb3 from './getWeb3';
import { ethers } from 'ethers';
import openSocket from 'socket.io-client';
const  socket = openSocket('http://balloonapi.nirakara.co.uk/');//, {transports: ['websocket', 'polling'], secure: false});
const serverURL = "http://balloonapi.nirakara.co.uk/"


const abi = [{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"user","type":"bytes32"},{"name":"userAddress","type":"address"},{"name":"newBalance","type":"uint256"}],"name":"withdraw","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"PlayerBalances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"}],"name":"changeAdmin","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"user","type":"bytes32"}],"name":"deposit","outputs":[{"name":"success","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"}];


class Home extends Component {
  constructor(props) {
  super(props);
  this.state = {
    web3: null,
    currentUser: "",
    username: "",
    password: "",
    sessionId: "",
    coinbase: "",
    privateKey: "",
    key: null,
    userCount: 0,
    balance: 0,
    spent: 0,
    gameStarted: false,
    forcePop: false,
    currentPanel: 0,
    amount: 0,
    messageList: [{sender: "GM", message: "Welcome to Balloon Game!"}],
    chatMessage: "",
  }

  this.login = this.login.bind(this)
  this.register = this.register.bind(this)
  this.getBalance = this.getBalance.bind(this)
  this.handlePanels = this.handlePanels.bind(this)
  this.handleKey = this.handleKey.bind(this)
  this.handleAmount = this.handleAmount.bind(this)
  this.handleAddress = this.handleAddress.bind(this)
  this.handleMessageBox = this.handleMessageBox.bind(this)
  this.joinGame = this.joinGame.bind(this)
  this.quitGame = this.quitGame.bind(this)
  this.sendMessage = this.sendMessage.bind(this)
  this.topUp = this.topUp.bind(this)
  this.cashOut = this.cashOut.bind(this)
  this.clickBalloon = this.clickBalloon.bind(this)
}

  componentDidMount(){
    var that = this;

    socket.on('connect', function(){
      console.log("connected")
      that.setState({sessionId: socket.id})
    });
    socket.on("ADD", message => {
      console.log(message);
      that.setState({userCount: message.count});
    });
    socket.on("POP", message => {
      console.log(message);
      that.setState({forcePop: true});
    });
    socket.on("CheckBalance", message => {
      console.log(message);
      that.getBalance();
    });
    socket.on("CHAT", message => {
      console.log(message);
      var msg = that.state.messageList;
      msg.push({sender: message.sender, message: message.message});
      that.setState({messageList: msg})
    });

    getWeb3.then(results => {
    this.setState({web3: results.web3})
    var that = this;



    results.web3.eth.getAccounts((error, accounts) => {
        if(accounts && accounts.length != 0){
          this.setState({coinbase: accounts[0]})
        }
        if (localStorage.getItem('defaultWallet') && localStorage.getItem('defaultWallet').length > 30) {
          var cb = localStorage.getItem('defaultWallet');
          var k = localStorage.getItem('defaultKey')
          if(k.length > 32){
            k = k.substr(2, k.length -1)
          }
          this.setState({coinbase: cb, pKey: k});
          let x = results.web3.eth.accounts.privateKeyToAccount( localStorage.getItem('defaultKey'));
          //console.log(results.web3.eth.accounts.wallet.add(x));
          console.log(x)
          console.log(results.web3.eth.accounts.wallet)
        }
      }).catch(() => {console.log('Error finding web3.')});
    });
}

  register(username, password){
    console.log("Registering...")
    fetch(serverURL + 'register/',
    {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": username,
        "password": password
    })
    }).then(response => response.json())
    .then(data => {
      if(data.status != "Ok"){
        this.props.alert.show(data.status)
      }
      else{
        this.login(username, password);
      }
    }).catch(function(err) {
      console.log(err)
    });
  }

  login(username, password){
    fetch(serverURL + 'login/',
    {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      //mode: "no-cors",
      body: JSON.stringify({
        "username": username,
        "password": password,
        "sessionId": this.state.sessionId
    })
    }).then(response => response.json())
    .then(data => {
      if(data.status != "Ok"){
        this.props.alert.show(data.status)
      }
      else{
        var userhash = this.state.web3.utils.soliditySha3(username);
        this.setState({currentUser: userhash, username: username, password: password}, function(){
          this.getBalance();
        })

      }
    }).catch(function(err) {
      console.log(err)
    });
  }

  async getBalance(){
    let provider = ethers.getDefaultProvider('ropsten');
    let contract = new ethers.Contract("0x7Af6faCB28061cFEb5f7D6538B4d63988C8AeE66", abi, provider);
    let currentValue = await contract.PlayerBalances(this.state.currentUser);
    console.log(ethers.utils.formatEther(currentValue) * 10000)
    this.setState({balance: Number((ethers.utils.formatEther(currentValue) * 10000).toFixed(0))})

    fetch(serverURL + 'balances/',
    {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": this.state.currentUser,
        "sessionId": this.state.sessionId
        })
    }).then(response => response.json())
    .then(data => {
      if(data.status != "Ok"){
        console.log(data.status)
      }
      else{
        console.log(data.spent)
        this.setState({spent: Number(data.spent)});
      }
    }).catch(function(err) {
      console.log(err)
    });

  }

  clickBalloon(){
    console.log("CLICKED")
    fetch(serverURL + 'click/',
    {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": this.state.currentUser,
        "key": this.state.key,
        "sessionId": this.state.sessionId

    })
    }).then(response => response.json())
    .then(data => {
      if(data.status == "Winner"){
        this.props.alert.show("+100")
        this.setState({spent: this.state.spent + 100});
      }
      else if(data.status == "Loser"){
        this.props.alert.show("-10")
        this.setState({spent: this.state.spent - 10});
      }
      else{
        this.props.alert.show(data.status)
      }
    }).catch(function(err) {
      console.log(err)
    });
  }

  joinGame(){
    fetch(serverURL + 'joinGame/',
    {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": this.state.currentUser,
        "key": this.state.key,
        "sessionId": this.state.sessionId

    })
    }).then(response => response.json())
    .then(data => {
      if(data.status != "Ok"){
        this.props.alert.show(data.status)
      }
      else{
        this.setState({key: data.key, gameStarted: true});
      }
    }).catch(function(err) {
      console.log(err)
    });
  }

  async topUp(){
    var key = this.state.privateKey;
    //if(key.substr(0,2) != "0x")
      //key = "0x" + this.state.privateKey;

    let provider = ethers.getDefaultProvider('ropsten');
    let contract = new ethers.Contract("0x7Af6faCB28061cFEb5f7D6538B4d63988C8AeE66", abi, provider);
    let currentValue = await contract.PlayerBalances(this.state.currentUser);
    console.log(ethers.utils.formatEther(currentValue) * 10000)
    let wallet = new ethers.Wallet(key);
    let walletWithProvider = new ethers.Wallet(key, provider);
    //console.log("AMOUNT: " + this.state.amount)
    //console.log(ethers.utils.parseEther(this.state.amount))
    let overrides = {
    gasLimit: 53000,
    //gasPrice: ethers.utils.parseUnits('9.0', 'gwei'),
    value: ethers.utils.parseEther(this.state.amount),
    };
    let contractWithSigner = await contract.connect(walletWithProvider);
    let tx = await contractWithSigner.deposit(this.state.currentUser, overrides);
    this.props.alert.show("Please Await Transaction")
    this.setState({currentPanel: 0})
    await tx.wait();
    this.props.alert.show("Deposit Confirmed")
    this.getBalance();
  }

  cashOut(){
    fetch(serverURL + 'withdraw/',
    {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "key": this.state.key,
        "username": this.state.currentUser,
        "password": this.state.password,
        "address": this.state.coinbase,
        "sessionId": this.state.sessionId,
        "amount": this.state.amount
    })
    }).then(response => response.json())
    .then(data => {
      if(data.status != "Ok"){
        this.props.alert.show(data.status)
      }
      else{
        this.props.alert.show("Withdrawal Confirmed")
        this.setState({currentPanel: 0})
      }
    }).catch(function(err) {
      console.log(err)
    });
  }

  quitGame(){
    fetch(serverURL + 'quitGame/',
    {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": this.state.currentUser,
        "key": this.state.key,
        "sessionId": this.state.sessionId
    })
    }).then(response => response.json())
    .then(data => {
      if(data.status != "Ok"){
        this.props.alert.show(data.status)
      }
      else{
        this.setState({gameStarted: false});
        this.getBalance();
      }
    }).catch(function(err) {
      console.log(err)
    });
  }

  sendMessage(){
    var sender = (this.state.username == "" ? "Guest" : this.state.username);
    socket.emit("CHAT", {sender: sender, message: this.state.chatMessage})
    this.setState({chatMessage: ""})

  }

  handleMessageBox(event){
    this.setState({chatMessage: event.target.value})
  }

  handlePanels(val){
    this.setState({currentPanel: val})
  }

  handleKey(event){
    this.setState({privateKey: event.target.value})
  }

  handleAmount(event){
    this.setState({amount: event.target.value})
  }

  handleAddress(event){
    this.setState({coinbase: event.target.value})
  }

  render() {
    const profilePanels = [
      <Profile
      joinGame={this.joinGame}
      username={this.state.username}
      balance={this.state.balance + this.state.spent}
      handlePanels={this.handlePanels}
      />,
      <TopUp
      joinGame={this.joinGame}
      username={this.state.username}
      balance={this.state.balance + this.state.spent}
      handlePanels={this.handlePanels}
      handleAmount={this.handleAmount}
      amount={this.state.amount}
      privateKey={this.state.privateKey}
      handleKey={this.handleKey}
      topUp={this.topUp}
      />,
      <CashOut
      joinGame={this.joinGame}
      username={this.state.username}
      balance={this.state.balance + this.state.spent}
      handlePanels={this.handlePanels}
      coinbase={this.state.coinbase}
      handleAmount={this.handleAmount}
      handleAddress={this.handleAddress}
      amount={this.state.amount}
      cashOut={this.cashOut}
      />
    ]
    return (
      <div className="Home">
        <div className="Panel">
        <h1>Balloon Game</h1>
          {this.state.currentUser == "" ? <Login login={this.login} register={this.register}/> : (this.state.gameStarted ? null : profilePanels[this.state.currentPanel])}
        </div>
        <GameScreen userCount={this.state.userCount} clickBalloon={this.clickBalloon} gameStarted={this.state.gameStarted}/>
        <div style={{position: "absolute", left: "0px", top: "0px", backgroundColor: "#00000052", borderRadius: "5px", margin: "10px", color: "white", padding: "5px"}}>
        <h1>{this.state.userCount}</h1>
        Players</div>
        <div style={{position: "absolute", right: "0px", top: "0px", backgroundColor: "#00000052", borderRadius: "5px", margin: "10px", color: "white", padding: "5px"}}>
        Balance
        <h1>{this.state.balance + this.state.spent}</h1></div>
        {this.state.gameStarted ?
          <div onClick={this.quitGame} style={{position: "absolute", right: "0px", bottom: "0px", backgroundColor: "#00000052", borderRadius: "5px", margin: "10px", color: "white", padding: "5px"}}>
          Quit Game</div>
           : null}
        <Chat messageList={this.state.messageList} chatMessage={this.state.chatMessage} handleChat={this.handleMessageBox} sendMessage={this.sendMessage}/>
      </div>
    );
  }
}

export default withAlert(Home);
