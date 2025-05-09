const mongoose = require("mongoose");

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