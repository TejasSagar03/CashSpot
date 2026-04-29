import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Pages
import Home from "./pages/Home";
import Locator from "./pages/Locator"; 
import About from "./pages/About";

// Components
import SettingsModal from "./components/SettingsModal";

// --- FLOATING NAVIGATION COMPONENT ---
function Navigation({ toggleTheme, isDark, openSettings }) {
  const location = useLocation();
  
  const triggerHaptic = () => { 
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(15); 
  };

  const navItems = [
    { 
      path: "/", 
      label: "Home", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> 
    },
    // ---> FIXED: Updated with specific path data from your new logo.svg <---
    { 
      path: "/locator", 
      label: "Locator", 
      icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><path fill="currentColor" d="M12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></> 
    },
    { 
      path: "/about", 
      label: "About", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> 
    }
  ];

  return (
    <>
      {/* ---> FIXED CENTER NAV PILL (Refined Glass & Liquid Sliding) <--- */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto w-max">
        <div className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border border-gray-200/60 dark:border-white/10 rounded-full p-1.5 flex items-center shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={triggerHaptic}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className="relative flex flex-col items-center justify-center w-[72px] h-[60px] rounded-full transition-colors outline-none cursor-pointer"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-gray-100 dark:bg-white/10 rounded-[2rem]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                
                {/* Content (Sits cleanly above the sliding pill) */}
                <div className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-300 ${isActive ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                  {/* ---> FIXED: Switched stroke to fill for specific Locator icon data <--- */}
                  <svg className="w-[22px] h-[22px] mb-1" fill={item.label === "Locator" ? "none" : "none"} stroke={item.label === "Locator" ? "currentColor" : "currentColor"} viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  <span className="text-[9px] font-bold tracking-[0.1em] uppercase font-sans">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ---> FIXED RIGHT SYSTEM CONTROLS <--- */}
      <div className="fixed top-6 right-4 md:right-6 z-[100] flex flex-col gap-3 pointer-events-auto">
        <button 
          onClick={() => { triggerHaptic(); openSettings(); }}
          className="w-12 h-12 bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button 
          onClick={() => { triggerHaptic(); toggleTheme(); }}
          className="w-12 h-12 bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </div>
    </>
  );
}

// --- ROUTE ANIMATION WRAPPER ---
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/locator" element={<Locator />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  );
}

// --- MAIN APP ---
function App() {
  // Theme Engine
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cashspot_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cashspot_theme', 'dark');
      document.querySelector('meta[name="theme-color"]').setAttribute("content", "#050505");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cashspot_theme', 'light');
      document.querySelector('meta[name="theme-color"]').setAttribute("content", "#fdfdfd");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <div className="relative w-full min-h-[100dvh] bg-white dark:bg-[#050505] text-black dark:text-white transition-colors duration-500 overflow-hidden">
        
        {/* Global Navigation */}
        <Navigation toggleTheme={toggleTheme} isDark={isDark} openSettings={() => setIsSettingsOpen(true)} />
        
        {/* Settings Modal Layer */}
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        {/* Page Content */}
        <AnimatedRoutes />
        
      </div>
    </Router>
  );
}

export default App;