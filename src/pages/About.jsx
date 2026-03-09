import SchematicGlobeSVG from "../components/SchematicGlobeSVG";
import AnimatedPage from "../components/AnimatedPage"; 

function About() {
  const categories = [
    { title: "System Architecture", desc: "Built on React, TailwindCSS, and Framer Motion for liquid transitions." },
    { title: "Data Sourcing", desc: "Live queries via OpenStreetMap's Overpass API for real-time ATM data." },
    { title: "GPS Telemetry", desc: "Utilizes navigator.geolocation with enableHighAccuracy for pinpoint routing." },
    { title: "UI/UX Schematics", desc: "Monochromatic adaptive theme inspired by flagship industrial hardware." },
    { title: "Deployment Specs", desc: "Automated CI/CD pipeline hosted on Vercel's edge network." },
    { title: "Privacy Metrics", desc: "Zero tracking. Location data is strictly client-side and volatile." }
  ];

  const faqs = [
    { q: "Why is my location inaccurate?", a: "Ensure your browser has location permissions granted and that you are not connected to a VPN, which routes your IP to a different geographical grid." },
    { q: "How often is the data updated?", a: "CashSpot pulls directly from OSM (OpenStreetMap). Edits made by the global mapping community reflect here almost instantly." },
    { q: "Does this work offline?", a: "No. CashSpot requires an active network connection to ping the API and render map tile data." }
  ];

  return (
    <AnimatedPage>
      <div className="relative min-h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden bg-white dark:bg-black font-sans pb-32">
        
        <div className="absolute top-0 w-full h-screen flex items-center justify-center pointer-events-none fixed">
          <SchematicGlobeSVG className="w-[1000px] h-[1000px] md:w-[1400px] md:h-[1400px] text-black dark:text-white opacity-[0.03] dark:opacity-[0.05] animate-[spin_120s_linear_infinite]" />
        </div>

        {/* HEADER */}
        <div className="relative z-10 w-full max-w-[1000px] px-6 pt-24 pb-12 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-semibold text-black dark:text-white tracking-tight mb-8">
            Support Centre
          </h1>
          <div className="w-full max-w-[600px] flex items-center bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-full overflow-hidden focus-within:border-black dark:focus-within:border-gray-500 shadow-sm transition-colors">
            <input 
              type="text" 
              placeholder="Search documentation..." 
              className="w-full bg-transparent px-6 py-4 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium outline-none text-sm md:text-base"
            />
            <button className="h-full px-6 text-black dark:text-white font-semibold hover:opacity-70">Search</button>
          </div>
        </div>

        {/* TECHNICAL SPECIFICATIONS GRID */}
        <div className="relative z-10 w-full max-w-[1200px] px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {categories.map((cat, index) => (
            <div key={index} className="group p-8 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{cat.title}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* NEW: FAQ SECTION */}
        <div className="relative z-10 w-full max-w-[800px] px-6 mb-12">
          <h2 className="text-3xl font-semibold text-black dark:text-white mb-8 text-center">System FAQ</h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl">
                <h4 className="font-semibold text-black dark:text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AnimatedPage>
  );
}

export default About;