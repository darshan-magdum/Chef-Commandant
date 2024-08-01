const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem'); // Adjust the path as per your project structure

// Route to create a new food item
router.post("/create", async (req, res) => {
  try {
    const { name, description, foodType } = req.body;

    // Check if all fields are provided
    if (!name || !description || !foodType) {
      return res.status(400).json({ message: 'All fields (name, description, foodType) are required' });
    }

    const newFoodItem = new FoodItem({
      name,
      description,
      foodType,
    });

    const savedFoodItem = await newFoodItem.save();
    res.status(201).json({ message: 'Food item added successfully', foodItem: savedFoodItem });
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({ message: "Failed to create food item", error: error.message });
  }
});

// Route to update an existing food item
router.put("/edit/:id", async (req, res) => {
  try {
    const { name, description, foodType } = req.body;
    const foodItemId = req.params.id;

    // Check if all fields are provided
    if (!name || !description || !foodType) {
      return res.status(400).json({ message: 'All fields (name, description, foodType) are required' });
    }

    const updatedFoodItem = await FoodItem.findByIdAndUpdate(foodItemId, {
      name,
      description,
      foodType,
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

module.exports = router;
