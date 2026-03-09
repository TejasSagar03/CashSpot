import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function NavBar() {
  const { pathname } = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: "Locator",
      path: "/locator",
      icon: (
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: "About",
      path: "/about",
      icon: (
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
{/* 1. BRANDING LOGO (Top Left) */}
      <Link to="/" className="fixed top-6 left-4 md:left-6 z-[100] flex items-center gap-3 group p-1.5 md:pr-5 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-3xl border border-gray-200 dark:border-gray-800 shadow-sm rounded-[2rem] hover:scale-105 transition-all duration-300">
        <div className="w-10 h-10 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-2xl md:rounded-full shadow-sm">
          <svg className="w-5 h-5 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        {/* Text reappears cleanly on desktop inside the frosted pill */}
        <span className="hidden lg:block text-lg font-bold tracking-tight text-black dark:text-white">CashSpot</span>
      </Link>

      {/* 2. THEME TOGGLE (Top Right) */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-4 md:right-6 z-[100] w-12 h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-3xl border border-gray-200 dark:border-gray-800 shadow-sm text-black dark:text-white hover:scale-105 transition-all duration-300"
        aria-label="Toggle Dark Mode"
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {/* 3. DYNAMIC ISLAND TOP NAVIGATION PILL */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100]">
        <nav className="flex items-center gap-1 p-1.5 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-none rounded-[2.5rem]">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                // The active state now matches your screenshot perfectly: an inner gray bubble!
                className={`flex flex-col items-center justify-center w-[76px] md:w-[88px] h-[64px] rounded-[2rem] transition-all duration-300 ${
                  isActive 
                    ? 'text-black dark:text-white bg-gray-100 dark:bg-white/10' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {link.icon}
                <span className="text-[11px] font-bold tracking-wide mt-1">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default NavBar;