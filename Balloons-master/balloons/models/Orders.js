var restful = require('node-restful');
var mongoose = restful.mongoose;


var orderSchema = new mongoose.Schema({
  user: String,
  coinbase: String,
  someId: mongoose.Schema.Types.ObjectId,
  transfer: String,
  newBalance: String,
  uid: String,
});


module.exports = restful.model('Orders',orderSchema);
