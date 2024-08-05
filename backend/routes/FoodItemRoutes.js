const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const FoodItem = require('../models/FoodItem');

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 'uploads' is the directory where images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create a unique filename
  }
});

// Initialize upload with storage settings
const upload = multer({ storage: storage });

// Route to create a new food item
router.post("/createfoodtocollection", upload.single('foodImage'), async (req, res) => {


  try {
    const { name, description, foodType ,  vendor,} = req.body;
    const foodImage = req.file ? req.file.path : null;

    // Check if all fields are provided
    if (!name || !description || !foodType || !foodImage || !vendor) {
      return res.status(400).json({ message: 'All fields (name, description, foodType, foodImage ,  vendor) are required' });
    }

    const newFoodItem = new FoodItem({
      name,
      description,
      foodType,
      foodImage,
      vendor,
    });

    const savedFoodItem = await newFoodItem.save();
    res.status(201).json({ message: 'Food item added successfully', foodItem: savedFoodItem });
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({ message: "Failed to create food item", error: error.message });
  }
});

// Route to update an existing food item
router.put("/edit/:id", upload.single('foodImage'), async (req, res) => {
  console.log('Received File:', req.file); // Debugging: Log file info
  console.log('Received Body:', req.body); // Debugging: Log form data

  try {
    const { name, description, foodType } = req.body;
    const foodImage = req.file ? req.file.path : req.body.foodImage; // Use new file if uploaded, else keep the old one
    const foodItemId = req.params.id;

    // Check if all fields are provided
    if (!name || !description || !foodType) {
      return res.status(400).json({ message: 'All fields (name, description, foodType) are required' });
    }

    const updatedFoodItem = await FoodItem.findByIdAndUpdate(foodItemId, {
      name,
      description,
      foodType,
      foodImage,
    }, { new: true });

    if (!updatedFoodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.status(200).json({ message: 'Food item updated successfully', foodItem: updatedFoodItem });
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({ message: "Failed to update food item", error: error.message });
  }
});

// Route to delete an existing food item
router.delete("/delete/:id", async (req, res) => {
  try {
    const foodItemId = req.params.id;

    const deletedFoodItem = await FoodItem.findByIdAndDelete(foodItemId);

    if (!deletedFoodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.status(200).json({ message: 'Food item deleted successfully', deletedFoodItem });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({ message: "Failed to delete food item", error: error.message });
  }
});

// Route to get all food items
router.get("/getallfoodcollection", async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.status(200).json(foodItems);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ message: "Failed to fetch food items", error: error.message });
  }
});

// Route to get food items by vendorID
router.get("/getbyvendor/:vendorID", async (req, res) => {
  try {
    const { vendorID } = req.params;
    const foodItems = await FoodItem.find({ vendor: vendorID });

    if (!foodItems.length) {
      return res.status(404).json({ message: 'No food items found for this vendor' });
    }

    res.status(200).json(foodItems);
  } catch (error) {
    console.error('Error fetching food items by vendorID:', error);
    res.status(500).json({ message: "Failed to fetch food items by vendorID", error: error.message });
  }
});


module.exports = router;
