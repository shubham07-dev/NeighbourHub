const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  bio: {
    type: String,
  },
  role: {
    type: String,
    default: 'Provider',
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
 reviews: {
  type: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewText: String
  }],
  default: []
},
  avgReviews: {
    type: Number,
    default: 0,
  },
  pricePerHour: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'busy'],
    default: 'available',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Provider', providerSchema);
