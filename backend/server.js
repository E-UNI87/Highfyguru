// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your User Model
const User = require('./models/User');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connection secure.'))
  .catch((err) => console.error('❌ Database connection failed:', err));

/* =========================================
   1. AUTHENTICATION ROUTES (Login & Register)
========================================= */

// Student Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'A student with this email already exists.' });
    }

    // Scramble (hash) the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    user = new User({
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'Student account created successfully!' });

  } catch (error) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Student Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare the typed password with the scrambled one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Create the secure digital ID card (JWT)
    const payload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); // Keeps them logged in for 7 days

    // Send the token and user data back to the React frontend
    res.json({
      message: 'Login successful',
      token: token,
      user: {
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});
/* =========================================
   SECURITY MIDDLEWARE
========================================= */
// This function checks the digital ID card (JWT)
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    // Remove "Bearer " from the string and verify
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = verified; // Attach user info to the request
    next(); // Pass to the next function
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

/* =========================================
   PROFILE ROUTES
========================================= */
// GET User Profile Data
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    // Find the user by the ID stored in their token, but do NOT send the password back!
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile.' });
  }
});

// UPDATE User Profile Data
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, branch, college } = req.body;
    
    // Find user and update their details
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, branch, college },
      { new: true } // Return the updated document
    ).select('-password');

    res.json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile.' });
  }
});


/* =========================================
   2. STUDY NOTES PIPELINE (Admin Uploads)
========================================= */

// Define Note Schema directly here for simplicity
const NoteSchema = new mongoose.Schema({
  title: String,
  subject: String,
  branch: String,
  college: String,
  fileUrl: String,
  uploadDate: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', NoteSchema);

// Configure Local File Storage via Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Requires an empty folder named 'uploads' in backend
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Upload a new PDF (Admin Action)
app.post('/api/notes/upload', upload.single('noteFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file transmitted.' });
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const newNote = new Note({
      title: req.body.title,
      subject: req.body.subject,
      branch: req.body.branch,
      college: req.body.college,
      fileUrl: fileUrl
    });

    await newNote.save();
    res.status(201).json({ success: true, note: newNote });
  } catch (error) {
    res.status(500).json({ error: 'Internal storage sequence failed.' });
  }
});

// Fetch all uploaded notes for students
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ uploadDate: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items.' });
  }
});

/* =========================================
   SERVER STARTUP
========================================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend processing layer streaming on port ${PORT}`));