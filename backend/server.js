const express = require("express");                  // Import Express framework
const mongoose = require("mongoose");   
const User = require('./models/User');               // Import Mongoose for MongoDB
console.log("User model loaded:", typeof User === 'function');
const Session = require('./models/Session');         //  Import the real schema

const bcrypt = require("bcryptjs");                  // Import bcrypt for hashing passwords
const cors = require("cors");                        // Import CORS to allow cross-origin requests

const app = express();  // Create Express app instance
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

                             
const port = 8000;                                   // Set server port

app.use(cors());                                     // Enable CORS
app.use(express.json());                             // Enable JSON body parsing

// Connect to MongoDB
const mongoURI = "mongodb+srv://bearjenny0909:Berenice.0909@studynav-cluster.cfjiesj.mongodb.net/studynav";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));




// Route: Signup
app.post('/signup', async (req, res) => {
  console.log("SIGNUP BODY:", req.body);

  const { name, email, password } = req.body;

  // Basic field check
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Respond with success + user ID
    res.status(200).json({ message: "Signup successful", userId: newUser._id });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// Route: Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  res.status(200).json({ message: "Login successful", userId: user._id,
    role: user.role
  });
});

//  Route: Get user document by ID
app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user." });
  }
});

// Route: Update user's session field
app.patch('/users/:userId/session', async (req, res) => {
  const { userId } = req.params;
  const { session } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { session },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user session:", error);
    res.status(500).json({ message: "Failed to update user session." });
  }
});


// Route: Get session document by ID
app.get('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error fetching session." });
  }
});

// Route: Create a new session
app.post('/sessions', async (req, res) => {
  try {
    const {
      ownerName,
      ownerEmail,
      geolocation,
      length,
      timestamp,
      members,
      course
    } = req.body;

    const newSession = new Session({
      ownerName,
      ownerEmail,
      geolocation,
      length,
      timestamp,
      members,
      course
    });

    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    console.error("Failed to create session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Route: Delete a session by ID
app.delete('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const deletedSession = await Session.findByIdAndDelete(sessionId);
    if (!deletedSession) {
      return res.status(404).json({ message: "Session not found." });
    }
    res.status(200).json({ message: "Session deleted." });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Failed to delete session." });
  }
});

// PROFILE ROUTES
// Get user profile data
app.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      program: user.program,
      year: user.year,
      department: user.department,
      position: user.position,
      courses: user.courses || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student profile
app.put('/profile/student/:userId', async (req, res) => {
  try {
    const { name, program, year } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { name, program, year, role: 'student' },
      { new: true }
    );
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update admin profile
app.put('/profile/admin/:userId', async (req, res) => {
  try {
    const { name, department, position, courses } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { name, department, position, courses, role: 'admin' },
      { new: true }
    );
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
