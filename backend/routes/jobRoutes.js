const express = require('express');
const router = express.Router();
const { createJob, getMyJobs, getProviderJobs, updateJobStatus, addReview, getAllJobs, updateLiveLocation, negotiatePrice, acceptPrice } = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createJob).get(protect, admin, getAllJobs);
router.get('/my', protect, getMyJobs);
router.get('/provider', protect, getProviderJobs);
router.put('/:id/status', protect, updateJobStatus);
router.put('/:id/live-location', protect, updateLiveLocation);
router.put('/:id/review', protect, addReview);
router.put('/:id/negotiate', protect, negotiatePrice);
router.put('/:id/accept-price', protect, acceptPrice);

// Payment routes
const { createRazorpayOrder, verifyPayment } = require('../controllers/jobController');
router.post('/payment/create-order', protect, createRazorpayOrder);
router.post('/payment/verify', protect, verifyPayment);

module.exports = router;
