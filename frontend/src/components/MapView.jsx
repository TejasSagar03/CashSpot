import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect, useState, useRef } from "react";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// --- CUSTOM NOTHING OS ICONS ---

const createUserIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4">
      <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div>
      <div class="w-4 h-4 bg-blue-600 border-[3px] border-white dark:border-[#0a0a0a] rounded-full z-10 shadow-lg transition-colors"></div>
    </div>
  `,
  iconSize: [0, 0], 
});

const createAtmIcon = (isActive) => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5 transition-all duration-300">
      ${isActive ? '<div class="absolute inset-0 border-[1.5px] border-dashed border-[#cc0000] dark:border-[#ff0000] rounded-full animate-[spin_4s_linear_infinite]"></div>' : ''}
      <div class="w-3.5 h-3.5 ${isActive ? 'bg-[#cc0000] dark:bg-[#ff0000] shadow-[0_0_15px_rgba(204,0,0,0.8)]' : 'bg-black dark:bg-white shadow-md'} rounded-full z-10 border-2 border-white dark:border-[#0a0a0a] transition-colors duration-300"></div>
    </div>
  `,
  iconSize: [0, 0],
});

const createDestinationIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div class="relative flex flex-col items-center justify-center -mt-10 -ml-4 animate-bounce">
       <svg class="w-10 h-10 text-[#cc0000] dark:text-[#ff0000] drop-shadow-xl" fill="currentColor" viewBox="0 0 24 24">
         <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
       </svg>
    </div>
  `,
  iconSize: [0, 0],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

function MapView({ locations, userLocation, routeTarget, travelMode = "walking" }) {
  const [map, setMap] = useState(null);
  const routingControlRef = useRef(null);
  const targetNameRef = useRef("");
  const lastRoutedPosition = useRef(null); // THE FIX: Memory bank for GPS Drift

  // Retrieve System Preferences from Settings
  const mapStyle = localStorage.getItem("cashspot_map_style") || "vector";

  const vectorUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  // ==========================================
  // BRAIN 1: The Builder (Runs ONCE on load)
  // ==========================================
  useEffect(() => {
    if (!map) return;

    // Nuke any ghost boxes left over by React Strict Mode
    document.querySelectorAll('.leaflet-routing-container').forEach(el => el.remove());

    const isDark = document.documentElement.classList.contains('dark');
    const lineColor = isDark ? '#ff0000' : '#cc0000';

    // Create the empty control box
    const routingControl = L.Routing.control({
      waypoints: [], 
      lineOptions: {
        styles: [{ color: lineColor, weight: 6, opacity: 1, dashArray: '4, 14', lineCap: 'round' }] 
      },
      show: true, 
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
      showAlternatives: false,
      position: 'topright' 
    }).addTo(map);

    routingControlRef.current = routingControl;

    // When the route finishes calculating, inject the ATM Name header
    routingControl.on('routeselected', () => {
      setTimeout(() => {
        const container = document.querySelector('.leaflet-routing-container');
        if (container) {
          container.style.display = 'block'; 
          let header = container.querySelector('.custom-target-header');
          if (!header) {
            header = document.createElement('h1');
            header.className = 'custom-target-header';
            container.insertBefore(header, container.firstChild);
          }
          header.innerText = targetNameRef.current;
        }
      }, 50);
    });

    // Cleanup when the map is totally destroyed
    return () => {
      try { map.removeControl(routingControl); } catch(e) {}
      routingControlRef.current = null;
    };
  }, [map]);


  // ==========================================
  // BRAIN 2: The Updater (Runs when you move)
  // ==========================================
  useEffect(() => {
    if (!routingControlRef.current || !userLocation) return;

    if (routeTarget) {
      const startLatLng = L.latLng(userLocation[0], userLocation[1]);
      const endLatLng = L.latLng(routeTarget.lat, routeTarget.lng || routeTarget.lon);

      // THE FIX: Anti-Spam Lock
      // Prevents the app from duplicating routes when your indoor GPS drifts.
      let shouldUpdateRoute = true;

      if (lastRoutedPosition.current) {
        const { start, end } = lastRoutedPosition.current;
        const movedDistance = startLatLng.distanceTo(start); // Leaflet calculates this in meters
        const isSameTarget = endLatLng.distanceTo(end) < 1;

        // If you are tracking the same ATM, and you haven't physically walked more than 15 meters, IGNORE the update
        if (isSameTarget && movedDistance < 15) {
          shouldUpdateRoute = false;
        }
      }

      if (shouldUpdateRoute) {
        targetNameRef.current = routeTarget.bank || routeTarget.name || "Target Terminal";
        lastRoutedPosition.current = { start: startLatLng, end: endLatLng };

        // DOM FAILSAFE: Manually rip out the old instruction tables before Leaflet draws the new ones
        const container = document.querySelector('.leaflet-routing-container');
        if (container) {
          const oldInstructions = container.querySelectorAll('.leaflet-routing-alt');
          oldInstructions.forEach(el => el.remove());
        }

        // Quietly update the coordinates inside the EXISTING box
        routingControlRef.current.setWaypoints([startLatLng, endLatLng]);
      }
    } else {
      // If no target is selected, clear the waypoints, reset memory, and hide the box
      lastRoutedPosition.current = null;
      routingControlRef.current.setWaypoints([]);
      const container = document.querySelector('.leaflet-routing-container');
      if (container) container.style.display = 'none';
    }
  }, [userLocation, routeTarget]);


  const handleLocateMe = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    if (map && userLocation) map.flyTo(userLocation, 16, { duration: 1.5 });
  };

  const defaultCenter = userLocation || [13.1986, 77.7066]; 
  const currentCenter = routeTarget ? [routeTarget.lat, routeTarget.lng || routeTarget.lon] : defaultCenter;

  return (
    <div className="relative h-full w-full z-0">
      
      {/* Controls */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3 pointer-events-auto">
        <button onClick={handleLocateMe} className="w-12 h-12 bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-full shadow-lg flex items-center justify-center hover:scale-[0.96] transition-all border border-gray-200 dark:border-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2M12 19v2M3 12h2M19 12h2" /></svg>
        </button>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-[1.5rem] shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          <button onClick={() => map?.zoomIn()} className="w-12 h-12 text-black dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all border-b border-gray-200 dark:border-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <button onClick={() => map?.zoomOut()} className="w-12 h-12 text-black dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </button>
        </div>
      </div>

      <MapContainer center={currentCenter} zoom={13} zoomControl={false} className="h-full w-full absolute inset-0 z-0" ref={setMap}>
        <TileLayer 
          url={mapStyle === 'satellite' ? satelliteUrl : vectorUrl} 
          attribution={mapStyle === 'satellite' ? 'Tiles © Esri' : '© OpenStreetMap'} 
        />
        
        <MapController center={currentCenter} zoom={routeTarget ? 16 : 14} />

        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()} zIndexOffset={1000}>
            <Popup className="nothing-popup">
              <div className="font-sans p-1">
                <h3 className="font-bold text-sm text-black mb-0.5 leading-tight">You are here</h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Live Telemetry</p>
              </div>
            </Popup>
          </Marker>
        )}

        {routeTarget && (
          <Marker 
            position={[routeTarget.lat, routeTarget.lng || routeTarget.lon]} 
            icon={createDestinationIcon()} 
            zIndexOffset={2000}
          />
        )}

        <MarkerClusterGroup>
          {locations.map(loc => {
            const isTarget = routeTarget && routeTarget.id === loc.id;
            return (
              <Marker key={loc.id} position={[loc.lat, loc.lng || loc.lon]} icon={createAtmIcon(isTarget)} zIndexOffset={isTarget ? 500 : 0}>
                <Popup className="nothing-popup">
                  <div className="font-sans p-1 min-w-[160px]">
                    <h3 className="font-bold text-sm text-black mb-0.5 leading-tight">
                      {loc.name !== "ATM" ? loc.name : `${loc.bank} ATM`}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-3">{loc.type || "ATM"}</p>
                    
                    {/* OFFICIAL DEEP LINK INJECTED HERE */}
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=$${loc.lat},${loc.lng || loc.lon}&travelmode=${travelMode}`} target="_blank" rel="noreferrer" className="w-full block">
                      <button className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-xs">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Maps
                      </button>
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default MapView;