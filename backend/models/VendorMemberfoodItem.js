


const mongoose = require('mongoose');

const vendorMemberFoodItemSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorMember', required: true }, // Assuming vendorId is of type ObjectId and references VendorMember model
    name: { type: String, required: true },
    description: { type: String, required: true },
    foodType: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
    date: { type: Date, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    foodImage: { type: String, required: true },
    location: { 
        type: [String], 
        required: true,
        validate: {
            validator: function(array) {
                return array.length === 1;
            },
            message: 'Location array must contain exactly one value'
        }
    } ,
    status: { 
        type: String, 
        enum: ['Available', 'Finished'], 
        default: 'Available' 
    }
});
const VendorMemberFoodItem = mongoose.model('VendorMemberFoodItem', vendorMemberFoodItemSchema);

module.exports = VendorMemberFoodItem;
