const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  session: { type: String, default: null },
  groupCode: { type: String, default: null },
  role:{type: String, enum: ['student', 'admin'], required: true},
  //Student specific fields
  program: String,
  year: Number,
  //admin specific fields
  department: String,
  position: String,
  courses: [String]
});

module.exports = mongoose.model("User", userSchema);

const studentSchema = new mongoose.Schema({
  name: 
  {
    type: String,
    required: true
  },  
  email: 
  {
    type: String,
    required: true
  },
  password:
  {
    type: String,
    required: true
  },
  session:
  {
    type: String,
    default: null
  },
  groupCode:
  {
    type: String,
    default: null
  },
  role:
  {
    type: String,
    enum: ['admin', 'student'],
    default: 'student',
    required: true
  },
  program:
  {
    type: String,
    default: 'unregistered',
    required: true
  },
  courses: 
  {
    type: [String],
    default: null
  },
  year:
  {
    type: Number,
    default: 1,
    required: true
  }  
});

module.exports = mongoose.model("Student", studentSchema);

const adminSchema = new mongoose.Schema({
  name: 
  {
    type: String,
    required: true
  },  
  email: 
  {
    type: String,
    required: true
  },
  password:
  {
    type: String,
    required: true
  },
  session:
  {
    type: String,
    default: null
  },
  groupCode:
  {
    type: String,
    default: null
  },
  role:
  {
    type: String,
    enum: ['admin', 'student'],
    default: 'admin',
    required: true
  },
  department:
  {
    type: String,
    default: null
  },
  position:
  {
    type: String,
    default: 'unassigned',
    required: true
  }
});  

module.exports = mongoose.model("Admin", adminSchema);