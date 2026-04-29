import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Filters({ setFilter, activeFilter, availableBanks = [] }) {
  const [myBank, setMyBank] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cashspot_my_bank') || "";
    }
    return "";
  });

  const [isEditingBank, setIsEditingBank] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter the dynamic banks based on search
  const filteredBanks = availableBanks.filter(bank => 
    bank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (myBank) localStorage.setItem('cashspot_my_bank', myBank);
    else localStorage.removeItem('cashspot_my_bank');
  }, [myBank]);

  const handleBankSelect = (selected) => {
    setMyBank(selected);
    setIsEditingBank(false);
    setSearchTerm(""); // Reset search
    if (selected) setFilter(selected.toUpperCase());
    else setFilter("ALL");
  };

  const filterOptions = ["ALL", "ATM", "BANK"];
  if (myBank) filterOptions.push(myBank.toUpperCase());

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* TOP ROW: Segmented Control */}
      <div className="flex w-full gap-1.5 items-center relative bg-gray-100 dark:bg-[#111] p-1.5 rounded-[1.25rem]">
        {filterOptions.map((f) => {
          const isMyBankFilter = myBank && f === myBank.toUpperCase();
          const isActive = activeFilter.toUpperCase() === f.toUpperCase();
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 relative flex items-center justify-center h-10 rounded-xl text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors z-10 ${
                isActive ? 'text-white dark:text-black' : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="filterIndicator"
                  className="absolute inset-0 bg-black dark:bg-white rounded-xl shadow-md z-[-1]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {isMyBankFilter && <span>⭐</span>}
                {isMyBankFilter ? "NO-FEE" : f}
              </span>
            </button>
          );
        })}
      </div>

      {/* BOTTOM ROW: Redesigned Bank Selector */}
      <div className="flex items-center justify-between px-2 border-t border-dashed border-gray-200 dark:border-gray-800 pt-3 relative">
        <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
          No-Fee Profile
        </span>

        <div className="relative" ref={dropdownRef}>
          <AnimatePresence mode="wait">
            {!myBank || isEditingBank ? (
              <motion.div 
                key="bankTrigger"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex flex-col items-end"
              >
                {/* --- NOTHING PILL TRIGGER --- */}
                <button 
                  onClick={() => setIsEditingBank(!isEditingBank)}
                  className="group flex items-center gap-2.5 px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-full border border-transparent hover:border-black/10 dark:hover:border-white/20 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${myBank ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-black dark:text-white">
                    {myBank || "SELECT BANK"}
                  </span>
                  <motion.svg 
                    animate={{ rotate: isEditingBank ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-3.5 h-3.5 text-gray-400 group-hover:text-black dark:group-hover:text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                {/* --- THE CUSTOM DROPDOWN MENU --- */}
                {isEditingBank && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-12 w-64 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                      <input 
                        autoFocus
                        className="w-full bg-gray-100 dark:bg-[#222] px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest outline-none focus:ring-1 ring-gray-300 dark:ring-gray-700 transition-all text-black dark:text-white"
                        placeholder="SEARCH BANKS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <ul className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
                      {filteredBanks.length > 0 ? (
                        filteredBanks.map(b => (
                          <li 
                            key={b} 
                            onClick={() => handleBankSelect(b)}
                            className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white cursor-pointer transition-all flex items-center justify-between group"
                          >
                            {b}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">→</span>
                          </li>
                        ))
                      ) : (
                        <li className="px-5 py-4 text-[10px] text-gray-400 uppercase italic">No banks found nearby</li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="bankDisplay"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3 relative z-10"
              >
                <span className="text-[11px] font-bold text-black dark:text-white tracking-widest uppercase">
                  {myBank}
                </span>
                <button
                  onClick={() => setIsEditingBank(true)}
                  className="text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors underline decoration-dashed underline-offset-4 cursor-pointer"
                >
                  EDIT
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Filters;