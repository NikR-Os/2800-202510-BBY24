//update user schema if you need to add a field to the User
//document
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  session: { type: String, default: null },
  groupCode: { type: String, default: null },
});

module.exports = mongoose.model("User", userSchema);
