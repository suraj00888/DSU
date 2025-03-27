// Script to list all users in the database
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find all users
      const users = await User.find({}).select('name email role createdAt');
      
      if (users.length === 0) {
        console.log('No users found in the database.');
        return;
      }
      
      console.log('Users in the database:');
      console.log('=============================================');
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('---------------------------------------------');
      });
      
      console.log(`Total users: ${users.length}`);
    } catch (error) {
      console.error('Error retrieving users:', error);
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