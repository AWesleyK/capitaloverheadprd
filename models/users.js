import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String }, // store hashed password
    fName: { type: String },
    lName: { type: String },
    roles: { type: [String], default: ["User"] }, // e.g. "Admin", "User"
    tier: { type: String, default: "free" }, // free, pro, enterprise
    subscriptionStatus: { type: String, default: "inactive" },
    setupComplete: { type: Boolean, default: false },
    accountLocked: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lastLogin: { type: Date },
    stripeCustomerId: { type: String }, // optional if using Stripe
    lockedBy: { type: String },
    lockedAt: { type: Date },

  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Avoid re-compiling model during dev hot reload
export default mongoose.models.User || mongoose.model("User", UserSchema);
