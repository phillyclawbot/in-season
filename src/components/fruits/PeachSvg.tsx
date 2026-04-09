export default function PeachSvg() {
  return (
    <svg
      viewBox="0 0 320 360"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", maxHeight: "100%" }}
    >
      <defs>
        <radialGradient id="pc-body" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="35%" stopColor="#FDBA74" />
          <stop offset="70%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>
        <radialGradient id="pc-blush" cx="60%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pc-shine" cx="32%" cy="28%" r="44%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="160" cy="346" rx="80" ry="11" fill="#C2410C" opacity="0.14" />

      {/* Body — peach is a sphere with a vertical crease, slightly flattened top */}
      <path
        d="M160 48
           C96 48, 46 102, 46 182
           C46 256, 96 336, 160 336
           C224 336, 274 256, 274 182
           C274 102, 224 48, 160 48Z"
        fill="url(#pc-body)"
      />

      {/* Vertical crease */}
      <path
        d="M160 54 Q156 140 160 330"
        stroke="#E05320"
        strokeWidth="2.5"
        fill="none"
        opacity="0.35"
      />

      {/* Pink-red blush on right side */}
      <path
        d="M160 48
           C224 48, 274 102, 274 182
           C274 256, 224 336, 160 336
           C200 336, 274 256, 274 182
           C274 102, 224 48, 160 48Z"
        fill="url(#pc-blush)"
      />

      {/* Shine */}
      <path
        d="M160 48
           C96 48, 46 102, 46 182
           C46 256, 96 336, 160 336
           C224 336, 274 256, 274 182
           C274 102, 224 48, 160 48Z"
        fill="url(#pc-shine)"
      />

      {/* Stem */}
      <path
        d="M160 50 Q163 32 160 18"
        stroke="#92400E"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Leaf */}
      <path
        d="M162 34 Q186 16 202 24 Q188 36 166 36Z"
        fill="#65A30D"
      />
      <path
        d="M162 34 Q186 22 202 24"
        stroke="#4D7C0F"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Small second leaf */}
      <path
        d="M160 38 Q140 20 126 28 Q140 38 158 40Z"
        fill="#84CC16"
        opacity="0.85"
      />
    </svg>
  );
}
