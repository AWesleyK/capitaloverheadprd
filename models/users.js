import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    fName: { type: String },
    lName: { type: String },
    roles: { type: [String], default: ["User"] },
    tier: { type: String, default: "free" },
    subscriptionStatus: { type: String, default: "inactive" },
    setupComplete: { type: Boolean, default: false },
    accountLocked: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lastLogin: { type: Date },
    stripeCustomerId: { type: String },
    lockedBy: { type: String },
    lockedAt: { type: Date },
    dashboardLayout: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
