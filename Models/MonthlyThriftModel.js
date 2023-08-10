const mongoose = require("mongoose");

const MonthlySchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true, unique :true },
    Amount: { type: Number, trim: true },
    interest: { type: Number, trim: true },
    duration: { type: String, trim: true },
    Wallet: { type: Number, default: 0.00 },
    image_url: { type: String, trim: true },
    plan: { type: String, trim: true },
  },
  { timestamps: true }
);

const MonthlyModel = mongoose.model("monthly_tbs", MonthlySchema);

module.exports = MonthlyModel;
