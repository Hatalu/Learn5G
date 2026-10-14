/* ═══════════════════════════════════════════════════════════
   TANG TANG DATA FAIR — Login (Supabase project: learn5G)
   - ชื่อผู้ใช้ + รหัสผ่าน → อีเมลภายใน <username>@internal.mediahub.local
   - role 'dev'   : เข้าได้ไม่จำกัด
   - role 'member': ต้องมี premium_until ที่ยังไม่หมดอายุ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const TT = window.TT;
  const { art, ui, audio } = TT;
  const $ = s => document.querySelector(s);

  const CFG = {
    url: 'https://hkellxwbpmsrblhnkfmu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZWxseHdicG1zcmJsaG5rZm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5OTczNDksImV4cCI6MjEwNjU3MzM0OX0.Me2H5hyAqe3vH_MvZvklroy7LSYjRNiZ612d2eJGnxE',
    domain: '@internal.mediahub.local'
  };

  let sb = null, profile = null;
  function client() {
    if (!sb && window.supabase && window.supabase.createClient) sb = window.supabase.createClient(CFG.url, CFG.anonKey);
    return sb;
  }
  const thaiDate = s => { const d = new Date(s); return isNaN(d) ? '-' : d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }); };

  function check(p) {
    if (!p) return 'ไม่พบข้อมูลผู้ใช้ในระบบ';
    if (p.role === 'dev') return null;
    const until = p.premium_until;
    if (!until || String(until).trim() === '-' || until === 'null') return 'บัญชีนี้ยังไม่มีสิทธิ์ใช้งาน\nติดต่อครูหรือเพจเพื่อเปิดสิทธิ์นะ';
    const t = new Date(until).getTime();
    if (isNaN(t)) return 'ข้อมูลวันหมดอายุไม่ถูกต้อง ติดต่อผู้ดูแลระบบนะ';
    if (t < Date.now()) return 'สิทธิ์ใช้งานหมดอายุแล้ว (' + thaiDate(until) + ')\nต่ออายุเพื่อเล่นต่อนะ';
    return null;
  }
  function alertMsg(text, kind) {
    const a = $('#lgAlert');
    if (!text) { a.classList.add('hidden'); return; }
    a.className = 'lg-alert ' + (kind || 'bad');
    a.innerHTML = (kind === 'info' ? art.icon('check') : art.icon('cross')) + '<span>' + ui.esc(text).replace(/\n/g, '<br>') + '</span>';
    ui.shake(a);
  }
  function busy(on) {
    ['#lgUser', '#lgPass', '#lgGo'].forEach(s => { $(s).disabled = on; });
    $('#lgGo span').textContent = on ? 'กำลังตรวจสอบ...' : 'เข้างานวันข้อมูล';
    $('#lgGo').classList.toggle('loading', on);
  }
  function clearFields() {
    let typed = false;
    const mark = () => { typed = true; };
    $('#lgUser').addEventListener('keydown', mark, { once: true });
    $('#lgPass').addEventListener('keydown', mark, { once: true });
    [0, 300, 900, 1800].forEach(ms => setTimeout(() => {
      if (typed && ms) return;
      $('#lgUser').value = ''; $('#lgPass').value = '';
    }, ms));
  }
  function showGate() {
    clearFields();
    $('#ovLogin').classList.remove('hidden');
    $('#userBadge').classList.add('hidden');
    setTimeout(() => $('#lgUser').focus(), 150);
  }
  function grant(p) {
    profile = p;
    $('#ovLogin').classList.add('hidden');
    $('#ubName').textContent = p.username || 'ผู้ช่วย';
    $('#ubRole').textContent = p.role === 'dev' ? 'ผู้พัฒนา' : 'ถึง ' + thaiDate(p.premium_until);
    $('#userBadge').classList.remove('hidden');
    document.body.classList.add('authed');
  }
  async function loadProfile(uid) {
    const r = await client().from('profiles').select('*').eq('id', uid).single();
    return r.error ? null : r.data;
  }
  async function login(e) {
    e.preventDefault();
    audio.unlock();
    const user = $('#lgUser').value.trim(), pass = $('#lgPass').value;
    if (!user) { alertMsg('ใส่ชื่อผู้ใช้งานก่อนนะ'); return; }
    if (!pass) { alertMsg('ใส่รหัสผ่านก่อนนะ'); return; }
    if (!client()) { alertMsg('เชื่อมต่อระบบไม่ได้ ลองรีเฟรชหน้าเว็บนะ'); return; }
    alertMsg(null); busy(true);
    try {
      const { data, error } = await client().auth.signInWithPassword({ email: user.toLowerCase() + CFG.domain, password: pass });
      if (error || !data.user) {
        alertMsg(error && /Invalid login/i.test(error.message) ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง ลองใหม่นะ' : 'เข้าสู่ระบบไม่สำเร็จ: ' + (error ? error.message : ''));
        audio.sfx('gentle'); busy(false); return;
      }
      const p = await loadProfile(data.user.id);
      const why = check(p);
      if (why) { await client().auth.signOut(); alertMsg(why); audio.sfx('gentle'); busy(false); return; }
      busy(false);
      audio.sfx('unlock');
      ui.sparkle($('#lgCard'), 18);
      grant(p);
    } catch (err) {
      alertMsg('อินเทอร์เน็ตมีปัญหา ลองใหม่อีกครั้งนะ');
      busy(false);
    }
  }
  async function logout() {
    try { if (client()) await client().auth.signOut(); } catch (e) {}
    profile = null;
    document.body.classList.remove('authed');
    location.reload();
  }

  async function init() {
    /* ทดลองเล่นจากเว็บหลัก: โทเคนที่เซิร์ฟเวอร์เซ็นไว้ ไม่ต้องล็อกอิน (เกมล็อกเองเมื่อหมดเวลา) */
    try {
      const trial = window.L5GTrial ? await window.L5GTrial.check() : null;
      if (trial) { grant({ username: 'ผู้ทดลองเล่น', role: 'trial', premium_until: null }); window.L5GTrial.begin(trial); return; }
    } catch (e) { /* ใช้ขั้นตอนล็อกอินปกติ */ }
    $('#lgMascot').innerHTML = art.tang('happy');
    $('#lgEye').innerHTML = art.icon('eye');
    $('#lgIcU').innerHTML = art.icon('user');
    $('#lgIcP').innerHTML = art.icon('key');
    $('#lgForm').addEventListener('submit', login);
    $('#lgEye').addEventListener('click', () => {
      const p = $('#lgPass');
      p.type = p.type === 'password' ? 'text' : 'password';
      $('#lgEye').classList.toggle('on', p.type === 'text');
    });
    $('#lgPass').addEventListener('focus', () => { $('#lgMascot').innerHTML = art.tang('think'); });
    $('#lgPass').addEventListener('blur', () => { $('#lgMascot').innerHTML = art.tang('happy'); });
    $('#ubOut').innerHTML = art.icon('right');
    $('#ubOut').addEventListener('click', () => { if (confirm('ออกจากระบบไหม?')) logout(); });

    /* ทดสอบบนเครื่องผู้พัฒนาเท่านั้น: localhost + ?dev=1 ข้ามหน้าล็อกอิน */
    if (/[?&]dev=1/.test(location.search) && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      grant({ username: 'ทดสอบ', role: 'dev' });
      return;
    }
    if (!client()) { showGate(); alertMsg('เชื่อมต่อระบบไม่ได้ ตรวจอินเทอร์เน็ตแล้วรีเฟรชนะ'); return; }
    try {
      const { data } = await client().auth.getSession();
      if (data.session && data.session.user) {
        const p = await loadProfile(data.session.user.id);
        const why = check(p);
        if (!why) { grant(p); return; }
        await client().auth.signOut();
        showGate(); alertMsg(why);
        return;
      }
    } catch (e) {}
    showGate();
  }

  TT.auth = { profile: () => profile, logout };
  init();
})();
