/**
 * Chrono-Beast - Supabase Authentication & Premium Guard
 * 
 * Secures entry into the Chrono-Beast Tense Evolution Game.
 * Validates user credentials and active Premium status from Supabase.
 */

(function () {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://hkellxwbpmsrblhnkfmu.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZWxseHdicG1zcmJsaG5rZm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5OTczNDksImV4cCI6MjEwNjU3MzM0OX0.Me2H5hyAqe3vH_MvZvklroy7LSYjRNiZ612d2eJGnxE',
    domain: '@internal.mediahub.local'
  };

  let supabaseClient = null;
  let currentUserProfile = null;

  function formatThaiDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '-';
    }
  }

  function getClient() {
    if (!supabaseClient && window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
    }
    return supabaseClient;
  }

  function showAlert(msg, type = 'error') {
    const alertEl = document.getElementById('auth-alert');
    const msgEl = document.getElementById('auth-alert-msg');
    const iconEl = document.getElementById('auth-alert-icon');
    if (!alertEl || !msgEl) return;

    alertEl.className = 'auth-alert ' + (type === 'error' ? 'alert-danger' : 'alert-info');
    iconEl.textContent = type === 'error' ? '🚫' : 'ℹ️';
    msgEl.innerHTML = msg;
    alertEl.style.display = 'flex';

    alertEl.classList.remove('shake');
    void alertEl.offsetWidth;
    alertEl.classList.add('shake');
  }

  function hideAlert() {
    const alertEl = document.getElementById('auth-alert');
    if (alertEl) alertEl.style.display = 'none';
  }

  function setLoading(isLoading) {
    const submitBtn = document.getElementById('auth-submit-btn');
    const spinner = document.getElementById('auth-btn-spinner');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const userInput = document.getElementById('auth-username-input');
    const passInput = document.getElementById('auth-password-input');

    if (submitBtn) submitBtn.disabled = isLoading;
    if (userInput) userInput.disabled = isLoading;
    if (passInput) passInput.disabled = isLoading;

    if (isLoading) {
      if (spinner) spinner.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'กำลังตรวจสอบสิทธิ์...';
    } else {
      if (spinner) spinner.style.display = 'none';
      if (btnText) btnText.textContent = '⚔️ เข้าสู่สำนักฝึกสัตว์วิเศษ';
    }
  }

  function showGateModal() {
    const modal = document.getElementById('auth-gate-modal');
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      setTimeout(() => {
        const uInput = document.getElementById('auth-username-input');
        if (uInput) uInput.focus();
      }, 100);
    }
    const badge = document.getElementById('user-auth-badge');
    if (badge) badge.style.display = 'none';
  }

  function hideGateModal() {
    const modal = document.getElementById('auth-gate-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.classList.add('fade-out');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('fade-out');
      }, 350);
    }
    updateHeaderUserBadge();
  }

  function updateHeaderUserBadge() {
    const badge = document.getElementById('user-auth-badge');
    if (!badge || !currentUserProfile) return;

    const roleEl = document.getElementById('auth-user-role');
    const nameEl = document.getElementById('auth-username');
    const pillEl = document.getElementById('auth-premium-pill');

    if (nameEl) nameEl.textContent = currentUserProfile.username;

    if (currentUserProfile.role === 'dev') {
      if (roleEl) {
        roleEl.textContent = '👑 ผู้พัฒนา';
        roleEl.className = 'auth-user-role role-dev';
      }
      if (pillEl) {
        pillEl.textContent = '✨ สิทธิ์ถาวร (Dev)';
        pillEl.className = 'auth-premium-pill pill-dev';
      }
    } else {
      if (roleEl) {
        roleEl.textContent = '🎓 ผู้ฝึกสัตว์วิเศษ';
        roleEl.className = 'auth-user-role role-member';
      }
      if (pillEl) {
        pillEl.textContent = `⭐ Premium: ถึง ${formatThaiDate(currentUserProfile.premium_until)}`;
        pillEl.className = 'auth-premium-pill pill-active';
      }
    }

    badge.style.display = 'inline-flex';
  }

  function evaluateAccess(profile) {
    if (!profile) {
      return { allowed: false, reason: 'ไม่พบข้อมูลโปรไฟล์ผู้ใช้งานในระบบ' };
    }

    if (profile.role === 'dev') {
      return { allowed: true };
    }

    const premiumUntil = profile.premium_until;

    if (!premiumUntil || premiumUntil.trim?.() === '-' || premiumUntil === 'null') {
      return {
        allowed: false,
        reason: '<strong>บัญชีของคุณยังไม่มีสิทธิ์ Premium (สถานะ: -)</strong><br><small>กรุณาติดต่อครูผู้สอนหรือผู้ดูแลระบบเพื่อเปิดสิทธิ์การเรียนรู้</small>'
      };
    }

    const expiryTime = new Date(premiumUntil).getTime();
    if (isNaN(expiryTime)) {
      return {
        allowed: false,
        reason: '<strong>ข้อมูลวันหมดอายุ Premium ไม่ถูกต้อง</strong><br><small>กรุณาติดต่อผู้ดูแลระบบ</small>'
      };
    }

    const now = Date.now();
    if (expiryTime < now) {
      const expiredDateStr = formatThaiDate(premiumUntil);
      return {
        allowed: false,
        reason: `<strong>สิทธิ์การใช้งาน Premium หมดอายุแล้ว</strong><br><small>หมดอายุเมื่อ ${expiredDateStr} กรุณาต่ออายุเพื่อเข้าใช้งานห้องเรียนนี้</small>`
      };
    }

    return { allowed: true };
  }

  async function performLogin(username, password) {
    const sb = getClient();
    if (!sb) {
      showAlert('ไม่สามารถเชื่อมต่อระบบฐานข้อมูล Supabase ได้ (กรุณารีเฟรชหน้าเว็บ)');
      return;
    }

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      showAlert('กรุณากรอกชื่อผู้ใช้งาน (Username)');
      return;
    }

    if (!password) {
      showAlert('กรุณากรอกรหัสผ่าน (Password)');
      return;
    }

    hideAlert();
    setLoading(true);

    try {
      const internalEmail = `${cleanUsername.toLowerCase()}${SUPABASE_CONFIG.domain}`;
      const { data: authData, error: authError } = await sb.auth.signInWithPassword({
        email: internalEmail,
        password: password
      });

      if (authError) {
        let msg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        if (authError.message.includes('Invalid login credentials')) {
          msg = '❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
        } else if (authError.message.includes('Email not confirmed')) {
          msg = '⚠️ บัญชียังไม่ได้รับการยืนยัน กรุณาติดต่อผู้ดูแลระบบ';
        } else {
          msg = `เกิดข้อผิดพลาด: ${authError.message}`;
        }
        showAlert(msg);
        setLoading(false);
        return;
      }

      const user = authData.user;
      if (!user) {
        showAlert('ไม่พบข้อมูลบัญชีผู้ใช้งาน');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        showAlert('ไม่สามารถดึงข้อมูลสิทธิ์ผู้ใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ');
        await sb.auth.signOut();
        setLoading(false);
        return;
      }

      const accessCheck = evaluateAccess(profile);
      if (!accessCheck.allowed) {
        await sb.auth.signOut();
        currentUserProfile = null;
        showAlert(accessCheck.reason, 'error');
        setLoading(false);
        return;
      }

      currentUserProfile = profile;
      hideAlert();
      setLoading(false);
      hideGateModal();

      if (window.soundFX && typeof window.soundFX.playEvolution === 'function') {
        window.soundFX.playEvolution();
      }

      console.log(`[ChronoBeastAuth] Access GRANTED for: ${profile.username}`);

    } catch (err) {
      console.error('[ChronoBeastAuth] Login exception:', err);
      showAlert('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่');
      setLoading(false);
    }
  }

  async function checkExistingSession() {
    const sb = getClient();
    if (!sb) {
      showGateModal();
      return;
    }

    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session || !session.user) {
        showGateModal();
        return;
      }

      const { data: profile, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        await sb.auth.signOut();
        showGateModal();
        return;
      }

      const accessCheck = evaluateAccess(profile);
      if (!accessCheck.allowed) {
        await sb.auth.signOut();
        currentUserProfile = null;
        showGateModal();
        showAlert(accessCheck.reason, 'error');
        return;
      }

      currentUserProfile = profile;
      hideGateModal();
      console.log(`[ChronoBeastAuth] Active session verified: ${profile.username}`);

    } catch (err) {
      console.warn('[ChronoBeastAuth] Session check failed:', err);
      showGateModal();
    }
  }

  async function logout() {
    const sb = getClient();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (e) {
        console.error('Sign out error:', e);
      }
    }
    currentUserProfile = null;
    hideAlert();
    const passInput = document.getElementById('auth-password-input');
    if (passInput) passInput.value = '';
    showGateModal();
    showAlert('ออกจากระบบเรียบร้อยแล้ว', 'info');
  }

  function initDOM() {
    const form = document.getElementById('auth-login-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('auth-username-input')?.value || '';
        const password = document.getElementById('auth-password-input')?.value || '';
        performLogin(username, password);
      });
    }

    const togglePwBtn = document.getElementById('auth-toggle-pw-btn');
    if (togglePwBtn) {
      togglePwBtn.addEventListener('click', function () {
        const passInput = document.getElementById('auth-password-input');
        if (!passInput) return;
        if (passInput.type === 'password') {
          passInput.type = 'text';
          togglePwBtn.textContent = '🙈';
        } else {
          passInput.type = 'password';
          togglePwBtn.textContent = '👁️';
        }
      });
    }

    const logoutBtn = document.getElementById('auth-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('คุณต้องการออกจากระบบสำนักฝึกสัตว์วิเศษหรือไม่?')) {
          logout();
        }
      });
    }

    checkExistingSession();
  }

  function start() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDOM);
    } else {
      initDOM();
    }
  }

  window.ChronoBeastAuth = {
    getClient,
    login: performLogin,
    logout,
    checkSession: checkExistingSession,
    getCurrentProfile: () => currentUserProfile
  };

  start();
})();
