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
    enum: ['pending', 'accepted', 'ongoing', 'completed', 'rejected'],
    default: 'pending',
  },
  description: {
    type: String,
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
