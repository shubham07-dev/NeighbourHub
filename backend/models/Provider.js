const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true }
});

const providerSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phoneNumber: { type: String },
  profilePicture: { type: String },
  gender: { type: String },
  bio: { type: String },
  serviceType: { type: String },
  role: { type: String, default: 'provider' },
  numberOfReviews: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    reviewText: { type: String }
  }],
  avgReviews: { type: Number, default: 0 },
  pricePerHour: { type: Number, required: true },
  priceType: { type: String, enum: ['per_hour', 'per_day', 'per_month'], default: 'per_hour' },
  status: { type: String, enum: ['available', 'unavailable', 'busy'], default: 'available' },
  location: { type: pointSchema, index: '2dsphere' },
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
