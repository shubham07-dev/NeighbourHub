const Job = require('../models/Job');
const Provider = require('../models/Provider');

// @desc    Create a job (customer books a provider)
const createJob = async (req, res, next) => {
  try {
    const { provider, description, lng, lat, houseNumber, city, area } = req.body;
    
    // Save to job natively
    const jobData = { user: req.user._id, provider, description, status: 'pending' };
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

module.exports = { createJob, getMyJobs, getProviderJobs, updateJobStatus, addReview, getAllJobs, updateLiveLocation };
