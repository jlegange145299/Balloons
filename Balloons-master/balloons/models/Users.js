var restful = require('node-restful');
var mongoose = restful.mongoose;

var userSchema = new mongoose.Schema({
  someId: mongoose.Schema.Types.ObjectId,
  username: String,
  userhash: String,
  password: String,
  //key: String,
  coinbase: String,
  balance: Number,
  socketId: String,
  clicks: Number,
});


module.exports = restful.model('Users',userSchema);
