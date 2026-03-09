import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// 1. Icons
const atmIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2830/2830284.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36], 
  popupAnchor: [0, -36]
});

const userIcon = new L.Icon({
   iconUrl: "https://cdn-icons-png.flaticon.com/512/727/727606.png", 
   iconSize: [24, 24],
});

function MapView({ locations, userLocation, routeTarget }) {
  // We capture the raw map instance here, completely bypassing the buggy Context API
  const [map, setMap] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);

  // Auto-fly to user location when map loads
  useEffect(() => {
    if (map && userLocation) {
      map.flyTo(userLocation, 14, { duration: 1.5 });
    }
  }, [map, userLocation]);

  // Handle the Routing Engine natively
  useEffect(() => {
    if (!map || !userLocation || !routeTarget) return;

    if (routingControl) {
      try { map.removeControl(routingControl); } catch(e) {}
    }

    const targetLat = routeTarget.lat;
    const targetLng = routeTarget.lng || routeTarget.lon;
    const isDark = document.documentElement.classList.contains('dark');
    
    // DOT MATRIX LED STYLE: Nothing Hardware Red
    const lineColor = isDark ? '#ff0000' : '#cc0000';

    const newRoutingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(targetLat, targetLng)
      ],
      lineOptions: {
        // dashArray '4, 14' creates perfect circular dots instead of long dashes
        styles: [{ color: lineColor, weight: 6, opacity: 1, dashArray: '4, 14', lineCap: 'round' }] 
      },
      show: true, 
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      createMarker: () => null, 
      showAlternatives: false,
      position: 'topright' // Panel safely moves to the top right to avoid UI overlap
    }).addTo(map);

    setRoutingControl(newRoutingControl);

    return () => {
      if (newRoutingControl && map) {
        try { map.removeControl(newRoutingControl); } catch(e) {}
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, routeTarget]); 

  // Custom Control Handlers directly using the map state
  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();
  const handleLocateMe = () => {
    if (map && userLocation) map.flyTo(userLocation, 15, { duration: 1.5 });
  };

  return (
    <div className="relative h-full w-full z-0">
      
      {/* CUSTOM CONTROLS: Pulled outside the MapContainer so they can't throw errors */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3 pointer-events-auto">
        <button onClick={handleLocateMe} className="w-12 h-12 bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all border border-gray-200 dark:border-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2M12 19v2M3 12h2M19 12h2" /></svg>
        </button>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-[1.5rem] shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          <button onClick={handleZoomIn} className="w-12 h-12 text-black dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-b border-gray-200 dark:border-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <button onClick={handleZoomOut} className="w-12 h-12 text-black dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </button>
        </div>
      </div>

      {/* MAIN MAP */}
      <MapContainer
        center={userLocation || [13.1986, 77.7066]}
        zoom={13}
        zoomControl={false} 
        className="h-full w-full absolute inset-0 z-0"
        ref={setMap} /* THIS REF GRABS THE MAP SECURELY */
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup className="font-bold">You are here</Popup>
          </Marker>
        )}

        <MarkerClusterGroup>
          {locations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={atmIcon}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">
                    {loc.name !== "ATM" ? loc.name : `${loc.bank} ATM`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 font-medium">{loc.bank}</p>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`} target="_blank" rel="noreferrer" className="w-full block">
                    <button className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                      Google Maps
                    </button>
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default MapView;