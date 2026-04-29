import { motion } from "framer-motion";

export default function RadarScan() {
  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.5 }}
      // 'fixed' and 'z-[9999]' ensures it covers the ENTIRE screen, including the sidebar
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/10 dark:bg-black/50 pointer-events-none"
    >
      
      {/* THE IOS GLASS LENS */}
      <div className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] flex items-center justify-center rounded-full border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Hardware Rings */}
        <div className="absolute inset-[15%] rounded-full border border-black/10 dark:border-white/10" />
        <div className="absolute inset-[35%] rounded-full border border-dashed border-black/20 dark:border-white/20" />
        <div className="absolute inset-[65%] rounded-full border border-dotted border-black/30 dark:border-white/30" />
        
        {/* Technical Crosshairs */}
        <div className="absolute w-full h-[1px] bg-black/10 dark:bg-white/10" />
        <div className="absolute h-full w-[1px] bg-black/10 dark:bg-white/10" />

        {/* INLINE SVG ROTATING GLOBE (Perfectly smooth, no images required) */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[25%] flex items-center justify-center opacity-30 dark:opacity-20"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-black dark:stroke-white" fill="none" strokeWidth="0.5">
            <circle cx="50" cy="50" r="49"/>
            <ellipse cx="50" cy="50" rx="25" ry="49"/>
            <ellipse cx="50" cy="50" rx="10" ry="49"/>
            <line x1="0" y1="50" x2="100" y2="50"/>
            <line x1="15" y1="25" x2="85" y2="25"/>
            <line x1="15" y1="75" x2="85" y2="75"/>
          </svg>
        </motion.div>

        {/* The Sweeping Beam - Soft and Cinematic */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{ background: "conic-gradient(from 0deg, transparent 75%, rgba(204, 0, 0, 0.3) 100%)" }}
        />

        {/* Active Grid Pings */}
        <RadarBlip top="25%" left="60%" delay={0.2} />
        <RadarBlip top="65%" left="30%" delay={1.4} />

        {/* Center Hardware LED */}
        <div className="relative z-10 w-2.5 h-2.5 bg-[#cc0000] dark:bg-[#ff0000] rounded-full shadow-[0_0_15px_rgba(255,0,0,0.8)]">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
        </div>
      </div>

      {/* TERMINAL DATA DISPLAY */}
      <div className="mt-12 text-center flex flex-col items-center">
        <h2 
          style={{ fontFamily: "'ndot 45', sans-serif" }} 
          className="text-black dark:text-white tracking-[0.25em] text-2xl md:text-3xl uppercase drop-shadow-md"
        >
          ACQUIRING_DATA
        </h2>
        
        <div className="flex flex-col items-center gap-1.5 mt-2 font-mono text-[10px] md:text-xs text-gray-600 dark:text-gray-400 tracking-[0.2em] uppercase">
          <span className="animate-pulse">SYS.OP // SPATIAL_GRID_SCAN</span>
          <span className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-md">
            <span className="w-1.5 h-1.5 bg-[#cc0000] dark:bg-[#ff0000] rounded-full animate-pulse shadow-[0_0_5px_rgba(204,0,0,1)]"></span>
            <span className="text-[9px] font-bold text-black dark:text-white tracking-widest">LIVE TELEMETRY</span>
          </span>
        </div>
      </div>
      
    </motion.div>
  );
}

function RadarBlip({ top, left, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
      transition={{ repeat: Infinity, duration: 2, delay, ease: "circOut" }}
      style={{ top, left }}
      className="absolute w-3 h-3 rounded-full bg-black dark:bg-white shadow-lg z-20"
    >
      <div className="absolute inset-0 rounded-full bg-black dark:bg-white opacity-40 animate-ping" />
    </motion.div>
  );
}