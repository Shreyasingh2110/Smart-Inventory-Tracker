import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden relative font-sans">
      
      {/* Premium ambient light effects (Wrapped securely to prevent page overflow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]"></div>
        <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] rounded-full bg-emerald-600/5 blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 md:px-8 h-24 flex items-center justify-between border-b border-slate-900/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none tracking-tight">
              StockGuard
            </span>
            <span className="block text-[9px] text-indigo-400 font-bold uppercase tracking-widest leading-none mt-0.5">
              Retail Intelligence
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {token ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider transition-all duration-300 shadow-lg shadow-indigo-600/20"
            >
              GO TO DASHBOARD
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold text-xs tracking-wider transition-all duration-300"
              >
                SIGN IN
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wider transition-all duration-300 shadow-lg shadow-indigo-600/10"
              >
                REGISTER STORE
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl w-full mx-auto px-6 md:px-8 py-16 flex flex-col items-center relative z-10 flex-1">
        {/* Retail Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          The All-In-One Store & Inventory System
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
            The Smartest Way to Run Your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Retail Store
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            An elegant real-time inventory management and checkout platform built specifically for store owners, mall cashiers, and shop staff. Take total control over sales, stock alert points, and cash registers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
            <Link
              to={token ? "/dashboard" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wider rounded-xl transition-all duration-300 shadow-xl shadow-indigo-600/20 hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto"
            >
              <span>LAUNCH STORE CONSOLE</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </Link>
            <a
              href="#store-features"
              className="px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 font-bold text-sm tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>VIEW FEATURES DIRECTORY</span>
            </a>
          </div>
        </div>

        {/* Detailed Shopkeeper Features Grid */}
        <section id="store-features" className="w-full max-w-5xl mb-24 text-left border-t border-slate-900/80 pt-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Everyday Tools for Modern Shopkeepers
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xl mx-auto font-light">
              We built features that directly solve checkout speed, inventory counts, and staff access controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: POS Billing */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Instant POS Checkout</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Speed up client checkouts. Cashiers can easily search items, adjust product counts, calculate total bills instantly, and complete transactions without frozen software or server screen delays.
                </p>
              </div>
            </div>

            {/* Feature 2: Real-time sync */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.75m-14 0v1.5"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Live Inventory Sync</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Never guess your shelf numbers again. The moment cashiers register a bill, stock balances across all terminal profiles update immediately in real-time, keeping managers in the loop.
                </p>
              </div>
            </div>

            {/* Feature 3: Low stock warning */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Smart Reorder Points</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Prevent lost sales due to empty shelves. Set automated warning thresholds for each category. StockGuard alerts managers when stock runs low so you can reorder bestseller items in time.
                </p>
              </div>
            </div>

            {/* Feature 4: Staff Accountability */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Separate Staff Accounts</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Protect your margins and profits. Separate cashier profiles from owner dashboards. Employees can register store purchases, but wholesale cost parameters and reports stay secure.
                </p>
              </div>
            </div>

            {/* Feature 5: Transparent Ledger */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Bulletproof Store Ledger</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Inspect stock movement records with ease. Every purchase or manual balance adjustment leaves a clear ledger trace, showing previous quantities, new counts, and the editor's username.
                </p>
              </div>
            </div>

            {/* Feature 6: Category Management */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Structured Catalog</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Keep products organized cleanly. Classify inventory batches by department categories or vendor tags. Find shelf positions and check product listings in single clicks.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Detailed Shopkeeper Q&A Section */}
        <section className="w-full max-w-4xl mb-16 text-left border-t border-slate-900/80 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">
              Store Owner Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xl mx-auto font-light">
              Clear answers to questions retail shop owners and mall managers ask about our software.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            
            <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-indigo-400">Q:</span>
                How does the system prevent cashiers from over-selling or double-billing?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light pl-6">
                StockGuard uses atomic transaction locks. If two separate cashiers check out a customer purchasing the same limited-supply product at the exact same millisecond, the platform queues and updates the stock sequentially. This stops double-selling or duplicate tickets completely, even during crowded sales hours.
              </p>
            </div>

            <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-indigo-400">Q:</span>
                Can cashier staff see my shop's private profits or total sales figures?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light pl-6">
                No. Shop Staff accounts are strictly limited. Cashiers can only access the POS billing ticket window and search active products. Profit summaries, wholesale purchase metrics, manually entering stock batches, and sales audit logs are kept completely secure and only visible to the registered Shop Owner profile.
              </p>
            </div>

            <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-indigo-400">Q:</span>
                Do I need to buy expensive POS computers or barcode scanners to run this?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light pl-6">
                No expensive proprietary hardware is required. StockGuard is built as a web-based responsive terminal that loads cleanly on any smartphone, tablet, desktop computer, or standard laptop. Any cashier can search items by name or SKU code inside the browser.
              </p>
            </div>

            <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-indigo-400">Q:</span>
                Are store transactions preserved if my counter computer gets disconnected?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light pl-6">
                Every sale, adjustment, and ticket is immediately logged to a cloud database cluster and verified in real-time. If a terminal disconnects, the audit trail ledger marks the transaction, showing the exact previous stock, updated counts, and modifying user, keeping your store data secure.
              </p>
            </div>

          </div>
        </section>

        {/* Closing Shopkeeper Call to Action */}
        <section className="w-full max-w-4xl bg-gradient-to-r from-violet-950/20 via-indigo-950/20 to-slate-900/40 border border-slate-800/60 p-8 md:p-12 rounded-3xl text-center backdrop-blur-md mb-8 relative">
          <div className="absolute top-[-20%] left-[40%] w-[150px] h-[150px] rounded-full bg-violet-600/10 blur-[50px] pointer-events-none"></div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Ready to Take Control of Your Store?
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto mb-8 font-light leading-relaxed">
            Register your retail store today. Assign accounts for cashier staff, import your product lists, and start running an organized, real-time checkout counter in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to={token ? "/dashboard" : "/register"}
              className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              CREATE STORE ACCOUNT
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 md:px-8 py-8 text-center text-xs text-slate-600 border-t border-slate-900 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} StockGuard Store Suite. All rights reserved.</span>
        <div className="flex gap-6 text-slate-500">
          <span className="hover:text-slate-400 transition-colors">Owner Console</span>
          <span className="hover:text-slate-400 transition-colors">Staff Terminal</span>
          <span className="hover:text-slate-400 transition-colors">Enterprise Security</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;