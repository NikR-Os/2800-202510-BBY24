require("dotenv").config(); 
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");                  // Import Express framework
const mongoose = require("mongoose");   
const Student = require('./models/Student');        // Import Mongoose for MongoDB (student schema)
const User = require('./models/User');         // Import Mongoose for MongoDB (student schema)
console.log("User model loaded:", typeof Student === 'function');
const Admin = require('./models/Admin');             // Import Mongoose for MongoDB (admin schema)
console.log("User model loaded:", typeof Admin === 'function');   
const Session = require('./models/Session');         //  Import the real schema
const bcrypt = require("bcryptjs");                  // Import bcrypt for hashing passwords
const cors = require("cors");                        // Import CORS to allow cross-origin requests
const multer = require("multer");                  // Import multer for file uploads
const path = require("path");                      // Import path for file paths
const app = express();  // Create Express app instance
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/../'));
                             
const port = process.env.PORT || 8000; //  .env port or fallback to 8000
app.use(cors());                                     // Enable CORS

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


// Route: Signup
app.post('/signup', async (req, res) => {
  console.log("SIGNUP BODY:", req.body);
  const { name, email, password } = req.body;

  // Basic field check
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const type = req.query.type;
  let role;

  if(type === "student")
  {
    role = Student;
  }
  else if (type === "admin")
  {
    role = Admin;
  }
  else
  {
    return res.status(410).json({ message: "Invalid type"});
  }

  try {
    // Check if user already exists
    const existingUserEmail = await role.findOne({ email });
    const existingUserName = await role.findOne({ name })
    if (existingUserEmail ||
        existingUserName) 
    {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new role({
      name,
      email,
      password: hashedPassword,
      role: type
    });

    await newUser.save();

    // Respond with success + user ID
    res.status(200).json({ message: "Signup successful", userId: newUser._id , role:type, name: newUser.name });
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
  res.status(200).json({ userId: user._id, name: user.name, role: user.role});
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

// Route: Create a new session(Add information to Session schema)
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

// Route: Get all sessions
app.get('/sessions', async (req, res) => {
    try {
        const sessions = await Session.find();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sessions." });
    }
});

// Start server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }

});

const connectedUsers = {}; // { username: socketId }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle registration of a connected user
  // The client sends their username after fetching it from the database
  socket.on("register", (username) => {
    if (!connectedUsers[username]) {
      connectedUsers[username] = [];
    }

    // Add this socket to the list of the user's active connections
    connectedUsers[username].push(socket.id);

    console.log(`Registered: ${username} with socket ID: ${socket.id}`);
    console.log("Connected users now:", connectedUsers);
  });

  // Handle incoming private messages
  socket.on("private message", async ({ toUsername, fromUserId, message }) => {
    try {
      const sender = await User.findById(fromUserId);
      if (!sender) {
        console.warn("Sender not found in DB:", fromUserId);
        return;
      }

      const fromUsername = sender.name;
      console.log("Message from", fromUsername, "to", toUsername, ":", message);

      // Look up all active socket IDs for the recipient
      const targetSocketIds = connectedUsers[toUsername] || [];
      console.log("Target socket IDs for recipient:", targetSocketIds);

      if (targetSocketIds.length > 0) {
        targetSocketIds.forEach((id) => {
          // Deliver the message to each active tab/window of the recipient
          io.to(id).emit("private message", { message, fromUsername });
        });
      } else {
        console.warn("No active socket ID found for recipient:", toUsername);
      }
    } catch (error) {
      console.error("Error processing private message:", error);
    }
  });

  // When a user disconnects, remove their socket from the connectedUsers map
  socket.on("disconnect", () => {
    for (const [username, socketIds] of Object.entries(connectedUsers)) {
      connectedUsers[username] = socketIds.filter((id) => id !== socket.id);

      // If the user has no more active sockets, clean up the entry
      if (connectedUsers[username].length === 0) {
        delete connectedUsers[username];
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// PROFILE ROUTES
// Get user profile data (Student or Admin)
app.get('/profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check student first
    const student = await Student.findById(id);
    if (student) {
      return res.json({
        name: student.name,
        email: student.email,
        role: student.role || 'student', // Ensure role exists
        program: student.program,
        year: student.year,
        courses: student.courses || []
      });
    }

    // Then check admin
    const admin = await Admin.findById(id);
    if (admin) {
      return res.json({
        name: admin.name,
        email: admin.email,
        role: admin.role || 'admin', // Ensure role exists
        department: admin.department,
        position: admin.position,
        courses: admin.courses || []
      });
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to update profile (Student or Admin)
const updateProfile = async (model, id, updates) => {
  try {
    const updatedUser = await model.findOneAndUpdate({ _id: id }, updates, { new: true });
    if (!updatedUser) {
      return null; // Not found
    }
    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update student profile
app.put('/profile/student/:id', async (req, res) => {
  const { id } = req.params;
  const { name, program, year, courses } = req.body;

  try {
    const updatedStudent = await updateProfile(Student, id, { name, program, year, courses });
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update admin profile
app.put('/profile/admin/:id', async (req, res) => {
  const { id } = req.params;
  const { name, department, position, courses } = req.body;

  try {
    const updatedAdmin = await updateProfile(Admin, id, { name, department, position, courses });
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(updatedAdmin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload profile image
app.post('/profile/:id/image', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const imageData = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    // Update student or admin with the image
    const studentUpdate = await Student.findByIdAndUpdate(id, { image: imageData }, { new: true });
    if (studentUpdate) {
      return res.status(200).json({ message: 'Image uploaded successfully' });
    }

    const adminUpdate = await Admin.findByIdAndUpdate(id, { image: imageData }, { new: true });
    if (adminUpdate) {
      return res.status(200).json({ message: 'Image uploaded successfully' });
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get profile image
app.get('/profile/:id/image', async (req, res) => {
  const { id } = req.params;

  try {
    // Check student first
    const student = await Student.findById(id);
    if (student && student.image) {
      res.set('Content-Type', student.image.contentType);
      return res.send(student.image.data);
    }

    // Then check admin
    const admin = await Admin.findById(id);
    if (admin && admin.image) {
      res.set('Content-Type', admin.image.contentType);
      return res.send(admin.image.data);
    }

    // Return default image if no image found
    const defaultImagePath = path.join(__dirname,  'images', 'default.avif');
    return res.sendFile(defaultImagePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Profile Deletion Route
app.delete('/profile/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid user ID format' 
    });
  }

  try {
    // Try deleting as student first
    const deletedStudent = await Student.findByIdAndDelete(id);
    
    // If not found as student, try as admin
    if (!deletedStudent) {
      const deletedAdmin = await Admin.findByIdAndDelete(id);
      if (!deletedAdmin) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found in either Student or Admin collections' 
        });
      }
    }

    // Success response
    return res.status(200).json({ 
      success: true,
      message: 'Profile deleted successfully' 
    });

  } catch (error) {
    console.error("Profile deletion error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during profile deletion',
      error: error.message 
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
