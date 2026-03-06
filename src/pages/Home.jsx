import { Link } from "react-router-dom";

function Home() {
  // Trigger a subtle vibration on mobile devices
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div className="relative h-[calc(100vh-68px)] flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>

      <div className="relative z-10 p-10 max-w-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 dark:border-gray-700/50 mx-4">
        
        {/* Map Pin Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
          <svg className="w-10 h-10 text-white transform -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h1 className="text-5xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">
          Find ATMs Near You <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Instantly</span>
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-medium">
          Discover nearby cash points with detailed information, live navigation, and smart routing powered by OpenStreetMap.
        </p>
        
        <Link to="/locator" onClick={triggerHaptic}>
          <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-3 mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Open CashSpot
          </button>
        </Link>

      </div>
    </div>
  );
}

export default Home;