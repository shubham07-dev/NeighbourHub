const Ticket = require('../models/Ticket');

// @desc    Create a new ticket (by customer or provider)
// @route   POST /api/support/tickets
const createTicket = async (req, res, next) => {
  try {
    const { subject, category, message } = req.body;
    if (!subject || !message) {
      res.status(400); throw new Error('Subject and message are required');
    }

    const ticket = await Ticket.create({
      creatorId: req.user._id,
      creatorRole: req.user.role,
      creatorName: req.user.firstName + (req.user.lastName ? ' ' + req.user.lastName : ''),
      creatorEmail: req.user.email,
      subject,
      category: category || 'other',
      messages: [{
        sender: req.user._id,
        senderRole: req.user.role,
        senderName: req.user.firstName,
        text: message
      }]
    });
    res.status(201).json(ticket);
  } catch (error) { next(error); }
};

// @desc    Get user's own tickets (customer or provider)
// @route   GET /api/support/tickets/my
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ creatorId: req.user._id }).sort('-createdAt');
    res.json(tickets);
  } catch (error) { next(error); }
};

// @desc    Get single ticket by ID
// @route   GET /api/support/tickets/:id
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) { res.status(404); throw new Error('Ticket not found'); }
    
    // Ensure only the creator or an agent/admin can view it
    if (ticket.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'support' && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized to view this ticket');
    }
    res.json(ticket);
  } catch (error) { next(error); }
};

// @desc    Send a message to a ticket
// @route   POST /api/support/tickets/:id/messages
const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) { res.status(400); throw new Error('Message text is required'); }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) { res.status(404); throw new Error('Ticket not found'); }
    
    // Auth check
    if (ticket.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'support') {
      res.status(403); throw new Error('Not authorized to reply to this ticket');
    }

    if (ticket.status === 'closed') {
      res.status(400); throw new Error('Ticket is closed');
    }

    ticket.messages.push({
      sender: req.user._id,
      senderRole: req.user.role,
      senderName: req.user.name || req.user.firstName,
      text
    });

    // If support agent replies, mark as assigned if it isn't
    if (req.user.role === 'support' && ticket.status === 'open') {
      ticket.status = 'assigned';
      ticket.assignedTo = req.user._id;
      ticket.assignedAgentName = req.user.name;
    }

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) { next(error); }
};

module.exports = { createTicket, getMyTickets, getTicketById, sendMessage };
