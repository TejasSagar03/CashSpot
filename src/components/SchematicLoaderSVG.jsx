function SchematicLoaderSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Outer spinning dashed ring */}
      <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="15 15" className="animate-spin" />
      {/* Inner reverse-spinning target */}
      <circle cx="12" cy="12" r="4" strokeWidth="2" strokeDasharray="4 4" className="animate-[spin_2s_linear_infinite_reverse]" />
    </svg>
  );
}

export default SchematicLoaderSVG;