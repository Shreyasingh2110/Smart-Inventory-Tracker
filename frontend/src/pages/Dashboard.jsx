import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { socket } from "../socket/socket";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];

function Dashboard() {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const itemsRes = await API.get("/inventory");
      const txRes = await API.get("/transactions");

      setItems(itemsRes.data);
      setTransactions(txRes.data.slice(0, 8)); // Grab last 8 for ledger feed
    } catch (error) {
      console.error("[Dashboard] Fetch error:", error);
      toast.error("Failed to load real-time analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 1. Establish Socket listeners for Live updates
    socket.connect();

    const handleStockUpdate = (data) => {
      console.log("🔌 [Socket] Live stock update received:", data);
      
      // Update item count & quantities in state
      setItems((prevItems) => {
        const index = prevItems.findIndex((it) => it._id === data.item._id);
        if (index !== -1) {
          const updated = [...prevItems];
          updated[index] = data.item;
          return updated;
        } else {
          return [data.item, ...prevItems];
        }
      });

      // Prepend to recent transactions ledger
      setTransactions((prevTx) => [data.transaction, ...prevTx].slice(0, 8));

      // Visual trigger toast
      toast.success(
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-xs uppercase tracking-wider text-indigo-400">Stock Update Alert</span>
          <span className="text-slate-200">
            Stock of <strong className="text-white">{data.item.name}</strong> was updated (
            <span className={data.transaction.type === "IN" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {data.transaction.type === "IN" ? "Added" : "Sold"} {data.transaction.quantity} units
            </span>
            )
          </span>
        </div>,
        { duration: 4000 }
      );
    };

    const handleItemAdded = (newItem) => {
      console.log("🔌 [Socket] Live product creation received:", newItem);
      setItems((prevItems) => [newItem, ...prevItems]);
      toast.success(`"${newItem.name}" has been added to your shop shelf!`);
    };

    socket.on("stock_updated", handleStockUpdate);
    socket.on("item_added", handleItemAdded);

    return () => {
      socket.off("stock_updated", handleStockUpdate);
      socket.off("item_added", handleItemAdded);
    };
  }, []);

  // Aggregated analytics metrics
  const totalProducts = items.length;
  
  const lowStockCount = items.filter(
    (item) => item.quantity <= item.reorderPoint
  ).length;

  const totalQuantity = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // Prepare Chart Data: SKU levels vs ROP reorder point
  const chartData = items.slice(0, 7).map((item) => ({
    name: item.name.length > 12 ? `${item.name.slice(0, 10)}...` : item.name,
    Stock: item.quantity,
    "Reorder Point (ROP)": item.reorderPoint || item.threshold,
  }));

  // Prepare Category allocation data for Pie Chart
  const categoryDataMap = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryDataMap).map((cat) => ({
    name: cat,
    value: categoryDataMap[cat],
  }));

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <Navbar />

        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-slate-400 font-medium text-xs tracking-wider uppercase">Loading your store details...</span>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
            
            {/* Header Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                My Shop Overview
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-light mt-1.5">
                See your items, low-stock alerts, and daily sales instantly
              </p>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Total unique products */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-400">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Total Items on Shelf
                </h2>
                <p className="text-5xl mt-3 font-black text-white tracking-tight">
                  {totalProducts}
                </p>
                <div className="text-[10px] text-slate-500 mt-2 font-sans font-light">
                  Different types of items in your shop
                </div>
              </div>

              {/* Dynamic ROP Warnings */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Low Stock Warnings
                </h2>
                <p className={`text-5xl mt-3 font-black tracking-tight ${lowStockCount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                  {lowStockCount}
                </p>
                <div className="text-[10px] text-slate-500 mt-2 font-sans font-light">
                  Items that need to be reordered soon
                </div>
              </div>

              {/* Total Physical Stock */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2"></path>
                  </svg>
                </div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Total Stock in Shop
                </h2>
                <p className="text-5xl mt-3 font-black text-emerald-400 tracking-tight">
                  {totalQuantity}
                </p>
                <div className="text-[10px] text-slate-500 mt-2 font-sans font-light">
                  Total number of individual items on hand
                </div>
              </div>

            </div>

            {/* Visual analytics graphics & transaction ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Primary Stock vs ROP chart */}
              <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl lg:col-span-2 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Stock Level vs Warning Limit
                  </h3>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded font-sans font-semibold">
                    Warning levels calculated based on sales speed
                  </span>
                </div>
                {chartData.length === 0 ? (
                  <div className="h-72 flex items-center justify-center text-slate-500 text-sm font-light">
                    No products on your shelves yet. Add one in the 'Manage Stock' page!
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                        <Bar dataKey="Stock" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Reorder Point (ROP)" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Category distribution Pie Chart */}
              <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide mb-6">
                    Products by Category
                  </h3>
                  {categoryChartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-slate-500 text-sm font-light">
                      No item categories found.
                    </div>
                  ) : (
                    <div className="h-48 flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "#0f172a",
                              border: "1px solid #334155",
                              borderRadius: "12px",
                              fontFamily: "Inter, sans-serif",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                
                {/* Custom Legend list */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  {categoryChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }}></span>
                      <span className="text-slate-400 font-light truncate max-w-[80px]">{entry.name}</span>
                      <span className="text-slate-200 font-semibold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Live rolling Audit Ledger */}
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Recent Stock Updates & Sales
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-light uppercase tracking-wider">
                  Updates instantly as stock moves
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm font-light">
                  No stock changes made yet. Try adding or selling stock on the 'Manage Stock' page!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-950/50 text-slate-400 font-semibold border-b border-slate-850">
                      <tr>
                        <th className="p-4 text-left font-semibold">Product</th>
                        <th className="p-4 text-left font-semibold">Action</th>
                        <th className="p-4 text-left font-semibold">Amount</th>
                        <th className="p-4 text-left font-semibold">Old Stock</th>
                        <th className="p-4 text-left font-semibold">New Stock</th>
                        <th className="p-4 text-left font-semibold">Done By</th>
                        <th className="p-4 text-left font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {transactions.map((txn) => (
                        <tr key={txn._id} className="hover:bg-slate-900/20 transition-all group duration-300">
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
                                {txn.itemId?.name || "Deleted Item"}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {txn.itemId?.sku || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                              txn.type === "IN"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {txn.type === "IN" ? "Added Stock" : "Sold Stock"}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-semibold text-slate-200">
                            {txn.quantity}
                          </td>
                          <td className="p-4 font-mono text-slate-400">
                            {txn.previousStock}
                          </td>
                          <td className="p-4 font-mono text-slate-200 font-bold">
                            {txn.newStock}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-indigo-400 font-bold">
                                {txn.updatedBy?.name ? txn.updatedBy.name[0].toUpperCase() : "U"}
                              </div>
                              <span className="text-slate-300 font-light text-xs">
                                {txn.updatedBy?.name || "System"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 text-xs font-light">
                            {new Date(txn.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;