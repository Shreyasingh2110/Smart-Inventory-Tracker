const Item = require("../models/Item");
const Transaction = require("../models/Transaction");
const { acquireLock, releaseLock } = require("../services/lockService");
const { getIO } = require("../socket/socketService");
const { calculateROP } = require("../services/ropService");

const createItem = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      quantity,
      threshold,
      leadTime,
      safetyStock,
    } = req.body;

    const existingItem = await Item.findOne({ sku, shopName: req.user.shopName });

    if (existingItem) {
      return res.status(400).json({
        message: "SKU already exists in your shop inventory",
      });
    }

    const item = await Item.create({
      name,
      sku,
      category,
      quantity: quantity ? Number(quantity) : 0,
      threshold: threshold ? Number(threshold) : 5,
      leadTime: leadTime ? Number(leadTime) : 3,
      safetyStock: safetyStock ? Number(safetyStock) : 5,
      shopName: req.user.shopName,
      createdBy: req.user.id,
    });

    // Broadcast newly added item real-time strictly to that shop's room
    const io = getIO();
    if (io) {
      const itemsForRop = await calculateROP([item]);
      io.to(req.user.shopName).emit("item_added", itemsForRop[0]);
    }

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await Item.find({ shopName: req.user.shopName }).sort({
      createdAt: -1,
    });

    // Run dynamic ROP calculations
    const itemsWithROP = await calculateROP(items);

    res.status(200).json(itemsWithROP);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateStock = async (req, res) => {
  const { id } = req.params;
  const { type, quantity } = req.body;

  if (!type || !quantity || isNaN(quantity) || Number(quantity) <= 0) {
    return res.status(400).json({
      message: "Valid type (IN/OUT) and positive quantity are required",
    });
  }

  const qtyNum = Number(quantity);

  // 1. Acquire Distributed Mutex Lock (prevents parallel users corrupting database state)
  const lockKey = `lock:item:${id}`;
  const lockToken = await acquireLock(lockKey, 5000); // 5 sec expiration safety

  if (!lockToken) {
    return res.status(423).json({
      message: "This item is currently being modified by another action. Please try again in a few moments.",
    });
  }

  try {
    // Secure item lookup to prevent multi-tenant data bleed
    const item = await Item.findOne({ _id: id, shopName: req.user.shopName });

    if (!item) {
      return res.status(404).json({
        message: "Item not found in your shop catalog",
      });
    }

    const previousStock = item.quantity;

    if (type === "IN") {
      item.quantity += qtyNum;
    } else if (type === "OUT") {
      if (item.quantity < qtyNum) {
        return res.status(400).json({
          message: `Insufficient stock! Requested ${qtyNum}, but only ${item.quantity} available.`,
        });
      }

      item.quantity -= qtyNum;
    }

    await item.save();

    // Record audit ledger transaction
    const transaction = await Transaction.create({
      itemId: item._id,
      type,
      quantity: qtyNum,
      previousStock,
      newStock: item.quantity,
      updatedBy: req.user.id,
      shopName: req.user.shopName,
    });

    const populatedTxn = await Transaction.findById(transaction._id)
      .populate("itemId", "name sku")
      .populate("updatedBy", "name");

    // Perform ROP recalculation for socket payload
    const recalculated = await calculateROP([item]);
    const updatedItemWithROP = recalculated[0];

    // 2. Broadcast Live Socket.io updates strictly to this shop's dashboard room
    const io = getIO();
    if (io) {
      io.to(req.user.shopName).emit("stock_updated", {
        item: updatedItemWithROP,
        transaction: populatedTxn,
      });
    }

    res.status(200).json({
      message: "Stock updated successfully under concurrency lock protection.",
      item: updatedItemWithROP,
      transaction: populatedTxn,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  } finally {
    // 3. Always release the lock
    await releaseLock(lockKey, lockToken);
  }
};

module.exports = {
  createItem,
  getItems,
  updateStock,
};