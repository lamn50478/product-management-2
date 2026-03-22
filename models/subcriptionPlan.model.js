const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },        // "1 month", "3 months", "6 months"
  code: { type: String, required: true, unique: true }, // "m1","m3","m6"
  price: { type: Number, required: true },        // lưu theo smallest unit (cents hoặc VND)
  currency: { type: String, default: 'VND' },
  periodMonths: { type: Number, required: true }, // 1, 3, 6
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, {
  timestamps: true
});

SubscriptionPlanSchema.index({ code: 1 });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema, 'subscriptionPlans');
module.exports = SubscriptionPlan;
