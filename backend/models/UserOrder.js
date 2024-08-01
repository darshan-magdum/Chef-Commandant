const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schema
const UserOrderSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100
  },
  userid: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  userlocation: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  foodname: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  usernamecontactno: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/, // Regex pattern for 10-digit number
    maxlength: 10
  },
  useremailid: {
    type: String,
    required: true,
    lowercase: true, // Ensure email is stored in lowercase
    trim: true, // Trim whitespace
    validate: {
      validator: function(v) {
        // Basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: Date,
    required: true,
    default: Date.now // Default to current timestamp
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Create model
const UserOrder = mongoose.model('UserOrder', UserOrderSchema);

module.exports = UserOrder;
