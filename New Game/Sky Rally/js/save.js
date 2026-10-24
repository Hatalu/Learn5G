// Progress storage: IndexedDB (schema-versioned) -> localStorage -> memory fallback.
// Records: progress[key] = { key, stars, bestRank, bestTime, plays, correct, total, level, updated }
const DB_NAME = 'sky-rally';
const SCHEMA = 1;
const LS_KEY = 'sky-rally-save';

const migrations = {
  // 1: initial stores
  1(db) {
    if (!db.objectStoreNames.contains('progress')) db.createObjectStore('progress', { keyPath: 'key' });
    if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
  },
};

function openIDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB_NAME, SCHEMA);
    req.onupgradeneeded = (e) => { for (let v = e.oldVersion + 1; v <= SCHEMA; v++) migrations[v](req.result); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  });
}

const valid = (r) => r && typeof r.key === 'string' && Number.isFinite(r.stars ?? 0);

class Store {
  constructor() { this.kind = 'memory'; this.mem = { progress: {}, settings: {} }; }

  async init() {
    try {
      this.db = await openIDB();
      this.kind = 'indexeddb';
      return this;
    } catch { /* fall through */ }
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.schema === SCHEMA) this.mem = { progress: data.progress || {}, settings: data.settings || {} };
      }
      localStorage.setItem('__t', '1'); localStorage.removeItem('__t');
      this.kind = 'localstorage';
    } catch { this.kind = 'memory'; this.mem = { progress: {}, settings: {} }; } // corrupt or blocked: start clean
    return this;
  }

  tx(store, mode, fn) {
    return new Promise((resolve, reject) => {
      const t = this.db.transaction(store, mode);
      const req = fn(t.objectStore(store));
      t.oncomplete = () => resolve(req?.result);
      t.onerror = () => reject(t.error);
    });
  }
  persistLS() {
    if (this.kind !== 'localstorage') return;
    try { localStorage.setItem(LS_KEY, JSON.stringify({ schema: SCHEMA, ...this.mem })); } catch { /* quota: keep in memory */ }
  }

  async get(store, key) {
    try {
      if (this.kind === 'indexeddb') return (await this.tx(store, 'readonly', (s) => s.get(key))) || null;
    } catch { /* fall back */ }
    return this.mem[store][key] || null;
  }
  async put(store, rec) {
    this.mem[store][rec.key] = rec;
    try {
      if (this.kind === 'indexeddb') return await this.tx(store, 'readwrite', (s) => s.put(rec));
    } catch { /* keep memory copy */ }
    this.persistLS();
  }
  async all(store) {
    try {
      if (this.kind === 'indexeddb') return ((await this.tx(store, 'readonly', (s) => s.getAll())) || []).filter(valid);
    } catch { /* fall back */ }
    return Object.values(this.mem[store]);
  }

  async setting(key, def) { const r = await this.get('settings', key); return r ? r.value : def; }
  async setSetting(key, value) { return this.put('settings', { key, value }); }

  // Merge one finished race into the topic record (keeps best results).
  async recordRace(key, res) {
    const old = (await this.get('progress', key)) || { key, stars: 0, bestRank: 99, bestTime: 0, plays: 0, correct: 0, total: 0, level: 1 };
    const rec = {
      ...old,
      stars: Math.max(old.stars, res.stars),
      bestRank: Math.min(old.bestRank, res.rank),
      bestTime: old.bestTime ? Math.min(old.bestTime, res.time) : res.time,
      plays: old.plays + 1,
      correct: old.correct + res.correct,
      total: old.total + res.total,
      level: res.level,
      updated: Date.now(),
    };
    await this.put('progress', rec);
    return rec;
  }
}

export const store = new Store();
export const progressKey = (subject, grade, topic) => `${subject}|${grade}|${topic}`;
