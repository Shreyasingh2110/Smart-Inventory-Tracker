import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    shopName: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shopName || !formData.shopName.trim()) {
      toast.error("Please enter a valid Shop / Mall name.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", formData);

      toast.success("Console account initialized successfully!");
      
      // Delay transition for visual comfort
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Check details and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-4 relative overflow-hidden">
      
      {/* Sleek Floating Back to Home button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800/85 px-4 py-2.5 rounded-xl transition-all duration-300 backdrop-blur-md cursor-pointer hover:scale-[1.03]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Background neon lights */}
      <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] rounded-full bg-violet-600/15 blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[30%] w-[350px] h-[350px] rounded-full bg-indigo-600/15 blur-[90px] pointer-events-none"></div>

      <div className="bg-slate-900/60 border border-slate-800/80 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md backdrop-blur-xl relative z-10">
        
        {/* Logo/Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
            Create Shop Account
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-light">
            Set up your StockGuard login details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4.5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Alex Mercer"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3.5 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="alex@company.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3.5 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
              Choose Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3.5 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 pl-1">
              Your Role in Shop
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "admin" })}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  formData.role === "admin"
                    ? "bg-indigo-650/20 border-indigo-500/80 text-indigo-300 shadow-inner scale-[1.01]"
                    : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <span>Shop Owner (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "user" })}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  formData.role === "user"
                    ? "bg-indigo-650/20 border-indigo-500/80 text-indigo-300 shadow-inner scale-[1.01]"
                    : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span>Shop Staff (User)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
              {formData.role === "admin" ? "Register New Shop / Mall Name" : "Join Existing Shop / Mall Name"}
            </label>
            <input
              type="text"
              name="shopName"
              placeholder={formData.role === "admin" ? "e.g. AuraMart Mall Outlets" : "e.g. AuraMart"}
              value={formData.shopName}
              onChange={handleChange}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3.5 rounded-xl text-slate-100 placeholder-slate-600 transition-all outline-none text-sm font-semibold"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1 pl-1 font-light leading-relaxed">
              {formData.role === "admin" 
                ? "This will establish a new multi-tenant database sandbox for your store." 
                : "Enter the exact shop name created by your store owner to access your catalog."}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Setting up your account...</span>
              </span>
            ) : (
              <span>CREATE MY ACCOUNT</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6 font-light">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;