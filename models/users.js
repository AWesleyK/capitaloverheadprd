import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    fName: { type: String },
    lName: { type: String },

    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },

    roles: { type: [String], default: ["User"] },
    tier: { type: Number, default: 1 },
    subscriptionStatus: { type: String, default: "inactive" },
    setupComplete: { type: Boolean, default: false },
    accountLocked: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lastLogin: { type: Date },
    stripeCustomerId: { type: String },
    subscriptionId: { type: String },
paymentHistory: [
  {
    invoiceId: String,
    amountPaid: Number,
    paidAt: Date,
    description: String,
  }
],
setupFeePaid: { type: Boolean, default: false },
setupFeeAmount: { type: Number, default: 0 },
    lockedBy: { type: String },
    lockedAt: { type: Date },
    dashboardLayout: {
      type: [String],
      default: [],
    },
    hidden: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
