const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true }
});

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phoneNumber: { type: String },
  location: { type: pointSchema, index: '2dsphere' },
  role: { type: String, default: 'customer' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
