const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const Provider = require('../models/Provider');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user or provider
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, role, serviceType, pricePerHour, priceType, bio, gender, lng, lat, profilePicture } = req.body;

    if (!firstName || !email || !password || !role) {
      res.status(400);
      throw new Error('Please fill all required fields');
    }

    if (role === 'provider') {
      if (!gender) { res.status(400); throw new Error('Gender is required for providers'); }
      if (!bio) { res.status(400); throw new Error('Short Bio is required for providers'); }
      
      const exists = await Provider.findOne({ email });
      if (exists) { res.status(400); throw new Error('Provider already exists'); }

      let profilePictureUrl = null;
      if (profilePicture && profilePicture.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(profilePicture, { folder: 'kalpathon_profiles' });
        profilePictureUrl = uploadRes.secure_url;
      }

      const providerData = {
        googleId: `local-${Date.now()}`,
        firstName, lastName, email, password, phoneNumber,
        serviceType: serviceType || 'General',
        pricePerHour: pricePerHour || 0,
        priceType: priceType || 'per_hour',
        bio, gender, profilePicture: profilePictureUrl,
      };
      if (lng && lat) {
        providerData.location = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
      }
      const provider = await Provider.create(providerData);
      return res.status(201).json({ _id: provider._id, firstName: provider.firstName, email: provider.email, role: 'provider', profilePicture: provider.profilePicture, token: `token-${provider._id}-provider` });

    } else {
      const exists = await User.findOne({ email });
      if (exists) { res.status(400); throw new Error('User already exists'); }

      let profilePictureUrl = null;
      if (profilePicture && profilePicture.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(profilePicture, { folder: 'kalpathon_profiles' });
        profilePictureUrl = uploadRes.secure_url;
      }

      const user = await User.create({
        googleId: `local-${Date.now()}`,
        firstName, lastName, email, password, phoneNumber,
        profilePicture: profilePictureUrl
      });
      return res.status(201).json({ _id: user._id, firstName: user.firstName, email: user.email, role: 'customer', profilePicture: user.profilePicture, token: `token-${user._id}-customer` });
    }
  } catch (error) { next(error); }
};

// @desc    Login user or provider
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    let account;
    if (role === 'provider') {
      account = await Provider.findOne({ email });
    } else if (role === 'admin') {
      if (email === 'admin@marketplace.com' && password === 'admin123') {
        return res.json({ _id: 'admin-id', firstName: 'Admin', email, role: 'admin', token: 'token-admin-admin' });
      }
      res.status(401); throw new Error('Invalid admin credentials');
    } else {
      account = await User.findOne({ email });
    }

    if (account && account.password === password) {
      return res.json({
        _id: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        role: role || 'customer',
        phoneNumber: account.phoneNumber,
        profilePicture: account.profilePicture,
        token: `token-${account._id}-${role || 'customer'}`,
      });
    }

    res.status(401);
    throw new Error('Invalid email or password');
  } catch (error) { next(error); }
};

// @desc    Google OAuth Login/Register
// @route   POST /api/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // Fallback: decode JWT payload without verification (for dev/testing)
      const parts = credential.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      } else {
        res.status(400);
        throw new Error('Invalid Google token');
      }
    }

    const { sub: googleId, email, given_name, family_name, picture } = payload;

    if (role === 'provider') {
      let provider = await Provider.findOne({ email });
      if (!provider) {
        provider = await Provider.create({
          googleId, firstName: given_name, lastName: family_name, email,
          serviceType: 'General', pricePerHour: 0,
        });
      }
      return res.json({
        _id: provider._id, firstName: provider.firstName, lastName: provider.lastName,
        email: provider.email, role: 'provider', picture,
        token: `token-${provider._id}-provider`,
      });
    } else {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          googleId, firstName: given_name, lastName: family_name, email,
        });
      }
      return res.json({
        _id: user._id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: 'customer', picture,
        token: `token-${user._id}-customer`,
      });
    }
  } catch (error) { next(error); }
};

module.exports = { register, login, googleLogin };
