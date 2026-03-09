import { useEffect, useState, useCallback, useRef } from "react";
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import ATMCard from "../components/ATMCard";
import Filters from "../components/Filters";
import { fetchATMs } from "../utils/overpass";
import { calculateDistance } from "../utils/distance"; 
import SchematicLoaderSVG from "../components/SchematicLoaderSVG"; 
import AnimatedPage from "../components/AnimatedPage"; 

function Locator() {
  const [locations, setLocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [routeTarget, setRouteTarget] = useState(null); 

  const hasFetchedInitialData = useRef(false);

  const getNearbyData = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const data = await fetchATMs(lat, lng);
      // Still calculate initial distances so the first render looks good
      const withDistance = data.map(loc => ({
        ...loc,
        distance: calculateDistance(lat, lng, loc.lat, loc.lng)
      })).sort((a, b) => a.distance - b.distance);
      setLocations(withDistance);
      setFiltered(withDistance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(!hasFetchedInitialData.current);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);

        if (!hasFetchedInitialData.current) {
          getNearbyData(coords[0], coords[1]);
          hasFetchedInitialData.current = true;
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          alert("Location access denied. Please use the Search Bar manually.");
        } else if (err.code === 3) {
          console.warn("GPS timeout - waiting for stronger signal...");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } 
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [getNearbyData]);

  useEffect(() => {
    const cleanup = handleLocateUser();
    return cleanup;
  }, [handleLocateUser]);

  // LIVE DISTANCE & FILTERING ENGINE
  useEffect(() => {
    if (!userLocation || locations.length === 0) return;

    // 1. Recalculate distance dynamically on every footstep
    let result = locations.map(loc => {
      const targetLng = loc.lng || loc.lon;
      return {
        ...loc,
        distance: calculateDistance(userLocation[0], userLocation[1], loc.lat, targetLng)
      };
    });

    // 2. Apply active filters
    if (activeFilter !== "ALL") {
      result = result.filter(loc => loc.type?.toLowerCase() === activeFilter.toLowerCase());
    }

    // 3. Apply search query
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(loc => 
        (loc.name && loc.name.toLowerCase().includes(s)) || 
        (loc.bank && loc.bank.toLowerCase().includes(s)) || 
        (loc.type && loc.type.toLowerCase().includes(s))
      );
    }

    // 4. Re-sort the list so the ATM you walk closest to is instantly pushed to the top
    result.sort((a, b) => a.distance - b.distance);

    setFiltered(result);
  }, [search, activeFilter, locations, userLocation]); // Listens to userLocation to trigger live math

  return (
    <AnimatedPage>
      <div className="relative h-screen w-full overflow-hidden bg-white dark:bg-black font-sans">
        
        <div className="absolute inset-0 z-0">
          <MapView locations={filtered} userLocation={userLocation} routeTarget={routeTarget} />
        </div>

        <div className="absolute top-0 left-0 z-10 w-full md:w-[440px] h-full flex flex-col pointer-events-none px-4 pt-28 pb-6 md:px-6 md:pt-32">
          
          <div className="pointer-events-auto flex flex-col gap-4 mb-4 p-5 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl transition-colors">
            <SearchBar setSearch={setSearch} />
            <Filters setFilter={setActiveFilter} activeFilter={activeFilter} />
          </div>

          <div className="pointer-events-auto flex-1 flex flex-col overflow-hidden bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl transition-colors">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-black dark:text-white">Active Grid</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  {loading ? "Scanning coordinates..." : `${filtered.length} locations verified`}
                </p>
              </div>
              {loading && <SchematicLoaderSVG className="w-6 h-6 text-black dark:text-white" />}
            </div>
            
            <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
              {filtered.map(loc => <ATMCard key={loc.id} loc={loc} setRouteTarget={setRouteTarget} />)}
              {!loading && filtered.length === 0 && (
                <div className="text-center p-8 text-gray-500 text-sm font-medium">
                  No operational units found in current view. Adjust filters or scan a new area.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] shrink-0 font-mono text-[10px] uppercase text-gray-400 tracking-widest flex flex-col gap-1">
              <p className="flex justify-between"><span>Source:</span> <span className="text-black dark:text-white">OSM Overpass API</span></p>
              <p className="flex justify-between"><span>GPS Hardware:</span> <span className="text-green-500">Live Telemetry</span></p>
              <p className="flex justify-between"><span>Radius Lock:</span> <span className="text-black dark:text-white">15.00 KM</span></p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Locator;