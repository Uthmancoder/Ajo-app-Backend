const mongoose = require("mongoose");

const ThriftSchema = new mongoose.Schema({
  groupName: { type: String, required: true, trim: true },
  Amount: { type: Number, trim: true },
  interest: { type: Number, trim: true },
  RequiredUsers: { type: Number, trim: true },
  Wallet: { type: Number, default: 0 },
  image_url: { type: String, trim: true },
  plan: { type: String, trim: true },
  Total : {type: Number, trim : true},
  Members: [
    {
      username: { type: String, trim: true, default : "" },
      verified : {type : Boolean, default:false},
      payment : [
        {
          paid : {type : Boolean}
        }
      ]
    },
  ],
}, {timestamps : true});

const ThriftModel =
  mongoose.model.Thrift_tbs || mongoose.model("Thrift_tbs", ThriftSchema);    
module.exports = ThriftModel;

