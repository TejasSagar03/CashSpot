import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 

// Pages
import Home from "./pages/Home";
import Locator from "./pages/Locator"; 
import About from "./pages/About";
import Login from "./pages/Login"; 
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Welcome from "./pages/Welcome";
import SettingsModal from "./components/SettingsModal";
import SystemToast from "./components/SystemToast";

// --- AUTH WRAPPER ---
const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-[#ff0031] rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// --- NAVIGATION ---
function Navigation({ toggleTheme, isDark, user }) {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  
  const triggerHaptic = () => { 
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(15); 
  };
  
  const isSplash = ["/login", "/signup", "/welcome"].includes(location.pathname);

  const navItems = [
    { path: "/home", label: "Home", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { path: "/locator", label: "Locator", icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><path fill="currentColor" d="M12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></> },
    { path: "/about", label: "About", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> }
  ];

  return (
    <>
      {!isSplash && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-max">
          <div className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border border-gray-200/60 dark:border-white/10 rounded-full p-1.5 flex items-center shadow-2xl">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={triggerHaptic} className="relative flex flex-col items-center justify-center w-[72px] h-[60px] rounded-full outline-none">
                  {isActive && <motion.div layoutId="activeNavPill" className="absolute inset-0 bg-gray-100 dark:bg-white/10 rounded-[2rem]" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
                  <div className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-300 ${isActive ? 'text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                    <svg className="w-[22px] h-[22px] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                    <span className="text-[9px] font-bold tracking-[0.1em] uppercase">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!["/login", "/signup"].includes(location.pathname) && (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
          {user && (
            <Link to="/profile" onClick={triggerHaptic} className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
              {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <span className="font-black text-sm uppercase">{user.displayName?.charAt(0) || "U"}</span>}
            </Link>
          )}
          
          <button 
            onClick={() => { triggerHaptic(); setIsSettingsOpen(true); }} 
            className="w-12 h-12 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button onClick={() => { triggerHaptic(); toggleTheme(); }} className="w-12 h-12 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90">
            {isDark ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  // Global Navigation Telemetry State
  const [toastData, setToastData] = useState({ visible: false, bank: "", dist: "" });

  const triggerNavLock = (bankName, distance) => {
    if (!bankName) {
      setToastData({ visible: false, bank: "", dist: "" });
    } else {
      setToastData({ visible: true, bank: bankName, dist: distance });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className={isDark ? "dark" : ""}>
        <div className="relative w-full min-h-[100dvh] bg-[#fdfdfd] dark:bg-black text-black dark:text-white transition-colors duration-500 overflow-hidden">
          
          <Navigation toggleTheme={() => setIsDark(!isDark)} isDark={isDark} user={user} />
          
          {/* Integrated Minimalist Top Banner HUD */}
          <SystemToast 
            isVisible={toastData.visible} 
            bankName={toastData.bank} 
            distance={toastData.dist}
            onClose={() => triggerNavLock(null)}
          />

          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
              <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
              <Route path="/signup" element={user ? <Navigate to="/welcome" replace /> : <Signup />} />
              
              <Route path="/home" element={<ProtectedRoute user={user} loading={loading}><Home /></ProtectedRoute>} />
              <Route path="/welcome" element={<ProtectedRoute user={user} loading={loading}><Welcome /></ProtectedRoute>} />
              
              {/* Passed trigger payload injection straight to context handler */}
              <Route path="/locator" element={
                <ProtectedRoute user={user} loading={loading}>
                  <Locator triggerToast={triggerNavLock} globalToastVisible={toastData.visible} />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={<ProtectedRoute user={user} loading={loading}><Profile user={user} /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
}