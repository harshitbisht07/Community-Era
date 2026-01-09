const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const User = require("../backend/models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    const email = process.argv[2] || "admin@community-era.com";
    const username = process.argv[3] || "admin";
    const password = process.argv[4] || "admin123";

    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      user.role = "admin";
      user.password = password;
      await user.save();
      console.log(`✅ Updated ${username} to admin`);
    } else {
      await User.create({
        email,
        username,
        password,
        role: "admin",
      });
      console.log(`✅ Admin user created`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
