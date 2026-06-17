// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  // Set default theme to 'light' (which triggers the :root CSS variables)
  const [theme, setTheme] = useState('light');
  const [isPremium, setIsPremium] = useState(false);

  // Available themes corresponding to our CSS data-theme attributes
  const themeOptions = [
    { id: 'light', color: '#3b82f6', name: 'Blue' },
    { id: 'emerald', color: '#10b981', name: 'Emerald' },
    { id: 'sunset', color: '#f97316', name: 'Sunset' },
    { id: 'midnight', color: '#8b5cf6', name: 'Midnight' }
  ];

  return (
    <Router>
      {/* Notice we changed className to data-theme here! */}
      <div className="app" data-theme={theme}>
        <header className="navbar">
          <h2><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>EduPlatform</Link></h2>
          
          <div className="nav-links">
            <Link to="/notes">Notes</Link>
            <Link to="/pyqs">PYQs</Link>
            <Link to="/tests">Tests</Link>
            <Link to="/guidance">Guidance</Link>
            <Link to="/training">Industry Training</Link>
            <Link to="/profile">My Profile</Link>
            <Link to="/login" style={{ fontWeight: '700' }}>
              {isPremium ? 'Premium Active' : 'Login'}
            </Link>
            
            {/* The New Theme Picker UI */}
            <div className="theme-picker">
              {themeOptions.map((t) => (
                <div 
                  key={t.id}
                  className={`theme-dot ${theme === t.id ? 'active' : ''}`}
                  style={{ backgroundColor: t.color }}
                  onClick={() => setTheme(t.id)}
                  title={`Switch to ${t.name} theme`}
                />
              ))}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/pyqs" element={<PyqPage isPremium={isPremium} />} />
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/guidance" element={<GuidancePage />} />
            <Route path="/login" element={<LoginPage setIsPremium={setIsPremium} isPremium={isPremium} />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

/* =========================================
   PAGE COMPONENTS STAY THE SAME BELOW HERE
   (Leave HomePage, NotesPage, etc. exactly as they were)
========================================= */

/* =========================================
   PAGE COMPONENTS
========================================= */

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '50px', flexWrap: 'wrap' }}>
      <div className="card" onClick={() => navigate('/notes')} style={{ cursor: 'pointer', textAlign: 'center', flex: '1 1 300px' }}>
        <h2>📚 Browse Notes</h2>
        <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Access subject-wise short notes and handwritten materials.</p>
      </div>
      <div className="card" onClick={() => navigate('/pyqs')} style={{ cursor: 'pointer', textAlign: 'center', flex: '1 1 300px' }}>
        <h2>📝 Explore PYQs</h2>
        <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Previous year question papers with detailed solutions.</p>
      </div>
    </div>
  );
}

function NotesPage() {
  const [subject, setSubject] = useState('All');
  const [branch, setBranch] = useState('Electrical Engineering');
  const [college, setCollege] = useState('CTAE Udaipur');
  const [notes, setNotes] = useState([]);

  // The list of subjects for your new visual chips
  const subjectOptions = ['All', 'Power Systems', 'Circuit Concepts', 'Electric Vehicles', 'Control Systems'];

  useEffect(() => {
    fetch('http://localhost:5000/api/notes')
      .then(res => res.json())
      .then(data => setNotes(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching notes:", err));
  }, []);

  return (
    <div className="card">
      <h3>Study Notes Repository</h3>
      
      {/* Upper Dropdowns for College & Branch */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={college} onChange={(e) => setCollege(e.target.value)} className="form-group select" style={{ padding: '10px', borderRadius: '8px', border: '2px solid var(--border-color)' }}>
          <option value="CTAE Udaipur">CTAE Udaipur</option>
          <option value="Other">Other Colleges</option>
        </select>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="form-group select" style={{ padding: '10px', borderRadius: '8px', border: '2px solid var(--border-color)' }}>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      {/* NEW: Interactive Filter Chips for Subjects */}
      <div className="filter-container">
        {subjectOptions.map((sub) => (
          <button
            key={sub}
            className={`filter-chip ${subject === sub ? 'active' : ''}`}
            onClick={() => setSubject(sub)}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Filtered Notes Output */}
      <div style={{ marginTop: '15px' }}>
        {notes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No notes matched your filter criteria.</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="notes-list-item">
              <strong>{note.title}</strong> — <small>{note.subject} | {note.branch} ({note.college})</small>
              <br />
              <a href={note.fileUrl} target="_blank" rel="noreferrer" style={{ marginTop: '10px', display: 'inline-block' }}>Open PDF</a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
function PyqPage({ isPremium }) {
  const [subject, setSubject] = useState('All');
  const [branch, setBranch] = useState('Electrical Engineering');
  const [college, setCollege] = useState('CTAE Udaipur');

  return (
    <div className="card">
      <h3>Previous Year Questions (PYQs)</h3>
      
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={college} onChange={(e) => setCollege(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
          <option value="CTAE Udaipur">CTAE Udaipur</option>
          <option value="Other">Other Colleges</option>
        </select>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Computer Science">Computer Science</option>
        </select>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ padding: '8px', borderRadius: '5px' }}>
          <option value="All">All Subjects</option>
          <option value="GATE EE">GATE EE</option>
          <option value="SSC JE">SSC JE</option>
        </select>
      </div>

      <div className="pyq-list" style={{ marginTop: '20px' }}>
        {/* Free Content Example */}
        <div className="notes-list-item">
          <strong>GATE EE 2026 Foundation Paper</strong>
          <span style={{ color: '#10b981', marginLeft: '10px', fontWeight: 'bold' }}>Free</span>
          <br />
          <a href="#" style={{ marginTop: '10px', display: 'inline-block' }}>View Paper</a>
        </div>

        {/* Premium Content Example */}
        <div className="notes-list-item" style={{ opacity: isPremium ? 1 : 0.6, transition: 'opacity 0.3s' }}>
          <strong>SSC JE Advanced Solutions & Notes</strong>
          {!isPremium ? (
            <span style={{ color: '#ef4444', marginLeft: '10px', fontWeight: 'bold' }}>🔒 Premium Required</span>
          ) : (
            <>
              <span style={{ color: '#10b981', marginLeft: '10px', fontWeight: 'bold' }}>🔓 Unlocked</span>
              <br />
              <a href="#" style={{ marginTop: '10px', display: 'inline-block' }}>View Paper</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ setIsPremium, isPremium }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Mock Login Successful for ${email}`);
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h3>Student Login</h3>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="submit-btn">Login</button>
      </form>

      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <h4>Testing Controls</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Current Status: {isPremium ? 'Premium User' : 'Free User'}
        </p>
        <button 
          onClick={() => setIsPremium(prev => !prev)} 
          className="submit-btn"
          style={{ backgroundColor: isPremium ? '#ef4444' : '#10b981' }}
        >
          {isPremium ? 'Revoke Premium Access' : 'Upgrade to Premium'}
        </button>
      </div>
    </div>
  );
}

function TestsPage() {
  // Quiz State Management
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // Demo Quiz Database
  const quizData = [
    {
      question: "Which of the following circuit parameters is non-linear?",
      options: ["Inductance", "Wire resistance", "Transistor", "Capacitance"],
      correct: "Transistor",
      explanation: "Transistors operate using semiconductor junctions, resulting in non-linear Voltage-Current (V-I) characteristics, unlike passive elements like resistors or capacitors."
    },
    {
      question: "Reasoning: Find the missing number in the series: 2, 6, 12, 20, ?",
      options: ["28", "30", "32", "36"],
      correct: "30",
      explanation: "The pattern adds consecutive even numbers: +4, +6, +8, +10. Therefore, 20 + 10 = 30."
    }
  ];

  const question = quizData[currentQ];

  const handleOptionClick = (option) => {
    if (!showSolution) {
      setSelectedOption(option);
    }
  };

  const handleNext = () => {
    setCurrentQ((prev) => (prev + 1) % quizData.length);
    setSelectedOption(null);
    setShowSolution(false);
  };

  return (
    <div className="card">
      <h3>Reasoning and GK Tests</h3>
      <p style={{ color: 'var(--text-muted)' }}>Test your knowledge before the midterms.</p>

      <div className="quiz-container">
        <h4 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
          Question {currentQ + 1} of {quizData.length}: {question.question}
        </h4>

        <div className="options-grid">
          {question.options.map((opt, index) => {
            // Determine styling based on whether solution is revealed
            let btnClass = "quiz-option";
            if (showSolution) {
              if (opt === question.correct) btnClass += " correct";
              else if (opt === selectedOption) btnClass += " wrong";
            } else if (opt === selectedOption) {
              btnClass += " selected";
            }

            return (
              <button 
                key={index} 
                className={btnClass}
                onClick={() => handleOptionClick(opt)}
                disabled={showSolution}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
          {!showSolution ? (
            <button 
              className="submit-btn" 
              onClick={() => setShowSolution(true)}
              disabled={!selectedOption}
              style={{ opacity: !selectedOption ? 0.5 : 1 }}
            >
              Submit & View Solution
            </button>
          ) : (
            <button className="submit-btn" onClick={handleNext}>
              Next Question ➔
            </button>
          )}
        </div>

        {/* Solution Explanation Box */}
        {showSolution && (
          <div className="solution-box">
            <strong>Explanation:</strong>
            <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GuidancePage() {
  return (
    <div className="card">
      <h3>Senior Guidance & Internship News</h3>
      <p style={{ color: 'var(--text-muted)' }}>Forum posts and direct internship opportunity boards will populate here.</p>
    </div>
  );
}

function AdminPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Power Systems');
  const [branch, setBranch] = useState('Electrical Engineering');
  const [college, setCollege] = useState('CTAE Udaipur');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a PDF file.");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('branch', branch);
    formData.append('college', college);
    formData.append('noteFile', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/notes/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        alert("File uploaded successfully!");
        setTitle('');
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3>Admin Panel (Upload Notes)</h3>
      <form onSubmit={handleFileUploadSubmit}>
        <div className="form-group">
          <label>Document Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Chapter 1 Basics" />
        </div>
        <div className="form-group">
          <label>Subject:</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="Power Systems">Power Systems</option>
            <option value="Circuit Concepts">Circuit Concepts</option>
            <option value="Electric Vehicles">Electric Vehicles</option>
          </select>
        </div>
        <div className="form-group">
          <label>Branch:</label>
          <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} />
        </div>
        <div className="form-group">
          <label>College:</label>
          <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Select PDF File:</label>
          <input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files[0])} required />
        </div>
        <button type="submit" className="submit-btn">Upload Note</button>
      </form>
    </div>
  );
}
function TrainingPage() {
  return (
    <div className="card">
      <h3>Industry Training & Expert Sessions</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Learn directly from the field. Access internship pathways and operational breakdowns of active grid infrastructure.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Module 1 */}
        <div className="notes-list-item">
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
            Upcoming Live Session
          </span>
          <h4 style={{ margin: '8px 0' }}>Grid Operations & Load Management</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
            Guest lecture detailing load distribution and safety protocols at the 220kV Substation in Debari.
          </p>
          <button className="submit-btn" style={{ padding: '8px', fontSize: '0.9rem' }}>Register for Session</button>
        </div>

        {/* Module 2 */}
        <div className="notes-list-item">
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f97316', textTransform: 'uppercase' }}>
            Internship Pathway
          </span>
          <h4 style={{ margin: '8px 0' }}>Summer Training: Jaipur Metro Rail Corporation</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
            Application guide and technical prerequisites for securing a summer internship with JMRC traction systems.
          </p>
          <button className="submit-btn" style={{ padding: '8px', fontSize: '0.9rem', backgroundColor: 'transparent', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}>
            View Requirements
          </button>
        </div>

        {/* Module 3 */}
        <div className="notes-list-item">
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase' }}>
            Recorded Masterclass
          </span>
          <h4 style={{ margin: '8px 0' }}>Suratgarh Thermal Power Plant Operations</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
            A deep dive into the generation cycle, synchronous machines, and maintenance schedules of thermal plants.
          </p>
          <a href="#" style={{ display: 'inline-block', marginTop: '5px' }}>Watch Recording</a>
        </div>

      </div>
    </div>
  );
}
function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', branch: '', college: '' });

  // Load the profile data as soon as the page opens
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; // If no token, they aren't logged in

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUser(data);
      setFormData({ name: data.name || '', branch: data.branch || '', college: data.college || '' });
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setUser(result.user);
        setIsEditing(false); // Switch back to view mode
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  // If data hasn't loaded yet
  if (!user) return <div className="card">Loading profile data... Please ensure you are logged in.</div>;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Student Profile</h3>
        <button 
          className="submit-btn" 
          style={{ width: 'auto', padding: '8px 15px', backgroundColor: isEditing ? 'var(--text-muted)' : 'var(--accent-primary)' }}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {!isEditing ? (
        // VIEW MODE
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ marginBottom: '10px' }}><strong>Email:</strong> {user.email}</p>
          <p style={{ marginBottom: '10px' }}><strong>Status:</strong> {user.role.toUpperCase()}</p>
          <hr style={{ margin: '15px 0', borderColor: 'var(--border-color)', borderStyle: 'solid' }} />
          <p style={{ marginBottom: '10px' }}><strong>Name:</strong> {user.name || 'Not set'}</p>
          <p style={{ marginBottom: '10px' }}><strong>Branch:</strong> {user.branch || 'Not set'}</p>
          <p style={{ marginBottom: '10px' }}><strong>College:</strong> {user.college || 'Not set'}</p>
        </div>
      ) : (
        // EDIT MODE
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Jane Doe" />
          </div>
          <div className="form-group">
            <label>Branch</label>
            <input type="text" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} placeholder="e.g., Electrical Engineering" />
          </div>
          <div className="form-group">
            <label>College</label>
            <input type="text" value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} placeholder="e.g., CTAE Udaipur" />
          </div>
          <button type="submit" className="submit-btn" style={{ backgroundColor: '#10b981' }}>Save Changes</button>
        </form>
      )}
    </div>
  );
}

export default App;