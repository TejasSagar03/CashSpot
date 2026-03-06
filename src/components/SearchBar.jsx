import { useState } from "react";

function SearchBar({ setSearch }) {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    setValue(e.target.value);
    setSearch(e.target.value);
  };

  return (
    <div className="bg-white rounded-full shadow-lg flex items-center px-5 py-3.5 border border-gray-100">
      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search 'HDFC', 'SBI', 'Axis'..."
        value={value}
        onChange={handleChange}
        className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base font-medium"
      />
    </div>
  );
}

export default SearchBar;