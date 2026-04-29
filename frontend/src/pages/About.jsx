import Footer from "../components/Footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchematicGlobeSVG from "../components/SchematicGlobeSVG";
import AnimatedPage from "../components/AnimatedPage";

function About() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  // --- EXTENDED HARDWARE CATEGORIES ---
  const categories = [
    { id: "ARC-01", status: "STABLE", title: "System Architecture", desc: "Built on React, TailwindCSS, and Framer Motion for liquid transitions." },
    { id: "DAT-02", status: "ACTIVE", title: "Data Sourcing", desc: "Live queries via OpenStreetMap's Overpass API for real-time ATM data." },
    { id: "TEL-03", status: "SYNCED", title: "GPS Telemetry", desc: "Utilizes navigator.geolocation with enableHighAccuracy for pinpoint routing." },
    { id: "UIX-04", status: "RENDERED", title: "UI/UX Schematics", desc: "Monochromatic adaptive theme inspired by flagship industrial hardware." },
    { id: "DEP-05", status: "DEPLOYED", title: "Deployment Specs", desc: "Automated CI/CD pipeline hosted on Vercel's edge network." },
    { id: "SEC-06", status: "ENCRYPTED", title: "Privacy Metrics", desc: "Zero tracking. Location data is strictly client-side and volatile." },
    { id: "NET-07", status: "OPTIMIZED", title: "Network Latency", desc: "Edge-cached API responses ensure sub-100ms data retrieval globally." },
    { id: "GEO-08", status: "CALIBRATED", title: "Geospatial Logic", desc: "Haversine formula implementation for absolute distance calculations." },
    { id: "OSS-09", status: "COMPLIANT", title: "Open-Source Hub", desc: "Completely transparent source code accessible for community audit." }
  ];

  const faqs = [
    { q: "Why is my location inaccurate?", a: "Ensure your browser has location permissions granted and that you are not connected to a VPN." },
    { q: "How often is the data updated?", a: "CashSpot pulls directly from OSM (OpenStreetMap). Edits reflect almost instantly." },
    { q: "Does this work offline?", a: "No. CashSpot requires an active network connection to ping the API and render map tiles." }
  ];

  const filteredCategories = categories.filter(cat => 
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const noResults = filteredCategories.length === 0 && filteredFaqs.length === 0;

  return (
    <AnimatedPage>
      <div className="relative min-h-[100dvh] w-full flex flex-col items-center bg-[#f8fafc] dark:bg-[#050505] transition-colors duration-500 font-sans pt-40 pb-24 overflow-hidden">
        
        {/* DOT MATRIX OVERLAY */}
        <style>{`
          .nothing-dots {
            background-image: radial-gradient(currentColor 1px, transparent 1px);
            background-size: 14px 14px;
          }
        `}</style>

        {/* 1. BACKGROUND GLOBE */}
        <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center pointer-events-none z-0">
          <SchematicGlobeSVG className="w-[300vw] h-[300vw] md:w-[1300px] md:h-[1300px] text-black dark:text-white opacity-[0.3] dark:opacity-[0.4] animate-[spin_180s_linear_infinite]" />
        </div>

        {/* 2. TACTICAL HARDWARE SIGNATURE (Top Left) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex flex-col gap-1.5 hidden md:flex select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className="text-[9px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Sys.Uplink Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-[0.35em] text-black dark:text-white uppercase leading-none">
              CashSpot
            </span>
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="w-2 h-3.5 bg-black dark:bg-white"
            />
          </div>
        </motion.div>

        {/* HERO SECTION */}
        <div className="relative z-10 w-full max-w-[1000px] px-6 pb-12 flex flex-col items-center text-center mt-4 md:mt-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="text-[10px] font-mono font-bold tracking-[0.5em] uppercase mb-2 text-black dark:text-white"
          >
            REF_ID: 884-X99-CS
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-black dark:text-white tracking-tighter mb-8"
          >
            Support Centre
          </motion.h1>
          
          <div className="w-full max-w-[600px] flex items-center bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-full focus-within:border-black dark:focus-within:border-white shadow-2xl transition-all p-1">
            <input 
              type="text" 
              placeholder="Search documentation, specs, or IDs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent px-5 py-3 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium outline-none text-sm md:text-base min-w-0"
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm("")}
                  className="px-3 text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </motion.button>
              )}
            </AnimatePresence>
            <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full mr-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="relative z-10 w-full max-w-[1200px] px-6">
          <AnimatePresence mode="wait">
            {noResults ? (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-12 text-center"
              >
                <p className="text-lg font-semibold text-black dark:text-white tracking-widest uppercase">SYSTEM :: 404</p>
                <p className="text-sm text-gray-500 mt-2">No data found for "{searchTerm}"</p>
              </motion.div>
            ) : (
              <motion.div key="results" className="contents">
                
                {/* 3. CATEGORY CARDS WITH REFINED HARDWARE LABELS */}
                {filteredCategories.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {filteredCategories.map((cat, index) => (
                      <motion.div 
                        key={cat.title}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, ease: [0.19, 1, 0.22, 1] }}
                        className="group relative p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/60 dark:hover:bg-white/[0.08] hover:border-white/40 shadow-sm hover:shadow-xl flex flex-col justify-between min-h-[220px]"
                      >
                        {/* Dot Background on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] nothing-dots text-black dark:text-white transition-opacity duration-500 pointer-events-none" />
                        
                        <div className="relative z-10 text-left">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase">
                              {cat.id} {"//"} {cat.status}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                          </div>
                          
                          <h3 className="text-lg font-bold text-black dark:text-white mb-2 uppercase tracking-tight">{cat.title}</h3>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{cat.desc}</p>
                        </div>

                        {/* Hardware Footer Bits */}
                        <div className="relative z-10 pt-4 border-t border-dashed border-black/5 dark:border-white/10 flex justify-between items-center opacity-40 mt-6">
                           <span className="text-[8px] font-mono tracking-widest">CHECKSUM_OK</span>
                           <span className="text-[8px] font-mono tracking-widest">0{index + 1}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* 4. INTERACTIVE TERMINAL FAQ */}
                {filteredFaqs.length > 0 && (
                  <div className="max-w-[800px] mx-auto mb-12">
                    <div className="flex items-center gap-4 mb-8">
                       <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-bold whitespace-nowrap">Diagnostic FAQ</span>
                       <div className="flex-1 h-[1px] border-b border-dashed border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {filteredFaqs.map((faq, index) => (
                        <motion.div 
                          key={faq.q}
                          onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                          className="cursor-pointer p-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] transition-all hover:bg-white/60 dark:hover:bg-white/10 shadow-sm"
                        >
                          <div className="flex justify-between items-center text-left">
                            <h4 className="font-bold text-black dark:text-white uppercase tracking-tight text-sm md:text-base">{faq.q}</h4>
                            <motion.span 
                              animate={{ rotate: activeFaq === index ? 45 : 0 }}
                              className={`w-8 h-8 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center transition-colors ${activeFaq === index ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-400'}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            </motion.span>
                          </div>
                          
                          <AnimatePresence>
                            {activeFaq === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="pt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium text-left border-t border-dashed border-gray-200 dark:border-gray-800 mt-4">
                                  <span className="text-green-500 mr-2 font-mono font-bold">{">"}</span>
                                  {faq.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Footer />

      </div>
    </AnimatedPage>
  );
}

export default About;