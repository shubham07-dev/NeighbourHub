const Provider = require('../models/Provider');
const cloudinary = require('../config/cloudinary');

// @desc    Get nearby providers
// @route   GET /api/providers/nearby?lng=...&lat=...&distance=...&serviceType=...
const getNearbyProviders = async (req, res, next) => {
  try {
    const { lng, lat, distance, serviceType } = req.query;
    if (!lng || !lat) { res.status(400); throw new Error('Please provide longitude and latitude'); }

    const maxDist = (distance ? Number(distance) : 10) * 1000;
    const query = {
      location: { $near: { $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] }, $maxDistance: maxDist } },
      status: 'available',
    };
    if (serviceType && serviceType !== 'All') query.serviceType = serviceType;

    const providers = await Provider.find(query).select('-password');
    res.json(providers);
  } catch (error) { next(error); }
};

// @desc    Get all providers
// @route   GET /api/providers
const getAllProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({}).select('-password');
    res.json(providers);
  } catch (error) { next(error); }
};

// @desc    Get provider by ID
// @route   GET /api/providers/:id
const getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id).select('-password');
    if (!provider) { res.status(404); throw new Error('Provider not found'); }
    res.json(provider);
  } catch (error) { next(error); }
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
const updateProviderProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.user._id);
    if (!provider) { res.status(404); throw new Error('Provider not found'); }

    if (req.body.pricePerHour !== undefined && Number(req.body.pricePerHour) < 100) {
      res.status(400);
      throw new Error('Base Service Cost must be at least ₹100');
    }

    if (!req.body.phoneNumber && !provider.phoneNumber) {
      res.status(400); throw new Error('Phone number is required');
    }

    if (!req.body.bio && !provider.bio) {
      res.status(400); throw new Error('Bio is required');
    }

    provider.firstName = req.body.firstName || provider.firstName;
    provider.lastName = req.body.lastName || provider.lastName;
    provider.phoneNumber = req.body.phoneNumber || provider.phoneNumber;
    provider.bio = req.body.bio || provider.bio;
    provider.serviceType = req.body.serviceType || provider.serviceType;
    provider.pricePerHour = req.body.pricePerHour || provider.pricePerHour;
    provider.priceType = req.body.priceType || provider.priceType;
    provider.status = req.body.status || provider.status;
    provider.gender = req.body.gender || provider.gender;
    if (req.body.password) provider.password = req.body.password;

    if (req.body.profilePicture && req.body.profilePicture.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(req.body.profilePicture, { folder: 'kalpathon_profiles' });
      provider.profilePicture = uploadRes.secure_url;
    }

    if (req.body.lng && req.body.lat) {
      provider.location = { type: 'Point', coordinates: [Number(req.body.lng), Number(req.body.lat)] };
    }

    const updated = await provider.save();
    res.json(updated);
  } catch (error) { next(error); }
};

// @desc    Get provider reviews
// @route   GET /api/providers/:id/reviews
const getProviderReviews = async (req, res, next) => {
  try {
    const Job = require('../models/Job');
    const jobsWithReviews = await Job.find({ 
      provider: req.params.id, 
      'reviews.rating': { $exists: true } 
    }).populate('user', 'firstName lastName').sort('-updatedAt');
    
    // Map to a cleaner format
    const reviews = jobsWithReviews.map(job => ({
      _id: job._id,
      rating: job.reviews.rating,
      comment: job.reviews.comment,
      reviewerName: job.user ? `${job.user.firstName} ${job.user.lastName}` : 'Anonymous',
      date: job.updatedAt
    }));

    res.json(reviews);
  } catch (error) { next(error); }
};

module.exports = { getNearbyProviders, getAllProviders, getProviderById, updateProviderProfile, getProviderReviews };
