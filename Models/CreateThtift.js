const mongoose = require("mongoose");

const ThriftSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true },
    Amount: { type: Number, trim: true },
    interest: { type: Number, trim: true },
    RequiredUsers: { type: Number, trim: true },
    Wallet: { type: Number, default: 0 },
    image_url: { type: String, trim: true },
    plan: { type: String, trim: true },
    Total: { type: Number, trim: true },
    TotalWithdraws: { type: Number, default: 0 },
    NextWithdrawal: { type: String, default: "" },
    Members: [
      {
        username: { type: String, trim: true, default: "" },
        verified: { type: Boolean, default: false },
        payment: [
          {
            paid: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

ThriftSchema.pre("save", function (next) {
  const requiredUsers = this.RequiredUsers;
  const currentMembers = this.Members.length;

  // Check if the user is being added to the group or if a new group is being created
  if (requiredUsers && currentMembers === 0) {
    // Initialize the payment array for the new user
    this.Members[0].payment = Array.from({ length: requiredUsers }, () => ({
      paid: false,
    }));
  }

  next();
});

const ThriftModel =
  mongoose.model.Thrift_tbs || mongoose.model("Thrift_tbs", ThriftSchema);
module.exports = ThriftModel;
