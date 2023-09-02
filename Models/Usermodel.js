const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")

const userSchema = new mongoose.Schema({
    firstname : {type : String, required :true, trim: true},
    lastname : {type : String, required :true, trim: true},
    username : {type : String, required :true, trim: true},
    image : {type : String},
    email : {type :String, required : true, trim :true, unique : true},
    password : {type :String, required : true, trim :true, unique : true},
    Wallet : {type :Number, default: 0},
    lastLoginTime: {type: Date},
}, {timestamps : true});


    

  const userModel = mongoose.model.user_tbs || mongoose.model("user_tbs", userSchema);
  module.exports = userModel;