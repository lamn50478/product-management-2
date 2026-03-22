const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active','expired','cancelled'], default: 'active' },
  paymentInfo: { type: mongoose.Schema.Types.Mixed, default: null }, // provider response / transaction id
  // optional: allow storing whether this subscription was auto-renewed or manual
  autoRenew: { type: Boolean, default: false }
}, {
  timestamps: true
});

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', SubscriptionSchema, 'subscriptions');
module.exports = Subscription;
