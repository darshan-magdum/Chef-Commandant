const express = require('express');
const router = express.Router();
const BranchCreation = require('../models/BranchCreation');

// POST route - Create a new branch
router.post('/addbranch', async (req, res) => {
  const { adminId, branch, city, companyName, country } = req.body;

  try {
    const newBranch = new BranchCreation({
      adminId,
      branch,
      city,
      companyName,
      country,
    });

    const savedBranch = await newBranch.save();
    res.status(201).json(savedBranch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route - Retrieve all branches
router.get('/viewallbranch', async (req, res) => {
  try {
    const branches = await BranchCreation.find();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT route - Update a branch by ID
router.put('/editbranch/:id', async (req, res) => {
  const { id } = req.params;
  const { country, city, branch } = req.body;

  try {
    const updatedBranch = await BranchCreation.findByIdAndUpdate(
      id,
      { country, city, branch },
      { new: true }
    );

    if (!updatedBranch) return res.status(404).json({ message: 'Branch not found' });

    res.json(updatedBranch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE route - Delete a branch by ID
router.delete('/deletebranch/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBranch = await BranchCreation.findByIdAndDelete(id);
    if (!deletedBranch) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
