import { Link } from "react-router-dom";
import SchematicGlobeSVG from "../components/SchematicGlobeSVG";
import AnimatedPage from "../components/AnimatedPage"; 

function Home() {
  const triggerHaptic = () => { if (navigator.vibrate) navigator.vibrate(50); };

  return (
    <AnimatedPage>
      <div className="relative min-h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden bg-white dark:bg-black transition-colors duration-500 font-sans pb-12">
        
        {/* Background Globe - OPACITY FIXED HERE */}
        <div className="absolute top-0 w-full h-screen flex items-center justify-center overflow-hidden pointer-events-none fixed">
          <SchematicGlobeSVG className="w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] text-black dark:text-white opacity-10 dark:opacity-20 animate-[spin_120s_linear_infinite]" />
        </div>

        {/* HERO SECTION */}
        <div className="relative z-10 px-6 pt-24 pb-16 md:py-32 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16 border border-gray-200 dark:border-gray-800 shadow-2xl dark:shadow-none mb-16">
            <div className="relative w-20 h-20 mx-auto mb-8">
               <div className="bg-black dark:bg-white text-white dark:text-black w-full h-full rounded-[1.5rem] flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-10 h-10 transform -rotate-3 hover:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold mb-6 text-black dark:text-white tracking-tight leading-tight">
              Find Your <span className="block">CashSpot</span>
            </h1>
            
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 font-medium max-w-xl mx-auto leading-relaxed">
              Engineered for absolute precision. Instantly locate the nearest operational ATMs and bank branches within your immediate radius.
            </p>
            
            <Link to="/locator" onClick={triggerHaptic}>
              <button className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold tracking-wide hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-3 rounded-full mx-auto">
                Launch System
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </Link>
          </div>
        </div>

        {/* MORE INFORMATION SECTION */}
        <div className="relative z-10 w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">Live Telemetry</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              We interface directly with the OSM Overpass API to ensure location data is fetched in real-time, preventing dead-ends and closed branches.
            </p>
          </div>
          <div className="p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">Adaptive Hardware</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Forces high-accuracy GPS triangulation via your device's native hardware, bypassing low-power network location estimations.
            </p>
          </div>
          <div className="p-8 bg-gray-50 dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-3 text-black dark:text-white">Privacy First</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your coordinate data never leaves your device. Geolocation is processed entirely client-side for maximum security and peace of mind.
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Home;