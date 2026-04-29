function Footer() {
  return (
    <footer className="relative z-10 w-full mt-16 border-t-[1.5px] border-dashed border-gray-300 dark:border-gray-800 bg-white/30 dark:bg-[#0a0a0a]/50 py-8 px-6 backdrop-blur-xl">
      <div className="max-w-[1100px] mx-auto flex flex-col gap-6">
        
        {/* --- TOP TIER: STATUS & STAMP --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Left: Status Readout */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-mono tracking-widest text-gray-500 dark:text-gray-400 uppercase">
              Systems Nominal // v1.0.0
            </span>
          </div>

          {/* Right: Developer Stamp */}
          <div className="text-[10px] font-mono tracking-[0.2em] text-gray-400 uppercase text-center w-full md:w-auto md:text-right">
            Engineered by <span className="text-black dark:text-white font-bold ml-1">Tejas Sagar K</span>
          </div>

        </div>

        {/* --- DIVIDER --- */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-800 to-transparent"></div>

        {/* --- BOTTOM TIER: LEGAL & COPYRIGHT --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono tracking-[0.15em] text-gray-400 uppercase">
          <span className="text-center md:text-left">
            &copy; 2026 CashSpot. All rights reserved.
          </span>
          <div className="flex items-center gap-3">
            <button type="button" className="hover:text-black dark:hover:text-white transition-colors cursor-pointer outline-none">
              Privacy Policy
            </button>
            <span className="text-gray-300 dark:text-gray-800">|</span>
            <button type="button" className="hover:text-black dark:hover:text-white transition-colors cursor-pointer outline-none">
              T&C Applied
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;