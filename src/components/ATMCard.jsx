import { useState } from "react";

function ATMCard({ loc, setRouteTarget }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = loc.name || loc.bank || "Unnamed Terminal";
  const displayType = loc.type || 'ATM';

  const mapLat = loc.lat;
  const mapLng = loc.lng || loc.lon; 
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapLat},${mapLng}`;

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="group p-5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-[2rem] hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer relative flex flex-col"
    >
      
      {/* Top Section: Always Visible */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex flex-col pr-4">
          <h3 className="text-lg font-semibold text-black dark:text-white leading-tight mb-1">
            {displayName}
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
            {displayType}
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Active
            </span>
          </div>
        </div>
        
        {/* Distance Pill */}
        <div className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold text-black dark:text-white whitespace-nowrap bg-gray-50 dark:bg-black">
          {(loc.distance / 1000).toFixed(2)} km
        </div>
      </div>

      {/* FIXED: Bulletproof Max-Height transition instead of buggy Grid trick */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out w-full ${
          isExpanded ? 'max-h-[200px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="w-full h-[1px] bg-gray-100 dark:bg-gray-800 mb-4"></div>
          
        <div className="flex gap-2 w-full">
          {/* Action 1: Direct to Google Maps */}
          <a 
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} 
            className="flex-1 flex items-center justify-center gap-2 py-3 px-2 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-bold uppercase tracking-wide hover:scale-[1.02] transition-transform shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Google Maps
          </a>

          {/* Action 2: In-App Routing */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (setRouteTarget) setRouteTarget(loc); 
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-2 bg-transparent border border-black dark:border-white text-black dark:text-white rounded-2xl text-[11px] font-bold uppercase tracking-wide hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            In-App Route
          </button>
        </div>
      </div>

    </div>
  );
}

export default ATMCard;