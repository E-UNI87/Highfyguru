// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

/* =========================================
   MAIN APP ROUTER & NAVBAR
========================================= */
function App() {
  const [theme, setTheme] = useState('light');
  const [isPremium, setIsPremium] = useState(false);
  
  // Track if user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const themeOptions = [
    { id: 'light', color: '#3b82f6', name: 'Blue' },
    { id: 'emerald', color: '#10b981', name: 'Emerald' },
    { id: 'sunset', color: '#f97316', name: 'Sunset' },
    { id: 'midnight', color: '#8b5cf6', name: 'Midnight' }
  ];

  return (
    <Router>
      <div className="app" data-theme={theme}>
        <header className="navbar">
          <h2><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>EduPlatform</Link></h2>
          
          <div className="nav-links">
            <Link to="/notes">Notes</Link>
            <Link to="/pyqs">PYQs</Link>
            <Link to="/tests">Tests</Link>
            <Link to="/guidance">Guidance</Link>
            <Link to="/training">Industry Training</Link>
            
            {/* Dynamic Auth Links: Hide Login if logged in */}
            {isAuthenticated ? (
              <>
                <Link to="/profile" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>My Profile</Link>
                <span onClick={handleLogout} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>Logout</span>
              </>
            ) : (
              <Link to="/login" style={{ fontWeight: '700' }}>Login</Link>
            )}

            <Link to="/admin" style={{ color: 'var(--accent-primary)' }}>Admin</Link>
            
            {/* Theme Picker */}
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
            <Route path="/gk-tests" element={<GKTestPage />} />
            <Route path="/guidance" element={<GuidancePage />} />
            {/* Pass auth states to Login */}
            <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setIsPremium={setIsPremium} />} />
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

  const subjectOptions = ['All', 'Power Systems', 'Circuit Concepts', 'Electric Vehicles', 'Control Systems'];

  useEffect(() => {
    fetch('http://localhost:5000/api/notes')
      .then(res => res.json())
      .then(data => {
        // FILTER: Only keep items that are NOT PYQs
        const onlyNotes = Array.isArray(data) ? data.filter(item => item.resourceType !== 'PYQ') : [];
        setNotes(onlyNotes);
      })
      .catch(err => console.error("Error fetching notes:", err));
  }, []);

  return (
    <div className="card">
      <h3>Study Notes Repository</h3>
      
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

      <div style={{ marginTop: '15px' }}>
        {notes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No notes matched your filter criteria.</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="notes-list-item">
              <strong>{note.title}</strong> — <small>{note.subject} | {note.branch} ({note.college})</small>
              <br />
              <a href={note.fileUrl} target="_blank" rel="noreferrer" style={{ marginTop: '10px', display: 'inline-block' }}>Open Resource</a>
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
  const [pyqs, setPyqs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/notes')
      .then(res => res.json())
      .then(data => {
        // FILTER: Only keep items tagged as PYQs
        const onlyPyqs = Array.isArray(data) ? data.filter(item => item.resourceType === 'PYQ') : [];
        setPyqs(onlyPyqs);
      })
      .catch(err => console.error("Error fetching PYQs:", err));
  }, []);

  return (
    <div className="card">
      <h3>Previous Year Questions (PYQs)</h3>
      
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
        {pyqs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No PYQs uploaded yet.</p>
        ) : (
          pyqs.map((pyq) => (
            <div key={pyq._id} className="notes-list-item">
              <strong>{pyq.title}</strong> — <small>{pyq.subject} | {pyq.branch} ({pyq.college})</small>
              <br />
              <a href={pyq.fileUrl} target="_blank" rel="noreferrer" style={{ marginTop: '10px', display: 'inline-block', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                View PYQ Paper
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LoginPage({ setIsAuthenticated }) {
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();

      if (response.ok) {
        if (isLoginMode) {
          localStorage.setItem('token', result.token);
          setIsAuthenticated(true); 
          navigate('/profile');
        } else {
          alert("Account created successfully! You can now log in.");
          setIsLoginMode(true);
          setPassword(''); 
        }
      } else {
        alert(result.error || "Authentication failed. Please check your details.");
      }
    } catch (err) {
      console.error("Auth Network Error:", err);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h3>{isLoginMode ? 'Student Login' : 'Create an Account'}</h3>
      
      <form onSubmit={handleAuthSubmit} style={{ textAlign: 'left', marginTop: '20px' }}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="student@ctae.ac.in" 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Enter a secure password"
          />
        </div>
        
        <button type="submit" className="submit-btn">
          {isLoginMode ? 'Login Securely' : 'Sign Up Now'}
        </button>
      </form>

      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLoginMode ? "Don't have an account yet?" : "Already have an account?"}
        </p>
        <button 
          onClick={() => setIsLoginMode(!isLoginMode)} 
          style={{ 
            background: 'none', border: 'none', color: 'var(--accent-primary)', 
            fontWeight: 'bold', cursor: 'pointer', marginTop: '5px', textDecoration: 'underline'
          }}
        >
          {isLoginMode ? 'Create a Free Account' : 'Log in to your account'}
        </button>
      </div>
    </div>
  );
}

function TestsPage() {
  const [category, setCategory] = useState('G.K');
  const [questions, setQuestions] = useState([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  
  // Timer and Question tracking
  const [timeLeft, setTimeLeft] = useState(600); // Default placeholder
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // 1. Fetch questions from your newly fixed backend!
  const loadTest = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${category}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          return alert("Is category me abhi koi questions nahi hain! Admin panel se questions add karein.");
        }
        setQuestions(data);
        setTimeLeft(data.length * 60); // Har question ke liye 60 seconds (1 minute)
        setSelectedAnswers({});
        setCurrentIndex(0);
        setTestStarted(true);
        setTestCompleted(false);
      } else {
        alert("Server se connect nahi ho paaya.");
      }
    } catch (err) { console.error("Test fetch error:", err); }
  };

  // 2. The Live Timer Logic
  useEffect(() => {
    if (!testStarted || testCompleted) return;
    
    if (timeLeft <= 0) {
      handleTestSubmit(); // Auto submit when time hits 0
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, testStarted, testCompleted]);

  const handleOptionSelect = (option) => {
    const currentQ = questions[currentIndex];
    setSelectedAnswers({ ...selectedAnswers, [currentQ._id]: option });
  };

  const handleTestSubmit = () => {
    setTestStarted(false);
    setTestCompleted(true);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q._id] === q.correctOption) score++;
    });
    return score;
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
      
      {/* SCREEN A: Setup & Category Selection */}
      {!testStarted && !testCompleted && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>🏆 Live Online Quiz Portal</h3>
          <p style={{ color: 'var(--text-muted)' }}>Select a subject to begin your timed assessment.</p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '25px 0' }}>
            <button 
              className={`filter-chip ${category === 'G.K' ? 'active' : ''}`} 
              onClick={() => setCategory('G.K')}
            >
              General Knowledge (G.K)
            </button>
            <button 
              className={`filter-chip ${category === 'Reasoning' ? 'active' : ''}`} 
              onClick={() => setCategory('Reasoning')}
            >
              Reasoning Ability
            </button>
          </div>

          {category === 'G.K' && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>Want to explore different test options?</p>
              <button onClick={() => window.location.href = '/#/gk-tests'} className="submit-btn" style={{ width: '100%', backgroundColor: '#f97316', marginBottom: '15px' }}>
                📅 Browse GK Test Options
              </button>
            </div>
          )}
          
          <button onClick={loadTest} className="submit-btn" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
            Start Live Timer Test
          </button>
        </div>
      )}

      {/* SCREEN B: The Active Test with Timer */}
      {testStarted && questions.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontWeight: 'bold' }}>Category: {category}</span>
            <span style={{ color: timeLeft < 60 ? '#ef4444' : 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.2rem', backgroundColor: 'var(--bg-secondary)', padding: '5px 15px', borderRadius: '20px' }}>
              ⏱️ {formatTime()}
            </span>
          </div>

          <h4>Question {currentIndex + 1} of {questions.length}:</h4>
          <p style={{ fontSize: '1.1rem', margin: '15px 0' }}>{questions[currentIndex].questionText}</p>

          <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questions[currentIndex].options.map((opt, i) => (
              <button 
                key={i} 
                className={`quiz-option ${selectedAnswers[questions[currentIndex]._id] === opt ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(opt)}
                style={{ 
                  padding: '12px', textAlign: 'left', borderRadius: '8px', 
                  border: selectedAnswers[questions[currentIndex]._id] === opt ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  backgroundColor: selectedAnswers[questions[currentIndex]._id] === opt ? 'var(--bg-secondary)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(p => p - 1)} className="submit-btn" style={{ width: 'auto', opacity: currentIndex === 0 ? 0.5 : 1 }}>
              Previous
            </button>
            
            {currentIndex < questions.length - 1 ? (
              <button onClick={() => setCurrentIndex(p => p + 1)} className="submit-btn" style={{ width: 'auto' }}>
                Next Question
              </button>
            ) : (
              <button onClick={handleTestSubmit} className="submit-btn" style={{ width: 'auto', backgroundColor: '#10b981' }}>
                Submit Final Test
              </button>
            )}
          </div>
        </div>
      )}

      {/* SCREEN C: Score & Deep Solutions */}
      {testCompleted && (
        <div>
          <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '25px', border: '1px solid var(--border-color)' }}>
            <h2>📊 Performance Scorecard</h2>
            <h1 style={{ color: 'var(--accent-primary)', fontSize: '3rem', margin: '10px 0' }}>{calculateScore()} / {questions.length}</h1>
            <button onClick={() => setTestCompleted(false)} className="submit-btn" style={{ width: 'auto', marginTop: '15px' }}>
              Back to Portal
            </button>
          </div>

          <h3>📑 Answer Key & Detailed Solutions:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {questions.map((q, idx) => {
              const userAns = selectedAnswers[q._id];
              const isCorrect = userAns === q.correctOption;
              
              return (
                <div key={q._id} style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                  <strong>Q{idx + 1}. {q.questionText}</strong>
                  <div style={{ margin: '15px 0', fontSize: '0.95rem' }}>
                    <p style={{ color: isCorrect ? '#10b981' : '#ef4444', margin: '5px 0' }}>
                      <strong>Your Answer:</strong> {userAns || '[Not Answered]'}
                    </p>
                    {!isCorrect && (
                      <p style={{ color: '#10b981', margin: '5px 0' }}>
                        <strong>Correct Answer:</strong> {q.correctOption}
                      </p>
                    )}
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '5px', fontSize: '0.9rem', borderLeft: '3px solid var(--accent-primary)', marginTop: '10px' }}>
                    <strong>💡 Solution:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
function GuidancePage() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. Social Interaction States
  const [localInteractions, setLocalInteractions] = useState({}); // Tracks Likes
  const [activeCommentPostId, setActiveCommentPostId] = useState(null); // Which post's comments are open
  const [postComments, setPostComments] = useState({}); // Stores the actual comments
  const [newComment, setNewComment] = useState(''); // Text in the comment input box

  // 2. Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: '', time: '', topic: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/posts')
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching posts:", err));
  }, []);

  // --- INTERACTION HANDLERS ---
  
  const handleLike = (postId) => {
    setLocalInteractions(prev => {
      const current = prev[postId] || { likes: 0, hasLiked: false };
      // If they already liked it, clicking again removes the like (Toggle)
      if (current.hasLiked) {
        return { ...prev, [postId]: { likes: current.likes - 1, hasLiked: false } };
      } 
      // If they haven't liked it, add exactly 1 like
      else {
        return { ...prev, [postId]: { likes: current.likes + 1, hasLiked: true } };
      }
    });
  };

  const handleCommentSubmit = (postId) => {
    if (!newComment.trim()) return;
    
    // Add the new comment to the specific post's array of comments
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    
    setNewComment(''); // Clear the input box
  };

  // --- BOOKING HANDLERS ---
  
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    // SECURITY CHECK: Do we know who is booking this?
    const token = localStorage.getItem('token');
    if (!token) {
      alert("⚠️ You must be logged in to book a session. Please go to the Login page first.");
      setShowBookingModal(false);
      return;
    }

    // Success! (In a real app, you would send this to your backend via fetch here)
    alert(`✅ Session Successfully Requested!\n\nDate: ${bookingForm.date}\nTime: ${bookingForm.time}\nTopic: ${bookingForm.topic}\n\nWe have linked this request to your logged-in account. A senior will email you shortly.`);
    
    // Close and reset form
    setShowBookingModal(false);
    setBookingForm({ date: '', time: '', topic: '' });
  };

  // Filter posts based on search bar
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="guidance-layout">
      
      {/* =========================================
          LEFT SIDE: FEED & SEARCH
      ========================================= */}
      <div className="guidance-feed">
        <div className="card" style={{ padding: '15px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search news, internships, or senior advice..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
          <button className="submit-btn" style={{ width: '100px' }}>Search</button>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="card"><p style={{ color: 'var(--text-muted)' }}>No news posts found.</p></div>
        ) : (
          filteredPosts.map(post => {
            const interacts = localInteractions[post._id] || { likes: 0, hasLiked: false };
            const commentsArray = postComments[post._id] || [];

            return (
              <div key={post._id} className="post-card">
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  {post.category}
                </span>
                <h3 style={{ marginTop: '5px' }}>{post.title}</h3>
                <p style={{ marginTop: '10px', color: 'var(--text-main)', lineHeight: '1.6' }}>{post.content}</p>
                
                {/* ACTION BAR */}
                <div className="interaction-bar">
                  <button 
                    className="action-btn" 
                    onClick={() => handleLike(post._id)}
                    style={{ color: interacts.hasLiked ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                  >
                    {interacts.hasLiked ? '❤️ Liked' : '🤍 Like'} {post.likes + interacts.likes > 0 && `(${post.likes + interacts.likes})`}
                  </button>
                  
                  <button 
                    className="action-btn" 
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)}
                  >
                    💬 Comment {commentsArray.length > 0 && `(${commentsArray.length})`}
                  </button>
                </div>

                {/* EXPANDABLE COMMENT SECTION */}
                {activeCommentPostId === post._id && (
                  <div className="comments-section">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                      {commentsArray.length === 0 ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Be the first to comment...</span>
                      ) : (
                        commentsArray.map((c, idx) => (
                          <div key={idx} className="comment-bubble"><strong>Student:</strong> {c}</div>
                        ))
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)} 
                        placeholder="Write a comment..." 
                        style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid var(--border-color)' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                      />
                      <button onClick={() => handleCommentSubmit(post._id)} className="submit-btn" style={{ width: 'auto', borderRadius: '20px', padding: '0 20px' }}>Post</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* =========================================
          RIGHT SIDE: ACTION SIDEBAR
      ========================================= */}
      <div className="guidance-sidebar">
        <div className="card" style={{ textAlign: 'center', padding: '25px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎓</div>
          <h3>Need Direction?</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '15px 0' }}>
            Book a 1-on-1 session with alumni and seniors to discuss placements, gate prep, and core subjects.
          </p>
          <button 
            className="submit-btn" 
            style={{ backgroundColor: '#f97316', width: '100%' }}
            onClick={() => setShowBookingModal(true)}
          >
            Book Senior Guidance
          </button>
          
          <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)', borderStyle: 'solid' }} />
          
          <h4 style={{ fontSize: '0.9rem', textAlign: 'left', marginBottom: '10px' }}>Top Mentors Available:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
              <span style={{ fontSize: '0.85rem' }}>Aman (Placed @ PowerGrid)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>P</div>
              <span style={{ fontSize: '0.85rem' }}>Priya (GATE EE Rank 142)</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          BOOKING MODAL OVERLAY
      ========================================= */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          {/* Stop bubbling so clicking inside the modal doesn't close it */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Schedule a Session</h3>
              <span style={{ cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }} onClick={() => setShowBookingModal(false)}>✕</span>
            </div>
            
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Date</label>
                  <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Time</label>
                  <input type="time" value={bookingForm.time} onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})} required />
                </div>
              </div>
              
              <div className="form-group">
                <label>What do you want to discuss?</label>
                <textarea 
                  rows="3" 
                  placeholder="e.g., I need help preparing for my SSC JE exam..."
                  value={bookingForm.topic}
                  onChange={(e) => setBookingForm({...bookingForm, topic: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                />
              </div>

              <button type="submit" className="submit-btn" style={{ width: '100%', backgroundColor: '#f97316' }}>
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
function TrainingPage() {
  return (
    <div className="card">
      <h3>Industry Training & Expert Sessions</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Learn directly from the field. Access internship pathways and operational breakdowns.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="notes-list-item">
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Upcoming Live Session</span>
          <h4 style={{ margin: '8px 0' }}>Grid Operations & Load Management</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Guest lecture detailing load distribution and safety protocols.</p>
          <button className="submit-btn" style={{ padding: '8px', fontSize: '0.9rem' }}>Register for Session</button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', branch: '', college: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setUser(result.user);
        setIsEditing(false);
      }
    } catch (error) { console.error("Update failed", error); }
  };

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
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ marginBottom: '10px' }}><strong>Email:</strong> {user.email}</p>
          <p style={{ marginBottom: '10px' }}><strong>Status:</strong> {user.role.toUpperCase()}</p>
          <hr style={{ margin: '15px 0', borderColor: 'var(--border-color)', borderStyle: 'solid' }} />
          <p style={{ marginBottom: '10px' }}><strong>Name:</strong> {user.name || 'Not set'}</p>
          <p style={{ marginBottom: '10px' }}><strong>Branch:</strong> {user.branch || 'Not set'}</p>
          <p style={{ marginBottom: '10px' }}><strong>College:</strong> {user.college || 'Not set'}</p>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Branch</label>
            <input type="text" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
          </div>
          <div className="form-group">
            <label>College</label>
            <input type="text" value={formData.college} onChange={(e) => setFormData({...formData, college: e.target.value})} />
          </div>
          <button type="submit" className="submit-btn" style={{ backgroundColor: '#10b981' }}>Save Changes</button>
        </form>
      )}
    </div>
  );
}

function AdminPage() {
  // 1. Dynamic Data States
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);

  // 2. Main Upload Form States
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [branch, setBranch] = useState('');
  const [college, setCollege] = useState('');
  
  const [resourceType, setResourceType] = useState('Note'); 
  const [uploadType, setUploadType] = useState('file'); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [externalLink, setExternalLink] = useState('');

  // 3. Mini-Form States (Infrastructure)
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  // 4. News Post States
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Internship News');

  // 5. NEW: Live Quiz Question States
  const [qCategory, setQCategory] = useState('G.K');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');
  const [qExplanation, setQExplanation] = useState('');

  // Fetch dynamic lists on load
  useEffect(() => {
    fetchDynamicData();
  }, []);

  const fetchDynamicData = async () => {
    try {
      const [collegesRes, branchesRes] = await Promise.all([
        fetch('http://localhost:5000/api/colleges'),
        fetch('http://localhost:5000/api/branches')
      ]);
      if (collegesRes.ok) setColleges(await collegesRes.json());
      if (branchesRes.ok) setBranches(await branchesRes.json());
    } catch (err) { console.error("Failed to fetch dynamic lists.", err); }
  };

  // --- Handlers ---
  const handleAddCollege = async () => {
    if (!newCollegeName) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollegeName })
      });
      if (res.ok) {
        setNewCollegeName('');
        fetchDynamicData();
        alert("College added successfully!");
      }
    } catch (err) { console.error(err); }
  };

  const handleAddBranch = async () => {
    if (!newBranchName) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBranchName })
      });
      if (res.ok) {
        setNewBranchName('');
        fetchDynamicData();
        alert("Branch added successfully!");
      }
    } catch (err) { console.error(err); }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      if (uploadType === 'file') {
        if (!selectedFile) return alert("Please select a PDF file.");
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('branch', branch);
        formData.append('college', college);
        formData.append('resourceType', resourceType);
        formData.append('noteFile', selectedFile);

        response = await fetch('http://localhost:5000/api/notes/upload', {
          method: 'POST',
          body: formData,
        });
      } else {
        if (!externalLink) return alert("Please paste a valid link.");
        const jsonData = {
          title, subject, branch, college,
          resourceType,
          fileUrl: externalLink,
          isExternalLink: true
        };

        response = await fetch('http://localhost:5000/api/notes/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        });
      }

      const result = await response.json();
      if (response.ok) {
        alert("Resource uploaded successfully!");
        setTitle(''); setSubject(''); setSelectedFile(null); setExternalLink('');
      } else { alert(result.error || "Upload failed."); }
    } catch (err) { console.error("Upload failed:", err); }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, content: postContent, category: postCategory })
      });
      if (res.ok) {
        alert("News post published successfully!");
        setPostTitle('');
        setPostContent('');
      }
    } catch (err) { console.error(err); }
  };

  // NEW: Handler for Live Test Questions
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    // Validate that the correct answer exactly matches one of the options
    if (!qOptions.includes(qCorrect)) {
      return alert("Correct option exact option tags me se ek hona chahiye!");
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: qCategory, 
          questionText: qText, 
          options: qOptions, 
          correctOption: qCorrect, 
          explanation: qExplanation 
        })
      });
      if (res.ok) {
        alert("Question live test set me add ho gya h!");
        setQText(''); setQOptions(['', '', '', '']); setQCorrect(''); setQExplanation('');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-grid">
      
      {/* LEFT COLUMN: Manage Infrastructure */}
      <div className="card">
        <h3>Manage Infrastructure</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Add new colleges and branches to make them available in the upload form.</p>

        <div className="form-group" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
          <label>Add New College</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" value={newCollegeName} onChange={(e) => setNewCollegeName(e.target.value)} placeholder="e.g., MNIT Jaipur" />
            <button type="button" onClick={handleAddCollege} className="submit-btn" style={{ width: 'auto' }}>Add</button>
          </div>
        </div>

        <div className="form-group">
          <label>Add New Branch</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} placeholder="e.g., Computer Science" />
            <button type="button" onClick={handleAddBranch} className="submit-btn" style={{ width: 'auto' }}>Add</button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Upload Resource or PYQ */}
      <div className="card">
        <h3>Upload Resource or PYQ</h3>
        <form onSubmit={handleResourceSubmit}>
          <div className="form-group">
            <label>Document Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., 2026 Midterm Solutions" />
          </div>

          <div className="form-group">
            <label>Course / Subject Name:</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g., Power System Analysis" />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Select College:</label>
              <select value={college} onChange={(e) => setCollege(e.target.value)} required>
                <option value="">-- Choose College --</option>
                {colleges.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                <option value="CTAE Udaipur">CTAE Udaipur (Default)</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Select Branch:</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} required>
                <option value="">-- Choose Branch --</option>
                {branches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                <option value="Electrical Engineering">Electrical Engineering (Default)</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Upload Type:</label>
            <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} required>
              <option value="Note">Study Note</option>
              <option value="PYQ">Previous Year Question (PYQ)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button 
              type="button" 
              onClick={() => setUploadType('file')} 
              style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid var(--accent-primary)', backgroundColor: uploadType === 'file' ? 'var(--accent-primary)' : 'transparent', color: uploadType === 'file' ? '#fff' : 'var(--text-main)', cursor: 'pointer' }}
            >
              Upload PDF File
            </button>
            <button 
              type="button" 
              onClick={() => setUploadType('link')} 
              style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid var(--accent-primary)', backgroundColor: uploadType === 'link' ? 'var(--accent-primary)' : 'transparent', color: uploadType === 'link' ? '#fff' : 'var(--text-main)', cursor: 'pointer' }}
            >
              Paste Google Drive Link
            </button>
          </div>

          {uploadType === 'file' ? (
            <div className="form-group">
              <label>Select PDF File:</label>
              <input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files[0])} required={uploadType === 'file'} />
            </div>
          ) : (
            <div className="form-group">
              <label>Google Drive / External Link:</label>
              <input type="url" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} required={uploadType === 'link'} placeholder="https://drive.google.com/..." />
            </div>
          )}

          <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>Publish Resource</button>
        </form>
      </div>

      {/* BOTTOM SPAN A: Post Community News */}
      <div className="card" style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
        <h3>Publish Platform News & Internships</h3>
        <form onSubmit={handlePostSubmit}>
          <div className="form-group">
            <label>Headline / Title:</label>
            <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required placeholder="e.g., L&T Summer Internship Applications Open" />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)}>
              <option value="Internship News">Internship News</option>
              <option value="Placement Update">Placement Update</option>
              <option value="General Announcement">General Announcement</option>
            </select>
          </div>
          <div className="form-group">
            <label>Post Content:</label>
            <textarea 
              value={postContent} 
              onChange={(e) => setPostContent(e.target.value)} 
              required 
              rows="4" 
              placeholder="Write the full details here..."
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontFamily: 'inherit' }}
            />
          </div>
          <button type="submit" className="submit-btn" style={{ backgroundColor: '#8b5cf6' }}>Publish Post to Feed</button>
        </form>
      </div>

      {/* BOTTOM SPAN B: Custom Live Question Ingestion */}
      <div className="card" style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
        <h3>➕ Add Questions to Live Tests (G.K / Reasoning)</h3>
        <form onSubmit={handleQuestionSubmit}>
          <div className="form-group">
            <label>Select Test Category:</label>
            <select value={qCategory} onChange={(e) => setQCategory(e.target.value)}>
              <option value="G.K">General Knowledge (G.K)</option>
              <option value="Reasoning">Reasoning Ability</option>
            </select>
          </div>
          <div className="form-group">
            <label>Question Text:</label>
            <input type="text" value={qText} onChange={(e) => setQText(e.target.value)} required placeholder="e.g., If A=1, B=2, then what is C equal to?" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }} className="form-group">
            {qOptions.map((opt, idx) => (
              <div key={idx}>
                <label>Option {idx + 1}:</label>
                <input 
                  type="text" 
                  value={opt} 
                  required 
                  onChange={(e) => {
                    const updated = [...qOptions];
                    updated[idx] = e.target.value;
                    setQOptions(updated);
                  }} 
                  placeholder={`Option Value ${idx + 1}`} 
                />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label>Exact Correct Option String:</label>
            <input type="text" value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} required placeholder="Paste exact correct choice text here" />
          </div>
          <div className="form-group">
            <label>Post-Submission Solution Explanation:</label>
            <textarea 
              value={qExplanation} 
              onChange={(e) => setQExplanation(e.target.value)} 
              required 
              rows="3" 
              placeholder="Explain step-by-step why this answer is correct..." 
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontFamily: 'inherit' }} 
            />
          </div>
          <button type="submit" className="submit-btn" style={{ backgroundColor: '#10b981' }}>Inject Question into Database</button>
        </form>
      </div>

    </div>
  );
}

/* =========================================
   G.K TEST OPTIONS PAGE
========================================= */
function GKTestPage() {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);

  const testOptions = [
    {
      id: 'daily',
      title: '⏰ Daily GK Challenge',
      description: 'Quick 5-minute test with 5 questions. Perfect for daily practice!',
      icon: '📅',
      color: '#3b82f6',
      duration: 300,
      questionCount: 5
    },
    {
      id: 'weekly',
      title: '📅 Weekly Assessment',
      description: 'Comprehensive 20-minute test with 20 questions.',
      icon: '📊',
      color: '#10b981',
      duration: 1200,
      questionCount: 20
    },
    {
      id: 'monthly',
      title: '🏆 Monthly Mock Exam',
      description: 'Full-length 60-minute test with 60 questions. Complete mock exam experience.',
      icon: '🎯',
      color: '#f97316',
      duration: 3600,
      questionCount: 60
    }
  ];

  const previousTests = [
    { month: 'May 2026', score: '42/50', date: '2026-05-15', difficulty: 'Hard' },
    { month: 'April 2026', score: '38/50', date: '2026-04-10', difficulty: 'Medium' },
    { month: 'March 2026', score: '45/50', date: '2026-03-20', difficulty: 'Medium' }
  ];

  const startTest = async (testType) => {
    setSelectedTest(testType);
    try {
      const res = await fetch(`http://localhost:5000/api/questions/G.K`);
      if (res.ok) {
        let data = await res.json();
        // Limit questions based on test type
        const testOption = testOptions.find(t => t.id === testType);
        data = data.slice(0, testOption.questionCount);
        
        if (data.length === 0) {
          return alert("No questions available for this test. Please check back later!");
        }
        
        setQuestions(data);
        setTimeLeft(testOption.duration);
        setSelectedAnswers({});
        setCurrentIndex(0);
        setTestStarted(true);
        setTestCompleted(false);
      }
    } catch (err) {
      console.error("Test fetch error:", err);
      alert("Failed to load test. Please try again.");
    }
  };

  // Timer Logic
  useEffect(() => {
    if (!testStarted || testCompleted) return;
    
    if (timeLeft <= 0) {
      handleTestSubmit();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, testStarted, testCompleted]);

  const handleOptionSelect = (option) => {
    const currentQ = questions[currentIndex];
    setSelectedAnswers({ ...selectedAnswers, [currentQ._id]: option });
  };

  const handleTestSubmit = () => {
    setTestStarted(false);
    setTestCompleted(true);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q._id] === q.correctOption) score++;
    });
    return score;
  };

  const formatTime = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const downloadReport = (test) => {
    const element = document.createElement('a');
    const file = new Blob([`Test Report\n\n${test.month}\nScore: ${test.score}\nDifficulty: ${test.difficulty}\nDate: ${test.date}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `GK-Test-${test.month}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // SCREEN 1: Test Selection
  if (!testStarted && !testCompleted && selectedTest === null) {
    return (
      <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>🧠 General Knowledge Tests</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Choose your test format and start practicing!</p>
        </div>

        {/* Test Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '50px' }}>
          {testOptions.map((test) => (
            <div
              key={test.id}
              style={{
                padding: '25px',
                backgroundColor: `${test.color}15`,
                border: `2px solid ${test.color}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                ':hover': { transform: 'translateY(-5px)' }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 10px 25px ${test.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{test.icon}</div>
              <h3 style={{ marginBottom: '10px', color: test.color }}>{test.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>{test.description}</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
                <span style={{ padding: '5px 10px', backgroundColor: `${test.color}20`, borderRadius: '20px', fontSize: '0.85rem', color: test.color, fontWeight: 'bold' }}>⏱️ {test.duration / 60}m</span>
                <span style={{ padding: '5px 10px', backgroundColor: `${test.color}20`, borderRadius: '20px', fontSize: '0.85rem', color: test.color, fontWeight: 'bold' }}>📝 {test.questionCount}q</span>
              </div>
              <button
                onClick={() => startTest(test.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: test.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Start Test
              </button>
            </div>
          ))}
        </div>

        {/* Previous Tests Section */}
        <div style={{ marginTop: '50px' }}>
          <h3 style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--border-color)' }}>📊 Your Previous Tests</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            {previousTests.map((test, idx) => (
              <div key={idx} style={{
                padding: '20px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{test.month}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Score: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{test.score}</span>
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Difficulty: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{test.difficulty}</span>
                  </p>
                </div>
                <button
                  onClick={() => downloadReport(test)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  📥 Download
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button onClick={() => navigate('/tests')} className="submit-btn" style={{ width: 'auto', backgroundColor: 'var(--text-muted)' }}>
            ← Back to All Tests
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 2: Active Test
  if (testStarted && questions.length > 0) {
    const testType = testOptions.find(t => t.id === selectedTest);
    const testColor = testType?.color || '#3b82f6';

    return (
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: `3px solid ${testColor}`
        }}>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{testType?.title}</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <span style={{
            color: timeLeft < 60 ? '#ef4444' : testColor,
            fontWeight: 'bold',
            fontSize: '1.3rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '10px 20px',
            borderRadius: '20px'
          }}>
            ⏱️ {formatTime()}
          </span>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              height: '100%',
              backgroundColor: testColor,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        <h4 style={{ fontSize: '1.1rem', margin: '20px 0 15px 0' }}>{questions[currentIndex].questionText}</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
          {questions[currentIndex].options.map((opt, i) => {
            const isSelected = selectedAnswers[questions[currentIndex]._id] === opt;
            return (
              <button
                key={i}
                onClick={() => handleOptionSelect(opt)}
                style={{
                  padding: '15px',
                  textAlign: 'left',
                  borderRadius: '10px',
                  border: `2px solid ${isSelected ? testColor : 'var(--border-color)'}`,
                  backgroundColor: isSelected ? `${testColor}15` : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: 'var(--text-main)',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ color: testColor, fontWeight: 'bold', marginRight: '10px' }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(p => p - 1)}
            style={{
              padding: '12px 25px',
              backgroundColor: currentIndex === 0 ? 'var(--text-muted)' : testColor,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              opacity: currentIndex === 0 ? 0.5 : 1
            }}
          >
            ← Previous
          </button>

          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {currentIndex + 1} / {questions.length}
          </span>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(p => p + 1)}
              style={{
                padding: '12px 25px',
                backgroundColor: testColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleTestSubmit}
              style={{
                padding: '12px 25px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Submit ✓
            </button>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 3: Test Completed
  if (testCompleted) {
    const testType = testOptions.find(t => t.id === selectedTest);
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const testColor = testType?.color || '#3b82f6';

    return (
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>🎉 Test Complete!</h2>
          <div style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: testColor,
            marginBottom: '10px'
          }}>
            {score} / {questions.length}
          </div>
          <div style={{
            fontSize: '1.5rem',
            color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f97316' : '#ef4444',
            marginBottom: '20px'
          }}>
            {percentage}% Success Rate
          </div>
          {percentage >= 70 && <p style={{ color: 'var(--text-muted)' }}>🌟 Excellent performance! Keep practicing!</p>}
          {percentage >= 50 && percentage < 70 && <p style={{ color: 'var(--text-muted)' }}>👍 Good effort! Review the solutions and try again.</p>}
          {percentage < 50 && <p style={{ color: 'var(--text-muted)' }}>💪 Don't worry! Practice makes perfect. Try again!</p>}
        </div>

        <h3 style={{ marginBottom: '20px' }}>📋 Answer Review</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', marginBottom: '30px' }}>
          {questions.map((q, idx) => {
            const userAns = selectedAnswers[q._id];
            const isCorrect = userAns === q.correctOption;
            return (
              <div key={q._id} style={{
                padding: '15px',
                border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                borderRadius: '8px',
                backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{isCorrect ? '✅' : '❌'}</span>
                  <strong>Q{idx + 1}. {q.questionText}</strong>
                </div>
                <p style={{ color: isCorrect ? '#10b981' : '#ef4444', margin: '5px 0', fontSize: '0.95rem' }}>
                  Your Answer: {userAns || '[Not Answered]'}
                </p>
                {!isCorrect && (
                  <p style={{ color: '#10b981', margin: '5px 0', fontSize: '0.95rem' }}>
                    Correct Answer: {q.correctOption}
                  </p>
                )}
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '5px', fontSize: '0.9rem', marginTop: '10px' }}>
                  <strong>💡 Solution:</strong> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              setSelectedTest(null);
              setTestCompleted(false);
            }}
            className="submit-btn"
            style={{ backgroundColor: testColor }}
          >
            Take Another Test
          </button>
          <button
            onClick={() => navigate('/gk-tests')}
            className="submit-btn"
            style={{ backgroundColor: 'var(--text-muted)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;