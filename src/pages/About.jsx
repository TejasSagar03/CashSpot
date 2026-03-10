import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchematicGlobeSVG from "../components/SchematicGlobeSVG";
import AnimatedPage from "../components/AnimatedPage"; 

function About() {
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { title: "System Architecture", desc: "Built on React, TailwindCSS, and Framer Motion for liquid transitions." },
    { title: "Data Sourcing", desc: "Live queries via OpenStreetMap's Overpass API for real-time ATM data." },
    { title: "GPS Telemetry", desc: "Utilizes navigator.geolocation with enableHighAccuracy for pinpoint routing." },
    { title: "UI/UX Schematics", desc: "Monochromatic adaptive theme inspired by flagship industrial hardware." },
    { title: "Deployment Specs", desc: "Automated CI/CD pipeline hosted on Vercel's edge network." },
    { title: "Privacy Metrics", desc: "Zero tracking. Location data is strictly client-side and volatile." }
  ];

  const faqs = [
    { q: "Why is my location inaccurate?", a: "Ensure your browser has location permissions granted and that you are not connected to a VPN." },
    { q: "How often is the data updated?", a: "CashSpot pulls directly from OSM (OpenStreetMap). Edits reflect almost instantly." },
    { q: "Does this work offline?", a: "No. CashSpot requires an active network connection to ping the API and render map tiles." }
  ];

  const filteredCategories = categories.filter(cat => 
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const noResults = filteredCategories.length === 0 && filteredFaqs.length === 0;

  return (
    <AnimatedPage>
      <div className="relative min-h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden bg-white dark:bg-black font-sans pb-32">
        
        {/* Background Globe - OPACITY FIXED HERE */}
        <div className="absolute top-0 w-full h-screen flex items-center justify-center overflow-hidden pointer-events-none fixed">
          <SchematicGlobeSVG className="w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] text-black dark:text-white opacity-10 dark:opacity-20 animate-[spin_120s_linear_infinite]" />
        </div>


        {/* Header Section */}
        <div className="relative z-10 w-full max-w-[1000px] px-6 pt-28 pb-12 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-semibold text-black dark:text-white tracking-tight mb-8"
          >
            Support Centre
          </motion.h1>
          
          {/* Refined Search Bar: Circular button prevents corner-spilling glitch */}
          <div className="w-full max-w-[600px] flex items-center bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-full focus-within:border-black dark:focus-within:border-gray-500 shadow-sm transition-nothing p-1">
            <input 
              type="text" 
              placeholder="Search documentation, specs, or FAQs..." 
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

        {/* Results Sections with Staggered Animations */}
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
                {/* Technical Specifications Grid */}
                {filteredCategories.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {filteredCategories.map((cat, index) => (
                      <motion.div 
                        key={cat.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, ease: [0.19, 1, 0.22, 1] }}
                        className="group p-8 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl hover:border-black dark:hover:border-white transition-nothing"
                      >
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{cat.title}</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{cat.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* FAQ List */}
                {filteredFaqs.length > 0 && (
                  <div className="max-w-[800px] mx-auto mb-12">
                    <h2 className="text-3xl font-semibold text-black dark:text-white mb-8 text-center uppercase tracking-tight">
                      {searchTerm ? "Search Results" : "System FAQ"}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {filteredFaqs.map((faq, index) => (
                        <motion.div 
                          key={faq.q}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
                          className="p-6 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl transition-nothing"
                        >
                          <h4 className="font-semibold text-black dark:text-white mb-2">{faq.q}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default About;