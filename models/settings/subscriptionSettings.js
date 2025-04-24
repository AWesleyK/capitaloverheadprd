import mongoose from "mongoose";

const SubscriptionSettingsSchema = new mongoose.Schema(
  {
    setupFeePaid: { type: Boolean, default: false },
    setupFeeAmount: { type: Number, default: 35000 },
    tier: { type: Number, default: 1 },
    stripeCustomerId: { type: String },
    subscriptionId: { type: String },
    subscriptionStatus: { type: String, default: "inactive" },
  },
  { timestamps: true }
);

export default mongoose.models.SubscriptionSettings ||
  mongoose.model("SubscriptionSettings", SubscriptionSettingsSchema);
