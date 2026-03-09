import { useEffect, useState, useCallback } from "react";
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

  const getNearbyData = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const data = await fetchATMs(lat, lng);
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
    if (navigator.vibrate) navigator.vibrate(50);
    setLoading(true);

    // 1. Check if the browser even supports GPS
    if (!navigator.geolocation) {
      setLoading(false);
      alert("Geolocation is not supported by your browser. Please use the search bar.");
      return;
    }

    // 2. Attempt to get the real user's location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        getNearbyData(coords[0], coords[1]);
      },
      (err) => {
        setLoading(false);
        // 3. PRODUCTION FIX: No fake locations. Just tell them to search manually.
        if (err.code === 1) {
          // They clicked "Deny"
          alert("Location access denied. Please use the Search Bar to enter your city or neighborhood manually.");
        } else if (err.code === 3) {
          // GPS Timed out
          alert("GPS signal is too weak. Please use the Search Bar to enter your location manually.");
        } else {
          // Unknown hardware error
          alert("Unable to pinpoint your device. Please use the Search Bar manually.");
        }
      },
      // enableHighAccuracy: false ensures it doesn't crash desktop browsers
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  }, [getNearbyData]);

  useEffect(() => { handleLocateUser(); }, [handleLocateUser]);

  useEffect(() => {
    let result = locations;
    if (activeFilter !== "ALL") {
      result = result.filter(loc => loc.type?.toLowerCase() === activeFilter.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(loc => 
        loc.name.toLowerCase().includes(s) || loc.bank.toLowerCase().includes(s) || loc.type?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [search, activeFilter, locations]);

  return (
    <AnimatedPage>
      <div className="relative h-screen w-full overflow-hidden bg-white dark:bg-black font-sans">
        
        <div className="absolute inset-0 z-0">
          {/* MapView handles everything internally now */}
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
              <p className="flex justify-between"><span>GPS Hardware:</span> <span className="text-green-500">Active</span></p>
              <p className="flex justify-between"><span>Radius Lock:</span> <span className="text-black dark:text-white">15.00 KM</span></p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Locator;