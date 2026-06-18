const mongoose = require('mongoose'); // <-- This was the missing piece!

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Branch', branchSchema);