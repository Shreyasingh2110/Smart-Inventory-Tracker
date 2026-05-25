const express = require("express");

const {
  registerUser,
  loginUser,
  getShopStaff,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/staff", protect, adminOnly, getShopStaff);

module.exports = router;