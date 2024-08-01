const express = require('express');
const router = express.Router();
const VendorMemberFoodItem = require('../models/VendorMemberfoodItem'); // Adjust path as needed

// POST route to create a new vendor member food item
router.post('/addfooditem', async (req, res) => {
  try {
    const { vendorId, name, description, foodType, date, price, category } = req.body;
    const errors = {};

    // Validate each required field
    if (!vendorId) {
      errors.vendorId = 'Vendor ID is required';
    }
    if (!name) {
      errors.name = 'Name is required';
    }
    if (!description) {
      errors.description = 'Description is required';
    }
    if (!foodType) {
      errors.foodType = 'Food type is required';
    }
    if (!date) {
      errors.date = 'Date is required';
    }
    if (!price) {
      errors.price = 'Price is required';
    }
    if (!category) {
      errors.category = 'Category is required';
    }

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Create a new instance of VendorMemberFoodItem
    const newVendorMemberFoodItem = new VendorMemberFoodItem({
      vendorId,
      name,
      description,
      foodType,
      date,
      price,
      category
      // Add other fields as needed
    });

    // Save the new vendor member food item to the database
    await newVendorMemberFoodItem.save();

    // Respond with a success message and the created vendor member food item
    res.status(201).json({ message: 'Food item created successfully', vendorMemberFoodItem: newVendorMemberFoodItem });
  } catch (err) {
    // Handle any unexpected errors that occur during the creation process
    console.error('Error creating food item:', err);
    res.status(500).json({ error: 'Failed to create food item' });
  }
});

// GET route to fetch a vendor member food item by vendorId
router.get('/getfooditems/:vendorId', async (req, res) => {
  const { vendorId } = req.params;

  try {
    // Query the database for all food items with the specified vendorId
    const foodItems = await VendorMemberFoodItem.find({ vendorId });

    if (foodItems.length === 0) {
      return res.status(404).json({ error: 'No food items found for this vendorId' });
    }

    // Respond with the found food items
    res.status(200).json(foodItems);
  } catch (err) {
    console.error('Error fetching food items:', err);
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});


router.delete('/deletefooditem/:foodItemId', async (req, res) => {
  const { foodItemId } = req.params;

  try {
    // Attempt to delete the food item by its _id
    const deletedItem = await VendorMemberFoodItem.findByIdAndDelete(foodItemId);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (err) {
    console.error('Error deleting food item:', err);
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

// PUT route to edit/update a vendor member food item by foodItemId
router.put('/editfooditem/:foodItemId', async (req, res) => {
  const { foodItemId } = req.params;

  try {
    // Check if foodItemId is provided
    if (!foodItemId) {
      return res.status(400).json({ error: 'Food item ID is required' });
    }

    // Retrieve updated fields from request body
    const { vendorId, name, description, foodType, date, price, category } = req.body;

    // Validate if any required fields are missing
    const errors = {};
    if (!vendorId) {
      errors.vendorId = 'Vendor ID is required';
    }
    if (!name) {
      errors.name = 'Name is required';
    }
    if (!description) {
      errors.description = 'Description is required';
    }
    if (!foodType) {
      errors.foodType = 'Food type is required';
    }
    if (!date) {
      errors.date = 'Date is required';
    }
    if (!price) {
      errors.price = 'Price is required';
    }
    if (!category) {
      errors.category = 'Category is required';
    }

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Find the food item by ID and update it
    const updatedItem = await VendorMemberFoodItem.findByIdAndUpdate(foodItemId, {
      vendorId,
      name,
      description,
      foodType,
      date,
      price,
      category
    }, { new: true }); // { new: true } ensures the updated document is returned

    // Check if the food item was found and updated
    if (!updatedItem) {
      return res.status(404).json({ error: 'Food item not found or could not be updated' });
    }

    // Respond with a success message and the updated food item
    res.status(200).json({ message: 'Food item updated successfully', vendorMemberFoodItem: updatedItem });
  } catch (err) {
    console.error('Error updating food item:', err);
    res.status(500).json({ error: 'Failed to update food item' });
  }
});


module.exports = router;
