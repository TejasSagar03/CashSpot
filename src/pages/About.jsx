import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="min-h-[calc(100vh-68px)] bg-gray-50 dark:bg-gray-900 py-12 px-6 transition-colors duration-300 relative overflow-hidden flex items-center justify-center">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 dark:opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 dark:opacity-20 pointer-events-none"></div>

      <div className="max-w-5xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">CashSpot</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            A modern, lightning-fast locator built to make finding nearby cash points and banking services completely effortless.
          </p>
        </div>

        {/* Features Grid using your GlassCard component */}
        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Smart Mapping</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              Utilizing OpenStreetMap and the Overpass API, we pull real-time, highly accurate data for ATMs and bank branches in a 15km radius around your exact location.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fast & Responsive</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              Built with React and Tailwind CSS, the interface is designed to be mobile-first, heavily interactive, and easy to use when you are on the go.
            </p>
          </GlassCard>
        </div>

        {/* Call to Action using your GradientButton component */}
        <div className="mt-16 flex justify-center">
          <Link to="/locator">
            <GradientButton text="Try the Locator Now" />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default About;