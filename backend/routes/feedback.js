// Assuming you have set up your Express server and imported necessary modules
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); // Import Feedback model

// POST route to submit feedback
router.post('/submit-feedback', async (req, res) => {
  try {
    const { userId, username, mobile, type, description } = req.body;

    // Validate input
    if (!userId || !username || !mobile || !type || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save feedback to database (using Mongoose or other ORM)
    const feedback = new Feedback({
      userId,
      username,
      mobile,
      type,
      description,
    });

    await feedback.save();

    // Respond with success
    return res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// GET route to fetch all feedback
router.get('/get-all-feedback', async (req, res) => {
  try {
    // Fetch all feedback entries from database
    const allFeedback = await Feedback.find();

    // Respond with fetched feedback entries
    return res.status(200).json(allFeedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// DELETE route to delete a specific feedback entry by ID
router.delete('/delete-feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: 'Feedback ID is required' });
    }

    // Find feedback by ID and delete it
    await Feedback.findByIdAndDelete(id);

    // Respond with success message
    return res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({ message: 'Failed to delete feedback' });
  }
});

module.exports = router;
