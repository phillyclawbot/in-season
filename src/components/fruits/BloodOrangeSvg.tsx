export default function BloodOrangeSvg() {
  return (
    <svg
      viewBox="0 0 320 360"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", maxHeight: "100%" }}
    >
      <defs>
        {/* Outer rind */}
        <radialGradient id="bo-rind" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="60%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
        {/* Flesh — deep crimson */}
        <radialGradient id="bo-flesh" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="50%" stopColor="#BE123C" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
        {/* Shine on rind */}
        <radialGradient id="bo-shine" cx="30%" cy="28%" r="42%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="160" cy="346" rx="84" ry="12" fill="#881337" opacity="0.15" />

      {/* Outer rind — full circle */}
      <circle cx="160" cy="178" r="148" fill="url(#bo-rind)" />

      {/* Shine on rind */}
      <circle cx="160" cy="178" r="148" fill="url(#bo-shine)" />

      {/* White pith ring */}
      <circle cx="160" cy="178" r="130" fill="#FFF7ED" />

      {/* Flesh circle */}
      <circle cx="160" cy="178" r="118" fill="url(#bo-flesh)" />

      {/* Segment membrane lines — 10 segments */}
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i * 36 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1="160"
            y1="178"
            x2={160 + 118 * Math.cos(angle)}
            y2={178 + 118 * Math.sin(angle)}
            stroke="#FFF0F0"
            strokeWidth="2"
            opacity="0.5"
          />
        );
      })}

      {/* Center navel */}
      <circle cx="160" cy="178" r="10" fill="#FB7185" opacity="0.6" />
      <circle cx="160" cy="178" r="4" fill="#FDA4AF" opacity="0.8" />

      {/* Shine on flesh */}
      <ellipse
        cx="130"
        cy="148"
        rx="32"
        ry="24"
        fill="white"
        opacity="0.12"
        transform="rotate(-20 130 148)"
      />

      {/* Small stem nub at top of rind */}
      <circle cx="160" cy="32" r="5" fill="#9A3412" />
      <path
        d="M160 32 Q162 20 160 10"
        stroke="#7C2D12"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
