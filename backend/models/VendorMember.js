const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorSignup', 
    required: true
  }
});

// Static method to find vendor member by credentials (email and password)
vendorMemberSchema.statics.findByCredentials = async function (email, password) {
  const vendorMember = await this.findOne({ email }).populate('vendor'); // Populate the vendor field

  if (!vendorMember) {
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, vendorMember.password);

  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  return vendorMember;
};

const VendorMemberSignup = mongoose.model('VendorMemberSignup', vendorMemberSchema);

module.exports = { VendorMemberSignup };
