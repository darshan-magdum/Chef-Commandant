require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const AdminSignup = require('../models/AdminSignup'); // Corrected import

const mongoURL = process.env.DB;

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    // Create an admin instance using .env variables
    const admin = new AdminSignup({
      companyName: process.env.COMPANY_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      contactNo: process.env.CONTACT_NO
    });

    // Hash the password before saving
    try {
      await admin.changePassword(admin.password); 
      await admin.save();
      console.log('Admin successfully inserted');
    } catch (err) {
      console.error('Error inserting admin:', err.message);
    }

    // Close the connection
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
  });
