// Inline SVG icons (no emoji anywhere). 24x24 viewBox, currentColor.
const s = (body, fill = 'currentColor') => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${fill}" stroke="none">${body}</svg>`;
const o = (body, w = 2.4) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICON = {
  star: s('<path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z"/>'),
  gem: s('<path d="M7 3h10l4 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6 3-6M12 9v12" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/>'),
  speed: s('<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>'),
  shield: s('<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/>'),
  wave: o('<circle cx="12" cy="12" r="2.5"/><path d="M6.3 6.3a8 8 0 000 11.4M17.7 6.3a8 8 0 010 11.4M3.5 3.5a12 12 0 000 17M20.5 3.5a12 12 0 010 17"/>'),
  magnet: o('<path d="M5 3v9a7 7 0 0014 0V3M5 3h4v9a3 3 0 006 0V3h4M5 7h4M15 7h4"/>'),
  double: s('<path d="M3 6h5l2.5 4L13 6h5l-5 6 5 6h-5l-2.5-4L8 18H3l5-6z" transform="scale(.75) translate(1 3)"/><text x="16" y="21" font-size="11" font-weight="900" font-family="sans-serif">2</text>'),
  fist: s('<path d="M7 9V6.5a1.5 1.5 0 013 0V9V5.5a1.5 1.5 0 013 0V9V6a1.5 1.5 0 013 0v3.5V8a1.5 1.5 0 013 0v6a7 7 0 01-7 7h-1a6 6 0 01-6-6v-2.5A2.5 2.5 0 017 10z"/>'),
  dash: o('<path d="M3 8h9M2 12h12M4 16h8M16 6l5 6-5 6"/>'),
  clock: o('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>'),
  crown: s('<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>'),
  flag: s('<path d="M5 2h2v20H5zM8 3h11l-3 4 3 4H8z"/>'),
  sound: s('<path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M16 8a5 5 0 010 8M18.5 5.5a8.5 8.5 0 010 13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  mute: s('<path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  back: o('<path d="M15 5l-7 7 7 7"/>'),
  next: o('<path d="M9 5l7 7-7 7"/>'),
  users: s('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5z"/><circle cx="17" cy="7" r="2.6" opacity=".7"/><path d="M15.5 12.6c3.6-.6 6.5 1.6 6.5 5.4h-4.3" opacity=".7"/>'),
  bot: s('<rect x="4" y="7" width="16" height="12" rx="4"/><circle cx="9" cy="13" r="1.7" fill="#fff"/><circle cx="15" cy="13" r="1.7" fill="#fff"/><path d="M12 7V3.5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="3" r="1.6"/>'),
  plus: o('<path d="M12 5v14M5 12h14"/>', 3),
  door: s('<path d="M5 2h11v20H5z" opacity=".35"/><path d="M5 2l9 2v18l-9-2z"/><circle cx="11.5" cy="12.5" r="1" fill="#fff"/>'),
  book: s('<path d="M3 4.5C6 3.5 9 3.8 11.2 5.5V20C9 18.4 6 18 3 19z"/><path d="M21 4.5c-3-1-6-.7-8.2 1V20c2.2-1.6 5.2-2 8.2-1z" opacity=".7"/>'),
  play: s('<path d="M7 4l13 8-13 8z"/>'),
  again: o('<path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4.5h4.5"/>'),
  lock: s('<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7.5a4 4 0 018 0V10" fill="none" stroke="currentColor" stroke-width="2.4"/>'),
  check: o('<path d="M4 12.5l5 5L20 6.5"/>', 3.2),
  cross: o('<path d="M6 6l12 12M18 6L6 18"/>', 3.2),
  bulb: s('<path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/><rect x="8.5" y="18.3" width="7" height="2" rx="1"/><rect x="9.5" y="21" width="5" height="1.6" rx=".8"/>'),
  dice: s('<rect x="3" y="3" width="18" height="18" rx="4"/><g fill="#fff"><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="16" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="16" cy="8" r="1.6"/><circle cx="8" cy="16" r="1.6"/></g>'),
  copy: o('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8"/>'),
  q: s('<circle cx="12" cy="12" r="10"/><path d="M9.2 9.3a2.9 2.9 0 115.4 1.4c-.7 1.1-2.2 1.5-2.6 2.8v.5" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.3" fill="#fff"/>'),
};
export const SKILL_ICON = { speed: ICON.speed, shield: ICON.shield, wave: ICON.wave, magnet: ICON.magnet, double: ICON.double };
export const CAT_ICON = {
  sci: s('<path d="M9 2h6v2h-1v5l6 10a2 2 0 01-1.7 3H5.7A2 2 0 014 19L10 9V4H9z"/><circle cx="10" cy="17" r="1.3" fill="#fff"/><circle cx="14" cy="15" r="1" fill="#fff"/>'),
  animal: s('<ellipse cx="12" cy="15.5" rx="5" ry="4.5"/><circle cx="5" cy="10" r="2.2"/><circle cx="9" cy="6" r="2.2"/><circle cx="15" cy="6" r="2.2"/><circle cx="19" cy="10" r="2.2"/>'),
  geo: s('<circle cx="12" cy="12" r="10"/><path d="M7 6c2 1 2 3 4 3s1 3 3 3 2 3 1 5M16 4c-1 2 1 3 3 3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>'),
  history: s('<path d="M3 9l9-6 9 6z"/><rect x="5" y="10" width="2.4" height="8"/><rect x="10.8" y="10" width="2.4" height="8"/><rect x="16.6" y="10" width="2.4" height="8"/><rect x="3" y="19" width="18" height="2.5" rx="1"/>'),
  life: s('<path d="M12 21s-8-5.1-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.9-8 11-8 11z"/>'),
};
