const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const vendorMemberSchema = new mongoose.Schema({
  locations: {
    type: [String],
    default: [],
    required: true
  },
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

});

// Static method to find vendor by credentials (email and password)
vendorMemberSchema.statics.findByCredentials = async function (email, password) {
  const vendorempolyee = await this.findOne({ email });

  if (!vendorempolyee) {
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, vendorempolyee.password);

  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  return vendorempolyee;
};

const VendorMemberSignup = mongoose.model('VendorMemberSignup', vendorMemberSchema);

module.exports = { VendorMemberSignup };
