import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import AnimatedPage from "../components/AnimatedPage";

// Helper for swipe calculation
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export default function Welcome() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  const [[page, direction], setPage] = useState([0, 0]);
  const [isReady, setIsReady] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || "TEJAS";

  const slides = [
    {
      top: "WELCOME",
      bottom: displayName.toUpperCase(),
      desc: "Identity confirmed. System is ready for localized extraction."
    },
    {
      top: "FIND",
      bottom: "SPOTS",
      desc: "Instantly locate the nearest cash extraction nodes in your perimeter."
    },
    {
      top: "ZERO",
      bottom: "FEES",
      desc: "Seamless and secure peer-to-peer liquidity bridging."
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

// --- KEYBOARD NAVIGATION ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" && page < slides.length - 1) paginate(1);
      if (e.key === "ArrowLeft" && page > 0) paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const triggerHaptic = (intensity = 10) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(intensity);
    }
  };

  const paginate = (newDirection) => {
    triggerHaptic(10);
    setPage([page + newDirection, newDirection]);
  };

  const handleInitialize = () => {
    triggerHaptic([10, 20, 10]); 
    navigate("/home");
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0, filter: "blur(8px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 400, damping: 30 } },
    exit: (direction) => ({ x: direction < 0 ? 60 : -60, opacity: 0, filter: "blur(8px)", transition: { duration: 0.2 } })
  };

  return (
    <AnimatedPage>
      <div className="min-h-[100dvh] w-full bg-[#fcfcfc] dark:bg-black transition-colors duration-700 flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden relative selection:bg-[#ff0031] selection:text-white font-['Inter']">
        
        {/* --- WATERMARK GRID --- */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.10] dark:opacity-[0.15]">
          <div className="absolute inset-0 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] bg-[size:40px_40px]"></div>
        </div>

        {/* --- HUD HEADER --- */}
        <div className="w-full flex justify-between items-start relative z-20 font-['Silkscreen'] pr-20 md:pr-24">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff0031] animate-pulse shadow-none dark:shadow-[0_0_8px_#ff0031]"></div>
              <span className="text-[9px] tracking-widest uppercase text-gray-500 dark:text-white dark:opacity-40 font-bold">System_Live</span>
            </div>
            <span className="text-[10px] tracking-widest uppercase text-black dark:text-white">Cash_Spot // Node_Uplink</span>
          </motion.div>
          <div className="hidden sm:block opacity-30 dark:opacity-20 mt-1">
             <span className="text-[9px] tracking-widest uppercase font-bold text-gray-500 dark:text-white">SESSION_ID: {user?.uid?.slice(0, 8).toUpperCase() || "NUL-00"}</span>
          </div>
        </div>

        {/* --- CENTER: SWIPEABLE SLIDER --- */}
        <div className="flex flex-col items-center justify-center relative z-10 w-full flex-1 mt-8 md:mt-0 overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div 
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              // --- GESTURE CONTROLS ---
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold && page < slides.length - 1) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold && page > 0) {
                  paginate(-1);
                }
              }}
              className="flex flex-col items-center w-full absolute cursor-grab active:cursor-grabbing"
            >
              <h1 className="text-[13vw] md:text-[8vw] font-[900] text-black dark:text-white tracking-tight uppercase leading-[0.9] text-center select-none">
                {slides[page].top}
              </h1>
              
              <div className="flex flex-wrap justify-center mt-1 text-center select-none">
                {slides[page].bottom.split("").map((char, index) => (
                  <span key={index} className="text-[15vw] md:text-[10vw] font-[900] text-[#ff0031] tracking-tight uppercase leading-[0.9] inline-block">
                    {char}
                  </span>
                ))}
              </div>

              <div className="mt-12 mb-8 w-12 h-[2px] bg-[#ff0031]"></div>

              <p className="font-['Silkscreen'] text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-500 leading-loose max-w-[380px] text-center px-4 select-none">
                {slides[page].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- FOOTER ACTION GROUP --- */}
        <div className="w-full max-w-sm flex flex-col items-center gap-10 relative z-20 pb-4">
          <AnimatePresence mode="wait">
            {isReady && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between w-full h-[60px]"
              >
                {/* PREVIOUS BUTTON */}
                <div className="w-[60px]">
                  {page > 0 && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => paginate(-1)}
                      className="w-[60px] h-[60px] rounded-full border border-gray-300 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center group hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-sm"
                    >
                      <svg className="w-5 h-5 text-black dark:text-white group-hover:-translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </motion.button>
                  )}
                </div>

                {/* DYNAMIC RIGHT ACTION */}
                <div className="flex justify-end flex-1 pl-4">
                  <AnimatePresence mode="wait">
                    {page < slides.length - 1 ? (
                      <motion.button 
                        key="next"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, transition:{duration:0.1} }}
                        onClick={() => paginate(1)}
                        className="w-[60px] h-[60px] rounded-full border border-gray-300 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center group hover:border-[#ff0031] dark:hover:border-[#ff0031] transition-all cursor-pointer shadow-sm"
                      >
                        <svg className="w-5 h-5 text-black dark:text-white group-hover:text-[#ff0031] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                      </motion.button>
                    ) : (
                      <motion.button 
                        key="init"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={handleInitialize}
                        className="w-full bg-[#ff0031] text-white h-[60px] px-6 rounded-full font-bold text-[13px] uppercase tracking-[0.4em] shadow-md dark:shadow-[0_20px_40px_-15px_rgba(255,0,49,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Initialize
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* DOT INDICATORS */}
          <div className="flex gap-3 opacity-40 dark:opacity-30">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === page 
                    ? 'w-4 bg-[#ff0031] opacity-100 shadow-[0_0_8px_#ff003180]' 
                    : 'w-1.5 bg-gray-400 dark:bg-white'
                }`}
              ></div>
            ))}
          </div>
        </div>

      </div>
    </AnimatedPage>
  );
}