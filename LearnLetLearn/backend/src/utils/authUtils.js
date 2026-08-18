const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  },
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },
  generateToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  },
  verifyToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
};
