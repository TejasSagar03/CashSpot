import React from "react";
import { motion } from "framer-motion";

function ATMCard({ loc, setRouteTarget, setCompassTarget, travelMode = "walking" }) {
  // If your data source ever provides a status, it reads it here. Otherwise, defaults to 'active'.
  const status = loc.status || 'active';

  const displayName = loc.name || loc.bank || "Unnamed Terminal";
  const displayType = loc.type || 'ATM';
  
  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}M`;
    return `${(meters / 1000).toFixed(2)}KM`;
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=$${loc.lat},${loc.lng || loc.lon}&travelmode=${travelMode}`;

  // Clean, high-contrast display states
  const statusConfig = {
    active: { label: 'ACTIVE', dot: 'bg-black dark:bg-white', text: 'text-black dark:text-white' },
    out_of_cash: { label: 'NO CASH', dot: 'bg-transparent border-2 border-black dark:border-white', text: 'text-gray-500 dark:text-gray-400' },
    broken: { label: 'BROKEN', dot: 'bg-red-500', text: 'text-red-500 font-bold' }
  };
  const currentStatus = statusConfig[status] || statusConfig.active;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="shrink-0 flex-none w-full min-h-[120px] p-5 bg-white dark:bg-black border-[2px] border-black dark:border-white rounded-3xl cursor-pointer flex flex-col relative shadow-sm"
    >
      
      {/* --- TOP: DATA & TELEMETRY --- */}
      <div className="flex justify-between items-start gap-4 w-full">
        <div className="flex flex-col flex-1 overflow-hidden">
          <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">
          [{displayType}]
          </span>
          
          <h3 className="text-2xl font-black text-black dark:text-white leading-none truncate mb-2">
            {displayName}
          </h3>
          
          {/* STATIC STATUS DISPLAY */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot}`}></div>
            <span style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-[11px] tracking-[0.1em] ${currentStatus.text}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>
        
        {/* Hardware-style inverted distance pill */}
        <div className="flex flex-col items-end shrink-0">
          <div 
            style={{ fontFamily: "'ndot 45', sans-serif" }} 
            className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-[14px] tracking-widest flex items-center justify-center"
          >
            {formatDistance(loc.distance)}
          </div>
        </div>
      </div>

     {/* --- BOTTOM: NAVIGATION ACTIONS --- */}
      {/* Dashed border for the tech/schematic vibe */}
      <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700 flex justify-start items-center w-full">
        
        <div className="flex items-center gap-3">
          {/* Compass Button */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); if (setCompassTarget) setCompassTarget(loc); }}
            className="w-10 h-10 flex items-center justify-center bg-transparent border-2 border-black dark:border-white text-black dark:text-white rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </motion.button>

          {/* Route Button */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); if (setRouteTarget) setRouteTarget(loc); }}
            className="w-10 h-10 flex items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </motion.button>

          {/* Google Maps Button */}
          <motion.a 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 flex items-center justify-center bg-transparent border-2 border-black dark:border-white text-black dark:text-white rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </motion.a>
        </div>

      </div>
    </motion.div>
  );
}

export default ATMCard;