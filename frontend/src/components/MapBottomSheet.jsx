import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function MapBottomSheet({ children }) {
  // Start minimized on mobile so the user sees the map first!
  const [isMinimized, setIsMinimized] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect if we are on a laptop to disable the swipe physics
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <motion.div
      initial={false}
      // On mobile, if minimized, push it down so only the top 130px (Search Bar) shows.
      // On desktop, it always stays fully open (y: 0).
      animate={{ y: isMinimized && !isDesktop ? "calc(100% - 140px)" : "0%" }}
      transition={{ type: "spring", damping: 25, stiffness: 250 }}
      
      // Enable vertical dragging only on mobile
      drag={isDesktop ? false : "y"}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={(e, info) => {
        // If swiped down hard enough, minimize it
        if (info.offset.y > 40) setIsMinimized(true);
        // If swiped up hard enough, expand it
        if (info.offset.y < -40) setIsMinimized(false);
      }}

      className="fixed bottom-0 left-0 w-full h-[80vh] bg-[#fdfdfd] dark:bg-[#050505] rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-15px_40px_rgba(0,0,0,0.5)] z-[500] flex flex-col overflow-hidden border-t border-gray-200 dark:border-gray-800
                 md:absolute md:top-28 md:left-6 md:w-[400px] md:h-[calc(100vh-140px)] md:rounded-[2rem] md:shadow-2xl md:border"
    >
      {/* 1. Drag Handle (Only visible on Mobile) */}
      <div 
        className="w-full pt-5 pb-3 flex justify-center items-center cursor-grab active:cursor-grabbing shrink-0 md:hidden" 
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors hover:bg-gray-400"></div>
      </div>

      {/* 2. Your Content Area (Search Bar + Active Grid) */}
      {/* When minimized, overflow-hidden stops scrolling. When expanded, it scrolls normally. */}
      <div className={`flex-1 w-full px-6 pb-6 ${isMinimized && !isDesktop ? 'overflow-hidden pointer-events-none' : 'overflow-y-auto pointer-events-auto'}`}>
         {/* We wrap children in a div that re-enables pointer events so the search bar works even when minimized */}
         <div className="pointer-events-auto">
            {children}
         </div>
      </div>
    </motion.div>
  );
}