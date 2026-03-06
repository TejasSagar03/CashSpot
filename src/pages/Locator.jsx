import { useEffect, useState } from "react";
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
  
  // States for our inputs
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(coords);

      const data = await fetchATMs(coords[0], coords[1]);

      const withDistance = data.map(loc => ({
        ...loc,
        distance: calculateDistance(coords[0], coords[1], loc.lat, loc.lng)
      })).sort((a, b) => a.distance - b.distance);

      setLocations(withDistance);
      setFiltered(withDistance);
    });
  }, []);

  // Supercharged filtering logic
  useEffect(() => {
    let result = locations;

    // 1. First, apply the quick button filter (ALL, ATM, or BANK)
    if (activeFilter !== "ALL") {
      result = result.filter(loc => 
        loc.type?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // 2. Next, apply the text search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(loc =>
        (loc.name && loc.name.toLowerCase().includes(searchLower)) ||
        (loc.bank && loc.bank.toLowerCase().includes(searchLower)) ||
        (loc.type && loc.type.toLowerCase().includes(searchLower)) // <-- This makes typing "bank" or "atm" work perfectly
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
        
        {/* Search & Filters Group */}
        <div className="pointer-events-auto flex flex-col gap-3 mb-4">
          <SearchBar setSearch={setSearch} />
          <Filters setFilter={setActiveFilter} activeFilter={activeFilter} />
        </div>

        <div className="pointer-events-auto flex-1 overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-20">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nearby Locations</h2>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{filtered.length} places found</p>
          </div>
          
          <div className="p-3">
            {filtered.length > 0 ? (
              filtered.map(loc => (
                <ATMCard key={loc.id} loc={loc} />
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-6 font-medium">No matching locations found.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Locator;