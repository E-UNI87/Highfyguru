const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'premium', 'admin'], default: 'student' },
  // Add these new profile fields:
  name: { type: String, default: '' },
  branch: { type: String, default: '' },
  college: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);