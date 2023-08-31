const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")

const userSchema = new mongoose.Schema({
    firstname : {type : String, required :true, trim: true},
    lastname : {type : String, required :true, trim: true},
    username : {type : String, required :true, trim: true},
    image : {type : String},
    email : {type :String, required : true, trim :true, unique : true},
    password : {type :String, required : true, trim :true, unique : true},
    Wallet : {type :Number, default: 0.00},
    lastLoginTime: {type: Date},
}, {timestamps : true});

// userSchema.pre("save", function (next){
//     let saltRound = 10
//     if (this.password !== undefined) {
//       bcryptjs.hash(this.password, saltRound).then((hashedPassword)=>{
//           this.password = hashedPassword
//           next();
//       }).catch((err)=>{
//           console.log(err);
//       })
//     }  
//   })
    

  const userModel = mongoose.model.user_tbs || mongoose.model("user_tbs", userSchema);
  module.exports = userModel;