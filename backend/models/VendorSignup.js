const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  mobile: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please fill a valid mobile number'],
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  locations: {
    type: [String],
    default: [],
    required: true
  }
});

// Static method to find vendor by credentials (email and password)
vendorSchema.statics.findByCredentials = async function (email, password) {
  const vendor = await this.findOne({ email });

  if (!vendor) {
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, vendor.password);

  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  return vendor;
};

const VendorSignup = mongoose.model('VendorSignup', vendorSchema);

module.exports = { VendorSignup };
