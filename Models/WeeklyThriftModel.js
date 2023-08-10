const mongoose = require("mongoose");

const weeklySchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true },
    Amount: { type: Number, trim: true },
    duration: { type: String, trim: true },
    Wallet: { type: Number, default: 0.00 },
    image_url: { type: String, trim: true },
    plan: { type: String, trim: true }, 
  },
  { timestamps: true }
);

const weeklyModel = mongoose.model("weekly_tbs", weeklySchema);

module.exports = weeklyModel;
