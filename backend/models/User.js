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