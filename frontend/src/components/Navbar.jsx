import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="h-20 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between px-4 md:px-8 backdrop-blur-md sticky top-0 z-40">
      
      {/* Greetings & Info */}
      <div className="flex items-center">
        {/* Hamburger button on Mobile */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-sidebar"))}
          className="md:hidden p-2 -ml-1 text-slate-400 hover:text-white bg-slate-850 border border-slate-800 rounded-xl transition-all cursor-pointer mr-3 hover:scale-105 active:scale-95"
          title="Toggle Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm md:text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center gap-1">
            <span className="hidden xs:inline">Welcome,</span>
            <span className="text-indigo-400 font-extrabold truncate max-w-[100px] md:max-w-[200px]" title={user?.name}>
              {user?.name || "User"}
            </span>
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-400 mt-0.5">
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="truncate max-w-[80px] md:max-w-none">{formattedDate}</span>
            <span className="text-slate-700 font-bold hidden sm:inline">•</span>
            <span className="font-mono text-indigo-350/85 hidden sm:inline">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2 md:gap-5">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/40 border border-slate-800/70">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-[10px] md:text-xs text-white shrink-0">
            {user?.name ? user.name[0].toUpperCase() : "S"}
          </div>
          <span className="text-[9px] md:text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase pr-0.5 hidden xs:inline">
            {user?.role === "admin" ? "Owner" : "Staff"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="relative px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-red-650 to-rose-650 text-white font-bold text-[10px] md:text-xs tracking-wider rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span className="hidden xs:inline">LOGOUT</span>
        </button>
      </div>
    </div>
  );
}

export default Navbar;