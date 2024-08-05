const mongoose = require('mongoose');
const { VendorSignup } = require('./VendorSignup');

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    foodType: { type: String, required: true },
    foodImage: { type: String, required: true },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorSignup', // Reference to VendorSignup model
        required: true
    }
});
  
const FoodItem = mongoose.model('FoodItem', foodItemSchema);

module.exports = FoodItem;
