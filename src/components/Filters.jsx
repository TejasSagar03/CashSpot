function Filters({ setFilter, activeFilter }) {
  const filterOptions = [
    { label: "All", value: "ALL" },
    { label: "ATMs", value: "atm" },
    { label: "Banks", value: "bank" }
  ];

  return (
    <div className="flex p-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      {filterOptions.map((btn) => (
        <button
          key={btn.value}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(20);
            setFilter(btn.value);
          }}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeFilter.toLowerCase() === btn.value.toLowerCase()
              ? "bg-blue-600 text-white shadow-md transform scale-[1.02]"
              : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

export default Filters;