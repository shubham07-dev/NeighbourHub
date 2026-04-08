const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, getTicketById, sendMessage } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/tickets', protect, createTicket);
router.get('/tickets/my', protect, getMyTickets);
router.get('/tickets/:id', protect, getTicketById);
router.post('/tickets/:id/messages', protect, sendMessage);

module.exports = router;
