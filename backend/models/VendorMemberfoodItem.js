


const mongoose = require('mongoose');

const vendorMemberFoodItemSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorMember', required: true }, // Assuming vendorId is of type ObjectId and references VendorMember model
    name: { type: String, required: true },
    description: { type: String, required: true },
    foodType: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
    date: { type: Date, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    foodImage: { type: String, required: true }
});
const VendorMemberFoodItem = mongoose.model('VendorMemberFoodItem', vendorMemberFoodItemSchema);

module.exports = VendorMemberFoodItem;
