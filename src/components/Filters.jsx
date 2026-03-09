function Filters({ setFilter, activeFilter }) {
  const options = [
    { label: "All", value: "ALL" },
    { label: "ATMs", value: "atm" },
    { label: "Banks", value: "bank" }
  ];

  return (
    <div className="flex w-full gap-2">
      {options.map((opt) => {
        // Checking if the current pill is active
        const isActive = activeFilter?.toLowerCase() === opt.value.toLowerCase() || 
                        (activeFilter === "ALL" && opt.value === "ALL");
                        
        return (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            // Matched the exact classes from your NavBar for a seamless look
            className={`
              flex-1 py-3 px-4 rounded-2xl text-sm font-semibold transition-all duration-300
              ${isActive 
                ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' 
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}
            `}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  );
}

export default Filters;