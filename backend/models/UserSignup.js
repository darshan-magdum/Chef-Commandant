const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  password: String,
});

const UserSignup = mongoose.model('UserSignup', userSchema);

module.exports = { UserSignup };
