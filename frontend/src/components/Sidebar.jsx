import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

function Sidebar() {
  const location = useLocation();
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Read active user details
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Initial check
    setSocketConnected(socket.connected);

    // Mobile menu toggle listener
    const handleToggleMobile = () => setMobileOpen((prev) => !prev);
    window.addEventListener("toggle-mobile-sidebar", handleToggleMobile);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      window.removeEventListener("toggle-mobile-sidebar", handleToggleMobile);
    };
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path>
        </svg>
      ),
    },
    {
      name: "Manage Stock",
      path: "/inventory",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      ),
    },
    {
      name: "History Logs",
      path: "/transactions",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
    },
  ];

  // Append Staff Directory for Shop Owner Admins
  if (user && user.role === "admin") {
    menuItems.push({
      name: "Staff Directory",
      path: "/staff",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
    });
  }

  const renderContent = () => (
    <>
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none tracking-tight truncate max-w-[140px]" title={user?.shopName || "StockGuard"}>
              {user?.shopName || "StockGuard"}
            </h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block mt-0.5">
              Shop Manager Suite
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-indigo-650/15 border border-indigo-500/35 text-indigo-400 font-medium shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                }`}
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"}`}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Connection & Security Diagnostics */}
      <div className="mt-auto bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col gap-3 backdrop-blur-md">
        <h3 className="text-xs font-semibold text-slate-300 tracking-wide uppercase border-b border-slate-800 pb-1.5">
          Connection Status
        </h3>
        
        {/* WebSocket Sync Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Auto-Sync
          </span>
          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
            socketConnected 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
          }`}>
            {socketConnected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>

        {/* Redis Concurrency Lock status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
            Double-Sell Shield
          </span>
          <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            ACTIVE
          </span>
        </div>

        <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-800/80 pt-2">
          Your stock is safe. Over-selling or double-billing is automatically prevented.
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop static vertical sidebar */}
      <div className="hidden md:flex w-68 min-h-screen bg-slate-950 border-r border-slate-800 p-6 flex-col justify-between shrink-0 font-sans">
        {renderContent()}
      </div>

      {/* Mobile Drawer Overlay Portal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          ></div>

          {/* Drawer Panel Container */}
          <div className="relative flex-1 flex flex-col max-w-[260px] w-full bg-slate-950 border-r border-slate-900 p-6 justify-between shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Close button inside Drawer */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-450 hover:text-white bg-slate-900 border border-slate-800/80 rounded-xl hover:scale-105 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;