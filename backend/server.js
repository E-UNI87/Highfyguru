// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your Database Models
const User = require('./models/User');
const College = require('./models/College'); 
const Branch = require('./models/Branch');   

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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'A student with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ email, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'Student account created successfully!' });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token: token, user: { email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

/* =========================================
   SECURITY MIDDLEWARE
========================================= */
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = verified; 
    next(); 
  } catch (err) {
    console.error("Token Verification Error:", err);
    res.status(400).json({ error: 'Invalid token.' });
  }
};

/* =========================================
   PROFILE ROUTES
========================================= */
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ error: 'Error fetching profile.' });
  }
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, branch, college } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, branch, college },
      { new: true } 
    ).select('-password');

    res.json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: 'Error updating profile.' });
  }
});


/* =========================================
   2. STUDY NOTES PIPELINE (Admin Uploads)
========================================= */
const NoteSchema = new mongoose.Schema({
  title: String,
  subject: String,
  branch: String,
  college: String,
  resourceType: { type: String, default: 'Note' }, 
  fileUrl: String,
  isExternalLink: { type: Boolean, default: false }, 
  uploadDate: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', NoteSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

app.post('/api/notes/upload', upload.single('noteFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file transmitted.' });
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const newNote = new Note({ ...req.body, fileUrl: fileUrl, isExternalLink: false });

    await newNote.save();
    res.status(201).json({ success: true, note: newNote });
  } catch (error) {
    console.error("File Upload Error:", error);
    res.status(500).json({ error: 'Internal storage sequence failed.' });
  }
});

app.post('/api/notes/link', async (req, res) => {
  try {
    const newNote = new Note({ ...req.body });
    await newNote.save();
    res.status(201).json({ success: true, note: newNote });
  } catch (error) {
    console.error("Link Upload Error:", error);
    res.status(500).json({ error: 'Failed to save link sequence.' });
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ uploadDate: -1 });
    res.json(notes);
  } catch (error) {
    console.error("Fetch Notes Error:", error);
    res.status(500).json({ error: 'Failed to fetch items.' });
  }
});


/* =========================================
   3. DYNAMIC INFRASTRUCTURE (Colleges & Branches)
========================================= */
app.post('/api/admin/colleges', async (req, res) => {
  try {
    const newCollege = new College({ name: req.body.name });
    await newCollege.save();
    res.status(201).json(newCollege);
  } catch (err) { 
    console.error("Add College Error:", err);
    res.status(400).json({ error: "Option already exists or is invalid." }); 
  }
});

app.get('/api/colleges', async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.json(colleges);
  } catch (error) { 
    console.error("Fetch Colleges Error:", error);
    res.status(500).json({ error: 'Failed to fetch colleges.' }); 
  }
});

app.post('/api/admin/branches', async (req, res) => {
  try {
    const newBranch = new Branch({ name: req.body.name });
    await newBranch.save();
    res.status(201).json(newBranch);
  } catch (err) { 
    console.error("Add Branch Error:", err);
    res.status(400).json({ error: "Option already exists or is invalid." }); 
  }
});

app.get('/api/branches', async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.json(branches);
  } catch (error) { 
    console.error("Fetch Branches Error:", error);
    res.status(500).json({ error: 'Failed to fetch branches.' }); 
  }
});

/* =========================================
   4. COMMUNITY POSTS (News & Guidance)
========================================= */
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: { type: String, default: 'News' }, 
  likes: { type: Number, default: 0 },
  likedBy: [String], // Prepared for persistent likes
  comments: [{       // Prepared for persistent comments
    text: String,
    author: String,
    date: { type: Date, default: Date.now }
  }],
  date: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) { 
    console.error("Fetch Posts Error:", error);
    res.status(500).json({ error: 'Failed to fetch posts.' }); 
  }
});

app.post('/api/admin/posts', async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) { 
    console.error("Create Post Error:", err);
    res.status(400).json({ error: "Failed to create post." }); 
  }
});

/* =========================================
   5. LIVE QUIZ ENGINE (GK & REASONING)
========================================= */
const QuestionSchema = new mongoose.Schema({
  category: { type: String, enum: ['G.K', 'Reasoning'], required: true },
  questionText: { type: String, required: true },
  options: [String], 
  correctOption: { type: String, required: true },
  explanation: { type: String, default: 'No explanation provided.' },
  createdAt: { type: Date, default: Date.now }
});

QuestionSchema.index({ category: 1, createdAt: -1 });
const Question = mongoose.model('Question', QuestionSchema);

app.post('/api/admin/questions', async (req, res) => {
  try {
    const { category, questionText, options, correctOption, explanation } = req.body;
    const newQuestion = new Question({ category, questionText, options, correctOption, explanation });
    await newQuestion.save();
    res.status(201).json({ success: true, message: 'Question saved to active matrix.' });
  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ error: 'Database ingestion failed.' });
  }
});

app.get('/api/questions/:category', async (req, res) => {
  try {
    const questions = await Question.find({ category: req.params.category })
                                    .select('questionText options correctOption explanation') 
                                    .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error("Fetch Questions Error:", error);
    res.status(500).json({ error: 'Failed to stream query network.' });
  }
});

/* =========================================
   GK TESTS SCHEMA & ROUTES
========================================= */
const GKTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['daily', 'monthly'], required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GKTest = mongoose.model('GKTest', GKTestSchema);

// GET all GK Tests (for students)
app.get('/api/gk-tests', async (req, res) => {
  try {
    const allTests = await GKTest.find().sort({ date: -1 });
    
    const daily = allTests.filter(t => t.type === 'daily');
    const monthly = allTests.filter(t => t.type === 'monthly');
    
    res.json({
      daily: daily,
      monthly: monthly,
      previous: [] // This would be populated from user test history in a full implementation
    });
  } catch (error) {
    console.error("Fetch GK Tests Error:", error);
    res.status(500).json({ error: 'Failed to fetch tests.' });
  }
});

// POST create new GK Test (for admins)
app.post('/api/admin/gk-tests', async (req, res) => {
  try {
    const { title, type, date } = req.body;
    
    if (!title || !type || !date) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    
    const newTest = new GKTest({ title, type, date: new Date(date) });
    await newTest.save();
    
    res.status(201).json({ success: true, message: 'GK Test created successfully!', test: newTest });
  } catch (error) {
    console.error("Create GK Test Error:", error);
    res.status(500).json({ error: 'Failed to create GK test.' });
  }
});

/* =========================================
   SERVER STARTUP
========================================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend processing layer streaming on port ${PORT}`));