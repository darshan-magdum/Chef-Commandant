const mongoose = require('mongoose');

// Define schema
const BranchCreationSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  companyName: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  branch: { type: String, required: true }
});

// Create model
const BranchCreation = mongoose.model('BranchCreation', BranchCreationSchema);

module.exports = BranchCreation;
