const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc    Get logged-in user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json(user);
  } catch (error) { next(error); }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    if (req.body.password) user.password = req.body.password;

    if (req.body.profilePicture && req.body.profilePicture.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(req.body.profilePicture, { folder: 'kalpathon_profiles' });
      user.profilePicture = uploadRes.secure_url;
    }

    if (req.body.lng && req.body.lat) {
      user.location = { type: 'Point', coordinates: [Number(req.body.lng), Number(req.body.lat)] };
    }

    const updated = await user.save();
    res.json(updated);
  } catch (error) { next(error); }
};

module.exports = { getUserProfile, updateUserProfile };
