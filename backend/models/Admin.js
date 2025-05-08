const mongoose = require("mongoose");

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