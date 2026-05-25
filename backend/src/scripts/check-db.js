const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/User");

const checkDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected successfully.");

    const users = await User.find({}, { password: 0 }); // exclude password for clean log
    console.log("👥 Active Users in Database:");
    console.log(JSON.stringify(users, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkDB();
