const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load backend .env from correct path
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/User");
const Item = require("../models/Item");
const Transaction = require("../models/Transaction");

const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding...");
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas cluster successfully.");

    // Clean existing database records to prevent duplicate key constraint crashes
    console.log("🧹 Clearing existing collections...");
    await User.deleteMany({});
    await Item.deleteMany({});
    await Transaction.deleteMany({});
    console.log("✅ Existing database collections cleared.");

    // 1. Create Hashed Password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 2. Create Multi-Tenant Users (Owners & Staff for 4 separate shops)
    console.log("👥 Creating store accounts for 4 distinct shops...");
    const usersData = [
      // SHOP 1: AuraMart (Supermarket & Groceries)
      {
        name: "Shreya Singh",
        email: "shreya@auramart.com",
        password: hashedPassword,
        role: "admin",
        shopName: "AuraMart",
      },
      {
        name: "Rohan Sharma",
        email: "rohan@auramart.com",
        password: hashedPassword,
        role: "user",
        shopName: "AuraMart",
      },
      {
        name: "Pooja Patel",
        email: "pooja@auramart.com",
        password: hashedPassword,
        role: "user",
        shopName: "AuraMart",
      },

      // SHOP 2: Apex Electronics (High-tech Components)
      {
        name: "Aditya Dev",
        email: "aditya@apex.com",
        password: hashedPassword,
        role: "admin",
        shopName: "Apex Electronics",
      },
      {
        name: "Sameer Verma",
        email: "sameer@apex.com",
        password: hashedPassword,
        role: "user",
        shopName: "Apex Electronics",
      },
      {
        name: "Tanya Sen",
        email: "tanya@apex.com",
        password: hashedPassword,
        role: "user",
        shopName: "Apex Electronics",
      },

      // SHOP 3: Vogue Boutique (Premium Apparel)
      {
        name: "Sneha Kapoor",
        email: "sneha@vogue.com",
        password: hashedPassword,
        role: "admin",
        shopName: "Vogue Boutique",
      },
      {
        name: "Rahul Malhotra",
        email: "rahul@vogue.com",
        password: hashedPassword,
        role: "user",
        shopName: "Vogue Boutique",
      },
      {
        name: "Diya Rao",
        email: "diya@vogue.com",
        password: hashedPassword,
        role: "user",
        shopName: "Vogue Boutique",
      },

      // SHOP 4: Mega Mart (General Department Store)
      {
        name: "Vikram Mehta",
        email: "vikram@megamart.com",
        password: hashedPassword,
        role: "admin",
        shopName: "Mega Mart",
      },
      {
        name: "Riya Sen",
        email: "riya@megamart.com",
        password: hashedPassword,
        role: "user",
        shopName: "Mega Mart",
      },
      {
        name: "Kabir Singh",
        email: "kabir@megamart.com",
        password: hashedPassword,
        role: "user",
        shopName: "Mega Mart",
      },
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log(`✅ Successfully created ${createdUsers.length} user accounts.`);

    // Helper maps to assign creator ids
    const findOwner = (shopName) => createdUsers.find(u => u.shopName === shopName && u.role === "admin");
    const findStaff = (email) => createdUsers.find(u => u.email === email);

    // 3. Create Custom Inventory Items per Shop
    console.log("📦 Creating separate catalogs for each store...");
    const itemsData = [
      // --- SHOP 1: AuraMart Catalog ---
      {
        name: "Organic Whole Milk 1L",
        sku: "DAI-MILK-1L",
        category: "Dairy",
        quantity: 45,
        threshold: 15,
        leadTime: 2,
        safetyStock: 5,
        shopName: "AuraMart",
        createdBy: findOwner("AuraMart")._id,
      },
      {
        name: "Cheddar Cheese 250g",
        sku: "DAI-CHED-250",
        category: "Dairy",
        quantity: 20,
        threshold: 8,
        leadTime: 3,
        safetyStock: 3,
        shopName: "AuraMart",
        createdBy: findOwner("AuraMart")._id,
      },
      {
        name: "Sourdough Bread 500g",
        sku: "BAK-SOUR-500",
        category: "Groceries",
        quantity: 32,
        threshold: 10,
        leadTime: 1,
        safetyStock: 4,
        shopName: "AuraMart",
        createdBy: findOwner("AuraMart")._id,
      },
      {
        name: "Greek Yogurt 500g",
        sku: "DAI-YOG-500",
        category: "Dairy",
        quantity: 6, // warning
        threshold: 12,
        leadTime: 2,
        safetyStock: 4,
        shopName: "AuraMart",
        createdBy: findOwner("AuraMart")._id,
      },
      {
        name: "Organic Eggs 12pk",
        sku: "GRO-EGGS-12",
        category: "Groceries",
        quantity: 58,
        threshold: 15,
        leadTime: 2,
        safetyStock: 6,
        shopName: "AuraMart",
        createdBy: findOwner("AuraMart")._id,
      },

      // --- SHOP 2: Apex Electronics Catalog ---
      {
        name: "Intel Core i9 14900K",
        sku: "CPU-INT-I9",
        category: "Processors",
        quantity: 12,
        threshold: 5,
        leadTime: 7,
        safetyStock: 2,
        shopName: "Apex Electronics",
        createdBy: findOwner("Apex Electronics")._id,
      },
      {
        name: "Samsung 990 Pro SSD 2TB",
        sku: "SSD-SAM-2TB",
        category: "Storage",
        quantity: 28,
        threshold: 10,
        leadTime: 4,
        safetyStock: 4,
        shopName: "Apex Electronics",
        createdBy: findOwner("Apex Electronics")._id,
      },
      {
        name: "Corsair Vengeance DDR5 32GB",
        sku: "RAM-COR-32G",
        category: "Memory",
        quantity: 4, // urgent warning
        threshold: 8,
        leadTime: 5,
        safetyStock: 3,
        shopName: "Apex Electronics",
        createdBy: findOwner("Apex Electronics")._id,
      },
      {
        name: "Mechanical Gaming Keyboard",
        sku: "ACC-KEY-RGB",
        category: "Peripherals",
        quantity: 19,
        threshold: 6,
        leadTime: 3,
        safetyStock: 2,
        shopName: "Apex Electronics",
        createdBy: findOwner("Apex Electronics")._id,
      },

      // --- SHOP 3: Vogue Boutique Catalog ---
      {
        name: "Linen Summer Shirt",
        sku: "CLO-LIN-SHR",
        category: "Apparel",
        quantity: 50,
        threshold: 12,
        leadTime: 5,
        safetyStock: 4,
        shopName: "Vogue Boutique",
        createdBy: findOwner("Vogue Boutique")._id,
      },
      {
        name: "Classic Denim Jacket",
        sku: "CLO-DEN-JCK",
        category: "Apparel",
        quantity: 18,
        threshold: 8,
        leadTime: 6,
        safetyStock: 3,
        shopName: "Vogue Boutique",
        createdBy: findOwner("Vogue Boutique")._id,
      },
      {
        name: "Floral Silk Summer Dress",
        sku: "CLO-SLK-DRS",
        category: "Apparel",
        quantity: 3, // warning
        threshold: 8,
        leadTime: 7,
        safetyStock: 2,
        shopName: "Vogue Boutique",
        createdBy: findOwner("Vogue Boutique")._id,
      },
      {
        name: "Italian Leather Waist Belt",
        sku: "ACC-LTH-BLT",
        category: "Accessories",
        quantity: 42,
        threshold: 10,
        leadTime: 3,
        safetyStock: 3,
        shopName: "Vogue Boutique",
        createdBy: findOwner("Vogue Boutique")._id,
      },

      // --- SHOP 4: Mega Mart Catalog ---
      {
        name: "Eco-Friendly Dish Soap 500ml",
        sku: "HOU-SOAP-500",
        category: "Household",
        quantity: 34,
        threshold: 10,
        leadTime: 3,
        safetyStock: 3,
        shopName: "Mega Mart",
        createdBy: findOwner("Mega Mart")._id,
      },
      {
        name: "All-Purpose Detergent 2kg",
        sku: "HOU-DETR-2K",
        category: "Household",
        quantity: 24,
        threshold: 6,
        leadTime: 5,
        safetyStock: 2,
        shopName: "Mega Mart",
        createdBy: findOwner("Mega Mart")._id,
      },
      {
        name: "Soft Face Tissues 200pk",
        sku: "HOU-TISS-200",
        category: "Household",
        quantity: 5, // warning
        threshold: 12,
        leadTime: 2,
        safetyStock: 4,
        shopName: "Mega Mart",
        createdBy: findOwner("Mega Mart")._id,
      },
    ];

    const createdItems = await Item.insertMany(itemsData);
    console.log(`✅ Successfully seeded ${createdItems.length} products to inventory shelves.`);

    // Helper dates to draw realistic chart records
    const daysAgo = (num) => {
      const d = new Date();
      d.setDate(d.getDate() - num);
      return d;
    };

    const findItem = (sku, shopName) => createdItems.find(i => i.sku === sku && i.shopName === shopName);

    // 4. Seeding historical transaction logs for each shop
    console.log("📈 Seeding historical sales transactions...");
    const transactionsData = [
      // --- AuraMart Transactions ---
      {
        itemId: findItem("DAI-MILK-1L", "AuraMart")._id,
        type: "IN",
        quantity: 50,
        previousStock: 0,
        newStock: 50,
        updatedBy: findOwner("AuraMart")._id,
        shopName: "AuraMart",
        createdAt: daysAgo(3),
      },
      {
        itemId: findItem("DAI-MILK-1L", "AuraMart")._id,
        type: "OUT",
        quantity: 5,
        previousStock: 50,
        newStock: 45,
        updatedBy: findStaff("rohan@auramart.com")._id,
        shopName: "AuraMart",
        createdAt: daysAgo(2),
      },
      {
        itemId: findItem("BAK-SOUR-500", "AuraMart")._id,
        type: "IN",
        quantity: 40,
        previousStock: 0,
        newStock: 40,
        updatedBy: findOwner("AuraMart")._id,
        shopName: "AuraMart",
        createdAt: daysAgo(2),
      },
      {
        itemId: findItem("BAK-SOUR-500", "AuraMart")._id,
        type: "OUT",
        quantity: 8,
        previousStock: 40,
        newStock: 32,
        updatedBy: findStaff("pooja@auramart.com")._id,
        shopName: "AuraMart",
        createdAt: daysAgo(1),
      },

      // --- Apex Electronics Transactions ---
      {
        itemId: findItem("CPU-INT-I9", "Apex Electronics")._id,
        type: "IN",
        quantity: 15,
        previousStock: 0,
        newStock: 15,
        updatedBy: findOwner("Apex Electronics")._id,
        shopName: "Apex Electronics",
        createdAt: daysAgo(3),
      },
      {
        itemId: findItem("CPU-INT-I9", "Apex Electronics")._id,
        type: "OUT",
        quantity: 3,
        previousStock: 15,
        newStock: 12,
        updatedBy: findStaff("sameer@apex.com")._id,
        shopName: "Apex Electronics",
        createdAt: daysAgo(2),
      },
      {
        itemId: findItem("SSD-SAM-2TB", "Apex Electronics")._id,
        type: "IN",
        quantity: 30,
        previousStock: 0,
        newStock: 30,
        updatedBy: findOwner("Apex Electronics")._id,
        shopName: "Apex Electronics",
        createdAt: daysAgo(2),
      },
      {
        itemId: findItem("SSD-SAM-2TB", "Apex Electronics")._id,
        type: "OUT",
        quantity: 2,
        previousStock: 30,
        newStock: 28,
        updatedBy: findStaff("tanya@apex.com")._id,
        shopName: "Apex Electronics",
        createdAt: daysAgo(1),
      },

      // --- Vogue Boutique Transactions ---
      {
        itemId: findItem("CLO-LIN-SHR", "Vogue Boutique")._id,
        type: "IN",
        quantity: 60,
        previousStock: 0,
        newStock: 60,
        updatedBy: findOwner("Vogue Boutique")._id,
        shopName: "Vogue Boutique",
        createdAt: daysAgo(3),
      },
      {
        itemId: findItem("CLO-LIN-SHR", "Vogue Boutique")._id,
        type: "OUT",
        quantity: 10,
        previousStock: 60,
        newStock: 50,
        updatedBy: findStaff("rahul@vogue.com")._id,
        shopName: "Vogue Boutique",
        createdAt: daysAgo(2),
      },
      {
        itemId: findItem("CLO-DEN-JCK", "Vogue Boutique")._id,
        type: "IN",
        quantity: 20,
        previousStock: 0,
        newStock: 20,
        updatedBy: findOwner("Vogue Boutique")._id,
        shopName: "Vogue Boutique",
        createdAt: daysAgo(2),
      },
      {
        itemId: findItem("CLO-DEN-JCK", "Vogue Boutique")._id,
        type: "OUT",
        quantity: 2,
        previousStock: 20,
        newStock: 18,
        updatedBy: findStaff("diya@vogue.com")._id,
        shopName: "Vogue Boutique",
        createdAt: daysAgo(1),
      },

      // --- Mega Mart Transactions ---
      {
        itemId: findItem("HOU-SOAP-500", "Mega Mart")._id,
        type: "IN",
        quantity: 40,
        previousStock: 0,
        newStock: 40,
        updatedBy: findOwner("Mega Mart")._id,
        shopName: "Mega Mart",
        createdAt: daysAgo(3),
      },
      {
        itemId: findItem("HOU-SOAP-500", "Mega Mart")._id,
        type: "OUT",
        quantity: 6,
        previousStock: 40,
        newStock: 34,
        updatedBy: findStaff("riya@megamart.com")._id,
        shopName: "Mega Mart",
        createdAt: daysAgo(2),
      },
      {
        itemId: findItem("HOU-TISS-200", "Mega Mart")._id,
        type: "IN",
        quantity: 10,
        previousStock: 0,
        newStock: 10,
        updatedBy: findOwner("Mega Mart")._id,
        shopName: "Mega Mart",
        createdAt: daysAgo(2),
      },
      {
        itemId: findItem("HOU-TISS-200", "Mega Mart")._id,
        type: "OUT",
        quantity: 5,
        previousStock: 10,
        newStock: 5,
        updatedBy: findStaff("kabir@megamart.com")._id,
        shopName: "Mega Mart",
        createdAt: daysAgo(1),
      },
    ];

    const seededTransactions = await Transaction.insertMany(transactionsData);
    console.log(`✅ Successfully seeded ${seededTransactions.length} historical sales ledger updates.`);

    console.log("\n🎉 Database Seeding completed successfully!");
    console.log("-----------------------------------------");
    console.log("Passwords for all accounts is: 'password123'");
    console.log("🛍️ SHOP 1: AuraMart");
    console.log("🔑 Owner: shreya@auramart.com");
    console.log("🔑 Staff: rohan@auramart.com | pooja@auramart.com");
    console.log("\n⚡ SHOP 2: Apex Electronics");
    console.log("🔑 Owner: aditya@apex.com");
    console.log("🔑 Staff: sameer@apex.com | tanya@apex.com");
    console.log("\n👗 SHOP 3: Vogue Boutique");
    console.log("🔑 Owner: sneha@vogue.com");
    console.log("🔑 Staff: rahul@vogue.com | diya@vogue.com");
    console.log("\n🛒 SHOP 4: Mega Mart");
    console.log("🔑 Owner: vikram@megamart.com");
    console.log("🔑 Staff: riya@megamart.com | kabir@megamart.com");
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    console.log("🔌 Disconnected safely from MongoDB cluster.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();
