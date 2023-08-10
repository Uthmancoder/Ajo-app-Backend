const mongoose = require("mongoose");

const dailySchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true },
    Amount: { type: Number, trim: true },
    duration: { type: String, trim: true },
    Wallet: { type: Number, default: 0.0 },
    image_url: { type: String, trim: true },
    plan: { type: String, trim: true },
  },
  { timestamps: true }
);

const dailyModel =
  mongoose.model.daily_tbs || mongoose.model("daily_tbs", dailySchema);
module.exports = dailyModel;
