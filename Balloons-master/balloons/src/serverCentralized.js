var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var app = express();
var bcrypt = require('bcrypt');
var http = require('http');
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || "http://ropsten.infura.io");
//app.use(cors())
mongoose.connect('mongodb://localhost/BalloonDB');

var activeList = [];
var popCount = 0;

const abi = [{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"PlayerBalances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"}],"name":"changeAdmin","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"user","type":"bytes32"},{"name":"userAddress","type":"address"}],"name":"withdraw","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"user","type":"bytes32"}],"name":"transferLoss","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"user","type":"bytes32"}],"name":"deposit","outputs":[{"name":"success","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"user","type":"bytes32"}],"name":"transferWinnings","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"}];

var balloonContract = new web3.eth.Contract(abi, '0xa8aa5eb312a669cbb5fe793991c520f1b2a84657', {
from: '0x1234567890123456789012345678901234567891', // default from address
gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
});




const crypto = require('crypto');
//const hash = crypto.createHash('sha256');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  res.header('Access-Control-Expose-Headers', 'Authorization');
  next();
});

var userSchema = require('./models/Users').userSchema;
var orderSchema = require('./models/Orders').orderSchema;





var server = http.createServer(app);
var io = require('socket.io').listen(server);
//io.origins(['https://cryptowildcard.com', 'https://www.cryptowildcard.com', 'http://18.184.213.199:3000', 'https://18.184.213.199:3000', '*']);
io.on('connection', function(socket){
  var sessionId = socket.id;


  socket.on('disconnect', function() {
      console.log('Got disconnect!' + socket.id);
      var index = activeList.findIndex((e) => e.sessionId == socket.id);
      if(index != -1){
        var User = mongoose.model('Users', orderSchema);
        User.findOne({userhash: activeList[index].username}, function(err, usr){
        usr.balances += activeList[index].won - activeList[index].spent;
        usr.save(function(){
            activeList.splice(index, 1);
            io.emit("ADD", {count: activeList.length})
        });

        });


      }
   });
});


var schedule = require('node-schedule');
var ethers = require('ethers');

var isProcessing = false;
var j = schedule.scheduleJob('*/5 * * * * *', function(){
    var Order = mongoose.model('Orders', orderSchema);
    Order.find({}, async function(err, product){
      if(product.length > 0)
      console.log(product.length + " PENDING ORDERS")
    if(!isProcessing && product.length > 0){
      isProcessing = true;
      var tx;
      var privateKey = "";
      let provider = new ethers.providers.InfuraProvider('ropsten');
      let wallet = new ethers.Wallet(privateKey, provider)
      let transactionCountPromise = await provider.getTransactionCount(wallet.address)
      let overrides = {
        //gasPrice: ethers.utils.parseUnits('20.0', 'gwei'),
        //gasLimit: 120000,
        nonce: transactionCountPromise
        }

      let contract = new ethers.Contract(contractAddress, abi, wallet);
      let contractWithSigner = await contract.connect(wallet);
      if(product[0].uid == "WITHDRAW"){

        tx = await contract.withdraw(ethers.utils.parseEther(product[0].transfer), product[0].user, product[0].coinbase, product[0].newBalance);
      }
        else{
          tx = null;
        }



      if(tx != null)
      await tx.wait().catch(function(e){
        console.log("TX ERROR")
      });
      product[0].remove(function(e){
          isProcessing = false;
      });

    }


  });

  });



function generateUID() {
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}



app.post('/register', async function(req, res){
  console.log("Registering User")
  var User = mongoose.model('Users', userSchema);
  var userhash = web3.utils.soliditySha3(req.body.username);
  console.log(userhash)
  console.log(req.body.username)
  User.findOne({userhash: userhash}, function(err, usr){
    console.log(usr)
      if(!usr){
        if(req.body.password != null){
          bcrypt.hash(req.body.password, 10, function(err, hash) {
            var newUser = new User({
              username: req.body.username,
              userhash: userhash,
              password: hash,
              coinbase: "",
              balance: 0,
              socketId: "",
              clicks: 0});
            newUser.save(function(e, r){
              console.log(e)
              console.log(r)
              res.send({status: "Ok"})
            });
          });
        }
        else{
          res.send({status: "Password Null"})
        }
      }
      else{
        res.send({status: "User Exists"})
      }
    });

})

app.post('/login', async function(req, res){
  var User = mongoose.model('Users', userSchema);
  User.findOne({username: req.body.username}, function(err, usr){
      if(usr){
        if(req.body.password != null && req.body.sessionId != null){
          bcrypt.compare(req.body.password, usr.password, async function(err, result) {
          if(result == true){
            usr.sessionId = req.body.sessionId;
            usr.save();
            res.send({status: "Ok"})
          }
          else{
            res.send({status: "Password Incorrect"})
          }
        });
        }
      }
      else{
        res.send({status: "No User Found"})
      }
    });
})

app.post('/joinGame', function(req, res){
  var index = activeList.findIndex((e) => e.sessionId == req.body.sessionId);
  if(index != -1){
    res.send({status: "Already In A Game"})
  }
  else{
    var User = mongoose.model('Users', userSchema);
    User.findOne({userhash: req.body.username}, function(err, usr){
      if(usr && usr.sessionId == req.body.sessionId && usr.username == req.body.username){
        balloonContract.methods.balances(this.state.currentUser).call(function(error, result){
          console.log("Contract Balance: " + result);
          console.log(result)

          //check balances here
          if(!error){
            var key = generateUID();
            activeList.push({username: req.body.username, sessionId: req.body.sessionId, spent: 0, won: 0, balance: result, key: key});
            io.emit("ADD", {count: activeList.length})
            usr.key = key;
            usr.save(function(){
              res.send({status: "Ok", key: key});
            })

          }
          else{
            res.send({status: "Could Not Find Balances"})
          }
        });
      }
      else{
        res.send({status: "Please Login Again"})
      }
    });
  }
})

app.post('/click', function(req, res){
  var index = activeList.findIndex((e) => e.sessionId == req.body.sessionId);
  var result = "Loser";
  if(index != -1 && req.body.key == activeList[index].key){
    popCount++;
    if(popCount % 11 == 0){
      console.log("Winner")
      activeList[index].won += 110;
      result = "Winner";
    }
    activeList[index].spent += 10;
    res.send({status: result})
  }
  else{
    res.send({status: "Please Login Again"})
  }
})

app.post('/balances', function(req, res){
  var balanceDeduction = 0;
  var index = activeList.findIndex((e) => e.username == req.body.username);
  var User = mongoose.model('Users', orderSchema);
  User.findOne({userhash: req.body.username}, async function(err, product){

    if(index != -1){
      balanceDeduction = activeList[index].won - activeList[index].spent;
    }


    if(product){
      balanceDeduction -= product[x].balances;
    }
    res.send({status: balanceDeduction})
  });
})

app.post('/withdraw', function(req, res){
  var index = activeList.findIndex((e) => e.username == req.body.username);
  if(index != -1){
    res.end({status: "Please Leave The Current Game"})
  }
  var Order = mongoose.model('Orders', orderSchema);
  Order.find({username: req.body.username}, async function(err, product){
    if(product.findIndex((e) => e.uid == "WITHDRAW") != -1){
      res.send({status: "Withdrawal Already Processing"})
    }
    else{

      var User = mongoose.model('Users', orderSchema);
      User.findOne({userhash: req.body.username}, async function(err, product){
        if(!product){
          res.send("Please Login Again")
        }

        bcrypt.compare(req.body.password, product.password, async function(err, result) {
        if(result == true){
          let provider = new ethers.providers.InfuraProvider('ropsten');
          let contract = new ethers.Contract(contractAddress, abi, wallet);
          let tx = await contract.PlayerBalances(req.body.username);
          console.log(tx);
          balance = (ethers.utils.formatEther(tx) * 10000).toFixed(0);

          if(balance < req.body.balance + product.balance){
            res.send({status: "Insufficient Balance"})
          }
          else{
            var newWithdrawal = new Order({
              user: activeList[index].username,
              coinbase: req.body.address,
              transfer: req.body.balance,
              newBalance: balance + product.balance - req.body.balance,
              uid: "WITHDRAW"});

            newWithdrawal.save(function(){
              res.send({status: "Ok"})
            });
          }

        }
        else{
          res.send({status: "Password Incorrect"})
        }
      });

    });
    }
  });

});


//app.use('/api', require('./routes/api'));

server.listen(5001);

//server.listen(5001);
console.log('API Running On Port 5001');
