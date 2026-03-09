function ATMCard({ loc }) {
  // Safe fallback for names
  const displayName = loc.name || loc.bank || "Unnamed Terminal";
  const displayType = loc.type || 'ATM';

  return (
    <div className="group p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer relative overflow-hidden">
      
      <div className="flex justify-between items-start mb-6">
        <div className="pr-4">
          <h3 className="text-lg font-semibold text-black dark:text-white leading-tight mb-1">
            {displayName}
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
            {displayType}
          </p>
        </div>
        
        {/* Distance Pill */}
        <div className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold text-black dark:text-white whitespace-nowrap">
          {(loc.distance / 1000).toFixed(2)} km
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        Operational
      </div>

      {/* Subtle hover arrow */}
      <svg className="w-5 h-5 absolute bottom-6 right-6 text-black dark:text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </div>
  );
}

export default ATMCard;