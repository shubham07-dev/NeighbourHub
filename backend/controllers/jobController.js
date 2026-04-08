const Job = require('../models/Job');
const Provider = require('../models/Provider');

// @desc    Create a job (customer books a provider)
const createJob = async (req, res, next) => {
  try {
    const { provider, description, lng, lat, houseNumber, city, area, proposedPrice } = req.body;
    
    const providerDoc = await Provider.findById(provider);
    if (!providerDoc) { res.status(404); throw new Error('Provider not found'); }

    // Save to job natively
    const jobData = { user: req.user._id, provider, description, status: 'pending', agreedPrice: providerDoc.pricePerHour };
    
    if (proposedPrice) {
      if (Number(proposedPrice) < 100) {
        res.status(400); throw new Error('Proposed price cannot be lower than ₹100');
      }
      if (Number(proposedPrice) !== providerDoc.pricePerHour) {
        jobData.negotiation = {
          isNegotiating: true,
          price: Number(proposedPrice),
          proposedBy: 'customer',
          roundCount: 1
        };
      }
    }

    if (lng && lat) jobData.serviceLocation = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    if (houseNumber || city || area) jobData.address = { houseNumber, city, area };

    const job = await Job.create(jobData);
    res.status(201).json(job);
  } catch (error) { next(error); }
};

// @desc    Get jobs for logged-in user (customer)
// @route   GET /api/jobs/my
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ user: req.user._id })
      .populate('provider', 'firstName lastName serviceType pricePerHour phoneNumber location')
      .populate('user', 'location')
      .sort('-createdAt');
    res.json(jobs);
  } catch (error) { next(error); }
};

// @desc    Get jobs for logged-in provider
// @route   GET /api/jobs/provider
const getProviderJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ provider: req.user._id })
      .populate('user', 'firstName lastName phoneNumber email location')
      .populate('provider', 'location')
      .sort('-createdAt');
    res.json(jobs);
  } catch (error) { next(error); }
};

// @desc    Update job status (accept, reject, complete, etc.)
// @route   PUT /api/jobs/:id/status
const updateJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404); throw new Error('Job not found'); }

    if (req.body.status === 'accepted' && job.negotiation?.isNegotiating) {
      job.negotiation.isNegotiating = false;
      job.agreedPrice = job.negotiation.price;
    }

    job.status = req.body.status;
    const updated = await job.save();
    res.json(updated);
  } catch (error) { next(error); }
};

// @desc    Add review to a completed job
// @route   PUT /api/jobs/:id/review
const addReview = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404); throw new Error('Job not found'); }
    if (job.status !== 'completed') { res.status(400); throw new Error('Job must be completed before reviewing'); }

    job.reviews = { rating: req.body.rating, comment: req.body.comment };
    await job.save();

    // Update provider avg rating
    const provider = await Provider.findById(job.provider);
    if (provider) {
      const allJobs = await Job.find({ provider: provider._id, 'reviews.rating': { $exists: true } });
      const total = allJobs.reduce((sum, j) => sum + (j.reviews?.rating || 0), 0);
      provider.avgReviews = total / allJobs.length;
      provider.numberOfReviews = allJobs.length;
      await provider.save();
    }

    res.json(job);
  } catch (error) { next(error); }
};

// @desc    Get all jobs (admin)
// @route   GET /api/jobs
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({})
      .populate('user', 'firstName lastName')
      .populate('provider', 'firstName lastName serviceType')
      .sort('-createdAt');
    res.json(jobs);
  } catch (error) { next(error); }
};

// @desc    Update live location (provider)
// @route   PUT /api/jobs/:id/live-location
const updateLiveLocation = async (req, res, next) => {
  try {
    const { lng, lat } = req.body;
    if (!lng || !lat) { res.status(400); throw new Error('Longitude and latitude required'); }

    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404); throw new Error('Job not found'); }
    if (job.provider.toString() !== req.user._id.toString()) { res.status(401); throw new Error('Not authorized'); }

    job.providerLiveLocation = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
    await job.save();
    res.json({ message: 'Live location updated' });
  } catch (error) { next(error); }
};

// @desc    Negotiate price
// @route   PUT /api/jobs/:id/negotiate
const negotiatePrice = async (req, res, next) => {
  try {
    const { price } = req.body;
    if (!price || Number(price) < 100) { res.status(400); throw new Error('Please provide a valid price (Minimum ₹100)'); }

    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404); throw new Error('Job not found'); }
    
    if (job.status !== 'pending') {
      res.status(400); throw new Error('Job is no longer pending pending, cannot negotiate');
    }

    if (job.negotiation?.roundCount >= 4) {
      res.status(400); throw new Error('Maximum negotiation rounds (4) reached.');
    }

    // Since token role for provider is sometimes implicitly set, we check req.user.role
    const role = req.user.role || (req.user.serviceType ? 'provider' : 'customer');

    job.negotiation = {
      isNegotiating: true,
      price: Number(price),
      proposedBy: role,
      roundCount: (job.negotiation?.roundCount || 0) + 1
    };

    const updated = await job.save();
    res.json(updated);
  } catch (error) { next(error); }
};

// @desc    Accept proposed price
// @route   PUT /api/jobs/:id/accept-price
const acceptPrice = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404); throw new Error('Job not found'); }

    if (!job.negotiation || !job.negotiation.isNegotiating) {
      res.status(400); throw new Error('No active negotiation');
    }

    job.agreedPrice = job.negotiation.price;
    job.negotiation.isNegotiating = false;
    
    const updated = await job.save();
    res.json(updated);
  } catch (error) { next(error); }
};

module.exports = { createJob, getMyJobs, getProviderJobs, updateJobStatus, addReview, getAllJobs, updateLiveLocation, negotiatePrice, acceptPrice };
