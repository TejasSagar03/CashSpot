function SchematicGlobeSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="400" cy="400" r="390" />
        <circle cx="400" cy="400" r="300" strokeDasharray="8 8" />
        <ellipse cx="400" cy="400" rx="390" ry="120" strokeDasharray="4 8" />
        <ellipse cx="400" cy="400" rx="390" ry="260" />
        <line x1="10" y1="400" x2="790" y2="400" />
        <ellipse cx="400" cy="400" rx="120" ry="390" strokeDasharray="4 8" />
        <ellipse cx="400" cy="400" rx="260" ry="390" />
        <line x1="400" y1="10" x2="400" y2="790" />
        <line x1="124" y1="124" x2="676" y2="676" strokeDasharray="12 12" />
        <line x1="124" y1="676" x2="676" y2="124" strokeDasharray="12 12" />
      </g>
    </svg>
  );
}

export default SchematicGlobeSVG;