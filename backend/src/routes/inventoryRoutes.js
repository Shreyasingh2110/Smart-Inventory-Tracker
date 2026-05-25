const express = require("express");

const {
  createItem,
  getItems,
  updateStock,
} = require("../controllers/inventoryController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, createItem);

router.get("/", protect, getItems);

router.put("/:id/stock", protect, updateStock);

module.exports = router;