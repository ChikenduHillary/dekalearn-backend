const mongoose = require("mongoose");

const CourseHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  platform: { type: String, required: true },
  price: { type: String },
  rating: { type: Number },
  reviews: { type: Number },
  thumbnail: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const CourseHistory = mongoose.model("CourseHistory", CourseHistorySchema);

module.exports = CourseHistory;
