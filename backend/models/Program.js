
//Here's the structure of the Program schema so you know what fields 
// the form should collect when a teacher creates a program group for students:
//a route to this still needs to be created in server.js and connected
//to the database

const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  // Program name (e.g., "Web Dev Bootcamp")
  name: {
    type: String,
    required: true
  },

  // List/array of course codes or titles in the program
  courses: [{
    type: String,
    required: true
  }],

  // Estimated number of students expected to join
  numberOfStudents: {
    type: Number,
    required: true
  },

  // Code for students to enter before joining
  code: {
    type: String,
    required: false
  },

  // Timestamp of when the program was created
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Duration (e.g., 12 for "12 weeks") to track lifespan
  length: {
    type: Number,
    required: true // measured in weeks
  }
});

module.exports = mongoose.model('Program', programSchema);
