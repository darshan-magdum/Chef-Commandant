const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { jwtkey } = require('../keys');
const { VendorSignup } = require('../models/VendorSignup'); // Adjust import as per your project structure
const mongoose = require('mongoose');

// Validation schema for signup using Joi
const vendorSignupSchema = Joi.object({
  name: Joi.string().required().label('Name'),
  email: Joi.string().email().required().label('Email'),
  mobile: Joi.string().required().label('Mobile'),
  password: Joi.string().required().label('Password'),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().label('Confirm Password')
    .messages({ 'any.only': 'Passwords must match' }),
  locations: Joi.array().items(Joi.string()).label('Locations')
});


// Route: POST /vendor/signup
router.post('/signup', async (req, res) => {
  try {
    // Validate request body using Joi
    const { error } = vendorSignupSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const { name, email, mobile, password, locations } = req.body;

    // Check if vendor already exists by mobile number
    let existingVendor = await VendorSignup.findOne({ mobile });

    if (existingVendor) {
      // Vendor with the same mobile number already exists
      return res.status(400).send({ message: 'Vendor already exists with this mobile number' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new vendor instance
    const newVendor = new VendorSignup({
      name,
      email,
      mobile,
      password: hashedPassword,
      locations
    });

    // Save the new vendor to the database
    await newVendor.save();

    // Generate JWT token
    const token = jwt.sign({ vendorId: newVendor._id }, jwtkey);

    // Return token and vendor ID
    res.status(201).send({ token, vendorId: newVendor._id, message: 'Vendor registered successfully' });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      // Duplicate key error (mobile number already exists)
      return res.status(400).send({ message: `Vendor already exists with mobile number: ${error.keyValue.mobile}` });
    } else {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
});



// Validation schema for login using Joi
const vendorLoginSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password')
});

// Route: POST /vendor/login
router.post('/login', async (req, res) => {
  try {
    // Validate request body using Joi
    const { error } = vendorLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find vendor by credentials
    const vendor = await VendorSignup.findByCredentials(email, password);

    // Generate JWT token
    const token = jwt.sign({ vendorId: vendor._id }, jwtkey);

    // Return token and vendor ID
    res.status(200).send({ token, vendorId: vendor._id, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Invalid email or password') {
      return res.status(401).send({ message: 'Invalid email or password' });
    } else {
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
});


// Route: GET /vendor/:id
router.get('/vendor/:id', async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Validate if vendorId is a valid ObjectId (assuming MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).send({ message: 'Invalid vendor ID' });
    }

    // Find vendor by ID in the database
    const vendor = await VendorSignup.findById(vendorId);

    // Check if vendor exists
    if (!vendor) {
      return res.status(404).send({ message: 'Vendor not found' });
    }

    // Return vendor details (name, email, mobile, locations)
    res.status(200).send({
      vendorId: vendor._id,
      name: vendor.name,
      email: vendor.email,
      mobile: vendor.mobile,
      locations: vendor.locations
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Validation schema for updating vendor details using Joi
const vendorUpdateSchema = Joi.object({
  name: Joi.string().required().label('Name'),
  mobile: Joi.string().required().label('Mobile'),
  locations: Joi.array().items(Joi.string()).label('Locations')
});

// Route: PUT /vendor/:id
router.put('/:id', async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { name, mobile, locations } = req.body;

    // Validate request body using Joi
    const { error } = vendorUpdateSchema.validate({ name, mobile, locations });
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // Check if mobile number is already used by another vendor
    const existingVendor = await VendorSignup.findOne({ mobile, _id: { $ne: vendorId } });
    if (existingVendor) {
      return res.status(400).send({ message: 'Mobile number is already associated with another vendor' });
    }

    // Update vendor details in the database
    const updatedVendor = await VendorSignup.findByIdAndUpdate(
      vendorId,
      { name, mobile, locations },
      { new: true } // To return the updated document
    );

    if (!updatedVendor) {
      return res.status(404).send({ message: 'Vendor not found' });
    }

    // Return updated vendor details
    res.status(200).send({
      vendorId: updatedVendor._id,
      name: updatedVendor.name,
      email: updatedVendor.email,
      mobile: updatedVendor.mobile,
      locations: updatedVendor.locations,
      message: 'Vendor details updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route: GET /vendor (get all vendors)
// Route: GET /vendor/getallvendor
router.get('/getallvendor', async (req, res) => {
  try {
    // Fetch all vendors from the database, excluding the password field
    const vendors = await VendorSignup.find({}, { password: 0 });

    // Return array of vendors
    res.status(200).json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Route: DELETE /vendor/:id
router.delete('/:id', async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Validate if vendorId is a valid ObjectId (assuming MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).send({ message: 'Invalid vendor ID' });
    }

    // Find and delete the vendor by ID in the database
    const deletedVendor = await VendorSignup.findByIdAndDelete(vendorId);

    if (!deletedVendor) {
      return res.status(404).send({ message: 'Vendor not found' });
    }

    // Return success message
    res.status(200).send({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


module.exports = router;
