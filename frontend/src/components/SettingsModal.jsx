import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsModal({ isOpen, onClose }) {
  // --- CORE SYSTEM STATES ---
  const [radius, setRadius] = useState(() => Number(localStorage.getItem("cashspot_radius")) || 5);
  const [haptics, setHaptics] = useState(() => localStorage.getItem("cashspot_haptics") !== "false");
  const [voice, setVoice] = useState(() => localStorage.getItem("cashspot_voice") === "true");
  const [unit, setUnit] = useState(() => localStorage.getItem("cashspot_unit") || "metric");
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem("cashspot_map_style") || "vector");
  const [phosphor, setPhosphor] = useState(() => localStorage.getItem("cashspot_phosphor") || "GREEN");

  // Sync all states with localStorage
  useEffect(() => {
    localStorage.setItem("cashspot_radius", radius);
    localStorage.setItem("cashspot_haptics", haptics);
    localStorage.setItem("cashspot_voice", voice);
    localStorage.setItem("cashspot_unit", unit);
    localStorage.setItem("cashspot_map_style", mapStyle);
    localStorage.setItem("cashspot_phosphor", phosphor);
  
    window.dispatchEvent(new Event("cashspot_settings_updated"));
  }, [radius, haptics, voice, unit, mapStyle, phosphor]);

  const clearSavedData = () => {
    if(window.confirm("Delete all pinned locations and cache? This cannot be undone.")) {
      localStorage.removeItem("cashspot_saved_spots");
      if (haptics && navigator.vibrate) navigator.vibrate([50, 50, 50]);
      alert("Hardware cache cleared.");
      window.location.reload(); 
    }
  };

  const handleToggle = (setter, val) => {
    if (haptics && navigator.vibrate) navigator.vibrate(20);
    setter(!val);
  };

  const handleSegment = (setter, val) => {
    if (haptics && navigator.vibrate) navigator.vibrate(10);
    setter(val);
  };

  const activeColor = {
    GREEN: "bg-green-500",
    AMBER: "bg-orange-500",
    CYAN: "bg-cyan-500",
    MONOCHROME: "bg-gray-800 dark:bg-gray-200"
  }[phosphor];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center pointer-events-none px-4 pb-4 md:p-0">
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          <motion.div 
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[420px] bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="px-8 pt-8 pb-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-800/60 shrink-0">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-black dark:text-white">System Specs</h2>
                <p className="text-xs font-mono tracking-widest text-gray-400 uppercase mt-1">Configuration</p>
              </div>
              <button onClick={() => onClose()} className="w-10 h-10 bg-gray-100 dark:bg-[#151515] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-full flex items-center justify-center transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
              
              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                  Telemetry
                </h3>
                
                <div className="flex flex-col gap-3 bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-semibold text-black dark:text-white">OSM Scan Radius</label>
                    <span className="font-mono text-xs bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded-md font-bold">{radius} {unit === 'metric' ? 'KM' : 'MI'}</span>
                  </div>
                  <input 
                    type="range" min="1" max="50" step="1" 
                    value={radius} 
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white mt-2"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>1 {unit === 'metric' ? 'KM' : 'MI'}</span>
                    <span>50 {unit === 'metric' ? 'KM' : 'MI'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black dark:text-white px-1">Measurement Unit</label>
                  <div className="flex bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-xl">
                    <button 
                      onClick={() => handleSegment(setUnit, 'metric')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${unit === 'metric' ? 'bg-white dark:bg-[#2a2a2a] text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                    >
                      METRIC (KM)
                    </button>
                    <button 
                      onClick={() => handleSegment(setUnit, 'imperial')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${unit === 'imperial' ? 'bg-white dark:bg-[#2a2a2a] text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                    >
                      IMPERIAL (MI)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
                  Interface
                </h3>

                {/* RESTORED: Map Rendering Engine Segmented Control */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm font-semibold text-black dark:text-white px-1">Map Rendering Engine</label>
                  <div className="flex bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-xl">
                    <button 
                      onClick={() => handleSegment(setMapStyle, 'vector')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${mapStyle === 'vector' ? 'bg-white dark:bg-[#2a2a2a] text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                    >
                      STANDARD VECTOR
                    </button>
                    <button 
                      onClick={() => handleSegment(setMapStyle, 'satellite')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${mapStyle === 'satellite' ? 'bg-white dark:bg-[#2a2a2a] text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                    >
                      SATELLITE VIEW
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-sm font-semibold text-black dark:text-white px-1">Terminal Phosphor (Accent)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "GREEN", label: "Matrix Green", color: "bg-green-500" },
                      { id: "AMBER", label: "Amber CRT", color: "bg-orange-500" },
                      { id: "CYAN", label: "Cobalt Sci-Fi", color: "bg-cyan-500" },
                      { id: "MONOCHROME", label: "Monochrome", color: "bg-gray-800 dark:bg-gray-200" }
                    ].map(theme => (
                      <button 
                        key={theme.id} 
                        onClick={() => handleSegment(setPhosphor, theme.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${phosphor === theme.id ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a]' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${theme.color} ${phosphor === theme.id ? 'shadow-md scale-110' : ''}`}></div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 cursor-pointer" onClick={() => handleToggle(setHaptics, haptics)}>
                    <div>
                      <h3 className="text-sm font-bold text-black dark:text-white">Haptic Feedback</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Physical device vibrations</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${haptics ? activeColor : 'bg-gray-300 dark:bg-gray-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${haptics ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 cursor-pointer" onClick={() => handleToggle(setVoice, voice)}>
                    <div>
                      <h3 className="text-sm font-bold text-black dark:text-white">Voice Assistant</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Audible navigation cues</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${voice ? activeColor : 'bg-gray-300 dark:bg-gray-700'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${voice ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60">
                <button 
                  onClick={clearSavedData}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-red-500 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 border border-red-100 dark:border-red-900/30 transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Clear Pinned Data
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}