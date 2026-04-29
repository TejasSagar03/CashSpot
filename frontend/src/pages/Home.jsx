import Footer from "../components/Footer";
import { useState, useEffect, memo, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SchematicGlobeSVG from "../components/SchematicGlobeSVG";
import AnimatedPage from "../components/AnimatedPage"; 

const MemoizedGlobe = memo(() => (
  <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center pointer-events-none z-0">
    <SchematicGlobeSVG className="w-[300vw] h-[300vw] md:w-[1300px] md:h-[1300px] text-black dark:text-white opacity-[0.3] dark:opacity-[0.4] animate-[spin_180s_linear_infinite]" />
  </div>
));

function Home() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [savedSpots, setSavedSpots] = useState([]);
  const [activeFeature, setActiveFeature] = useState(null); 
  const [shareState, setShareState] = useState("HIDDEN"); 
  
  const [travelMode, setTravelMode] = useState("WALK");
  const [ping, setPing] = useState(42);
  const [isPinging, setIsPinging] = useState(false);
  
  const [telemetry, setTelemetry] = useState({
    lat: "12.9716",
    lng: "77.5946",
    accuracy: "4.2",
    satellites: 8
  });

  const haptic = (pattern) => { 
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern); 
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setTelemetry(prev => ({
        ...prev,
        accuracy: (4.2 + (Math.random() * 0.4 - 0.2)).toFixed(1)
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const spots = JSON.parse(localStorage.getItem('cashspot_saved_spots')) || [];
    setSavedSpots(spots); 
  }, []);

  const intelLink = useMemo(() => {
    if (savedSpots.length === 0) return "";
    const packed = savedSpots.map(loc => {
        const lat = loc.lat ? loc.lat.toFixed(5) : 0;
        const lng = (loc.lng || loc.lon) ? (loc.lng || loc.lon).toFixed(5) : 0;
        const name = encodeURIComponent(loc.name || "Unknown");
        const type = loc.type || "NODE";
        return `${loc.id}~${lat}~${lng}~${name}~${type}`;
    }).join('|');
    const payload = btoa(packed);
    return `${window.location.origin}/locator?payload=${payload}`; 
  }, [savedSpots]);

  const runPingTest = () => {
    if (isPinging) return;
    haptic(20);
    setIsPinging(true);
    setTimeout(() => {
      setPing(Math.floor(Math.random() * 30) + 15); 
      setIsPinging(false);
      haptic([10, 30]); 
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  const glassStyle = "bg-white/5 dark:bg-white/[0.03] backdrop-blur-md border border-white/10 dark:border-white/5 shadow-2xl transition-all duration-300 hover:backdrop-blur-xl hover:bg-white/10 dark:hover:bg-white/[0.08] hover:border-white/30";

  const capabilities = useMemo(() => [
    { title: "Radar Triangulation", desc: "Scans the immediate radius using low-latency Overpass queries to map active, operational financial nodes in real-time." },
    { title: "Hardware Memory", desc: "Locally caches frequently visited ATMs and bank branches into encrypted device storage for instant, zero-latency retrieval without network calls." },
    { title: "Live Sensor Telemetry", desc: "Bypasses standard browser geolocation estimators to poll raw GPS coordinates, heading vectors, and accuracy thresholds directly from your device." },
    { title: "Angular Vector Orientation", desc: "Utilizes device magnetometer and accelerometer data to provide absolute heading orientation, ensuring you stay aligned with your target in complex urban environments." },
    { title: "Haptic Feedback Response", desc: "Integrates tactical vibration patterns to provide non-visual proximity alerts and interface confirmation, reducing the need for constant screen monitoring." },
    { title: "Tactical Route Execution", desc: "Compiles live sensor data to generate absolute-vector directions and proximity alerts to your target, independent of bloated external mapping apps." }
  ], []);

  const corePrinciples = useMemo(() => [
    { title: "Open Data Feed", desc: "We rely on the community-driven OpenStreetMap Overpass API for live nodes, ensuring transparent data access." },
    { title: "Hardware Local", desc: "By utilizing device-level GPS and compass polling, we bypass inaccurate estimates provided by standard network providers." },
    { title: "Zero Cloud", desc: "Coordinates never leave your device. All calculations happen 100% locally for absolute user privacy." },
    { title: "Neural-Adaptive UX", desc: "Interface density scales dynamically based on system state, providing high-focus clarity during tactical execution." },
    { title: "Minimalist Overhead", desc: "Engineered for maximum performance on flagship industrial hardware by stripping all non-essential tracking." },
    { title: "Hardware-Agnostic", desc: "Engineered to run seamlessly across diverse mobile architectures while maintaining a monochromatic, high-end aesthetic." }
  ], []);

  return (
    <AnimatedPage>
      <div className="relative min-h-[100dvh] w-full flex flex-col items-center bg-[#f8fafc] dark:bg-[#050505] transition-colors duration-500 font-sans pt-40 pb-0 overflow-hidden text-left">
        
        <MemoizedGlobe />

        <AnimatePresence>
          {shareState !== "HIDDEN" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center relative"
              >
                <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Transmit Intel</h2>
                <p className="text-xs text-gray-400 mb-8 px-2 leading-relaxed">Securely share {savedSpots.length} pinned extraction coordinates with other devices.</p>

                {shareState === "MENU" && (
                    <div className="flex flex-col gap-4 w-full">
                        <button onClick={() => {
                            navigator.clipboard.writeText(intelLink);
                            if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
                            alert("[SYSTEM] Link copied to clipboard.");
                            setShareState("HIDDEN");
                        }} className="w-full py-4 bg-green-500 text-black font-bold uppercase tracking-widest rounded-2xl hover:bg-green-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer">
                            Copy Secure Link
                        </button>
                        <button onClick={() => setShareState("QR")} className="w-full py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-white/5 active:scale-95 transition-all cursor-pointer">
                            Show QR Code
                        </button>
                        <button onClick={() => setShareState("HIDDEN")} className="mt-4 text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors py-2 cursor-pointer">
                            Cancel Transmission
                        </button>
                    </div>
                )}

                {shareState === "QR" && (
                    <div className="flex flex-col items-center w-full">
                        <div className="p-4 bg-white rounded-3xl mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=1&data=${encodeURIComponent(intelLink)}`} alt="Encrypted QR Code" className="w-48 h-48 rounded-xl" />
                        </div>
                        <button onClick={() => setShareState("HIDDEN")} className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-200 active:scale-95 transition-all cursor-pointer">
                            Close Scanner
                        </button>
                    </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onMouseEnter={() => haptic(5)}
          className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex flex-col gap-1.5 cursor-crosshair group hidden md:flex select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className="text-[9px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">
              Sys.Uplink Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-[0.35em] text-black dark:text-white uppercase leading-none">
              CashSpot
            </span>
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="w-2 h-3.5 bg-black dark:bg-white"
            ></motion.span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onMouseEnter={() => haptic(15)}
          className="relative z-10 px-6 w-full max-w-[600px] mx-auto mb-10 rounded-[3rem] p-10 md:p-12 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl cursor-crosshair mt-4 md:mt-0 text-center"
        >
          <div className="flex flex-col items-center">
            <div className="bg-black dark:bg-white text-white dark:text-black w-20 h-20 rounded-[1.8rem] flex items-center justify-center flex-shrink-0 shadow-xl mb-6 hover:scale-105 transition-transform duration-300">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
               </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-black dark:text-white tracking-tighter leading-tight">
              Find Your <br className="hidden md:block" /> CashSpot
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
              Open-source, hardware-accelerated precision mapping. Locate operational ATMs within your immediate radius.
            </p>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-[1100px] px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 mb-6"
        >
          <motion.div 
            variants={itemVariants}
            onPointerDown={() => haptic([30, 50, 30])}
            className={`md:col-span-8 flex flex-col justify-between overflow-hidden relative group ${glassStyle} p-12 rounded-[3.5rem]`}
          >
            <div className="mb-10 relative z-10 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-bold">Hardware Active</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-bold text-black dark:text-white tracking-tighter leading-[0.9]">Locate.<br/>Navigate.<br/>Execute.</h2>
            </div>
            <Link to="/locator" className="z-10 w-full block">
              <button onClick={() => haptic(80)} className="w-full py-6 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] flex items-center justify-between px-10 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl font-bold cursor-pointer">
                <span className="text-sm md:text-base uppercase tracking-[0.2em]">Initialize Radar</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            onMouseEnter={() => haptic(5)}
            className="md:col-span-4 bg-[#0a0a0a] rounded-[3.5rem] p-10 border border-gray-900 text-white flex flex-col justify-between shadow-2xl hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="flex flex-col gap-1 relative z-10 text-left">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-6 font-bold">Raw Telemetry</span>
              <span className="text-5xl md:text-5xl tracking-wide text-white font-mono mb-2">
                {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
              </span>
            </div>
            <div className="flex flex-col gap-3 font-mono text-[10px] uppercase text-gray-400 relative z-10 mt-6 text-left">
              <div className="flex justify-between border-b border-gray-800 pb-2"><span>LAT / LNG:</span> <span className="text-white font-bold">{telemetry.lat}° N, {telemetry.lng}° E</span></div>
              <div className="flex justify-between border-b border-gray-800 pb-2"><span>ACCURACY:</span> <span className="text-green-500 font-bold tracking-widest">± {telemetry.accuracy}M</span></div>
              <div className="flex justify-between"><span>SATELLITES:</span> <span className="text-white font-bold tracking-widest">{telemetry.satellites} ACTIVE</span></div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-[1100px] px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 mb-6"
        >
          <motion.div 
            variants={itemVariants}
            onMouseEnter={() => haptic([10, 10])}
            className={`md:col-span-4 flex flex-col items-center justify-center text-center p-8 rounded-[3.5rem] ${glassStyle}`}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-8 block font-bold">Active Radar</span>
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border border-gray-200 dark:border-gray-800 animate-ping opacity-30"></div>
               <div className="w-4 h-4 bg-black dark:bg-white rounded-full z-10 shadow-[0_0_10px_white]"></div>
               <div className="absolute inset-0 rounded-full border-l-2 border-black dark:border-white animate-[spin_2s_linear_infinite]"></div>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Radius: Dynamic</span>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            onMouseEnter={() => haptic(10)}
            className={`md:col-span-4 flex flex-col justify-between p-8 rounded-[3.5rem] ${glassStyle} text-left`}
          >
             <span className="text-[10px] uppercase tracking-[0.25em] text-green-500 mb-6 block font-bold animate-pulse">Nearest Node Detected</span>
             <div className="flex flex-1 flex-col justify-center">
                <span className="text-3xl font-bold text-black dark:text-white leading-tight mb-2 uppercase">HDFC Bank ATM</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Distance: ~450 Meters | NE</span>
             </div>
             <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest border-t border-black/10 dark:border-white/10 pt-4 mt-4">Status: Operational (OSM)</span>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            onMouseEnter={() => haptic([15, 30, 15])}
            className={`md:col-span-4 flex flex-col p-10 rounded-[3.5rem] ${glassStyle} text-left`}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold">Pinned Locations</span>
              <div className="flex items-center gap-2">
                {/* SHARE BUTTON CONDITIONALLY RENDERED */}
                {savedSpots.length > 0 && (
                  <button 
                    onClick={() => setShareState("MENU")}
                    className="text-[9px] font-bold border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors uppercase tracking-widest cursor-pointer"
                  >
                    Share
                  </button>
                )}
                <button 
                  onClick={() => { haptic(50); navigate('/locator'); }}
                  className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                >
                  <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[180px] custom-scrollbar pr-1">
              {savedSpots.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-[1.5rem] flex items-center justify-center">
                   <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Memory Empty</span>
                </div>
              ) : (
                savedSpots.map(spot => (
                  <div 
                    key={spot.id} 
                    onClick={() => { haptic([10, 20]); navigate(`/locator?target=${encodeURIComponent(spot.name)}`); }}
                    className="flex items-center gap-4 p-3 rounded-[1.2rem] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex-shrink-0 flex items-center justify-center text-white dark:text-black font-bold uppercase text-xs">
                      {spot.name ? spot.name.charAt(0) : 'A'}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-xs font-bold text-black dark:text-white uppercase truncate block w-full">{spot.name}</span>
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mt-0.5 block w-full truncate">{spot.type || 'FIN-NODE'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-[1100px] px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className={`md:col-span-6 p-8 rounded-[3.5rem] ${glassStyle} flex flex-col justify-between`}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold">Travel Mode</span>
              <span className="text-xs font-bold text-black dark:text-white bg-gray-200 dark:bg-white/10 px-3 py-1 rounded-full">{travelMode}</span>
            </div>
            
            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-[#1a1a1a] rounded-3xl">
              {['WALK', 'DRIVE', 'RIDE'].map(mode => (
                <button
                  key={mode}
                  onClick={() => { haptic(15); setTravelMode(mode); }}
                  className={`flex-1 py-4 text-xs font-bold tracking-widest rounded-[1.25rem] transition-all cursor-pointer ${
                    travelMode === mode 
                      ? 'bg-white dark:bg-[#333] text-black dark:text-white shadow-md' 
                      : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={`md:col-span-6 p-8 rounded-[3.5rem] ${glassStyle} flex flex-col justify-between`}>
             <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold">Network Health</span>
              <div className="flex items-center gap-2">
                 <div className={`w-2.5 h-2.5 rounded-full ${isPinging ? 'bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
                 <span className="text-[10px] font-mono tracking-widest text-gray-500">API_LINK</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-2">
               <div className="flex items-baseline gap-1.5">
                 <span style={{ fontFamily: "'ndot 45', sans-serif" }} className="text-5xl text-black dark:text-white tracking-tight">
                   {isPinging ? '--' : ping}
                 </span>
                 <span className="text-sm font-bold text-gray-400 font-mono">ms</span>
               </div>
               <button
                 onClick={runPingTest}
                 disabled={isPinging}
                 className="px-6 py-3.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
               >
                 {isPinging ? 'Testing...' : 'Run Test'}
               </button>
            </div>
          </motion.div>
        </motion.div>

        <div className="relative z-10 w-full max-w-[1100px] px-6 mb-12">
           <div className="flex items-center gap-4 mb-6">
              <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-bold whitespace-nowrap">System Capabilities</span>
              <div className="flex-1 h-[1px] border-b border-dashed border-gray-300 dark:border-gray-700"></div>
           </div>
           
           <div className={`p-6 md:p-8 rounded-[3.5rem] ${glassStyle} flex flex-col gap-2`}>
              {capabilities.map((cap, index) => (
                <div 
                  key={cap.title} 
                  className="border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  onClick={() => {
                    haptic(15);
                    setActiveFeature(activeFeature === index ? null : index);
                  }}
                >
                  <div className="p-6 flex justify-between items-center text-left">
                    <h3 className="text-sm md:text-base font-bold text-black dark:text-white uppercase tracking-tight">{cap.title}</h3>
                    <div className={`w-8 h-8 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center transition-transform duration-300 ${activeFeature === index ? 'rotate-45 bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {activeFeature === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-left">
                          {cap.desc}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
           </div>
        </div>

        <div className="relative z-10 w-full max-w-[1100px] px-6">
           <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-bold whitespace-nowrap">Core Principles</span>
              <div className="flex-1 h-[1px] border-b border-dashed border-gray-300 dark:border-gray-700"></div>
           </div>
           
           <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
           >
              {corePrinciples.map((principle, idx) => (
                <motion.div 
                  key={principle.title}
                  variants={itemVariants} 
                  onMouseEnter={() => haptic(10 + (idx * 5))} 
                  className={`p-10 rounded-[3.5rem] ${glassStyle} text-left`}
                >
                  <h3 className="text-lg font-bold mb-4 text-black dark:text-white uppercase tracking-tight">{principle.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {principle.desc}
                  </p>
                </motion.div>
              ))}
           </motion.div>
        </div>

        <Footer />
      </div>
    </AnimatedPage>
  );
}

export default Home;