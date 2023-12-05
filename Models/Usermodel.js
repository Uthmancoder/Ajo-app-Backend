const mongoose = require("mongoose")
// const bcryptjs = require("bcryptjs")

const userSchema = new mongoose.Schema({
    username : {type : String, required :true, trim: true},
    image : {type : String},
    email : {type :String, required : true, trim :true, unique : true},
    password : {type :String, required : true, trim :true, unique : true},
    Wallet : {type :Number, default: 0},
    lastLoginTime: {type: Date},
    TotalWithdrawal : {type : Number, default : 0},
    TotalDeposit : {type : Number, default : 0},
    TotalTransactions : {type : Number, default : 0},
    TransactionHistory: [{ type: Object, default: {} }],
}, {timestamps : true});


  const userModel = mongoose.model.user_tbs || mongoose.model("user_tbs", userSchema);
  module.exports = userModel;