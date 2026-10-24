// Inline SVG icons (no emoji anywhere in the game).
const s = (body, vb = '0 0 24 24') => `<svg viewBox="${vb}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICON = {
  back: s('<path d="M15 5l-7 7 7 7"/>'),
  left: s('<path d="M14 5l-7 7 7 7"/><path d="M20 5l-7 7 7 7" opacity=".45"/>'),
  right: s('<path d="M10 5l7 7-7 7"/><path d="M4 5l7 7-7 7" opacity=".45"/>'),
  brake: s('<rect x="5" y="9" width="14" height="8" rx="3"/><path d="M8 9V7m8 2V7"/>'),
  pause: s('<path d="M9 5v14M15 5v14"/>'),
  play: s('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
  soundOn: s('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12"/>'),
  soundOff: s('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6m0-6l-5 6"/>'),
  speak: s('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 010 6"/>'),
  check: s('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  cross: s('<path d="M6 6l12 12M18 6L6 18"/>'),
  replay: s('<path d="M4 12a8 8 0 108-8H8"/><path d="M10 1L7 4l3 3"/>'),
  home: s('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>'),
  book: s('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5M8 7h7"/>'),
  flag: s('<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5" fill="currentColor"/>'),
  next: s('<path d="M9 5l7 7-7 7"/>'),
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" fill="currentColor" stroke="#7a4a00" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  coin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffd23f" stroke="#c77a00" stroke-width="2"/><path d="M12 6.5l1.7 3.4 3.8.5-2.8 2.6.7 3.7L12 15l-3.4 1.7.7-3.7-2.8-2.6 3.8-.5z" fill="#fff6c2"/></svg>',
  trophy: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 8h28v14a14 14 0 01-28 0z" fill="#ffd23f" stroke="#a86a00" stroke-width="3"/><path d="M18 12H8a10 10 0 0010 12M46 12h10a10 10 0 01-10 12" fill="none" stroke="#a86a00" stroke-width="3"/><path d="M28 36h8v10h-8z" fill="#ffb02e"/><rect x="18" y="46" width="28" height="9" rx="3" fill="#8f6bff"/><path d="M26 14l3 6 6 1-5 4 1 6-5-3" fill="#fff3b0"/></svg>',
  wrench: s('<path d="M14.5 5.5a4 4 0 00-5 5L4 16l4 4 5.5-5.5a4 4 0 005-5l-2.5 2.5-2.5-.5-.5-2.5z"/>'),
  // Items (filled, colorful)
  turbo: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4c8 6 10 16 6 26h-12C14 20 16 10 24 4z" fill="#eef4ff" stroke="#2b1b4a" stroke-width="3"/><circle cx="24" cy="17" r="4" fill="#3fd0ff" stroke="#2b1b4a" stroke-width="2.5"/><path d="M18 30l-6 6 2-10M30 30l6 6-2-10" fill="#ff5fa8" stroke="#2b1b4a" stroke-width="3" stroke-linejoin="round"/><path d="M19 32q5 14 10 0z" fill="#ffc93c" stroke="#2b1b4a" stroke-width="2.5"/></svg>',
  shield: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="#8ff4ff" fill-opacity=".55" stroke="#2b1b4a" stroke-width="3"/><path d="M15 17q4-6 10-6" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="31" cy="31" r="3" fill="#fff"/></svg>',
  orb: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 30q8 2 12-4M6 22q8 0 12-2" stroke="#ff8af0" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="29" cy="24" r="13" fill="#ff8af0" stroke="#2b1b4a" stroke-width="3"/><path d="M29 15l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="#fff"/></svg>',
  jelly: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 36q0-24 18-24t18 24z" fill="#a6ff5f" stroke="#2b1b4a" stroke-width="3" stroke-linejoin="round"/><path d="M14 26q2-6 8-8" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="19" cy="30" r="2.5" fill="#2b1b4a"/><circle cx="29" cy="30" r="2.5" fill="#2b1b4a"/><path d="M4 38h40" stroke="#2b1b4a" stroke-width="3" stroke-linecap="round"/></svg>',
  cloud: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 30a7 7 0 010-14 10 10 0 0119-3 8 8 0 015 17z" fill="#b8b2dd" stroke="#2b1b4a" stroke-width="3" stroke-linejoin="round"/><path d="M16 36l-2 6M24 36l-2 6M32 36l-2 6" stroke="#3fd0ff" stroke-width="3.5" stroke-linecap="round"/></svg>',
  magnet: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 8h9v16a5 5 0 0010 0V8h9v16a14 14 0 01-28 0z" fill="#ff5f6f" stroke="#2b1b4a" stroke-width="3" stroke-linejoin="round"/><path d="M10 8h9v7h-9zM29 8h9v7h-9z" fill="#eef0ff" stroke="#2b1b4a" stroke-width="3"/><path d="M40 34l4 2M38 40l3 4" stroke="#ffc93c" stroke-width="3" stroke-linecap="round"/></svg>',
  // Subject badges
  math: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="16" fill="#fff" opacity=".25"/><path d="M20 22h12M26 16v12M36 22h10M20 42l10 10M30 42L20 52M36 44h10M36 50h10" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>',
  science: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M26 8h12M28 8v16L14 48a6 6 0 005 9h26a6 6 0 005-9L36 24V8" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M19 42h26l4 8a3 3 0 01-3 4H18a3 3 0 01-3-4z" fill="#fff"/><circle cx="28" cy="47" r="2.5" fill="#2fc28b"/><circle cx="37" cy="50" r="2" fill="#2fc28b"/></svg>',
  english: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 12h44a4 4 0 014 4v24a4 4 0 01-4 4H28l-12 10v-10h-6a4 4 0 01-4-4V16a4 4 0 014-4z" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><text x="32" y="35" text-anchor="middle" font-family="Mitr, sans-serif" font-weight="700" font-size="17" fill="#fff">ABC</text></svg>',
};

export function starsHTML(n, max = 3, cls = '') {
  return `<span class="stars ${cls}">${Array.from({ length: max }, (_, i) => `<span class="st ${i < n ? 'on' : ''}">${ICON.star}</span>`).join('')}</span>`;
}
