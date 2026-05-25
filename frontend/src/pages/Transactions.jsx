import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { socket } from "../socket/socket";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTxId, setNewTxId] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load stock history logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Connect to websocket server
    socket.connect();

    const handleStockUpdate = (data) => {
      // Prepend the new transaction ledger entry
      setTransactions((prevTx) => [data.transaction, ...prevTx]);

      // Set flashing row state
      setNewTxId(data.transaction._id);
      setTimeout(() => setNewTxId(null), 2000);
    };

    socket.on("stock_updated", handleStockUpdate);

    return () => {
      socket.off("stock_updated", handleStockUpdate);
    };
  }, []);

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <Navbar />

        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Detailed Stock History</span>
              <span className="text-[9px] sm:text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold tracking-widest animate-pulse">
                LIVE LOGS
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-light mt-1.5">
              Full list of stock additions and sales made in your shop.
            </p>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl overflow-hidden backdrop-blur-md">
            
            {loading ? (
              <div className="p-16 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-16 text-center text-slate-500 font-light">
                No stock history transactions logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  
                  <thead className="bg-slate-950/70 border-b border-slate-850 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-4 text-left">Product</th>
                      <th className="p-4 text-left">Action</th>
                      <th className="p-4 text-left">Quantity Changed</th>
                      <th className="p-4 text-left">Old Stock</th>
                      <th className="p-4 text-left">New Stock</th>
                      <th className="p-4 text-left">Staff Member</th>
                      <th className="p-4 text-left">Date & Time</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-850">
                    {transactions.map((txn) => {
                      const isNew = newTxId === txn._id;
                      return (
                        <tr
                          key={txn._id}
                          className={`transition-all duration-700 ${
                            isNew
                              ? "bg-violet-600/20 border-y border-violet-500/35 font-semibold"
                              : "hover:bg-slate-900/15"
                          }`}
                        >
                          {/* Item/SKU */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-200">
                                {txn.itemId?.name || "Deleted Product"}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">
                                SKU: {txn.itemId?.sku || "N/A"}
                              </span>
                            </div>
                          </td>

                          {/* Action Type */}
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-xs tracking-wider ${
                              txn.type === "IN"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {txn.type === "IN" ? "Added Stock" : "Sold Stock"}
                            </span>
                          </td>

                          {/* Quantity count */}
                          <td className="p-4 font-mono font-bold text-slate-200">
                            {txn.quantity} units
                          </td>

                          {/* Initial Stock */}
                          <td className="p-4 font-mono text-slate-400">
                            {txn.previousStock} units
                          </td>

                          {/* Resultant Stock */}
                          <td className="p-4 font-mono text-white font-extrabold">
                            {txn.newStock} units
                          </td>

                          {/* Authorized Operator */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-indigo-400 font-bold border border-slate-800/80">
                                {txn.updatedBy?.name ? txn.updatedBy.name[0].toUpperCase() : "S"}
                              </div>
                              <span className="text-slate-300 font-medium text-xs">
                                {txn.updatedBy?.name || "Staff Member"}
                              </span>
                            </div>
                          </td>

                          {/* Date/Time */}
                          <td className="p-4 text-slate-500 text-xs font-light">
                            <div className="flex flex-col">
                              <span>{new Date(txn.createdAt).toLocaleDateString()}</span>
                              <span className="font-mono text-[10px] text-slate-650 mt-0.5">
                                {new Date(txn.createdAt).toLocaleTimeString()}
                              </span>
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
    </div>
  );
}

export default Transactions;