const express = require('express');
const router = express.Router();
const { getNearbyProviders, getAllProviders, getProviderById, updateProviderProfile, getProviderReviews } = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/nearby', getNearbyProviders);
router.get('/', getAllProviders);
router.put('/profile', protect, updateProviderProfile);
router.get('/:id', getProviderById);
router.get('/:id/reviews', getProviderReviews);

module.exports = router;
