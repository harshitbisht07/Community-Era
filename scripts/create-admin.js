/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <email> <username> <password>
 * Or modify the script and run: node scripts/create-admin.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const User = require('../backend/models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community-era');
    console.log('Connected to MongoDB');

    // Get arguments or use defaults
    const email = process.argv[2] || 'admin@community-era.com';
    const username = process.argv[3] || 'admin';
    const password = process.argv[4] || 'admin123';

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    
    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.password = password; // Will be hashed by pre-save hook
      await user.save();
      console.log(`✅ Updated user "${username}" to admin role`);
    } else {
      // Create new admin user
      user = new User({
        email,
        username,
        password,
        role: 'admin'
      });
      await user.save();
      console.log(`✅ Created admin user: ${username} (${email})`);
    }

    console.log('\nAdmin credentials:');
    console.log(`Email: ${email}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();

