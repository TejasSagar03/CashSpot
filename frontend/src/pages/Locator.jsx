import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import ATMCard from "../components/ATMCard";
import Filters from "../components/Filters";
import RadarScan from "../components/RadarScan";
import HardwareCompass from "../components/HardwareCompass";
import { fetchATMs } from "../utils/overpass";
import { calculateDistance } from "../utils/distance"; 
import SchematicLoaderSVG from "../components/SchematicLoaderSVG"; 
import AnimatedPage from "../components/AnimatedPage"; 
import { useProximityHaptics } from "../hooks/useProximityHaptics";
import { useBattery } from "../hooks/useBattery"; 

function Locator() {
  const [locations, setLocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [routeTarget, setRouteTarget] = useState(null); 
  const [compassTarget, setCompassTarget] = useState(null);
  const [voiceAction, setVoiceAction] = useState(null);
  const [isListeningForFollowUp, setIsListeningForFollowUp] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true); 
  const [shareState, setShareState] = useState("HIDDEN"); 

  const lastActiveTarget = useRef(null);
  const hasFetchedInitialData = useRef(false);

  const { isCriticalPower, level } = useBattery();

  const [savedLocations, setSavedLocations] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cashspot_saved_spots');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const travelMode = localStorage.getItem('cashspot_travelmode') || "WALK";
  
  const googleMode = useMemo(() => {
    if (travelMode === "WALK") return "walking";
    if (travelMode === "RIDE") return "bicycling";
    return "driving";
  }, [travelMode]);

  const stateRef = useRef({ filtered, locations, googleMode, savedLocations });
  useEffect(() => {
    stateRef.current = { filtered, locations, googleMode, savedLocations };
  }, [filtered, locations, googleMode, savedLocations]);

  // ---> DYNAMIC BANK FILTER EXTRACTION <---
  const availableBanks = useMemo(() => {
    if (!locations || locations.length === 0) return [];
    const banks = new Set();
    locations.forEach(loc => {
      const name = loc.bank || loc.name;
      if (name && name.length < 25) { 
        banks.add(name.toUpperCase());
      }
    });
    return Array.from(banks).sort();
  }, [locations]);

  const intelLink = useMemo(() => {
    if (savedLocations.length === 0) return "";
    const packed = savedLocations.map(loc => {
        const lat = loc.lat ? loc.lat.toFixed(5) : 0;
        const lng = (loc.lng || loc.lon) ? (loc.lng || loc.lon).toFixed(5) : 0;
        const name = encodeURIComponent(loc.name || "Unknown");
        const type = loc.type || "NODE";
        return `${loc.id}~${lat}~${lng}~${name}~${type}`;
    }).join('|');
    const payload = btoa(packed);
    return `${window.location.origin}${window.location.pathname}?payload=${payload}`;
  }, [savedLocations]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('payload');
    if (payload) {
      try {
        const decodedStr = atob(payload);
        let decodedIntel = [];
        
        if (decodedStr.startsWith('[')) {
          decodedIntel = JSON.parse(decodedStr);
        } else {
          decodedIntel = decodedStr.split('|').map(item => {
              const [id, lat, lng, name, type] = item.split('~');
              return { id, lat: parseFloat(lat), lng: parseFloat(lng), lon: parseFloat(lng), name: decodeURIComponent(name), type };
          });
        }

        if (Array.isArray(decodedIntel) && decodedIntel.length > 0) {
          setSavedLocations(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newIntel = decodedIntel.filter(intel => !existingIds.has(intel.id));
            return [...newIntel, ...prev];
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          alert(`[SYSTEM] Successfully decoded and imported ${decodedIntel.length} tactical coordinates.`);
        }
      } catch (e) {
        console.error("Payload corruption detected.", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cashspot_saved_spots', JSON.stringify(savedLocations));
  }, [savedLocations]);

  const toggleSaveLocation = useCallback((loc) => {
    setSavedLocations(prev => {
      if (prev.some(p => p.id === loc.id)) return prev.filter(p => p.id !== loc.id); 
      return [{ ...loc, savedAt: Date.now() }, ...prev]; 
    });
  }, []);

  const isSaved = useCallback((id) => savedLocations.some(s => s.id === id), [savedLocations]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const updateNotification = async () => {
      if (routeTarget && userLocation && 'serviceWorker' in navigator) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return; 

        const rawDistance = calculateDistance(
          userLocation[0], userLocation[1], 
          routeTarget.lat, routeTarget.lng || routeTarget.lon
        );
        const safeDistance = parseFloat(rawDistance) || 0;
        const unit = localStorage.getItem("cashspot_unit") === "imperial" ? "MI" : "KM";
        const bankName = (routeTarget.bank || routeTarget.name || "ATM").toUpperCase();

        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(`[ NAV_SYSTEM ]`, {
          body: `LOCKED ON: ${bankName}\nDISTANCE: ${safeDistance.toFixed(1)} ${unit}`,
          icon: '/favicon.svg', 
          badge: '/favicon.svg',
          tag: 'cashspot-nav-tracker', 
          renotify: false, 
          silent: true, 
          requireInteraction: true 
        });
      } else if (!routeTarget && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications({ tag: 'cashspot-nav-tracker' });
        notifications.forEach(notification => notification.close());
      }
    };

    updateNotification();
  }, [userLocation, routeTarget]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); }, 300); 
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const speakCasually = (type, data = {}) => {
    const phrases = {
      found: [`I've found ${data.count} branches.`, `Okay, I've located ${data.count} spots nearby.`],
      compass: [`Opening the compass for ${data.bank}.`, `Guide mode active. Locked on to ${data.bank}.`],
      route: [`Calculating directions to ${data.bank}. Ready!`, `Mapping the best route to ${data.bank} now.`],
      nothing: ["I couldn't find a branch by that name. Want to try another?"],
      followUp: ["Anything else?", "What's next?", "System standing by."]
    };
    const list = phrases[type];
    return list[Math.floor(Math.random() * list.length)];
  };

  const getNearbyData = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      // Pull dynamic radius from settings
      const searchRadius = Number(localStorage.getItem("cashspot_radius")) * 1000 || 5000;
      
      const data = await fetchATMs(lat, lng, searchRadius);
      const withDistance = data.map(loc => ({
        ...loc,
        distance: calculateDistance(lat, lng, loc.lat, loc.lng || loc.lon)
      })).sort((a, b) => a.distance - b.distance);
      setLocations(withDistance);
      setFiltered(withDistance);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    let watchId;
    let intervalId;

    const handleSuccess = (pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(coords);
      if (!hasFetchedInitialData.current) {
        getNearbyData(coords[0], coords[1]);
        hasFetchedInitialData.current = true;
      }
    };

    const handleError = (err) => console.warn("GPS Error:", err);

    if (isCriticalPower) {
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 5000
        });
      }, 5000);
    } else {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, { 
        enableHighAccuracy: true, 
        timeout: 5000, 
        maximumAge: 0 
      });
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isCriticalPower, getNearbyData]);


  useEffect(() => {
    if (!userLocation || locations.length === 0) return;
    
    let result = locations.map(loc => ({
      ...loc,
      distance: calculateDistance(userLocation[0], userLocation[1], loc.lat, loc.lng || loc.lon)
    }));

    if (activeFilter !== "ALL") {
      const upperFilter = activeFilter.toUpperCase();
      if (upperFilter === "ATM" || upperFilter === "BANK") {
        result = result.filter(loc => loc.type?.toUpperCase() === upperFilter);
      } else {
        result = result.filter(loc => {
          const bankName = (loc.bank || loc.name || "").toUpperCase();
          return bankName.includes(upperFilter);
        });
      }
    }

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      result = result.filter(loc => 
        (loc.name?.toLowerCase().includes(s)) || (loc.bank?.toLowerCase().includes(s))
      );
    }
    
    result.sort((a, b) => a.distance - b.distance);
    setFiltered(result);
    
    if (result.length > 0) lastActiveTarget.current = result[0];
  }, [debouncedSearch, activeFilter, locations, userLocation]);

  useEffect(() => {
    if (!voiceAction || !('speechSynthesis' in window)) return;

    const { filtered: currentFiltered, locations: currentLocations, googleMode: currentGoogleMode, savedLocations: currentSaved } = stateRef.current;

    const rawText = typeof voiceAction === 'string' ? voiceAction.toLowerCase() : (voiceAction.text || "").toLowerCase();
    let intent = typeof voiceAction === 'object' ? { ...voiceAction } : {};

    if (rawText) {
        if (rawText.includes("google maps") || rawText.includes("maps") || rawText.includes("map")) intent.isGoogleMaps = true;
        if (rawText.match(/\b(pin|pen|ping|save|safe|bookmark)\b/)) intent.isPin = true;
        if (rawText.match(/\b(filter|search|show|find)\b/)) intent.isFilter = true;
        if (rawText.match(/\b(compass|guide)\b/)) intent.isCompass = true;
        if (rawText.match(/\b(route|root|navigate|directions|direct)\b/)) intent.isRoute = true;

        const knownBanks = [
          "union bank of india", "federal bank", "sbi", "hdfc", "axis", 
          "icici", "union", "canara", "kotak", "atm", "bank"
        ];
        intent.targetBank = knownBanks.find(b => rawText.includes(b));
    }

    setVoiceAction(null);
    window.speechSynthesis.cancel(); 

    const msg = new SpeechSynthesisUtterance();
    msg.rate = 1.0;

    let target = lastActiveTarget.current;
    if (intent.targetBank) {
       target = currentLocations.find(loc => (loc.bank || loc.name || "").toLowerCase().includes(intent.targetBank)) || target;
    }
    if (!target && currentFiltered.length > 0) target = currentFiltered[0];

    const bankName = target ? (target.bank || target.name || "the location") : "the branch";

    if (intent.isCompass) {
       if (target) {
          setCompassTarget(target); setRouteTarget(null); setIsMinimized(true);
          msg.text = speakCasually('compass', { bank: bankName }) + " " + speakCasually('followUp');
       } else {
          msg.text = speakCasually('nothing');
       }
    }
    else if (intent.isRoute) {
       if (target) {
          setRouteTarget(target); setCompassTarget(null); setIsMinimized(true);
          msg.text = speakCasually('route', { bank: bankName }) + " " + speakCasually('followUp');
       } else {
          msg.text = speakCasually('nothing');
       }
    }
    else if (intent.isGoogleMaps) {
       if (target) {
          msg.text = `Opening ${bankName} in Google Maps.`;
          const lat = target.lat;
          const lng = target.lng || target.lon;
          setTimeout(() => {
              window.location.href = `https://www.google.com/maps/dir/?api=1&destination=$${lat},${lng}&travelmode=${currentGoogleMode}`;
          }, 1000); 
       } else {
          msg.text = speakCasually('nothing');
       }
    }
    else if (intent.isPin) {
       if (target) {
          const isAlreadySaved = currentSaved.some(s => s.id === target.id);
          if (!isAlreadySaved) toggleSaveLocation(target);
          setIsMinimized(true); 
          msg.text = `Pinned ${bankName} to your hardware memory.`;
       } else {
          msg.text = speakCasually('nothing');
       }
    }
    else if (intent.isFilter) {
       if (intent.targetBank) {
          setSearch(intent.targetBank); 
          setIsMinimized(false); 
          msg.text = `Filtering radar for ${intent.targetBank}.`;
       } else {
          msg.text = "Which bank should I filter?";
       }
    }
    else {
       msg.text = speakCasually('found', { count: currentFiltered.length }) + " " + speakCasually('followUp');
    }

    msg.onend = () => { setIsListeningForFollowUp(true); };

    setTimeout(() => { window.speechSynthesis.speak(msg); }, 300);

  }, [voiceAction, toggleSaveLocation]); 

  const mapLocations = useMemo(() => {
    const allIds = new Set(filtered.map(f => f.id));
    const missingSaved = savedLocations.filter(s => !allIds.has(s.id));
    return [...filtered, ...missingSaved];
  }, [filtered, savedLocations]);

  const activeTrackingTarget = routeTarget || compassTarget;
  const liveTargetDistance = (userLocation && activeTrackingTarget) 
    ? calculateDistance(userLocation[0], userLocation[1], activeTrackingTarget.lat, activeTrackingTarget.lng || activeTrackingTarget.lon) 
    : null;

  useProximityHaptics(liveTargetDistance);

  return (
    <AnimatedPage>
      <div className="relative h-[100dvh] w-full overflow-hidden bg-[#f8fafc] dark:bg-[#050505] font-sans transition-colors duration-500">
        
        <AnimatePresence>
          {isCriticalPower && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-[400px] bg-red-500/90 dark:bg-red-600/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-[0_10px_30px_rgba(239,68,68,0.3)] border border-red-400/50"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-ping shrink-0"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
                  Low Power Mode Active ({level}%)
                </span>
                <span className="text-[9px] font-mono text-white/80 leading-none">
                  Hardware sensors throttled to 5000ms
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{loading && <RadarScan />}</AnimatePresence>
        
        <div className="absolute inset-0 z-0">
          <MapView locations={mapLocations} userLocation={userLocation} routeTarget={routeTarget} travelMode={googleMode} />
        </div>

        <AnimatePresence>
          {compassTarget && (
            <HardwareCompass target={compassTarget} userLocation={userLocation} onClose={() => setCompassTarget(null)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {shareState !== "HIDDEN" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center relative"
              >
                <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Transmit Intel</h2>
                <p className="text-xs text-gray-400 mb-8 px-2 leading-relaxed">Securely share {savedLocations.length} pinned extraction coordinates with other devices.</p>

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
          initial={false}
          animate={{ y: isDesktop ? 0 : (isMinimized ? "calc(100% - 160px)" : 0) }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          drag={isDesktop ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.05}
          onDragEnd={(e, info) => {
            if (info.offset.y > 40) setIsMinimized(true);
            if (info.offset.y < -40) setIsMinimized(false);
          }}
          className="absolute bottom-0 left-0 z-20 w-full h-[calc(100dvh-120px)] md:top-4 md:left-4 md:bottom-4 md:h-[calc(100dvh-32px)] md:w-[400px] flex flex-col bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-3xl rounded-t-[2.5rem] md:rounded-[2.5rem] md:border border-gray-200 dark:border-gray-800 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] md:shadow-[0_15px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_-15px_40px_rgba(0,0,0,0.5)] pointer-events-auto transition-colors duration-500 overflow-hidden"
        >
          
          <div className="w-full pt-5 pb-3 flex justify-center items-center shrink-0 md:hidden cursor-grab active:cursor-grabbing" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>

          <div className="px-5 pt-2 pb-5 shrink-0 border-b border-gray-100 dark:border-gray-800/60" onPointerDown={(e) => { if(e.target.tagName.toLowerCase() === 'input') e.stopPropagation() }}>
            <SearchBar 
              search={search} setSearch={setSearch} 
              autoStart={isListeningForFollowUp} onAutoStartDone={() => setIsListeningForFollowUp(false)}
              onVoiceSearchEnd={(action) => setVoiceAction(action)} 
            />
            <div className="mt-4">
              <Filters setFilter={setActiveFilter} activeFilter={activeFilter} availableBanks={availableBanks} />
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="text-[1.1rem] font-bold text-black dark:text-white tracking-tight">Active Grid</h2>
            
            <div className="flex items-center gap-3">
              {loading && <SchematicLoaderSVG className="w-5 h-5" />}
              
              {/* TACTICAL MANUAL REFRESH BUTTON */}
              <button 
                onClick={() => {
                  if (userLocation && navigator.vibrate) navigator.vibrate(15);
                  if (userLocation) getNearbyData(userLocation[0], userLocation[1]);
                }}
                disabled={loading}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#111] transition-all cursor-pointer active:scale-90 disabled:opacity-30 group"
                title="Force Radar Rescan"
              >
                <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
          </div>
            
          <motion.div layoutScroll onPointerDown={(e) => e.stopPropagation()} className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
                  Scanning coordinates...
                </motion.div>
              ) : (
                <motion.div key="loaded-state" className="flex flex-col w-full">
                  {savedLocations.length > 0 && !search && activeFilter === "ALL" && (
                    <motion.div layout className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                      
                      <div className="flex items-center justify-between mb-3 px-2">
                        <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2 m-0">
                          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          Pinned Destinations
                        </h3>
                        <button 
                          onClick={() => savedLocations.length > 0 ? setShareState("MENU") : alert("Memory empty.")} 
                          className="text-[9px] font-bold border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors uppercase tracking-widest cursor-pointer"
                        >
                          Share Intel
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {savedLocations.map(loc => (
                          <div key={`saved-${loc.id}`} className="relative group">
                            <ATMCard loc={loc} travelMode={googleMode} setRouteTarget={(l) => { setRouteTarget(l); setCompassTarget(null); setIsMinimized(true); }} setCompassTarget={(l) => { setCompassTarget(l); setRouteTarget(null); setIsMinimized(true); }}/>
                            <button onClick={() => toggleSaveLocation(loc)} className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-yellow-400 hover:bg-red-500 text-black hover:text-white rounded-full shadow-lg z-10 transition-colors cursor-pointer">
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 font-medium text-sm p-8">
                      <span className="block mb-3 text-2xl opacity-50">📡</span> No operational units found.
                    </motion.div>
                  ) : (
                    filtered.map(loc => (
                      <motion.div layout initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} transition={{ type: "spring", stiffness: 350, damping: 25 }} key={loc.id} className="shrink-0 mb-3 relative group">
                        <ATMCard loc={loc} travelMode={googleMode} setRouteTarget={(l) => { setRouteTarget(l); setCompassTarget(null); setIsMinimized(true); }} setCompassTarget={(l) => { setCompassTarget(l); setRouteTarget(null); setIsMinimized(true); }}/>
                        <button onClick={() => toggleSaveLocation(loc)} className={`absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full shadow-lg z-10 transition-colors cursor-pointer ${isSaved(loc.id) ? 'bg-yellow-400 text-black' : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-700'}`}>
                          <svg className="w-4 h-4" fill={isSaved(loc.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isSaved(loc.id) ? 1 : 2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </button>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="p-4 bg-gray-50/50 dark:bg-[#050505]/50 shrink-0 font-mono text-[10px] uppercase text-gray-400 tracking-widest flex flex-col gap-1 border-t border-gray-100 dark:border-gray-800/60 rounded-b-[2.5rem]">
            <p className="flex justify-between"><span>Source:</span> <span className="text-black dark:text-white">OSM Overpass API</span></p>
            <p className="flex justify-between">
              <span>Hardware:</span> 
              {isCriticalPower ? (
                <span className="text-red-500 font-bold animate-pulse">Power-Save ({level}%)</span>
              ) : (
                <span className="text-green-500">Live Telemetry</span>
              )}
            </p>
          </div>
          
        </motion.div>

      </div>
    </AnimatedPage>
  );
}

export default Locator;