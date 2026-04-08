const express = require('express');
const router = express.Router();
const { getDashboard, deleteUser, deleteProvider, createSupportAgent, getSupportAgents, deleteSupportAgent } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboard);
router.delete('/users/:id', protect, admin, deleteUser);
router.delete('/providers/:id', protect, admin, deleteProvider);

// Support Agent Management
router.post('/support-agents', protect, admin, createSupportAgent);
router.get('/support-agents', protect, admin, getSupportAgents);
router.delete('/support-agents/:id', protect, admin, deleteSupportAgent);

module.exports = router;
