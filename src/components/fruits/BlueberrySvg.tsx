export default function BlueberrySvg() {
  return (
    <svg
      viewBox="0 0 320 360"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", maxHeight: "100%" }}
    >
      <defs>
        <radialGradient id="bb-big" cx="36%" cy="30%" r="62%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="45%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </radialGradient>
        <radialGradient id="bb-mid" cx="36%" cy="30%" r="62%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#4C1D95" />
        </radialGradient>
        <radialGradient id="bb-sm" cx="36%" cy="30%" r="62%">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="50%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#3B0764" />
        </radialGradient>
        <radialGradient id="bb-shine" cx="30%" cy="26%" r="45%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="160" cy="348" rx="110" ry="12" fill="#3730A3" opacity="0.14" />

      {/* Back-left small berry */}
      <circle cx="80" cy="250" r="44" fill="url(#bb-sm)" />
      <circle cx="80" cy="250" r="44" fill="url(#bb-shine)" />
      <path d="M80 208 L76 204 L80 200 L84 204Z" fill="#312E81" opacity="0.6" />

      {/* Back-right berry */}
      <circle cx="246" cy="238" r="50" fill="url(#bb-mid)" />
      <circle cx="246" cy="238" r="50" fill="url(#bb-shine)" />
      <path d="M246 190 L242 186 L246 182 L250 186Z" fill="#3B0764" opacity="0.6" />

      {/* Front center — big berry */}
      <circle cx="160" cy="210" r="108" fill="url(#bb-big)" />

      {/* Bloom (silvery waxy coating) */}
      <circle cx="160" cy="210" r="108" fill="white" opacity="0.06" />

      {/* Shine on big berry */}
      <circle cx="160" cy="210" r="108" fill="url(#bb-shine)" />

      {/* Crown — the star-shaped calyx at top of blueberry */}
      <g transform="translate(160, 106)">
        <path d="M0,-12 L-3,-4 L-10,-4 L-4,0 L-6,8 L0,4 L6,8 L4,0 L10,-4 L3,-4Z"
          fill="#312E81" opacity="0.7" />
      </g>

      {/* Stem on back-left */}
      <path d="M80 207 Q79 198 80 192" stroke="#312E81" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* Crown back-right */}
      <g transform="translate(246, 190)">
        <path d="M0,-10 L-2.5,-3.5 L-8,-3.5 L-3.5,0 L-5,7 L0,3.5 L5,7 L3.5,0 L8,-3.5 L2.5,-3.5Z"
          fill="#3B0764" opacity="0.6" />
      </g>
    </svg>
  );
}
