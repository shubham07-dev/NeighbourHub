const User = require('../models/User');
const Provider = require('../models/Provider');
const Job = require('../models/Job');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments({});
    const providersCount = await Provider.countDocuments({});
    const jobsCount = await Job.countDocuments({});
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });

    const users = await User.find({}).select('-password').sort('-createdAt').limit(20);
    const providers = await Provider.find({}).select('-password').sort('-createdAt').limit(20);
    const jobs = await Job.find({}).populate('user', 'firstName lastName').populate('provider', 'firstName lastName serviceType').sort('-createdAt').limit(20);

    res.json({ metrics: { usersCount, providersCount, jobsCount, pendingJobs, completedJobs }, users, providers, jobs });
  } catch (error) { next(error); }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) { next(error); }
};

// @desc    Delete a provider
// @route   DELETE /api/admin/providers/:id
const deleteProvider = async (req, res, next) => {
  try {
    await Provider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Provider removed' });
  } catch (error) { next(error); }
};

module.exports = { getDashboard, deleteUser, deleteProvider };
