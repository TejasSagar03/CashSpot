import { useEffect, useState, useCallback } from "react"; // Added useCallback
import MapView from "../components/MapView";
import SearchBar from "../components/SearchBar";
import ATMCard from "../components/ATMCard";
import Filters from "../components/Filters";
import { fetchATMs } from "../utils/overpass";
import { calculateDistance } from "../utils/distance"; 

function Locator() {
  const [locations, setLocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

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
      console.error("Error fetching points:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocateUser = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(50);
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        getNearbyData(coords[0], coords[1]);
      },
      (err) => {
        setLoading(false);
        alert("Location access denied. Please search manually or enable GPS.");
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
      }
    );
  }, [getNearbyData]);

  useEffect(() => {
    handleLocateUser(); 
  }, [handleLocateUser]); // dependency is now stable thanks to useCallback

  useEffect(() => {
    let result = locations;
    if (activeFilter !== "ALL") {
      result = result.filter(loc => loc.type?.toLowerCase() === activeFilter.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(loc => 
        loc.name.toLowerCase().includes(s) || 
        loc.bank.toLowerCase().includes(s) ||
        loc.type?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [search, activeFilter, locations]);

  return (
    <div className="relative h-[calc(100vh-68px)] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
      <div className="absolute inset-0 z-0">
        <MapView locations={filtered} userLocation={userLocation} />
      </div>

      <div className="absolute top-0 left-0 z-10 h-full w-full md:w-[420px] flex flex-col pointer-events-none p-4 md:p-6">
        <div className="pointer-events-auto flex flex-col gap-3 mb-4">
          <SearchBar setSearch={setSearch} />
          <Filters setFilter={setActiveFilter} activeFilter={activeFilter} />
        </div>

        <div className="pointer-events-auto flex-1 overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-800/95 z-20">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nearby Locations</h2>
            {loading ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-blue-600">Scanning for ATMs...</p>
              </div>
            ) : (
              <p className="text-sm font-medium text-blue-600 mt-1">{filtered.length} places found</p>
            )}
          </div>
          
          <div className="p-3">
            {filtered.map(loc => <ATMCard key={loc.id} loc={loc} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Locator;