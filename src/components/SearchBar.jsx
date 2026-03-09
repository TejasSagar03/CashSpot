import { useState } from "react";

function SearchBar({ setSearch }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch(input);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      // Notice the rounded-full and thinner border
      className="relative flex w-full border border-black dark:border-white bg-white dark:bg-black rounded-full overflow-hidden transition-colors"
    >
      <input
        type="text"
        placeholder="Search locations..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        // Clean, medium-weight text instead of aggressive uppercase
        className="flex-1 bg-transparent px-6 py-3.5 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium outline-none text-sm md:text-base"
      />
      
      <button
        type="submit"
        className="px-6 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300 flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}

export default SearchBar;