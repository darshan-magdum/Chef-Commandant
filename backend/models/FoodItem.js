const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    foodType: { type: String, required: true }
});
  
const FoodItem = mongoose.model('FoodItem', foodItemSchema);

module.exports = FoodItem;
