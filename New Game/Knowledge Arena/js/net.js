// Room networking over Supabase Realtime Broadcast (public channel, no database tables).
// Minimal Phoenix protocol client (vsn 1.0.0, JSON frames) — the same channel feature the Learn5G
// live rooms use. URL + anon key are the public values already shipped in other Learn5G games.
const SUPABASE_URL = 'https://hkellxwbpmsrblhnkfmu.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZWxseHdicG1zcmJsaG5rZm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5OTczNDksImV4cCI6MjEwNjU3MzM0OX0.Me2H5hyAqe3vH_MvZvklroy7LSYjRNiZ612d2eJGnxE';

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const makeCode = () => Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
export const cleanCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);

// connect(code, onMsg) -> Promise<{ send(event, payload), close() }>
export function connect(code, onMsg, { onClose } = {}) {
  return new Promise((resolve, reject) => {
    let ref = 0, hb = null, joined = false;
    const topic = `realtime:ka-${code}`;
    let ws;
    try {
      ws = new WebSocket(`${SUPABASE_URL.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${ANON_KEY}&vsn=1.0.0`);
    } catch (e) { reject(e); return; }
    const push = (event, payload, t = topic) => {
      if (ws.readyState !== 1) return false;
      ws.send(JSON.stringify({ topic: t, event, payload, ref: String(++ref), join_ref: t === topic ? '1' : undefined }));
      return true;
    };
    const fail = setTimeout(() => { if (!joined) { try { ws.close(); } catch {} reject(new Error('timeout')); } }, 9000);
    ws.onopen = () => {
      push('phx_join', {
        config: { broadcast: { self: false, ack: false }, presence: { key: '', enabled: false }, postgres_changes: [], private: false },
        access_token: ANON_KEY,
      });
      hb = setInterval(() => push('heartbeat', {}, 'phoenix'), 25000);
    };
    ws.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.topic !== topic) return;
      if (m.event === 'phx_reply' && !joined) {
        if (m.payload?.status === 'ok') {
          joined = true; clearTimeout(fail);
          resolve({
            send: (event, payload) => push('broadcast', { type: 'broadcast', event, payload }),
            close: () => { clearInterval(hb); try { ws.close(); } catch {} },
          });
        } else { clearTimeout(fail); reject(new Error(m.payload?.response?.reason || 'join failed')); }
        return;
      }
      if (m.event === 'broadcast' && m.payload) onMsg(m.payload.event, m.payload.payload || {});
    };
    ws.onerror = () => { if (!joined) { clearTimeout(fail); reject(new Error('socket error')); } };
    ws.onclose = () => { clearInterval(hb); if (joined) onClose?.(); };
  });
}
