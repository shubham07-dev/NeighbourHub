const User = require('../models/User');
const Provider = require('../models/Provider');
const SupportAgent = require('../models/SupportAgent');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    const token = authHeader.split(' ')[1];
    // Token format: token-{id}-{role}
    const parts = token.split('-');
    if (parts.length < 3) {
      res.status(401);
      throw new Error('Not authorized, bad token');
    }

    const id = parts[1];
    const role = parts[2];

    // Admin bypass
    if (role === 'admin') {
      req.user = { _id: 'admin', role: 'admin' };
      return next();
    }

    let account;
    if (role === 'provider') {
      account = await Provider.findById(id).select('-password');
    } else if (role === 'support') {
      account = await SupportAgent.findById(id).select('-password');
    } else {
      account = await User.findById(id).select('-password');
    }

    if (!account) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    req.user = { _id: account._id, role, ...account._doc };
    next();
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(401);
    next(error);
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized as admin'));
  }
};

module.exports = { protect, admin };
