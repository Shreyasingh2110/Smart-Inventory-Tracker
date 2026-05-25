const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/User");

const testLogin = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected successfully.");

    const email = "shreya@shop.com";
    const password = "password123";

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found!");
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log("Found user:", user.name, "with role:", user.role);
    console.log("Stored hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isMatch ? "MATCH ✅" : "MISMATCH ❌");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testLogin();
