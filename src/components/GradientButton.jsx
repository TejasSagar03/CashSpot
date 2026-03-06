function GradientButton({ text, onClick }) {
  const handleClick = (e) => {
    if (navigator.vibrate) navigator.vibrate(30);
    if (onClick) onClick(e);
  };

  return (
    <button 
      onClick={handleClick}
      className="px-8 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
    >
      {text}
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  );
}

export default GradientButton;