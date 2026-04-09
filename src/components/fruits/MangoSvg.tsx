export default function MangoSvg() {
  return (
    <svg
      viewBox="0 0 320 360"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", maxHeight: "100%" }}
    >
      <defs>
        <radialGradient id="mg-body" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="80%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <radialGradient id="mg-blush" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#FB923C" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mg-shine" cx="30%" cy="28%" r="45%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="163" cy="346" rx="78" ry="11" fill="#92400E" opacity="0.14" />

      {/* Body — kidney/oval mango shape, slightly asymmetric */}
      <path
        d="M163 42
           C110 42, 64 88, 58 158
           C52 220, 78 280, 116 318
           C136 336, 152 342, 163 342
           C174 342, 192 334, 210 314
           C246 274, 268 216, 264 154
           C260 86, 216 42, 163 42Z"
        fill="url(#mg-body)"
      />

      {/* Red-orange blush near stem end */}
      <ellipse
        cx="163"
        cy="100"
        rx="70"
        ry="62"
        fill="url(#mg-blush)"
      />

      {/* Green tinge near tip */}
      <ellipse
        cx="155"
        cy="320"
        rx="38"
        ry="24"
        fill="#84CC16"
        opacity="0.25"
      />

      {/* Shine */}
      <path
        d="M163 42
           C110 42, 64 88, 58 158
           C52 220, 78 280, 116 318
           C136 336, 152 342, 163 342
           C174 342, 192 334, 210 314
           C246 274, 268 216, 264 154
           C260 86, 216 42, 163 42Z"
        fill="url(#mg-shine)"
      />

      {/* Stem */}
      <path
        d="M163 42 Q165 24 162 12"
        stroke="#92400E"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Stem nub */}
      <circle cx="163" cy="42" r="6" fill="#A16207" />

      {/* Small leaf */}
      <path
        d="M163 28 Q182 14 196 20 Q184 30 166 30Z"
        fill="#65A30D"
      />
      <path
        d="M163 28 Q182 20 196 20"
        stroke="#4D7C0F"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
