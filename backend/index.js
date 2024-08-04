// index.js

// Import required modules
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require('./routes/auth');
const feedback = require('./routes/feedback');
const fooditemroutes = require('./routes/FoodItemRoutes');
const connection = require("./db"); // Import the database connection function
const adminAuth = require('./routes/adminauth'); // Import the admin authentication middleware
const branchRoutes = require('./routes/branchRoutes');
const UserOrdersRoutes = require('./routes/UserOders');
const vendorAuth = require('./routes/Vendorauth');
const vendormemberAuth = require('./routes/VendorMemberauth');
const vendorMemberFoodRoutes = require('./routes/VendormemberFoodItemRoute');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Database connection
connection();

// Middleware setup
const requireToken = require('./middlewear/requireToken');
const adminToken = require('./middlewear/adminToken');
const vendorToken = require('./middlewear/vendorToken');
const vendormemberToken = require('./middlewear/vendormemberToken');


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));


// Routes setup
app.use("/api/user", authRoutes);
app.use("/api/admin", adminAuth);
app.use("/api/vendor", vendorAuth);
app.use("/api/user/feedback", feedback);
app.use("/api/branchRoutes", branchRoutes);
app.use("/api/fooditemroutes", fooditemroutes);
app.use("/api/vendormember", vendormemberAuth);
app.use("/api/UserOrdersRoutes", UserOrdersRoutes);
app.use("/api/vendorMemberFoodRoutes", vendorMemberFoodRoutes);

// Define the port for the server
const port = process.env.PORT || 3000;

app.get('/',requireToken,(req,res)=>{
  res.send({email:req.user.email})
})
app.get('/admintoken',adminToken,(req,res)=>{
  res.send({email:req.user.email})
})

app.get('/vendorToken',vendorToken,(req,res)=>{
  res.send({email:req.user.email})
})

app.get('/vendormemberToken',vendormemberToken,(req,res)=>{
  res.send({email:req.user.email})
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
