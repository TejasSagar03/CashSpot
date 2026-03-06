function ATMCard({ loc }) {
  // Construct a universal Google Maps directions URL (User Location to ATM Location)
  // This will automatically open in the Google Maps App on mobile.
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;

  const handleNavigation = () => {
    // Provide a distinct haptic double tap on mobile
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    // Open in a new tab/app
    window.open(navigationUrl, "_blank");
  };

  return (
    <div
      className="p-4 mb-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4 active:scale-95 duration-100"
      onClick={handleNavigation}
      title={`Maps to ${loc.name}`}
    >
      {/* Icon Circle */}
      <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1">
        {/* We use a different icon based on type (ATM vs Bank) */}
        {loc.type === 'bank' ? (
          // Bank Icon (Building)
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m0 10V4m0 10h.01" /></svg>
        ) : (
          // ATM Icon (Card/Machine)
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )}
      </div>
      
      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1 truncate">
          {loc.name !== "ATM" ? loc.name : `${loc.bank} ATM`}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {loc.address || loc.bank}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-semibold">
          <span className={`${loc.cash === "Deposit Available" ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50" : "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"} px-2.5 py-1 rounded-md`}>
            {loc.cash === "Deposit Available" ? "Cash & Deposit" : "Withdrawal Only"}
          </span>
          {loc.hours !== "24 Hours" && (
            <span className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
              {loc.hours}
            </span>
          )}
        </div>
      </div>

      {/* Distance Tracker & Navigation Icon */}
      {loc.distance && (
        <div className="flex flex-col items-end h-full pt-1 gap-2">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
            {loc.distance} km
          </span>
          {/* A small arrow indicating direct navigation */}
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      )}
    </div>
  );
}

export default ATMCard;