const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { jwtkey } = require('../keys');
const { VendorMemberSignup } = require('../models/VendorMember'); // Adjust import as per your project structure
const mongoose = require('mongoose');

// Validation schema for signup using Joi
const vendorMemberSchema = Joi.object({
  name: Joi.string().required().label('Name'),
  email: Joi.string().email().required().label('Email'),
  mobile: Joi.string().required().label('Mobile'),
  password: Joi.string().required().label('Password'),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().label('Confirm Password')
    .messages({ 'any.only': 'Passwords must match' }),
  locations: Joi.array().items(Joi.string()).label('locations'),
  vendor: Joi.string().label('Vendor')
});

// Route: POST /vendormember/signup
router.post('/signup', async (req, res) => {
  try {
    // Validate request body using Joi
    const { error } = vendorMemberSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const { name, email, mobile, password, locations, vendor } = req.body;

    // Check if vendor member already exists by mobile number
    let existingVendorMember = await VendorMemberSignup.findOne({ mobile });

    if (existingVendorMember) {
      // Vendor member with the same mobile number already exists
      return res.status(400).send({ message: 'Vendor member already exists with this mobile number' });
    }

    // Check if vendor member already exists by email
    let existingVendorMemberByEmail = await VendorMemberSignup.findOne({ email });

    if (existingVendorMemberByEmail) {
      // Vendor member with the same email already exists
      return res.status(400).send({ message: 'Vendor member already exists with this email' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new vendor member instance
    const newVendorMember = new VendorMemberSignup({
      name,
      email,
      mobile,
      password: hashedPassword,
      locations,
      vendor
    });

    // Save the new vendor member to the database
    await newVendorMember.save();

    // Generate JWT token
    const token = jwt.sign({ vendorMemberId: newVendorMember._id }, jwtkey);

    // Return token and vendor member ID
    res.status(201).send({ token, vendorMemberId: newVendorMember._id, message: 'Vendor member registered successfully' });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      if (error.keyPattern.mobile) {
        // Duplicate key error (mobile number already exists)
        return res.status(400).send({ message: `Vendor member already exists with mobile number: ${error.keyValue.mobile}` });
      } else if (error.keyPattern.email) {
        // Duplicate key error (email already exists)
        return res.status(400).send({ message: `Vendor member already exists with email: ${error.keyValue.email}` });
      }
    } else {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
});



// Validation schema for login using Joi
const vendorMemberLoginSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password')
});

// Route: POST /vendormember/login
router.post('/login', async (req, res) => {
  try {
    // Validate request body using Joi
    const { error } = vendorMemberLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find vendor member by credentials
    const vendorMember = await VendorMemberSignup.findByCredentials(email, password);

    // Generate JWT token
    const token = jwt.sign({ vendorMemberId: vendorMember._id }, jwtkey);

    // Return token and vendor member ID
    res.status(200).send({ token, vendorMemberId: vendorMember._id, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Invalid email or password') {
      return res.status(401).send({ message: 'Invalid email or password' });
    } else {
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
});

// Route: GET /vendormember/:id


// Validation schema for updating vendor member details using Joi
const vendorMemberUpdateSchema = Joi.object({
  name: Joi.string().required().label('Name'),
  mobile: Joi.string().required().label('Mobile'),
  locations: Joi.array().items(Joi.string()).label('location')
});

// Route: PUT /vendormember/:id
router.put('/:id', async (req, res) => {
  try {
    const vendorMemberId = req.params.id;
    const { name, mobile, locations } = req.body;

    // Validate request body using Joi
    const { error } = vendorMemberUpdateSchema.validate({ name, mobile, locations });
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // Check if mobile number is already used by another vendor member
    const existingVendorMember = await VendorMemberSignup.findOne({ mobile, _id: { $ne: vendorMemberId } });
    if (existingVendorMember) {
      return res.status(400).send({ message: 'Mobile number is already associated with another vendor member' });
    }

    // Update vendor member details in the database
    const updatedVendorMember = await VendorMemberSignup.findByIdAndUpdate(
      vendorMemberId,
      { name, mobile, locations },
      { new: true } // To return the updated document
    );

    if (!updatedVendorMember) {
      return res.status(404).send({ message: 'Vendor member not found' });
    }

    // Return updated vendor member details
    res.status(200).send({
      vendorMemberId: updatedVendorMember._id,
      name: updatedVendorMember.name,
      email: updatedVendorMember.email,
      mobile: updatedVendorMember.mobile,
      locations: updatedVendorMember.locations,
      message: 'Vendor member details updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route: GET /vendormember (get all vendor members)
// Route: GET /vendormember/getallmembers


router.get('/getallmembers', async (req, res) => {
  try {
    // Fetch all vendors from the database, excluding the password field
    const vendorMembers = await VendorMemberSignup.find({}, { password: 0 });

    // Return array of vendors
    res.status(200).json(vendorMembers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vendorMemberId = req.params.id;

    // Validate if vendorMemberId is a valid ObjectId (assuming MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(vendorMemberId)) {
      return res.status(400).send({ message: 'Invalid vendor member ID' });
    }

    // Find vendor member by ID in the database
    const vendorMember = await VendorMemberSignup.findById(vendorMemberId);

    // Check if vendor member exists
    if (!vendorMember) {
      return res.status(404).send({ message: 'Vendor member not found' });
    }

    // Return vendor member details (name, email, mobile, locations)
    res.status(200).send({
      vendorMemberId: vendorMember._id,
      name: vendorMember.name,
      email: vendorMember.email,
      mobile: vendorMember.mobile,
      locations: vendorMember.locations
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route: DELETE /vendormember/:id
router.delete('/:id', async (req, res) => {
  try {
    const vendorMemberId = req.params.id;

    // Validate if vendorMemberId is a valid ObjectId (assuming MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(vendorMemberId)) {
      return res.status(400).send({ message: 'Invalid vendor member ID' });
    }

    // Find and delete the vendor member by ID in the database
    const deletedVendorMember = await VendorMemberSignup.findByIdAndDelete(vendorMemberId);

    if (!deletedVendorMember) {
      return res.status(404).send({ message: 'Vendor member not found' });
    }

    // Return success message
    res.status(200).send({ message: 'Vendor member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


// Route: GET /vendormember/byvendor/:vendorId
router.get('/byvendor/:vendorId', async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    // Validate if vendorId is a valid ObjectId (assuming MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).send({ message: 'Invalid vendor ID' });
    }

    // Find vendor members associated with the provided vendor ID
    const vendorMembers = await VendorMemberSignup.find({ vendor: vendorId }).select('-password'); // Exclude password from response

    // Check if any vendor members were found
    if (vendorMembers.length === 0) {
      return res.status(404).send({ message: 'No vendor members found for this vendor' });
    }

    // Return the list of vendor members
    res.status(200).json(vendorMembers);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
