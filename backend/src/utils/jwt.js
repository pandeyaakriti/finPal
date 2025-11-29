// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
