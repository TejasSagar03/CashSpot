function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 p-8 rounded-[2rem] shadow-xl hover:-translate-y-2 transition-transform duration-300 ${className}`}>
      {children}
    </div>
  );
}

export default GlassCard;