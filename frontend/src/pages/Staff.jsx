import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { socket } from "../socket/socket";

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchStaffAndActivities = async () => {
    try {
      setLoading(true);
      // Get active user context
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Fetch both staff directory and transaction histories in parallel
      const [staffRes, txnRes] = await Promise.all([
        API.get("/auth/staff"),
        API.get("/transactions"),
      ]);

      setStaffList(staffRes.data);
      setTransactions(txnRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load staff auditing records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndActivities();

    // Set up WebSocket to update live audit list as new activities occur
    socket.connect();

    const handleStockUpdate = (data) => {
      // Prepend to transaction feed
      setTransactions((prevTx) => [data.transaction, ...prevTx]);
    };

    socket.on("stock_updated", handleStockUpdate);

    return () => {
      socket.off("stock_updated", handleStockUpdate);
    };
  }, []);

  // Calculate stats for staff directory
  const getStaffStats = (staffId) => {
    const staffTxns = transactions.filter((t) => t.updatedBy?._id === staffId);
    const salesCount = staffTxns.filter((t) => t.type === "OUT").length;
    const additionsCount = staffTxns.filter((t) => t.type === "IN").length;
    return {
      totalActions: staffTxns.length,
      salesCount,
      additionsCount,
    };
  };

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <Navbar />

        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Staff Audit Control Directory</span>
              <span className="text-[8px] sm:text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold tracking-widest animate-pulse">
                OWNER PORTAL
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-light mt-1.5">
              Monitor active cashier profiles, setup attributes, and watch operational activities within <span className="text-indigo-400 font-semibold">{user?.shopName || "your shop"}</span> sandbox.
            </p>
          </div>

          {/* Cards & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/5 blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Staff Units</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{staffList.length}</span>
                <span className="text-slate-500 text-xs font-light">active cashiers</span>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Sales Audited</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">
                  {transactions.filter((t) => t.type === "OUT").length}
                </span>
                <span className="text-slate-500 text-xs font-light">ledger checkouts</span>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-500/5 blur-xl pointer-events-none group-hover:bg-violet-500/10 transition-colors"></div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Restocks Logs</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-violet-400">
                  {transactions.filter((t) => t.type === "IN").length}
                </span>
                <span className="text-slate-500 text-xs font-light">inbound replenishments</span>
              </div>
            </div>
          </div>

          {/* Directory & Audit splits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Staff Accounts Catalog */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Active Cashier Access</h2>
              
              <div className="bg-slate-900/20 border border-slate-800/60 rounded-3xl overflow-hidden backdrop-blur-md">
                {loading ? (
                  <div className="p-12 flex justify-center">
                    <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-light">
                    No staff registers associated with <span className="font-semibold">{user?.shopName}</span> yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-950/80 border-b border-slate-850 text-slate-400 font-semibold">
                        <tr>
                          <th className="p-4 text-left">Cashier Profile</th>
                          <th className="p-4 text-left">Shop Context</th>
                          <th className="p-4 text-left">Total Actions</th>
                          <th className="p-4 text-left">Sales / Inbound</th>
                          <th className="p-4 text-left">Registered On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60">
                        {staffList.map((staff) => {
                          const stats = getStaffStats(staff._id);
                          return (
                            <tr key={staff._id} className="hover:bg-slate-900/10 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-2xl bg-indigo-650/15 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">
                                    {staff.name[0].toUpperCase()}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200">{staff.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{staff.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold">
                                  {staff.shopName}
                                </span>
                              </td>
                              <td className="p-4 font-mono font-bold text-slate-300 pl-8">
                                {stats.totalActions}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-emerald-400 font-bold font-mono">{stats.salesCount}S</span>
                                  <span className="text-slate-650">/</span>
                                  <span className="text-violet-400 font-bold font-mono">{stats.additionsCount}R</span>
                                </div>
                              </td>
                              <td className="p-4 text-slate-500 text-xs font-light">
                                {new Date(staff.createdAt).toLocaleDateString()}
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

            {/* Audit Trail Logs Timeline */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Live Audit Trail</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </h2>

              <div className="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-6 flex flex-col gap-5 max-h-[460px] overflow-y-auto backdrop-blur-md">
                {loading ? (
                  <div className="p-12 flex justify-center">
                    <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm font-light py-10">
                    No transactions made by staff accounts yet.
                  </div>
                ) : (
                  transactions.slice(0, 10).map((txn) => (
                    <div key={txn._id} className="relative pl-6 border-l border-slate-800 pb-1 last:pb-0">
                      {/* Timeline dot accent */}
                      <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border border-slate-950 ${
                        txn.type === "IN" ? "bg-violet-500" : "bg-emerald-500"
                      }`}></span>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">
                            {txn.updatedBy?.name || "Staff Member"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 font-light">
                          {txn.type === "IN" ? "Replenished" : "Checked out"}{" "}
                          <span className="text-slate-200 font-semibold">
                            {txn.quantity} units
                          </span>{" "}
                          of{" "}
                          <span className="text-indigo-400 font-medium">
                            {txn.itemId?.name || "Deleted Product"}
                          </span>.
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider font-mono">
                          <span className="text-slate-650">BALANCE:</span>
                          <span className="text-slate-500">{txn.previousStock}</span>
                          <span className="text-slate-650">➔</span>
                          <span className="text-white">{txn.newStock} units</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Staff;
