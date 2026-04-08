const express = require('express');
const router = express.Router();
const { createJob, getMyJobs, getProviderJobs, updateJobStatus, addReview, getAllJobs, updateLiveLocation } = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createJob).get(protect, admin, getAllJobs);
router.get('/my', protect, getMyJobs);
router.get('/provider', protect, getProviderJobs);
router.put('/:id/status', protect, updateJobStatus);
router.put('/:id/live-location', protect, updateLiveLocation);
router.put('/:id/review', protect, addReview);

module.exports = router;
