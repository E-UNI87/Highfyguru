const mongoose = require('mongoose'); // <-- Check for this line

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('College', collegeSchema);