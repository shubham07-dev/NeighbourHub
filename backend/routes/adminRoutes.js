const express = require('express');
const router = express.Router();
const { getDashboard, deleteUser, deleteProvider } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboard);
router.delete('/users/:id', protect, admin, deleteUser);
router.delete('/providers/:id', protect, admin, deleteProvider);

module.exports = router;
