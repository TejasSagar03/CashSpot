import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import AnimatedPage from "../components/AnimatedPage";

export default function Welcome() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const user = auth.currentUser;
  
  // Operator Identity
  const displayName = user?.displayName || user?.email?.split('@')[0] || "TEJAS";
  const nameChars = displayName.toUpperCase().split("");

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleInitialize = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 20, 10]); 
    }
    navigate("/home");
  };

  // --- REFINED SHUTTER VARIANTS ---
  const charVars = {
    hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0, x: -10 },
    visible: { 
      clipPath: "inset(0 0% 0 0)", 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 350, damping: 30 }
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-[100dvh] w-full bg-[#fdfdfd] dark:bg-black transition-colors duration-700 flex flex-col items-center justify-between p-8 md:p-16 overflow-hidden relative selection:bg-[#ff0031] selection:text-white font-['Inter']">
        
        {/* --- GRID --- */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.12]">
          <div className="absolute inset-0 bg-[radial-gradient(#000_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] bg-[size:42px_42px]"></div>
        </div>

        {/* --- HUD HEADER --- */}
        <div className="w-full flex justify-between items-start relative z-20 font-['Silkscreen']">
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff0031] animate-pulse shadow-[0_0_8px_#ff0031]"></div>
              <span className="text-[9px] tracking-tight uppercase text-black dark:text-white opacity-40">System_Live</span>
            </div>
            <span className="text-[10px] tracking-tight uppercase text-black dark:text-white">Cash_Spot // Node_Uplink</span>
          </motion.div>
          <div className="hidden md:block opacity-20">
             <span className="text-[9px] tracking-tight uppercase font-bold">SESSION_ID: {user?.uid?.slice(0, 8).toUpperCase() || "NUL-01"}</span>
          </div>
        </div>

        {/* --- MAIN IDENTITY (Refined Boldness) --- */}
        <div className="flex flex-col items-center text-center relative z-10 w-full">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }} 
            className="flex flex-col items-center"
          >
            <motion.h1 
              variants={charVars}
              className="text-[12vw] md:text-[8vw] font-bold text-black dark:text-white tracking-tighter uppercase leading-none"
            >
              WELCOME
            </motion.h1>
            
            <div className="flex flex-wrap justify-center mt-2">
              {nameChars.map((char, index) => (
                <motion.span
                  key={index}
                  variants={charVars}
                  className="text-[15vw] md:text-[11vw] font-bold text-[#ff0031] tracking-tighter uppercase leading-none inline-block drop-shadow-[0_0_20px_rgba(255,0,49,0.1)]"
                >
                  {char}
                </motion.span>
              ))}
            </div>

            <motion.div 
              initial={{ scaleX: 0 }} 
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-14 w-14 h-[1.5px] bg-[#ff0031]"
            ></motion.div>

            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-10 font-['Silkscreen'] text-[8px] md:text-[9px] uppercase tracking-normal text-gray-400 dark:text-gray-600 leading-relaxed max-w-[320px]"
            >
              Identity confirmed. System is ready for localized extraction.
            </motion.p>
          </motion.div>
        </div>

        {/* --- ACTION GROUP --- */}
        <div className="w-full max-w-sm flex flex-col items-center gap-12 relative z-20">
          <AnimatePresence>
            {isReady && (
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="flex items-center gap-5 w-full px-4"
              >
                <button
                  onClick={handleInitialize}
                  className="flex-1 bg-black dark:bg-[#ff0031] text-white dark:text-white py-5 px-6 rounded-full font-bold text-[13px] uppercase tracking-[0.4em] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  Initialize
                </button>
                
                <button 
                  onClick={handleInitialize}
                  className="w-16 h-16 rounded-full border border-black/5 dark:border-white/10 bg-white dark:bg-black flex items-center justify-center group hover:border-[#ff0031] transition-all cursor-pointer shadow-sm"
                >
                  <svg className="w-5 h-5 text-black dark:text-white group-hover:text-[#ff0031] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 opacity-10">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"></div>
            ))}
          </div>
        </div>

      </div>
    </AnimatedPage>
  );
}