const express = require('express');
const router = express.Router();
const { loginSupport, getAllTickets, acceptTicket, resolveTicket } = require('../controllers/supportAgentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginSupport);
router.get('/tickets', protect, getAllTickets);
router.put('/tickets/:id/accept', protect, acceptTicket);
router.put('/tickets/:id/resolve', protect, resolveTicket);

module.exports = router;
