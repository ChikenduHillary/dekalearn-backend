const express = require('express');
const router = express.Router();
const CourseHistory = require('../models/courseHistory');

// POST: Store course history
router.post('/', async (req, res) => {
  const {
    userId,
    courseId,
    title,
    url,
    platform,
    price,
    rating,
    reviews,
    thumbnail,
  } = req.body;

  if (!userId || !courseId || !title || !url || !platform) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if this course was already viewed by the user recently (within 24 hours)
    const existingEntry = await CourseHistory.findOne({
      userId,
      courseId,
      timestamp: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    });

    if (existingEntry) {
      // Update the timestamp of the existing entry
      existingEntry.timestamp = new Date();
      await existingEntry.save();
    } else {
      // Insert new history entry
      await CourseHistory.create({
        userId,
        courseId,
        title,
        url,
        platform,
        price,
        rating,
        reviews,
        thumbnail,
        timestamp: new Date(),
      });
    }

    res.status(200).json({ message: 'Course history saved successfully' });
  } catch (error) {
    console.error('Error saving course history:', error);
    res.status(500).json({ error: 'Failed to save course history' });
  }
});

// GET: Retrieve course history for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;
  const limit = parseInt(req.query.limit || '10');
  const page = parseInt(req.query.page || '1');

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await CourseHistory.countDocuments({ userId });

    // Get paginated history entries
    const history = await CourseHistory.find({ userId })
      .sort({ timestamp: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      history,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error retrieving course history:', error);
    res.status(500).json({ error: 'Failed to retrieve course history' });
  }
});

// DELETE: Clear course history for a user
router.delete('/', async (req, res) => {
  const { userId, courseId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const query = courseId ? { userId, courseId } : { userId };
    const result = await CourseHistory.deleteMany(query);

    res.status(200).json({
      message: 'Course history deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting course history:', error);
    res.status(500).json({ error: 'Failed to delete course history' });
  }
});

module.exports = router;