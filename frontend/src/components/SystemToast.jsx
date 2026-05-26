import { motion, AnimatePresence } from "framer-motion";

export default function SystemToast({ isVisible, bankName, distance, onClose }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm pointer-events-auto"
        >
          {/* Background and shadows adapt to Light/Dark mode automatically */}
          <div className="bg-white/90 dark:bg-[#050505]/95 border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden relative transition-colors duration-500">
            
            {/* The Grid Overlay: Faint black grid in light mode, faint white grid in dark mode */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none transition-colors duration-500"></div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 shrink-0">
                <div className="w-2 h-2 bg-[#ff0031] rounded-full animate-pulse shadow-[0_0_10px_#ff0031]"></div>
              </div>

              {/* Text dynamically switches from black to white */}
              <div className="flex-1 text-left font-dot">
                <p className="text-[10px] tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-0.5 transition-colors duration-500">
                  Tracking Active
                </p>
                <h3 className="text-sm tracking-[0.15em] text-black dark:text-white uppercase max-w-[200px] truncate transition-colors duration-500">
                  {bankName}
                </h3>
                <p className="text-[12px] text-[#ff0031] font-bold tracking-widest mt-0.5">
                  Distance: {distance}
                </p>
              </div>

              {/* Close Button adapts to theme */}
              <button 
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-all active:scale-90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}