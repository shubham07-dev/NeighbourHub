const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },       // user ID or agent ID
  senderRole: { type: String, enum: ['customer', 'provider', 'support'], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const ticketSchema = new mongoose.Schema({
  creatorId: { type: String, required: true },      // user or provider _id
  creatorRole: { type: String, enum: ['customer', 'provider'], required: true },
  creatorName: { type: String, required: true },
  creatorEmail: { type: String, required: true },
  subject: { type: String, required: true },
  category: {
    type: String,
    enum: ['booking', 'payment', 'account', 'technical', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportAgent', default: null },
  assignedAgentName: { type: String, default: null },
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
