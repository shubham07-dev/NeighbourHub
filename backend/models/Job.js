const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'out for service', 'reached', 'ongoing', 'completed', 'rejected'],
    default: 'pending',
  },
  description: { type: String },
  agreedPrice: { type: Number }, // the finalized base cost for the service
  priceType: { type: String, enum: ['per_hour', 'per_day', 'per_month'], default: 'per_hour' },
  paymentMethod: { type: String, enum: ['offline', 'online'], default: 'offline' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  negotiation: {
    isNegotiating: { type: Boolean, default: false },
    price: { type: Number },
    proposedBy: { type: String, enum: ['customer', 'provider'] },
    roundCount: { type: Number, default: 0 } // max 4 rounds as requested
  },
  serviceLocation: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  },
  address: {
    houseNumber: String,
    city: String,
    area: String
  },
  providerLiveLocation: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  },
  reviews: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
