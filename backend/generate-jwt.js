// // generate-jwt.js
// // Usage: node generate-jwt.js <userId>

// const { generateToken } = require('./middleware/auth');

// const userId = process.argv[2] || 'dummyUserId';
// const token = generateToken(userId);
// console.log('Generated JWT token:', token);


// generateToken.js (CommonJS)
const jwt = require('jsonwebtoken');

// REPLACE this with the same secret used in your backend (or set via env)
const SECRET = process.env.JWT_SECRET || 'lavanya123';

// payload should match what your auth middleware expects (e.g., user id, role)
const payload = {
  userId: 'test-user-001',
  email: 'test@example.com',
  role: 'tester'
};

const token = jwt.sign(payload, SECRET, { expiresIn: '7d' }); // adjust expiry as needed
console.log(token);
