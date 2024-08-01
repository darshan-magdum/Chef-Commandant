const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { jwtkey } = require('../keys');

const AdminSignup = require('../models/AdminSignup');

const mongoose = require('mongoose');

// Validation schema for admin login using Joi
const loginSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password'),
});

// Validation schema for updating admin details using Joi
const updateSchema = Joi.object({
  companyName: Joi.string().required().label('Company Name'),
  contactNo: Joi.string().required().label('Contact Number'),
  newPassword: Joi.string().optional().label('New Password'),
});

// Route: POST /admin/login
// routes/adminAuth.js

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body using Joi
    const { error } = loginSchema.validate({ email, password });
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // Find admin by email in the database
    let admin = await AdminSignup.findOne({ email });
    if (!admin) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Validate password using bcrypt
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Admin authenticated, generate JWT token
    const token = jwt.sign({ adminId: admin._id }, jwtkey);

    // Return the token and any additional data you may need
    res.status(200).send({ token, adminId: admin._id, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


// Route: GET /admin/:id
router.get('/:id', async (req, res) => {
  try {
    const adminId = req.params.id;

    // Validate if adminId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).send({ message: 'Invalid admin ID' });
    }

    // Find admin by ID in the database
    const admin = await AdminSignup.findById(adminId);

    // Check if admin exists
    if (!admin) {
      return res.status(404).send({ message: 'Admin not found' });
    }

    // Return admin details (excluding password)
    res.status(200).send({
      adminId: admin._id,
      companyName: admin.companyName,
      email: admin.email,
      contactNo: admin.contactNo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route: PUT /admin/:id
// routes/adminAuth.js

// Route: PUT /admin/:id
router.put('/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const { companyName, contactNo } = req.body;

    // Validate request body using Joi
    const { error } = updateSchema.validate({ companyName, contactNo });
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // Find admin by ID in the database
    const admin = await AdminSignup.findById(adminId);
    if (!admin) {
      return res.status(404).send({ message: 'Admin not found' });
    }

    // Update admin details
    admin.companyName = companyName;
    admin.contactNo = contactNo;

    // Save the updated admin details
    await admin.save();

    // Return updated admin details
    res.status(200).send({
      adminId: admin._id,
      companyName: admin.companyName,
      email: admin.email,
      contactNo: admin.contactNo,
      message: 'Admin details updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



// Route: PUT /admin/password/:id
router.put('/password/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const { newPassword } = req.body;

    // Validate request body using Joi
    const schema = Joi.object({
      newPassword: Joi.string().min(6).required().label('New Password'),
    });

    const { error } = schema.validate({ newPassword });
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // Find admin by ID in the database
    const admin = await AdminSignup.findById(adminId);
    if (!admin) {
      return res.status(404).send({ message: 'Admin not found' });
    }

    // Update password using bcrypt
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);

    // Save the updated admin details
    await admin.save();

    // Return success message
    res.status(200).send({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});




module.exports = router;
