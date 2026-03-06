import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect } from "react";

// Automatically fly to user location on first load
function MapController({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 14, { duration: 1.5 });
    }
  }, [userLocation, map]);
  return null;
}

// Custom Floating Controls (Zoom & Locate)
function CustomMapControls({ userLocation }) {
  const map = useMap();

  const handleZoomIn = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    map.zoomIn();
  };

  const handleZoomOut = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    map.zoomOut();
  };

  const handleLocateMe = () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // Distinct vibration pattern
    if (userLocation) {
      map.flyTo(userLocation, 15, { duration: 1.5 });
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
      {/* Locate Me Button */}
      <button
        onClick={handleLocateMe}
        className="w-12 h-12 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
        title="Go to my location"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2M12 19v2M3 12h2M19 12h2" />
        </svg>
      </button>

      {/* Zoom Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="w-12 h-12 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border-b border-gray-100 dark:border-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-12 h-12 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
      </div>
    </div>
  );
}

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

function MapView({ locations, userLocation }) {
  return (
    <MapContainer
      center={userLocation || [13.1986, 77.7066]}
      zoom={13}
      zoomControl={false} // Default zoom disabled to use our custom buttons
      className="h-full w-full z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      <MapController userLocation={userLocation} />
      
      {/* Inject custom controls here */}
      <CustomMapControls userLocation={userLocation} />

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
                
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block"
                >
                  <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    Directions
                  </button>
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

export default MapView;