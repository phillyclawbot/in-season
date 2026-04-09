export default function StrawberrySvg() {
  return (
    <svg
      viewBox="0 0 320 360"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", maxHeight: "100%" }}
    >
      <defs>
        <radialGradient id="sb-body" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FF6B7A" />
          <stop offset="55%" stopColor="#E8334A" />
          <stop offset="100%" stopColor="#C01F34" />
        </radialGradient>
        <radialGradient id="sb-shine" cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sb-shadow" cx="50%" cy="100%" r="40%">
          <stop offset="0%" stopColor="#8B0000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="160" cy="348" rx="72" ry="10" fill="#C01F34" opacity="0.12" />

      {/* Body — classic strawberry heart/cone shape */}
      <path
        d="M160 50
           C100 50, 46 105, 60 185
           C72 255, 110 305, 160 338
           C210 305, 248 255, 260 185
           C274 105, 220 50, 160 50Z"
        fill="url(#sb-body)"
      />

      {/* Inner shadow at base */}
      <path
        d="M160 338 C135 318, 104 278, 88 232 C80 200 80 170 80 160 C95 230 125 295 160 338Z"
        fill="#9B1B2E"
        opacity="0.22"
      />

      {/* Shine overlay */}
      <path
        d="M160 50
           C100 50, 46 105, 60 185
           C72 255, 110 305, 160 338
           C210 305, 248 255, 260 185
           C274 105, 220 50, 160 50Z"
        fill="url(#sb-shine)"
      />

      {/* Seeds — realistic distribution on a strawberry */}
      {[
        [130, 120], [165, 110], [198, 122],
        [112, 158], [148, 148], [182, 143], [212, 158],
        [100, 198], [134, 188], [165, 183], [196, 186], [222, 196],
        [95,  238], [128, 228], [160, 223], [192, 227], [220, 236],
        [110, 272], [142, 264], [172, 262], [200, 268],
        [128, 305], [158, 298], [186, 304],
      ].map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="4.5"
          ry="6"
          fill="#F5D090"
          opacity="0.88"
          transform={`rotate(${-8 + (i % 3) * 8} ${cx} ${cy})`}
        />
      ))}

      {/* Calyx — 5 realistic sepals */}
      <g>
        {/* Center sepal */}
        <path d="M160 54 Q155 18 160 4 Q165 18 160 54Z" fill="#4CAF50" />
        {/* Left sepals */}
        <path d="M160 54 Q128 30 108 22 Q120 38 148 52Z" fill="#43A047" />
        <path d="M160 54 Q120 48 98 54 Q114 62 150 58Z" fill="#388E3C" />
        {/* Right sepals */}
        <path d="M160 54 Q192 30 212 22 Q200 38 172 52Z" fill="#43A047" />
        <path d="M160 54 Q200 48 222 54 Q206 62 170 58Z" fill="#388E3C" />
        {/* Center circle */}
        <circle cx="160" cy="54" r="7" fill="#2E7D32" />
        {/* Stem */}
        <path d="M160 48 Q162 30 159 16" stroke="#33691E" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
