const SupportAgent = require('../models/SupportAgent');
const Ticket = require('../models/Ticket');

// @desc    Support Agent Login
// @route   POST /api/support-agent/login
const loginSupport = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const agent = await SupportAgent.findOne({ email });
    if (!agent || agent.password !== password) {
      res.status(401); throw new Error('Invalid agent credentials');
    }
    
    agent.status = 'online';
    await agent.save();

    res.json({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      role: 'support',
      token: `token-${agent._id}-support`
    });
  } catch (error) { next(error); }
};

// @desc    Get all active tickets for support dashboard
// @route   GET /api/support-agent/tickets
const getAllTickets = async (req, res, next) => {
  try {
    // Return open tickets and tickets assigned to this agent
    const tickets = await Ticket.find({
      $or: [
        { status: 'open' },
        { assignedTo: req.user._id, status: { $in: ['assigned', 'resolved'] } }
      ]
    }).sort('createdAt');
    res.json(tickets);
  } catch (error) { next(error); }
};

// @desc    Accept/Assign ticket to self
// @route   PUT /api/support-agent/tickets/:id/accept
const acceptTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) { res.status(404); throw new Error('Ticket not found'); }
    if (ticket.status !== 'open') { res.status(400); throw new Error('Ticket already assigned or closed'); }

    ticket.status = 'assigned';
    ticket.assignedTo = req.user._id;
    ticket.assignedAgentName = req.user.name;
    
    await ticket.save();
    res.json(ticket);
  } catch (error) { next(error); }
};

// @desc    Resolve ticket
// @route   PUT /api/support-agent/tickets/:id/resolve
const resolveTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) { res.status(404); throw new Error('Ticket not found'); }
    if (ticket.assignedTo.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not assigned to this ticket');
    }

    ticket.status = 'resolved';
    await ticket.save();
    res.json(ticket);
  } catch (error) { next(error); }
};

module.exports = { loginSupport, getAllTickets, acceptTicket, resolveTicket };
