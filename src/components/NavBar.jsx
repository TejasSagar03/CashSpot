import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

function NavBar() {
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <div className="flex items-center justify-between px-6 md:px-8 py-4 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 relative z-20 transition-colors duration-300">
      <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        CashSpot 
      </h1>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex gap-1">
          <Link to="/" onClick={triggerHaptic} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-all">Home</Link>
          <Link to="/locator" onClick={triggerHaptic} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-all">Locator</Link>
          <Link to="/about" onClick={triggerHaptic} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-all">About</Link>
        </div>
        
        <DarkModeToggle />
      </div>
    </div>
  );
}

export default NavBar;