const Transaction = require("../models/Transaction");

/**
 * Calculates dynamic Reorder Point (ROP) for a list of items.
 * ROP = (Average Daily Demand * Lead Time) + Safety Stock
 * 
 * @param {Array} items - List of items from database
 * @returns {Promise<Array>} - Items populated with dynamic demand and reorder metrics
 */
const calculateROP = async (items) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate OUT (sales) transactions for the last 30 days to calculate daily demand
    const transactions = await Transaction.find({
      type: "OUT",
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Map item IDs to their total OUT quantity
    const demandMap = {};
    transactions.forEach((tx) => {
      demandMap[tx.itemId] = (demandMap[tx.itemId] || 0) + tx.quantity;
    });

    return items.map((item) => {
      const itemObj = item.toObject ? item.toObject() : item;
      
      // Calculate Average Daily Demand (Total sales over 30 days / 30)
      const totalDemand = demandMap[item._id.toString()] || 0;
      const avgDailyDemand = totalDemand / 30;

      const leadTime = item.leadTime !== undefined ? item.leadTime : 3;
      const safetyStock = item.safetyStock !== undefined ? item.safetyStock : 5;

      // Dynamic Reorder Point (ROP) Formula
      const computedROP = Math.ceil((avgDailyDemand * leadTime) + safetyStock);

      return {
        ...itemObj,
        avgDailyDemand: parseFloat(avgDailyDemand.toFixed(2)),
        reorderPoint: computedROP,
        isReorderNeeded: item.quantity <= computedROP,
      };
    });
  } catch (error) {
    console.error("[ROP Engine] Error calculating reorder points:", error.message);
    // Fallback: return items with threshold as reorderPoint if calculation fails
    return items.map((item) => {
      const itemObj = item.toObject ? item.toObject() : item;
      return {
        ...itemObj,
        avgDailyDemand: 0,
        reorderPoint: item.threshold || 5,
        isReorderNeeded: item.quantity <= (item.threshold || 5),
      };
    });
  }
};

module.exports = { calculateROP };
