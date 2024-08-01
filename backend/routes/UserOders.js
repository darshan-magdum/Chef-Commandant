const express = require('express');
const router = express.Router();
const UserOrder = require('../models/UserOrder'); // Assuming your model is in models/UserOrder.js
const mongoose = require('mongoose');


// POST route to create a new UserOrder
router.post('/post', async (req, res) => {
  try {
    // Create a new UserOrder instance with data from request body
    const newUserOrder = new UserOrder({
      username: req.body.username,
      userid: req.body.userid,
      userlocation: req.body.userlocation,
      foodname: req.body.foodname,
      usernamecontactno: req.body.usernamecontactno,
      useremailid: req.body.useremailid,
      description: req.body.description,
      quantity: req.body.quantity,
      date: req.body.date,
    });

    // Save the new UserOrder to the database
    const savedUserOrder = await newUserOrder.save();

    res.status(201).json(savedUserOrder); // Respond with the saved UserOrder object
  } catch (err) {
    res.status(400).json({ message: err.message }); // Handle any validation or database errors
  }
});


router.get('/getallorder', async (req, res) => {
    try {
      const userOrders = await UserOrder.find(); // Retrieve all UserOrders from the database
  
      res.json(userOrders); // Respond with JSON array of UserOrder objects
    } catch (err) {
      res.status(500).json({ message: err.message }); // Handle server error
    }
  });

  // GET route to fetch a specific UserOrder by ID


router.get('/:userid', async (req, res) => {
  const { userid } = req.params;

  try {
    // Find all UserOrders that match the userid
    const userOrders = await UserOrder.find({ userid });

    if (userOrders.length === 0) {
      return res.status(404).json({ message: 'No UserOrders found for this userid' });
    }

    res.json(userOrders); // Respond with the found UserOrders array
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



  



  // PUT route to update a specific UserOrder by ID
  router.put('/edit/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Check if the requested ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid UserOrder ID' });
      }
  
      // Find the UserOrder by ID
      const userOrder = await UserOrder.findById(id);
  
      if (!userOrder) {
        return res.status(404).json({ message: 'UserOrder not found' });
      }
  
      // Check if the order was created more than 30 minutes ago
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (userOrder.createdAt <= thirtyMinutesAgo) {
        return res.status(403).json({ message: 'Cannot edit order after 30 minutes' });
      }
  
      // Update the UserOrder with data from req.body
      const updatedUserOrder = await UserOrder.findByIdAndUpdate(id, req.body, { new: true });
  
      if (!updatedUserOrder) {
        return res.status(404).json({ message: 'UserOrder not found' });
      }
  
      res.json({ message: 'UserOrder updated successfully', updatedUserOrder });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  
  // DELETE route to delete a specific UserOrder by ID
  router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Check if the requested ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid UserOrder ID' });
      }
  
      // Find the UserOrder by ID
      const userOrder = await UserOrder.findById(id);
  
      if (!userOrder) {
        return res.status(404).json({ message: 'UserOrder not found' });
      }
  
      // Check if the order was created more than 30 minutes ago
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (userOrder.createdAt <= thirtyMinutesAgo) {
        return res.status(403).json({ message: 'Cannot delete order after 30 minutes' });
      }
  
      // Delete the UserOrder
      const deletedUserOrder = await UserOrder.findByIdAndDelete(id);
  
      if (!deletedUserOrder) {
        return res.status(404).json({ message: 'UserOrder not found' });
      }
  
      res.json({ message: 'UserOrder deleted successfully' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  

module.exports = router;
