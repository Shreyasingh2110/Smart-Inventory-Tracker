const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/user", protect, (req, res) => {
  res.json({
    message: "Protected user route accessed",
    user: req.user,
  });
});

router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({
    message: "Protected admin route accessed",
    user: req.user,
  });
});

module.exports = router;