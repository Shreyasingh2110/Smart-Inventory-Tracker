const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
    },

    threshold: {
      type: Number,
      default: 5,
    },

    leadTime: {
      type: Number,
      default: 3, // standard restocking days
    },

    safetyStock: {
      type: Number,
      default: 5, // buffer stock
    },

    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ shopName: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model("Item", itemSchema);