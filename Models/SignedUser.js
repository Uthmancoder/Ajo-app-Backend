const mongoose = require("mongoose");

const signedUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  Wallet: {
    type: Number,
    required: true,
    default : 0.00
  },
});

const SignedUserModel = mongoose.model("SignedUser", signedUserSchema);

module.exports = SignedUserModel;
