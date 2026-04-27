// ---- Helpers ----
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return diff + 's atrás';
  if (diff < 3600) return Math.floor(diff / 60) + 'min atrás';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
  return Math.floor(diff / 86400) + 'd atrás';
}

function showNotification(msg, type = 'success') {
  let container = document.getElementById('notif-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notif-container';
    document.body.appendChild(container);
  }
  const notif = document.createElement('div');
  notif.className = `notif-item ${type}`;
  notif.style.cssText = 'opacity:0;transform:translateY(20px);transition:opacity .4s,transform .4s';
  const icon = type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
  notif.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
  container.appendChild(notif);
  requestAnimationFrame(() => {
    notif.style.opacity = '1';
    notif.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translateY(-20px)';
    setTimeout(() => notif.remove(), 400);
  }, 4000);
}

// ---- Session (Firebase Auth) ----
let _currentUser = null; // { uid, username, ...profile }

function getSession() { return _currentUser?.username || null; }
function getUID()     { return _currentUser?.uid || null; }

// ---- Auth ----
async function register() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm').value;
  const error    = document.getElementById('error');

  if (!username || !password) return (error.textContent = 'Preencha todos os campos.');
  if (password !== confirm)   return (error.textContent = 'Senhas não coincidem.');
  if (password.length < 6)   return (error.textContent = 'Senha mínimo 6 caracteres.');

  // Verifica se username já existe
  const existing = await DB.get(`usernames/${username.toLowerCase()}`);
  if (existing) return (error.textContent = 'Usuário já existe.');

  try {
    // Cria conta no Firebase Auth com email fake
    const email = `${username.toLowerCase()}@scriptdrop.app`;
    const cred  = await auth.createUserWithEmailAndPassword(email, password);
    const uid   = cred.user.uid;

    const isAlex = username.toLowerCase() === 'alex';
    const profile = {
      uid,
      username,
      avatarURL: '',
      avatarColor: '#7c6af7',
      nameColor: '#ffffff',
      bio: '',
      banner: '',
      profileMusic: '',
      badges: [],
      isBanned: false,
      canPost: true,
      warns: 0,
      timeoutUntil: 0,
      following: [],
      id: isAlex ? '937937001112555531' : uid,
      createdAt: Date.now()
    };

    await DB.set(`users/${uid}`, profile);
    await DB.set(`usernames/${username.toLowerCase()}`, uid);

    window.location.href = './';
  } catch(e) {
    error.textContent = e.message;
  }
}

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const error    = document.getElementById('error');

  try {
    const uid = await DB.get(`usernames/${username.toLowerCase()}`);
    if (!uid) return (error.textContent = 'Usuário não encontrado.');

    const email = `${username.toLowerCase()}@scriptdrop.app`;
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = './';
  } catch(e) {
    error.textContent = 'Usuário ou senha incorretos.';
  }
}

function logout() {
  auth.signOut().then(() => window.location.href = './');
}

function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// ---- Notifications ----
async function pushNotif(toUID, type, msg, link) {
  if (!toUID) return;
  await DB.push(`notifs/${toUID}`, { type, msg, link, read: false, ts: Date.now() });
}

async function renderNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const badge = document.getElementById('notifBadge');
  if (!panel || !_currentUser) return;

  const uid = getUID();
  const data = await DB.get(`notifs/${uid}`) || {};
  const notifs = Object.entries(data).map(([k,v]) => ({...v, _key: k})).sort((a,b) => b.ts - a.ts).slice(0,30);
  const unread = notifs.filter(n => !n.read).length;

  if (badge) { badge.textContent = unread || ''; badge.style.display = unread > 0 ? 'flex' : 'none'; }

  panel.innerHTML = notifs.length ? notifs.map(n => `
    <a class="notif-entry ${n.read?'':'unread'}" href="${n.link||'#'}">
      <div class="ne-icon ${n.type}">${
        n.type==='follow' ? SD.icon('userplus',16)
        : n.type==='comment' ? SD.icon('comment',16)
        : n.type==='msg' ? SD.icon('envelope',16)
        : SD.icon('bell',16)
      }</div>
      <div class="ne-body">
        <div class="ne-msg">${escapeHtml(n.msg)}</div>
        <div class="ne-time">${timeAgo(n.ts)}</div>
      </div>
    </a>`).join('')
  : '<div style="padding:20px;text-align:center;color:#555;font-size:.85rem">Nenhuma notificação</div>';
}

async function markNotifsRead() {
  const uid = getUID();
  if (!uid) return;
  const data = await DB.get(`notifs/${uid}`) || {};
  const updates = {};
  Object.keys(data).forEach(k => { updates[`notifs/${uid}/${k}/read`] = true; });
  if (Object.keys(updates).length) await db.ref().update(updates);
}

// ---- Follow ----
async function toggleFollow(targetUsername) {
  if (!_currentUser) return showNotification('Faça login para seguir!', 'error');
  if (_currentUser.username === targetUsername) return;

  const myUID = getUID();
  const targetUID = await DB.get(`usernames/${targetUsername.toLowerCase()}`);
  if (!targetUID) return;

  const following = _currentUser.following || [];
  const idx = following.indexOf(targetUsername);

  if (idx > -1) {
    following.splice(idx, 1);
    showNotification(`Você deixou de seguir ${targetUsername}`);
  } else {
    following.push(targetUsername);
    showNotification(`Seguindo ${targetUsername}!`);
    await pushNotif(targetUID, 'follow', `${_currentUser.username} começou a te seguir!`, `profile?user=${_currentUser.username}`);
  }

  _currentUser.following = following;
  await DB.update(`users/${myUID}`, { following });
  location.reload();
}

async function isMutualFollow(usernameA, usernameB) {
  const uidA = await DB.get(`usernames/${usernameA.toLowerCase()}`);
  const uidB = await DB.get(`usernames/${usernameB.toLowerCase()}`);
  if (!uidA || !uidB) return false;
  const a = await DB.get(`users/${uidA}`);
  const b = await DB.get(`users/${uidB}`);
  return (a?.following||[]).includes(usernameB) && (b?.following||[]).includes(usernameA);
}

// ---- Chat ----
function getChatKey(a, b) { return [a,b].sort().join('__'); }

async function sendMessage(toUser, text) {
  if (!_currentUser || !text.trim()) return;
  const mutual = await isMutualFollow(_currentUser.username, toUser);
  if (!mutual) return showNotification('Vocês precisam se seguir mutuamente.', 'error');

  const key = getChatKey(_currentUser.username, toUser);
  await DB.push(`chats/${key}`, { from: _currentUser.username, text: text.trim(), ts: Date.now() });

  const toUID = await DB.get(`usernames/${toUser.toLowerCase()}`);
  if (toUID) await pushNotif(toUID, 'msg', `${_currentUser.username}: ${text.trim().slice(0,40)}`, `chat?with=${_currentUser.username}`);
}

// ---- Comments ----
async function addComment(postId) {
  if (!_currentUser) return showNotification('Faça login para comentar!', 'error');
  const input = document.getElementById('cInput');
  const text = input?.value.trim();
  if (!text) return;

  await DB.push(`comments/${postId}`, {
    author: _currentUser.username,
    authorUID: getUID(),
    text,
    ts: Date.now()
  });
  input.value = '';

  // Notifica dono do post
  const post = await DB.get(`posts/${postId}`);
  if (post && post.authorUID !== getUID()) {
    await pushNotif(post.authorUID, 'comment', `${_currentUser.username} comentou no seu script "${post.title}"`, `script?id=${postId}`);
  }

  renderComments(postId);
}

async function renderComments(postId) {
  const el = document.getElementById('commentList');
  if (!el) return;
  const data = await DB.get(`comments/${postId}`) || {};
  const comments = Object.values(data).sort((a,b) => a.ts - b.ts);

  if (!comments.length) {
    el.innerHTML = '<p style="color:#555;font-size:.85rem;padding:10px 0">Nenhum comentário ainda.</p>';
    return;
  }

  // Busca avatares
  const userCache = {};
  for (const c of comments) {
    if (!userCache[c.author]) {
      const uid = await DB.get(`usernames/${c.author.toLowerCase()}`);
      if (uid) userCache[c.author] = await DB.get(`users/${uid}`) || {};
    }
  }

  el.innerHTML = comments.map(c => {
    const u = userCache[c.author] || {};
    const av = u.avatarURL
      ? `<img src='${u.avatarURL}' style='width:100%;height:100%;object-fit:cover;border-radius:50%'>`
      : c.author.charAt(0).toUpperCase();
    return `<div class="comment-item">
      <div class="comment-av" style="background:${u.avatarColor||'#7c6af7'}">${av}</div>
      <div class="comment-body">
        <div class="comment-author"><a href="profile?user=${encodeURIComponent(c.author)}">${escapeHtml(c.author)}</a><span class="comment-time">${timeAgo(c.ts)}</span></div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </div>
    </div>`;
  }).join('');
}

// ---- Moderation ----
async function verifyUser(targetUID) {
  if (getSession() !== 'Alex') return;
  const user = await DB.get(`users/${targetUID}`);
  if (!user) return;
  await DB.update(`users/${targetUID}`, { isVerified: !user.isVerified });
  showNotification(user.isVerified ? 'Verificação removida.' : 'Usuário verificado!');
  location.reload();
}

async function deletePost(postId) {
  if (!_currentUser) return;
  const post = await DB.get(`posts/${postId}`);
  if (!post) return;
  if (post.authorUID !== getUID() && getSession() !== 'Alex') return showNotification('Sem permissão!', 'error');
  if (!confirm('Deletar este script para sempre?')) return;
  await DB.remove(`posts/${postId}`);
  showNotification('Script deletado!');
  location.reload();
}

// ---- Modal ----
function openPostModal()  { document.getElementById('postModal')?.classList.add('open'); }
function closePostModal() { document.getElementById('postModal')?.classList.remove('open'); }

// ---- Posts ----
async function submitPost() {
  const title = document.getElementById('mTitle')?.value.trim();
  const code  = document.getElementById('mCode')?.value.trim();
  const game  = document.getElementById('mGame')?.value.trim();
  const image = document.getElementById('mImage')?.value.trim();
  const desc  = document.getElementById('mDesc')?.value.trim();
  const tags  = document.getElementById('mTags')?.value.split(',').map(t=>t.trim()).filter(Boolean);

  if (!_currentUser) return showNotification('Faça login!', 'error');
  if (!title || !code) return showNotification('Preencha título e script.', 'error');
  if (_currentUser.isBanned) return showNotification('Sua conta está banida.', 'error');
  if (!_currentUser.canPost) return showNotification('Você não pode postar.', 'error');
  if (_currentUser.timeoutUntil > Date.now()) return showNotification('Você está em timeout.', 'error');

  const postId = Date.now().toString();
  await DB.set(`posts/${postId}`, {
    id: postId, title, code, game, image, desc, tags,
    author: _currentUser.username,
    authorUID: getUID(),
    date: new Date().toLocaleDateString('pt-BR'),
    ts: Date.now(),
    isVerifiedPost: _currentUser.isVerified || false,
    views: 0
  });

  closePostModal();
  ['mTitle','mCode','mGame','mImage','mDesc','mTags'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  showNotification('Script publicado!');
  renderFeed();
  updateStats();
}

async function copyScript(id, e) {
  if (e) e.preventDefault();
  const post = await DB.get(`posts/${id}`);
  if (!post) return;
  navigator.clipboard.writeText(post.code);
}

// ---- Filter ----
let currentFilter = 'all';
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderFeed();
}

// ---- Global Search ----
function globalSearch(q) {
  if (!q?.trim()) return;
  window.location.href = `search?q=${encodeURIComponent(q.trim())}`;
}

async function liveSearch(q) {
  const box = document.getElementById('globalSearchResults');
  if (!box) return;
  if (!q || q.length < 2) { box.classList.remove('open'); return; }

  const ql = q.toLowerCase();
  const [postsData, usersData] = await Promise.all([
    DB.get('posts'),
    DB.get('users')
  ]);

  const posts = postsData ? Object.values(postsData).filter(p => (p.title+(p.game||'')).toLowerCase().includes(ql)).slice(0,4) : [];
  const users = usersData ? Object.values(usersData).filter(u => u.username?.toLowerCase().includes(ql)).slice(0,3) : [];

  if (!posts.length && !users.length) { box.classList.remove('open'); return; }

  let html = '';
  if (users.length) {
    html += '<div class="gsr-section">Usuários</div>';
    html += users.map(u => {
      const av = u.avatarURL ? `<img src='${u.avatarURL}'>` : u.username.charAt(0).toUpperCase();
      return `<div class="gsr-item" onclick="location.href='profile?user=${encodeURIComponent(u.username)}'">
        <div class="gsr-av" style="background:${u.avatarColor||'#7c6af7'}">${av}</div>
        <div><div class="gsr-name">${escapeHtml(u.username)}</div><div class="gsr-sub">${(u.following||[]).length} seguindo</div></div>
      </div>`;
    }).join('');
  }
  if (posts.length) {
    html += '<div class="gsr-section">Scripts</div>';
    html += posts.map(p => `<div class="gsr-item" onclick="location.href='script?id=${p.id}'">
      <div class="gsr-av" style="background:#1a1a1a">${SD.icon('code',14)}</div>
      <div><div class="gsr-name">${escapeHtml(p.title)}</div><div class="gsr-sub">${escapeHtml(p.author)} · ${escapeHtml(p.game||'Universal')}</div></div>
    </div>`).join('');
  }

  box.innerHTML = html;
  box.classList.add('open');
  document.addEventListener('click', () => box.classList.remove('open'), { once: true });
}

// ---- Feed ----
async function renderFeed() {
  const grid = document.getElementById('scriptGrid');
  if (!grid) return;

  const q = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const data = await DB.get('posts') || {};
  let posts = Object.values(data).sort((a,b) => b.ts - a.ts);

  if (q) posts = posts.filter(p => (p.title+(p.game||'')+(p.author||'')).toLowerCase().includes(q));
  if (currentFilter === 'recent') posts = posts.slice(0, 10);

  if (!posts.length) { grid.innerHTML = '<p class="feed-empty">Nenhum script encontrado.</p>'; return; }

  grid.innerHTML = posts.map(p => {
    const img = p.image
      ? `<div class="pc-img"><img src="${escapeHtml(p.image)}" onerror="this.parentElement.classList.add('pc-img-err')"/></div>`
      : `<div class="pc-img pc-img-placeholder">${SD.icon('code',32)}</div>`;
    return `<a class="post-card" href="script?id=${p.id}">
      <div class="pc-top"><span class="pc-time">${SD.icon('recent',13)} ${timeAgo(p.ts)||p.date}</span><span class="pc-author">@${escapeHtml(p.author||'anon')}</span></div>
      ${img}
      <div class="pc-bottom"><div class="pc-title">${escapeHtml(p.title)}</div><div class="pc-game">${SD.icon('gamepad',13)} ${escapeHtml(p.game||'Universal')}</div></div>
    </a>`;
  }).join('');

  renderRecent(posts);
  renderTagCloud(posts);
}

async function renderRecent(posts) {
  const el = document.getElementById('recentList');
  if (!el) return;
  el.innerHTML = posts.slice(0,5).map(p =>
    `<a class="recent-item" href="script?id=${p.id}"><span class="ri-title">${escapeHtml(p.title)}</span><span class="ri-game">${escapeHtml(p.game||'Universal')}</span></a>`
  ).join('') || '<p style="color:#555;font-size:.8rem">Nenhum script ainda.</p>';
}

function renderTagCloud(posts) {
  const el = document.getElementById('tagCloud');
  if (!el) return;
  const map = {};
  posts.forEach(p => (p.tags||[]).forEach(t => { map[t]=(map[t]||0)+1; }));
  const tags = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,12);
  el.innerHTML = tags.length
    ? tags.map(([t]) => `<span class="tag-chip" onclick="document.getElementById('searchInput').value='${escapeHtml(t)}';renderFeed()">${escapeHtml(t)}</span>`).join('')
    : '<p style="color:#555;font-size:.8rem">Sem tags ainda.</p>';
}

async function updateStats() {
  const [postsData, usersData] = await Promise.all([DB.get('posts'), DB.get('users')]);
  const pc = postsData ? Object.keys(postsData).length : 0;
  const uc = usersData ? Object.keys(usersData).length : 0;
  const visits = parseInt(localStorage.getItem('visits')||'0') + 1;
  localStorage.setItem('visits', visits);
  ['statScripts','sideStatScripts'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=pc; });
  ['statUsers','sideStatUsers'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=uc; });
  ['statVisits','sideStatVisits'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=visits; });
}

// ---- RGB Owner ----
function startRgbName() {
  const el = document.getElementById('navName');
  if (!el) return;
  let h = 0;
  setInterval(() => { h=(h+2)%360; el.style.color=`hsl(${h},100%,65%)`; }, 30);
}

// ---- Navbar ----
let _navbarInited = false;
function initNavbar() {
  const guest  = document.getElementById('nav-guest');
  const logged = document.getElementById('nav-logged');
  if (!guest || !logged) return;

  if (_currentUser) {
    guest.style.display  = 'none';
    logged.style.display = 'flex';

    const navName   = document.getElementById('navName');
    const navAvatar = document.getElementById('navAvatar');
    const navAdmin  = document.getElementById('navAdminBtn');

    if (navName) navName.textContent = _currentUser.username;
    if (navAdmin && _currentUser.id === '937937001112555531') navAdmin.style.display = 'flex';
    if (navAvatar) {
      if (_currentUser.avatarURL) {
        navAvatar.innerHTML = `<img src="${escapeHtml(_currentUser.avatarURL)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      } else {
        navAvatar.textContent = _currentUser.username.charAt(0).toUpperCase();
        navAvatar.style.background = _currentUser.avatarColor || '#7c6af7';
      }
    }
    if (_currentUser.id === '937937001112555531') startRgbName();
    renderNotifPanel();

    // Corrige link do perfil na navbar
    document.querySelectorAll('a[href="profile"]').forEach(a => {
      a.href = `profile?user=${encodeURIComponent(_currentUser.username)}`;
    });
  } else {
    guest.style.display  = 'flex';
    logged.style.display = 'none';
  }

  // Listeners só uma vez
  if (_navbarInited) return;
  _navbarInited = true;

  const wrap = document.getElementById('navAvatarWrap');
  const drop = document.getElementById('navDropdown');
  if (wrap && drop) {
    wrap.addEventListener('click', e => { e.stopPropagation(); drop.classList.toggle('open'); });
    document.addEventListener('click', () => drop.classList.remove('open'));
  }

  const notifBtn   = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', e => {
      e.stopPropagation();
      notifPanel.classList.toggle('open');
      if (notifPanel.classList.contains('open')) { markNotifsRead(); renderNotifPanel(); }
    });
    document.addEventListener('click', () => notifPanel.classList.remove('open'));
  }

  const modal = document.getElementById('postModal');
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closePostModal(); });
}

// ---- Particles ----
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots = [];
  function resize() { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
  function spawn() { dots=Array.from({length:60},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.5,a:Math.random()*.5+.1})); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    dots.forEach(d=>{d.x+=d.vx;d.y+=d.vy;if(d.x<0||d.x>W)d.vx*=-1;if(d.y<0||d.y>H)d.vy*=-1;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fillStyle=`rgba(124,106,247,${d.a})`;ctx.fill();});
    requestAnimationFrame(draw);
  }
  resize(); spawn(); draw();
  window.addEventListener('resize',()=>{resize();spawn();});
}

// ---- Init (aguarda Firebase Auth) ----
// Mostra navbar imediatamente com cache local para evitar flash de "deslogado"
const _cachedUID = localStorage.getItem('sd_uid');
const _cachedUser = localStorage.getItem('sd_user');
if (_cachedUID && _cachedUser) {
  try {
    _currentUser = JSON.parse(_cachedUser);
    initNavbar(); // renderiza navbar imediatamente com cache
  } catch(e) {}
}

auth.onAuthStateChanged(async (firebaseUser) => {
  if (firebaseUser) {
    const profile = await DB.get(`users/${firebaseUser.uid}`);
    if (profile) {
      _currentUser = { ...profile, uid: firebaseUser.uid };
      // Garante ID do Alex
      if (_currentUser.username.toLowerCase() === 'alex' && _currentUser.id !== '937937001112555531') {
        await DB.update(`users/${firebaseUser.uid}`, { id: '937937001112555531' });
        _currentUser.id = '937937001112555531';
      }
      // Salva cache local
      localStorage.setItem('sd_uid', firebaseUser.uid);
      localStorage.setItem('sd_user', JSON.stringify(_currentUser));
    }
  } else {
    _currentUser = null;
    localStorage.removeItem('sd_uid');
    localStorage.removeItem('sd_user');
  }

  initNavbar();
  initParticles();
  renderFeed();
  updateStats();
});
