// Script to make a user an admin
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Email of the user to update
const EMAIL_TO_UPDATE = process.argv[2];

if (!EMAIL_TO_UPDATE) {
  console.error('Please provide an email address as an argument.');
  console.log('Example: node utils/makeAdmin.js user@example.com');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the user by email
      const user = await User.findOne({ email: EMAIL_TO_UPDATE });
      
      if (!user) {
        console.error(`User with email ${EMAIL_TO_UPDATE} not found.`);
        process.exit(1);
      }
      
      // Update the user's role to admin
      user.role = 'admin';
      await user.save();
      
      console.log(`User ${user.name} (${user.email}) has been updated to admin role.`);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      // Close the connection
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 