const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    geolocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    length: { type: String, required: true },
    timestamp: { type: Date, required: true },
    members: [{ type: String, required: true }], // Array of userIds
    course: { type: String, default: null },
    courses: { type: [String], default: [] },
    program: { type: String, required: true },
    subject: {type: String, default: null}
});

module.exports = mongoose.model("Session", sessionSchema);
