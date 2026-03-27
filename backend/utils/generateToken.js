const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
