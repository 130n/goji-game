// Inline SVG sprites — chibi kaiju style, facing right

function monsterSvg(body) {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150">${body}</svg>`
    )}`;
}

function bgSvg(body) {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768">${body}</svg>`
    )}`;
}

// ── Godzilla ─ upright reptile, dorsal plates, thick tail ──
export const SPRITE_GODZILLA = monsterSvg(`
  <path d="M50,28 C62,18 78,24 80,36 L82,44 C80,52 78,58 80,66 L76,66 C80,85 74,105 72,115
    L76,130 C76,140 72,148 64,148 L58,148 C56,142 56,134 58,128 L56,118
    L52,128 C52,138 48,148 40,148 L34,148 C32,142 34,134 36,128
    L42,108 C36,95 32,82 34,68 L28,62 C30,50 36,38 44,30 Z" fill="#4488ff"/>
  <polygon points="40,32 30,16 44,38" fill="#66bbff"/>
  <polygon points="36,50 24,36 38,55" fill="#66bbff"/>
  <polygon points="34,68 22,55 36,73" fill="#66bbff"/>
  <path d="M36,105 C22,108 10,98 6,86 C4,78 10,72 16,72" fill="#3a7aee" stroke="#2a5acc" stroke-width="1.5"/>
  <path d="M80,62 L96,56 L92,62 L80,66" fill="#3a7aee"/>
  <ellipse cx="74" cy="32" rx="6" ry="5" fill="white"/>
  <circle cx="76" cy="32" r="3" fill="#111"/>
  <circle cx="77" cy="31" r="1" fill="white"/>
  <path d="M82,40 L94,38 L92,44 L82,44" fill="#2a5acc"/>
  <path d="M84,40 L86,43 M88,39 L89,43" stroke="white" stroke-width="1"/>
`);

// ── King Kong ─ massive ape, long arms, broad chest ──
export const SPRITE_KINGKONG = monsterSvg(`
  <ellipse cx="58" cy="65" rx="30" ry="35" fill="#4488ff"/>
  <circle cx="58" cy="32" r="22" fill="#4488ff"/>
  <path d="M38,32 L30,26 L34,22 L38,28" fill="#4488ff"/>
  <path d="M78,32 L86,26 L82,22 L78,28" fill="#4488ff"/>
  <ellipse cx="58" cy="72" rx="18" ry="20" fill="#5599ff"/>
  <path d="M30,60 C18,70 14,90 16,110 L26,115 L28,105 C28,85 30,75 36,65" fill="#3a7aee"/>
  <path d="M86,60 C98,70 102,90 100,110 L90,115 L88,105 C88,85 86,75 80,65" fill="#3a7aee"/>
  <rect x="42" y="100" width="14" height="38" rx="6" fill="#3a7aee"/>
  <rect x="62" y="100" width="14" height="38" rx="6" fill="#3a7aee"/>
  <ellipse cx="45" cy="148" rx="10" ry="4" fill="#2a5acc"/>
  <ellipse cx="72" cy="148" rx="10" ry="4" fill="#2a5acc"/>
  <circle cx="48" cy="30" r="5" fill="white"/>
  <circle cx="68" cy="30" r="5" fill="white"/>
  <circle cx="50" cy="30" r="2.5" fill="#111"/>
  <circle cx="70" cy="30" r="2.5" fill="#111"/>
  <path d="M50,42 Q58,50 66,42" fill="#2a5acc"/>
  <path d="M52,42 L54,46 M56,42 L57,47 M60,42 L61,47 M64,42 L63,46" stroke="white" stroke-width="0.8"/>
`);

// ── Gamera ─ round turtle shell, stubby limbs, tusks ──
export const SPRITE_GAMERA = monsterSvg(`
  <ellipse cx="58" cy="80" rx="42" ry="38" fill="#338833"/>
  <ellipse cx="58" cy="82" rx="36" ry="30" fill="#44aa44"/>
  <path d="M30,65 L22,60 L26,56 M86,65 L94,60 L90,56" stroke="#338833" stroke-width="3" fill="none"/>
  <circle cx="58" cy="42" r="18" fill="#44aa44"/>
  <polygon points="48,28 44,18 50,30" fill="#66cc66"/>
  <polygon points="68,28 72,18 66,30" fill="#66cc66"/>
  <circle cx="50" cy="38" r="5" fill="white"/>
  <circle cx="66" cy="38" r="5" fill="white"/>
  <circle cx="52" cy="38" r="2.5" fill="#111"/>
  <circle cx="68" cy="38" r="2.5" fill="#111"/>
  <path d="M52,50 L50,56 M64,50 L66,56" stroke="white" stroke-width="1.5"/>
  <path d="M20,85 L8,90 L10,98 L22,95" fill="#338833"/>
  <path d="M96,85 L108,90 L106,98 L94,95" fill="#338833"/>
  <rect x="38" y="115" width="14" height="28" rx="6" fill="#338833"/>
  <rect x="66" y="115" width="14" height="28" rx="6" fill="#338833"/>
  <path d="M32,70 Q58,55 84,70" fill="none" stroke="#228822" stroke-width="2"/>
  <path d="M36,82 Q58,70 80,82" fill="none" stroke="#228822" stroke-width="1.5"/>
`);

// ── Hedorah ─ amorphous smog blob, dripping, red eyes ──
export const SPRITE_HEDORAH = monsterSvg(`
  <path d="M20,50 C10,40 15,25 30,20 C40,16 50,18 55,15 C65,12 80,16 90,28
    C100,40 105,55 100,70 C98,80 102,90 98,105 C95,115 90,125 85,135
    C80,142 70,148 55,148 C40,148 30,142 25,130 C18,118 15,105 18,90
    C20,78 16,65 20,50 Z" fill="#44aa44"/>
  <path d="M25,130 C22,138 28,148 20,148 C15,148 12,140 18,130" fill="#44aa44" opacity="0.8"/>
  <path d="M85,135 C88,142 82,148 90,148 C95,145 92,138 88,132" fill="#44aa44" opacity="0.8"/>
  <path d="M45,148 C42,148 40,142 44,148" fill="#44aa44" opacity="0.6"/>
  <ellipse cx="60" cy="82" rx="22" ry="18" fill="#338833" opacity="0.5"/>
  <circle cx="42" cy="48" r="10" fill="#881111"/>
  <circle cx="42" cy="48" r="6" fill="#ff2222"/>
  <circle cx="44" cy="46" r="2" fill="#ffaa00"/>
  <circle cx="78" cy="45" r="8" fill="#881111"/>
  <circle cx="78" cy="45" r="5" fill="#ff2222"/>
  <circle cx="80" cy="43" r="1.5" fill="#ffaa00"/>
  <circle cx="55" cy="70" r="5" fill="#881111" opacity="0.6"/>
  <circle cx="55" cy="70" r="3" fill="#ff2222" opacity="0.6"/>
  <path d="M30,60 Q25,75 30,85 M90,55 Q95,70 88,82 M50,100 Q48,115 52,125"
    stroke="#228822" stroke-width="2" fill="none" opacity="0.5"/>
`);

// ── Rodan ─ wide pteranodon wings, pointed beak ──
export const SPRITE_RODAN = monsterSvg(`
  <path d="M55,55 L2,30 L15,50 L30,55 Z" fill="#ee9500"/>
  <path d="M65,55 L118,25 L105,48 L90,55 Z" fill="#ee9500"/>
  <path d="M55,55 L5,45 L18,55" fill="#cc7700" opacity="0.6"/>
  <path d="M65,55 L115,40 L102,55" fill="#cc7700" opacity="0.6"/>
  <ellipse cx="60" cy="72" rx="20" ry="22" fill="#ffaa22"/>
  <path d="M60,52 C65,42 75,38 82,42 L80,48 C75,45 68,48 65,55" fill="#ffaa22"/>
  <path d="M82,42 L95,36 L88,44 L82,44" fill="#cc7700"/>
  <ellipse cx="76" cy="44" rx="4" ry="3.5" fill="white"/>
  <circle cx="77" cy="44" r="2" fill="#111"/>
  <path d="M45,90 L38,120 L42,118 L48,95" fill="#cc7700"/>
  <path d="M75,90 L82,120 L78,118 L72,95" fill="#cc7700"/>
  <path d="M40,120 L32,130 L38,128" fill="#ee9500"/>
  <path d="M80,120 L88,130 L82,128" fill="#ee9500"/>
  <path d="M38,122 L30,128 M42,118 L34,126" stroke="#cc7700" stroke-width="1.5"/>
  <path d="M78,122 L86,128 M82,118 L90,126" stroke="#cc7700" stroke-width="1.5"/>
`);

// ── Mothra ─ large butterfly wings, tiny body, antennae ──
export const SPRITE_MOTHRA = monsterSvg(`
  <ellipse cx="60" cy="80" rx="6" ry="20" fill="#cc8800"/>
  <circle cx="60" cy="55" r="10" fill="#ffaa22"/>
  <path d="M52,50 L40,15 L44,18" stroke="#ffcc66" stroke-width="1.5" fill="none"/>
  <path d="M68,50 L80,15 L76,18" stroke="#ffcc66" stroke-width="1.5" fill="none"/>
  <circle cx="40" cy="14" r="3" fill="#ffcc66"/>
  <circle cx="80" cy="14" r="3" fill="#ffcc66"/>
  <path d="M54,58 C30,35 5,40 2,60 C0,75 10,95 40,90 C48,88 52,82 54,75" fill="#ffaa22"/>
  <path d="M66,58 C90,35 115,40 118,60 C120,75 110,95 80,90 C72,88 68,82 66,75" fill="#ffaa22"/>
  <ellipse cx="28" cy="62" rx="12" ry="10" fill="#ffcc66" opacity="0.6"/>
  <ellipse cx="92" cy="62" rx="12" ry="10" fill="#ffcc66" opacity="0.6"/>
  <ellipse cx="20" cy="78" rx="8" ry="6" fill="#ff6622" opacity="0.5"/>
  <ellipse cx="100" cy="78" rx="8" ry="6" fill="#ff6622" opacity="0.5"/>
  <circle cx="54" cy="52" r="4" fill="white"/>
  <circle cx="66" cy="52" r="4" fill="white"/>
  <circle cx="56" cy="52" r="2" fill="#111"/>
  <circle cx="68" cy="52" r="2" fill="#111"/>
  <path d="M60,100 L55,130 M60,100 L65,130 M60,100 L60,135" stroke="#cc8800" stroke-width="1.5" fill="none"/>
`);

// ── Anguirus ─ low armored quadruped, back spikes ──
export const SPRITE_ANGUIRUS = monsterSvg(`
  <path d="M20,82 C15,72 20,62 35,58 L85,55 C100,55 108,65 105,78
    L102,90 C100,100 95,108 85,112 L35,115 C22,115 15,105 15,95 Z" fill="#ffaa22"/>
  <polygon points="35,58 30,38 40,56" fill="#ffcc44"/>
  <polygon points="48,56 44,32 52,54" fill="#ffcc44"/>
  <polygon points="60,55 58,28 64,53" fill="#ffcc44"/>
  <polygon points="72,55 70,34 76,54" fill="#ffcc44"/>
  <polygon points="84,56 82,40 88,55" fill="#ffcc44"/>
  <path d="M105,76 L115,70 L112,78 L105,80" fill="#cc8800"/>
  <circle cx="108" cy="72" r="4" fill="white"/>
  <circle cx="110" cy="72" r="2" fill="#111"/>
  <rect x="18" y="110" width="12" height="30" rx="5" fill="#cc8800"/>
  <rect x="38" y="112" width="12" height="30" rx="5" fill="#cc8800"/>
  <rect x="65" y="110" width="12" height="30" rx="5" fill="#cc8800"/>
  <rect x="88" y="108" width="12" height="30" rx="5" fill="#cc8800"/>
  <path d="M25,80 Q60,72 100,80" fill="none" stroke="#cc8800" stroke-width="1.5" opacity="0.5"/>
  <ellipse cx="60" cy="85" rx="30" ry="12" fill="#ee9900" opacity="0.3"/>
`);

// ── King Ghidorah ─ three heads on long necks, wings ──
export const SPRITE_GHIDORAH = monsterSvg(`
  <ellipse cx="60" cy="95" rx="22" ry="28" fill="#ff4444"/>
  <path d="M42,80 L5,25 L20,40 L35,75" fill="#ee2222"/>
  <path d="M78,80 L115,25 L100,40 L85,75" fill="#ee2222"/>
  <path d="M48,70 C42,50 30,30 22,18 L28,16 C35,25 45,45 50,65" fill="#ff4444"/>
  <path d="M72,70 C78,50 90,30 98,18 L92,16 C85,25 75,45 70,65" fill="#ff4444"/>
  <path d="M57,68 C56,48 55,28 55,12 L65,12 C65,28 64,48 63,68" fill="#ff4444"/>
  <circle cx="22" cy="16" r="8" fill="#ff4444"/>
  <circle cx="98" cy="16" r="8" fill="#ff4444"/>
  <ellipse cx="60" cy="10" rx="9" ry="8" fill="#ff4444"/>
  <circle cx="25" cy="14" r="2.5" fill="#ffff44"/>
  <circle cx="19" cy="14" r="2.5" fill="#ffff44"/>
  <circle cx="101" cy="14" r="2.5" fill="#ffff44"/>
  <circle cx="95" cy="14" r="2.5" fill="#ffff44"/>
  <circle cx="63" cy="8" r="2.5" fill="#ffff44"/>
  <circle cx="57" cy="8" r="2.5" fill="#ffff44"/>
  <rect x="44" y="118" width="12" height="26" rx="5" fill="#cc2222"/>
  <rect x="64" y="118" width="12" height="26" rx="5" fill="#cc2222"/>
  <path d="M45,120 C35,130 25,142 20,148" stroke="#cc2222" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M75,120 C85,130 95,142 100,148" stroke="#cc2222" stroke-width="4" fill="none" stroke-linecap="round"/>
`);

// ── Mecha Godzilla ─ angular robot, visor, mechanical ──
export const SPRITE_MECHAG = monsterSvg(`
  <path d="M48,25 L72,25 L76,35 L78,50 L82,55 L78,65 L80,80 L76,100
    L82,115 L78,130 L74,145 L64,148 L60,135 L56,148 L46,148 L42,130
    L38,115 L44,100 L40,80 L42,65 L38,55 L42,50 L44,35 Z" fill="#9933ee"/>
  <rect x="46" y="28" rx="2" width="28" height="10" fill="#bb66ff"/>
  <rect x="50" y="30" rx="1" width="20" height="6" fill="#ff2244"/>
  <rect x="44" y="50" width="32" height="4" fill="#bb66ff" opacity="0.6"/>
  <rect x="44" y="70" width="32" height="3" fill="#bb66ff" opacity="0.6"/>
  <rect x="44" y="90" width="32" height="3" fill="#bb66ff" opacity="0.6"/>
  <path d="M82,55 L100,48 L98,55 L95,58 L82,60" fill="#7722bb"/>
  <path d="M38,58 L20,52 L22,58 L25,62 L38,62" fill="#7722bb"/>
  <rect x="74" y="130" width="6" height="12" rx="2" fill="#7722bb"/>
  <rect x="40" y="132" width="6" height="12" rx="2" fill="#7722bb"/>
  <circle cx="52" cy="33" r="1.5" fill="#ffff66"/>
  <circle cx="56" cy="33" r="1.5" fill="#ffff66"/>
  <circle cx="60" cy="33" r="1.5" fill="#ffff66"/>
  <circle cx="64" cy="33" r="1.5" fill="#ffff66"/>
  <circle cx="68" cy="33" r="1.5" fill="#ffff66"/>
  <path d="M48,25 L55,18 L65,18 L72,25" fill="#bb66ff"/>
  <line x1="60" y1="18" x2="60" y2="12" stroke="#ff2244" stroke-width="2"/>
  <polygon points="60,12 56,8 60,2 64,8" fill="#ff2244"/>
`);

// ── Monster sprite lookup ──
export const MONSTER_SPRITES = {
    godzilla: SPRITE_GODZILLA,
    kingkong: SPRITE_KINGKONG,
    gamera: SPRITE_GAMERA,
    hedorah: SPRITE_HEDORAH,
    rodan: SPRITE_RODAN,
    mothra: SPRITE_MOTHRA,
    anguirus: SPRITE_ANGUIRUS,
    ghidorah: SPRITE_GHIDORAH,
    mechagodzilla: SPRITE_MECHAG,
};

// ── Shared SVG fragments ──
const SKY_DEFS = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4488cc"/>
      <stop offset="50%" stop-color="#77bbee"/>
      <stop offset="100%" stop-color="#aaddff"/>
    </linearGradient>
    <linearGradient id="fuji" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8899aa"/>
      <stop offset="40%" stop-color="#7788aa"/>
      <stop offset="100%" stop-color="#556688"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#445566"/>
      <stop offset="100%" stop-color="#334455"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="768" fill="url(#sky)"/>`;

const CLOUDS = `
  <ellipse cx="150" cy="80" rx="80" ry="25" fill="white" opacity="0.5"/>
  <ellipse cx="180" cy="75" rx="50" ry="20" fill="white" opacity="0.6"/>
  <ellipse cx="700" cy="120" rx="90" ry="22" fill="white" opacity="0.4"/>
  <ellipse cx="740" cy="115" rx="55" ry="18" fill="white" opacity="0.5"/>
  <ellipse cx="400" cy="60" rx="60" ry="18" fill="white" opacity="0.35"/>
  <ellipse cx="900" cy="70" rx="70" ry="20" fill="white" opacity="0.3"/>`;

const GROUND = `
  <rect x="0" y="440" width="1024" height="328" fill="url(#ground)"/>
  <line x1="0" y1="442" x2="1024" y2="442" stroke="#556677" stroke-width="2"/>
  <line x1="0" y1="480" x2="1024" y2="480" stroke="#4a5a6a" stroke-width="1" opacity="0.4"/>`;

// ── BG_FUJI — Mount Fuji nature scene (no buildings) ──
const BG_FUJI = bgSvg(`
  ${SKY_DEFS}
  ${CLOUDS}

  <!-- Mount Fuji (wider ~135° angle) -->
  <polygon points="200,440 512,140 824,440" fill="url(#fuji)"/>
  <!-- Snow cap -->
  <polygon points="420,260 512,140 604,260 592,266 512,180 432,266" fill="#eef4ff" opacity="0.85"/>
  <polygon points="445,272 512,180 580,272" fill="white" opacity="0.5"/>

  <!-- Distant hills -->
  <path d="M0,440 Q120,400 250,425 Q400,405 512,415 Q650,395 780,425 Q900,405 1024,435 L1024,460 L0,460Z"
    fill="#4a6070"/>

  <!-- Green treeline / hills at base -->
  <path d="M0,430 Q60,410 120,425 Q180,415 240,428 Q300,408 360,425 L360,440 L0,440Z" fill="#2a5533"/>
  <path d="M660,425 Q720,408 780,422 Q840,412 900,428 Q960,415 1024,430 L1024,440 L660,440Z" fill="#2a5533"/>
  <path d="M0,438 Q80,428 160,436 Q240,426 320,438 L320,445 L0,445Z" fill="#1e4428" opacity="0.7"/>
  <path d="M700,436 Q780,426 860,438 Q940,428 1024,436 L1024,445 L700,445Z" fill="#1e4428" opacity="0.7"/>

  <!-- Scattered trees (triangle silhouettes) -->
  <polygon points="80,430 90,405 100,430" fill="#1e4428" opacity="0.6"/>
  <polygon points="140,428 148,408 156,428" fill="#1e4428" opacity="0.5"/>
  <polygon points="220,432 230,410 240,432" fill="#1e4428" opacity="0.6"/>
  <polygon points="790,428 800,406 810,428" fill="#1e4428" opacity="0.6"/>
  <polygon points="870,432 878,414 886,432" fill="#1e4428" opacity="0.5"/>
  <polygon points="950,430 958,412 966,430" fill="#1e4428" opacity="0.6"/>

  ${GROUND}
`);

// ── BG_TOKYO — Tokyo skyline with Tokyo Tower ──
const BG_TOKYO = bgSvg(`
  ${SKY_DEFS}
  ${CLOUDS}

  <!-- Distant hills -->
  <path d="M0,440 Q120,400 250,425 Q400,405 512,415 Q650,395 780,425 Q900,405 1024,435 L1024,460 L0,460Z"
    fill="#4a6070"/>

  <!-- City skyline (back layer) -->
  <rect x="60"  y="370" width="30" height="70" fill="#3a4a5a"/>
  <rect x="100" y="340" width="45" height="100" fill="#354555"/>
  <rect x="155" y="360" width="25" height="80" fill="#3a4a5a"/>
  <rect x="200" y="320" width="35" height="120" fill="#354555"/>
  <rect x="250" y="355" width="50" height="85" fill="#3a4a5a"/>
  <rect x="320" y="370" width="28" height="70" fill="#354555"/>
  <rect x="420" y="335" width="40" height="105" fill="#354555"/>
  <rect x="560" y="350" width="35" height="90" fill="#3a4a5a"/>
  <rect x="680" y="350" width="40" height="90" fill="#3a4a5a"/>
  <rect x="730" y="330" width="30" height="110" fill="#354555"/>
  <rect x="775" y="360" width="50" height="80" fill="#3a4a5a"/>
  <rect x="840" y="345" width="35" height="95" fill="#354555"/>
  <rect x="890" y="370" width="45" height="70" fill="#3a4a5a"/>
  <rect x="950" y="350" width="30" height="90" fill="#354555"/>

  <!-- Tokyo Tower -->
  <polygon points="500,280 512,440 524,440" fill="#cc4444" opacity="0.8"/>
  <polygon points="506,280 512,260 518,280" fill="#ee5555" opacity="0.8"/>
  <line x1="500" y1="340" x2="524" y2="340" stroke="#dd5555" stroke-width="1.5" opacity="0.6"/>
  <line x1="502" y1="370" x2="522" y2="370" stroke="#dd5555" stroke-width="1.5" opacity="0.6"/>
  <line x1="504" y1="400" x2="520" y2="400" stroke="#dd5555" stroke-width="1.5" opacity="0.6"/>
  <circle cx="512" cy="275" r="2" fill="#ff6666" opacity="0.9"/>

  <!-- City skyline (front layer) -->
  <rect x="30"  y="400" width="50" height="40" fill="#2e3e4e"/>
  <rect x="90"  y="385" width="60" height="55" fill="#2e3e4e"/>
  <rect x="160" y="395" width="35" height="45" fill="#2e3e4e"/>
  <rect x="360" y="390" width="55" height="50" fill="#2e3e4e"/>
  <rect x="430" y="405" width="30" height="35" fill="#2e3e4e"/>
  <rect x="570" y="395" width="40" height="45" fill="#2e3e4e"/>
  <rect x="620" y="385" width="50" height="55" fill="#2e3e4e"/>
  <rect x="850" y="400" width="55" height="40" fill="#2e3e4e"/>
  <rect x="920" y="390" width="40" height="50" fill="#2e3e4e"/>

  <!-- Window lights -->
  <rect x="108" y="350" width="3" height="3" fill="#ddeeff" opacity="0.4"/>
  <rect x="118" y="358" width="3" height="3" fill="#ddeeff" opacity="0.3"/>
  <rect x="112" y="370" width="3" height="3" fill="#ddeeff" opacity="0.35"/>
  <rect x="210" y="335" width="3" height="3" fill="#ddeeff" opacity="0.4"/>
  <rect x="218" y="355" width="3" height="3" fill="#ddeeff" opacity="0.3"/>
  <rect x="695" y="360" width="3" height="3" fill="#ddeeff" opacity="0.4"/>
  <rect x="740" y="345" width="3" height="3" fill="#ddeeff" opacity="0.35"/>
  <rect x="855" y="358" width="3" height="3" fill="#ddeeff" opacity="0.4"/>

  ${GROUND}
`);

// ── BG_OSAKA — Osaka castle scene ──
const BG_OSAKA = bgSvg(`
  ${SKY_DEFS}
  ${CLOUDS}

  <!-- Green hills backdrop -->
  <path d="M0,400 Q150,350 300,380 Q450,340 600,370 Q750,350 900,380 Q980,360 1024,390 L1024,440 L0,440Z"
    fill="#2a5533"/>
  <path d="M0,420 Q200,390 400,415 Q600,390 800,415 Q950,400 1024,420 L1024,440 L0,440Z"
    fill="#1e4428" opacity="0.7"/>

  <!-- Osaka Castle — 3-tiered pagoda silhouette -->
  <!-- Base tier (widest) -->
  <rect x="440" y="370" width="144" height="70" fill="#3a4a5a"/>
  <polygon points="425,370 512,355 599,370" fill="#4a5a6a"/>
  <!-- Curved eaves base -->
  <path d="M425,370 Q420,374 415,372 L425,370Z" fill="#3a4a5a"/>
  <path d="M599,370 Q604,374 609,372 L599,370Z" fill="#3a4a5a"/>

  <!-- Middle tier -->
  <rect x="462" y="320" width="100" height="50" fill="#3a4a5a"/>
  <polygon points="448,320 512,305 576,320" fill="#4a5a6a"/>
  <!-- Curved eaves mid -->
  <path d="M448,320 Q443,324 438,322 L448,320Z" fill="#3a4a5a"/>
  <path d="M576,320 Q581,324 586,322 L576,320Z" fill="#3a4a5a"/>

  <!-- Top tier -->
  <rect x="484" y="280" width="56" height="25" fill="#3a4a5a"/>
  <polygon points="475,280 512,265 549,280" fill="#4a5a6a"/>
  <!-- Curved eaves top -->
  <path d="M475,280 Q470,284 466,282 L475,280Z" fill="#3a4a5a"/>
  <path d="M549,280 Q554,284 558,282 L549,280Z" fill="#3a4a5a"/>

  <!-- Castle spire -->
  <line x1="512" y1="265" x2="512" y2="245" stroke="#5a6a7a" stroke-width="2"/>
  <circle cx="512" cy="243" r="3" fill="#ffd700" opacity="0.8"/>

  <!-- Castle windows/details -->
  <rect x="494" y="288" width="8" height="6" fill="#223344" opacity="0.6"/>
  <rect x="522" y="288" width="8" height="6" fill="#223344" opacity="0.6"/>
  <rect x="478" y="330" width="8" height="8" fill="#223344" opacity="0.5"/>
  <rect x="502" y="330" width="8" height="8" fill="#223344" opacity="0.5"/>
  <rect x="526" y="330" width="8" height="8" fill="#223344" opacity="0.5"/>
  <rect x="550" y="330" width="8" height="8" fill="#223344" opacity="0.5"/>

  <!-- Low traditional buildings (wider, shorter) -->
  <rect x="60"  y="400" width="80" height="40" fill="#2e3e4e"/>
  <polygon points="55,400 100,385 145,400" fill="#354555"/>
  <rect x="180" y="405" width="70" height="35" fill="#2e3e4e"/>
  <polygon points="175,405 215,392 255,405" fill="#354555"/>
  <rect x="700" y="400" width="80" height="40" fill="#2e3e4e"/>
  <polygon points="695,400 740,385 785,400" fill="#354555"/>
  <rect x="830" y="405" width="90" height="35" fill="#2e3e4e"/>
  <polygon points="825,405 875,390 925,405" fill="#354555"/>

  <!-- Stone wall base for castle -->
  <path d="M420,440 L420,420 Q460,410 512,408 Q564,410 604,420 L604,440Z" fill="#556677"/>
  <line x1="420" y1="430" x2="604" y2="430" stroke="#667788" stroke-width="1" opacity="0.5"/>

  ${GROUND}
`);

// ── Battle backgrounds array (legacy alias + new array) ──
export const BATTLE_BG = BG_FUJI;
export const BATTLE_BACKGROUNDS = [BG_FUJI, BG_TOKYO, BG_OSAKA];
