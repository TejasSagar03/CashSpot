import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Calculates absolute angle (0-360) Line-of-Sight
function calculateBearing(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Calculates distance in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Browser-safe Haptic Engine
const triggerHaptic = (pattern) => {
  try {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (err) {}
};

export default function HardwareCompass({ target, userLocation, onClose }) {
  const [heading, setHeading] = useState(0); 
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  
  // Database & Crowdsourcing State
  const [atmStatus, setAtmStatus] = useState("Checking...");
  const [isReporting, setIsReporting] = useState(false);

  const accumulatedRotationRef = useRef(0);
  const lastHapticTickRef = useRef(0);

  const targetLat = target?.lat;
  const targetLng = target?.lng || target?.lon;
  const targetId = target?.id || target?.osm_id || "demo-atm-id";
  
  const bearing = (userLocation && targetLat && targetLng) 
    ? calculateBearing(userLocation[0], userLocation[1], targetLat, targetLng) : 0;
    
  const distance = (userLocation && targetLat && targetLng)
    ? calculateDistance(userLocation[0], userLocation[1], targetLat, targetLng) : null;

  // ---> BACKGROUND SYNC ENGINE <---
  useEffect(() => {
    const syncOfflineData = async () => {
      const offlineQueue = JSON.parse(localStorage.getItem('offlineReports')) || [];
      if (offlineQueue.length > 0) {
        console.log(`Syncing ${offlineQueue.length} offline reports...`);
        for (let report of offlineQueue) {
          try {
           await fetch(`https://cashspot-backend.onrender.com/api/locations/report`, {
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(report)
            });
          } catch (err) {
            return; 
          }
        }
        localStorage.removeItem('offlineReports');
        triggerHaptic([50, 100, 50]); 
      }
    };

    window.addEventListener('online', syncOfflineData);
    if (navigator.onLine) syncOfflineData();
    return () => window.removeEventListener('online', syncOfflineData);
  }, []);

  // ---> FETCH LIVE STATUS ON LOAD <---
  useEffect(() => {
    if (targetId) {
      fetch(`https://cashspot-backend.onrender.com/api/locations/${targetId}`)
        .then(res => res.json())
        .then(data => setAtmStatus(data.status || 'Operational'))
        .catch(err => setAtmStatus('Operational')); 
    }
  }, [targetId]);

  // ---> OFFLINE-READY REPORT FUNCTION <---
  const handleReport = async (newStatus) => {
    setIsReporting(true);
    triggerHaptic([20, 30, 20]);
    
    const reportData = {
      osm_id: targetId,
      name: target?.bank || target?.name || "Terminal",
      lat: targetLat,
      lng: targetLng,
      newStatus: newStatus,
      timestamp: new Date().getTime()
    };

    if (navigator.onLine) {
      try {
        await fetch(`https://cashspot-backend.onrender.com/api/locations/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });
        setAtmStatus(newStatus);
      } catch (err) {}
    } else {
      const existingQueue = JSON.parse(localStorage.getItem('offlineReports')) || [];
      existingQueue.push(reportData);
      localStorage.setItem('offlineReports', JSON.stringify(existingQueue));
      setAtmStatus(newStatus); 
      triggerHaptic([10, 10, 10]); 
    }
    setIsReporting(false);
  };

  // ARRIVAL LOGIC (< 15 meters)
  useEffect(() => {
    if (distance !== null && distance < 15 && !hasArrived) {
      setHasArrived(true);
      triggerHaptic([50, 100, 50, 100, 300]); 
    }
  }, [distance, hasArrived]);

  // ---> MISSING FUNCTION RESTORED: SENSOR PERMISSION <---
  const requestAccess = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          setNeedsPermission(false);
        }
      } catch (error) {}
    } else {
      setPermissionGranted(true);
      setNeedsPermission(false);
    }
    triggerHaptic([10]);
  };

  // ---> UPGRADED SENSOR CALIBRATION (WITH ROTATION FIX) <---
  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setNeedsPermission(!permissionGranted);
    } else {
      setPermissionGranted(true);
    }

    let absoluteSupported = false;

    const handleOrientation = (e) => {
      let compassHeading = 0;

      if (e.webkitCompassHeading !== undefined) {
        compassHeading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        compassHeading = 360 - e.alpha;
      } else {
        return; 
      }

      let screenAngle = 0;
      if (window.screen && window.screen.orientation) {
        screenAngle = window.screen.orientation.angle || 0;
      } else if (typeof window.orientation !== 'undefined') {
        screenAngle = window.orientation || 0;
      }

      compassHeading = (compassHeading + screenAngle) % 360;
      if (compassHeading < 0) compassHeading += 360;

      setHeading(compassHeading);
    };

    const handleAbsolute = (e) => {
      absoluteSupported = true;
      handleOrientation(e);
    };

    const handleStandard = (e) => {
      if (!absoluteSupported || e.webkitCompassHeading !== undefined) {
        handleOrientation(e);
      }
    };

    if (permissionGranted) {
      window.addEventListener("deviceorientationabsolute", handleAbsolute, true);
      window.addEventListener("deviceorientation", handleStandard, true);
    }
    
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleAbsolute, true);
      window.removeEventListener("deviceorientation", handleStandard, true);
    };
  }, [permissionGranted]);

  // ANTI-SNAP MATH
  let targetRotation = bearing - heading;
  let diff = (targetRotation - accumulatedRotationRef.current) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  accumulatedRotationRef.current += diff;

  // PHYSICAL ROTARY & LOCK HAPTICS
  useEffect(() => {
    const isAligned = Math.abs(diff) < 8; 
    
    if (isAligned && !isLocked) {
      setIsLocked(true);
      triggerHaptic([30, 40, 30]); 
    } else if (!isAligned && isLocked) {
      setIsLocked(false);
      triggerHaptic([15]); 
    }

    const currentTick = Math.floor(heading / 3);
    if (currentTick !== lastHapticTickRef.current) {
      if (!isAligned) triggerHaptic([2]); 
      lastHapticTickRef.current = currentTick;
    }
  }, [diff, heading, isLocked]);

  const handleTouch = useCallback(() => triggerHaptic([15, 20, 15]), []);

  // DYNAMIC STATUS COLORS
  let statusColor = 'text-green-500';
  let indicatorBg = 'bg-green-500';
  let indicatorShadow = 'shadow-[0_0_10px_rgba(34,197,94,0.5)]'; 

  if (atmStatus === 'Out of Cash') {
    statusColor = 'text-orange-500';
    indicatorBg = 'bg-orange-500';
    indicatorShadow = 'shadow-[0_0_10px_rgba(249,115,22,0.5)]'; 
  } else if (atmStatus === 'Broken') {
    statusColor = 'text-[#cc0000] dark:text-[#ff0000]';
    indicatorBg = 'bg-[#cc0000] dark:bg-[#ff0000]';
    indicatorShadow = 'shadow-[0_0_10px_rgba(204,0,0,0.5)]'; 
  }

  // 36 PRECISION TICKS
  const renderTicks = () => {
    return Array.from({ length: 36 }).map((_, i) => (
      <div key={i} style={{ transform: `rotate(${i * 10}deg)` }} className="absolute w-full h-full flex justify-center top-0 left-0">
        <div className={`w-[1.5px] ${i % 9 === 0 ? 'h-3 bg-black dark:bg-white' : 'h-1.5 bg-gray-300 dark:bg-gray-700'} rounded-full`}></div>
      </div>
    ));
  };

  return (
    <motion.div 
      // FIXED: Animate ONLY opacity. The backdrop-blur is now a static Tailwind class. This guarantees 60fps on mobile.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-end md:justify-center bg-black/40 dark:bg-black/80 backdrop-blur-xl p-4 pb-12 pointer-events-auto"
    >
      <div className="relative w-full max-w-[400px] flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {!hasArrived ? (
            <motion.div 
              key="compass"
              // UPGRADED PHYSICS: Lower mass, higher stiffness. Exits fast.
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: isLocked ? 1.04 : 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20, transition: { duration: 0.15, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 450, damping: 25, mass: 0.5 }}
              className={`relative w-full bg-[#fdfdfd] dark:bg-[#050505] rounded-[3rem] p-8 pb-10 transition-colors duration-300 shadow-2xl flex flex-col items-center border ${isLocked ? 'border-[#cc0000] dark:border-[#ff0000] shadow-[0_20px_50px_rgba(204,0,0,0.15)]' : 'border-gray-200 dark:border-gray-800/50'}`}
            >
              
              <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none rounded-[3rem]" style={{ backgroundImage: 'radial-gradient(currentColor 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

              <div className="w-full flex justify-between items-start mb-8 z-10">
                <div className="flex flex-col">
                  <h2 className="text-[28px] font-black text-black dark:text-white leading-none tracking-tight mb-2 truncate w-48 font-['Space_Grotesk']">
                    {target?.bank || target?.name || "Terminal"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${indicatorBg} ${indicatorShadow} animate-pulse transition-colors duration-300`}></div>
                    <p style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-[10px] tracking-widest uppercase transition-colors duration-300 ${statusColor}`}>
                      {atmStatus}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="w-12 h-12 bg-transparent border-[1.5px] border-gray-200 dark:border-gray-800 rounded-full flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-90 transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {needsPermission ? (
                 <div className="py-12 flex flex-col items-center text-center z-10 w-full">
                   <button onClick={requestAccess} className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest px-8 py-5 rounded-full active:scale-95 transition-transform shadow-lg text-sm" style={{ fontFamily: "'ndot 45', sans-serif" }}>
                     Initialize Hardware
                   </button>
                 </div>
              ) : (
                <>
                  <motion.div 
                    whileTap={{ scale: 0.96 }}
                    onClick={handleTouch}
                    animate={{ scale: isLocked ? 1.04 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="relative w-[280px] h-[280px] flex items-center justify-center z-10 cursor-pointer my-2"
                  >
                    <div className="absolute inset-0 rounded-full border border-dashed border-gray-300 dark:border-gray-700 pointer-events-none"></div>
                    <div className="absolute inset-6 rounded-full border border-gray-100 dark:border-gray-900 pointer-events-none"></div>

                    <div className="absolute inset-8 flex items-center justify-center z-0 pointer-events-none">
                       {renderTicks()}
                       <span className="absolute top-5 font-bold text-[14px] text-black dark:text-white font-['Space_Grotesk']">N</span>
                       <span className="absolute bottom-5 font-bold text-[12px] text-gray-400 font-['Space_Grotesk']">S</span>
                       <span className="absolute left-5 font-bold text-[12px] text-gray-400 font-['Space_Grotesk']">W</span>
                       <span className="absolute right-5 font-bold text-[12px] text-gray-400 font-['Space_Grotesk']">E</span>
                    </div>

                    <motion.div 
                      animate={{ rotate: accumulatedRotationRef.current }}
                      transition={{ type: "spring", stiffness: 140, damping: 14, mass: 0.5 }} 
                      className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none drop-shadow-[0_12px_15px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_12px_15px_rgba(0,0,0,0.6)]"
                    >
                      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M60 10 L95 95 L60 80 L25 95 Z" className={`transition-colors duration-300 ${isLocked ? 'fill-[#cc0000] dark:fill-[#ff0000]' : 'fill-black dark:fill-white'}`} />
                        <circle cx="60" cy="60" r="4" stroke={isLocked ? 'white' : '#cc0000'} strokeWidth="2.5" fill={isLocked ? '#cc0000' : 'transparent'} className="dark:stroke-[#ff0000]" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  <div className="mt-10 w-full flex flex-col items-center justify-center z-10 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl py-4 shadow-[inset_0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)] pointer-events-none">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase">Live Line-of-Sight Range</span>
                    </div>
                    
                    <div className="flex items-baseline gap-1">
                      <span style={{ fontFamily: "'ndot 45', sans-serif" }} className={`text-[46px] leading-none transition-colors duration-300 tracking-tight ${isLocked ? 'text-[#cc0000] dark:text-[#ff0000]' : 'text-black dark:text-white'}`}>
                        {distance ? distance.toFixed(1) : '--'}
                      </span>
                      <span className="text-sm font-bold text-gray-400 font-mono">m</span>
                    </div>
                  </div>

                </>
              )}
            </motion.div>
          ) : (

            /* CROWDSOURCING / SUCCESS DIALOG */
            <motion.div 
              key="success"
              // UPGRADED PHYSICS: Matches the compass card
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20, transition: { duration: 0.15, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 450, damping: 25, mass: 0.5 }}
              className="w-full bg-white dark:bg-[#0a0a0a] rounded-[3rem] p-8 border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

              <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mb-6 shadow-xl z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              </div>
              
              <h2 className="text-3xl font-black text-black dark:text-white leading-none tracking-tighter uppercase mb-2 z-10 font-['Space_Grotesk']">
                Destination<br/>Reached
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-8 z-10 px-2">
                Help the community. Does this {target?.bank || "terminal"} have cash available?
              </p>

              {/* REPORTING ACTIONS */}
              <div className="w-full flex flex-col gap-3 z-10 mb-6 border-b border-gray-100 dark:border-gray-900 pb-6">
                <button 
                  onClick={() => handleReport('Operational')}
                  disabled={isReporting}
                  className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 font-bold py-3.5 rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-wider flex justify-center items-center gap-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div> YES, HAS CASH
                </button>
                <button 
                  onClick={() => handleReport('Out of Cash')}
                  disabled={isReporting}
                  className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-400 font-bold py-3.5 rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-wider flex justify-center items-center gap-2"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div> OUT OF CASH
                </button>
                <button 
                  onClick={() => handleReport('Broken')}
                  disabled={isReporting}
                  className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 font-bold py-3.5 rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-wider flex justify-center items-center gap-2"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div> MACHINE BROKEN
                </button>
              </div>

              <div className="w-full flex flex-col gap-4 z-10">
                <button onClick={onClose} style={{ fontFamily: "'ndot 45', sans-serif" }} className="w-full bg-black dark:bg-white text-white dark:text-black tracking-widest py-4 rounded-full active:scale-95 transition-transform uppercase shadow-md text-sm">
                  CLOSE RADAR
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}