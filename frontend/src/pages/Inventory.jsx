import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { socket } from "../socket/socket";

function Inventory() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    threshold: "5",
    leadTime: "3",
    safetyStock: "5",
  });

  const [activeModal, setActiveModal] = useState(null);
  const [modalQuantity, setModalQuantity] = useState("");
  const [modalError, setModalError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Fetch Items from Database
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await API.get("/inventory");
      setItems(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inventory ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Connect and set up WebSocket synchronization listeners
    socket.connect();

    const handleStockUpdate = (data) => {
      // Locate the item in state and update it real-time
      setItems((prevItems) =>
        prevItems.map((item) => (item._id === data.item._id ? data.item : item))
      );

      // Flash highlight animation helper
      setUpdatingItemId(data.item._id);
      setTimeout(() => setUpdatingItemId(null), 1500);
    };

    const handleItemAdded = (newItem) => {
      setItems((prevItems) => [newItem, ...prevItems]);
    };

    socket.on("stock_updated", handleStockUpdate);
    socket.on("item_added", handleItemAdded);

    return () => {
      socket.off("stock_updated", handleStockUpdate);
      socket.off("item_added", handleItemAdded);
    };
  }, []);

  // Handle Form Inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Register Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/inventory", formData);
      toast.success(`"${formData.name}" has been added to your shop shelf!`);
      
      setFormData({
        name: "",
        sku: "",
        category: "",
        quantity: "",
        threshold: "5",
        leadTime: "3",
        safetyStock: "5",
      });
      setIsFormOpen(false);
      fetchItems(); // Recalculate
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product.");
    }
  };

  // Open Custom Stock Adjustment Modal
  const openStockModal = (item, type) => {
    setActiveModal({
      itemId: item._id,
      itemName: item.name,
      type: type,
      actionWord: type === "IN" ? "add to" : "sell/remove from",
    });
    setModalQuantity("");
    setModalError("");
  };

  // Submit Modal under Redis Distributed Lock
  const handleModalSubmit = async (e) => {
    if (e) e.preventDefault();

    const quantity = Number(modalQuantity);
    if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      setModalError("Please enter a valid positive whole number.");
      return;
    }

    const { itemId, type } = activeModal;
    setActiveModal(null); // Close modal right away

    try {
      const updatePromise = API.put(`/inventory/${itemId}/stock`, {
        type,
        quantity,
      });

      // Gorgeous toast loader for real-time validation
      await toast.promise(updatePromise, {
        loading: `Saving stock change safely...`,
        success: (res) => {
          return `Stock updated! New count is ${res.data.item.quantity} units.`;
        },
        error: (err) => {
          return err.response?.data?.message || "Someone else is updating this stock. Please wait a second!";
        },
      });

      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  // Unique category tags for filtering
  const categories = ["All", ...new Set(items.map((item) => item.category))];

  // Filters: Search String + Selected Category Dropdown
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <Navbar />

        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          
          {/* Main Controls Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Product Stock Room
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-light mt-1.5">
                Add new items, adjust stock levels safely, and check restock alerts.
              </p>
            </div>
            
            {isAdmin ? (
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider rounded-xl px-5 py-3 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer animate-fadeIn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isFormOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"></path>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                  )}
                </svg>
                <span>{isFormOpen ? "HIDE ADD FORM" : "ADD NEW PRODUCT"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-indigo-400 font-bold backdrop-blur-md">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <span>Staff Mode (Read-Only Configs)</span>
              </div>
            )}
          </div>

          {/* Add product form drawer */}
          {isFormOpen && (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-5 animate-fadeIn"
            >
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Intel Core i9 14900K"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                  Barcode / SKU Code
                </label>
                <input
                  type="text"
                  name="sku"
                  placeholder="Barcode or unique code"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                  Product Category
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Processors"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                  Initial Stock Count
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="e.g. 50"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                  Minimum Warning Stock
                </label>
                <input
                  type="number"
                  name="threshold"
                  value={formData.threshold}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 rounded-xl text-slate-100 transition-all outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                  Days to Delivery (Supplier)
                </label>
                <input
                  type="number"
                  name="leadTime"
                  value={formData.leadTime}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 rounded-xl text-slate-100 transition-all outline-none text-sm"
                  required
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                  Emergency Buffer Stock
                </label>
                <input
                  type="number"
                  name="safetyStock"
                  value={formData.safetyStock}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 rounded-xl text-slate-100 transition-all outline-none text-sm mb-4 md:mb-0"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  SAVE PRODUCT TO SHELF
                </button>
              </div>
            </form>
          )}

          {/* Filtering control matrices */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/20 border border-slate-800/60 p-4 rounded-2xl">
            
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <svg className="w-5 h-5 text-slate-600 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="Search by product name or item code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 pl-11 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
              />
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-500 shrink-0 uppercase tracking-widest font-bold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-3 outline-none focus:border-indigo-500 text-sm cursor-pointer w-full sm:w-48"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl overflow-hidden backdrop-blur-md">
            
            {loading ? (
              <div className="p-16 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-16 text-center text-slate-500 font-light">
                No products found on shelves. Try changing search words.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  
                  <thead className="bg-slate-950/70 border-b border-slate-850 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-4 text-left">Product Details</th>
                      <th className="p-4 text-left">Category</th>
                      <th className="p-4 text-left">Available Stock</th>
                      <th className="p-4 text-left">Daily Sales (Avg)</th>
                      <th className="p-4 text-left">Warn Me At (ROP)</th>
                      <th className="p-4 text-left">Stock Alert</th>
                      <th className="p-4 text-center">Quick Stock Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-850">
                    {filteredItems.map((item) => {
                      const isLow = item.quantity <= item.reorderPoint;
                      const isCritical = item.quantity <= (item.reorderPoint / 2);
                      const isUpdating = updatingItemId === item._id;

                      let statusBadge = (
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          In Stock ✅
                        </span>
                      );
                      if (isCritical) {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                            Urgent Restock! 🚨
                          </span>
                        );
                      } else if (isLow) {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Low Stock! Reorder ⚠️
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={item._id}
                          className={`transition-all duration-500 ${
                            isUpdating
                              ? "bg-indigo-600/20 border-y border-indigo-500/35"
                              : "hover:bg-slate-900/15"
                          }`}
                        >
                          {/* Item/SKU */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-200">{item.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">
                                SKU: {item.sku}
                              </span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-4">
                            <span className="text-slate-400 font-light">{item.category}</span>
                          </td>

                          {/* Stock Quantity */}
                          <td className="p-4 font-mono">
                            <span className={`font-extrabold text-base ${
                              isLow ? "text-rose-500" : "text-emerald-400"
                            }`}>
                              {item.quantity}
                            </span>
                            <span className="text-slate-600 text-xs ml-1 font-light">units</span>
                          </td>

                          {/* Average Daily Demand */}
                          <td className="p-4 font-mono text-slate-400">
                            <span>{item.avgDailyDemand !== undefined ? item.avgDailyDemand : 0}</span>
                            <span className="text-[10px] text-slate-600 ml-1 font-light">/ day</span>
                          </td>

                          {/* Reorder Point (ROP) */}
                          <td className="p-4 font-mono">
                            <div className="flex flex-col">
                              <span className="text-slate-300 font-semibold">{item.reorderPoint}</span>
                              <span className="text-[9px] text-slate-500 leading-none">
                                Buffer: {item.safetyStock} units
                              </span>
                            </div>
                          </td>

                          {/* Diagnostic Status */}
                          <td className="p-4">
                            {statusBadge}
                          </td>

                          {/* Ledger Operations */}
                          <td className="p-4">
                            <div className="flex gap-2.5 justify-center">
                              <button
                                onClick={() => openStockModal(item, "IN")}
                                className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                                </svg>
                                <span>+ Add Stock</span>
                              </button>
                              
                              <button
                                onClick={() => openStockModal(item, "OUT")}
                                className="bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"></path>
                                </svg>
                                <span>- Sell / Remove</span>
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Elegant Custom Industry-Level Modal for Stock Adjustments */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800/80 max-w-md w-full rounded-3xl p-6 md:p-8 shadow-2xl relative animate-scaleIn">
            
            {/* Modal Glow Accent */}
            <div className="absolute -top-10 left-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Adjust Shelf Stock</h3>
                <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                  Safely updating inventory balances for <span className="font-bold text-slate-200">{activeModal.itemName}</span>.
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/80 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Status Type Banner */}
            <div className="mb-6">
              {activeModal.type === "IN" ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ✦ Add Stock to Counter
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  ✦ Sell / Remove Stock from Shelf
                </div>
              )}
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Adjust Quantity (Units)
                </label>
                <input
                  type="number"
                  placeholder="Enter total units..."
                  value={modalQuantity}
                  onChange={(e) => {
                    setModalQuantity(e.target.value);
                    if (modalError) setModalError("");
                  }}
                  autoFocus
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-4 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-base font-mono"
                  required
                />
                {modalError && (
                  <span className="text-xs text-rose-500 mt-2 pl-1 block font-semibold animate-pulse">
                    ⚠ {modalError}
                  </span>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-semibold py-3 rounded-xl text-xs tracking-wider transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs tracking-wider transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  CONFIRM ADJUST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;