// ---- Helpers ----
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }
function getPosts() { return JSON.parse(localStorage.getItem('posts') || '[]'); }
function savePosts(p) { localStorage.setItem('posts', JSON.stringify(p)); }
function getComments() { return JSON.parse(localStorage.getItem('comments') || '[]'); }
function saveComments(c) { localStorage.setItem('comments', JSON.stringify(c)); }
function getSession() { return localStorage.getItem('session'); }
function setSession(u) { localStorage.setItem('session', u); }
function clearSession() { localStorage.removeItem('session'); }

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

// ---- Toast ----
function showNotification(msg, type = 'success') {
  let container = document.getElementById('notif-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notif-container';
    document.body.appendChild(container);
  }
  const notif = document.createElement('div');
  notif.className = `notif-item ${type} animate-fade-up`;
  const icon = type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
  notif.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translate(0, -20px)';
    setTimeout(() => notif.remove(), 500);
  }, 4000);
}

// ---- In-App Notifications ----
function getNotifs() { return JSON.parse(localStorage.getItem('notifs') || '{}'); }
function saveNotifs(n) { localStorage.setItem('notifs', JSON.stringify(n)); }

function pushNotif(toUser, type, msg, link) {
  const all = getNotifs();
  if (!all[toUser]) all[toUser] = [];
  all[toUser].unshift({ id: Date.now(), type, msg, link, read: false, ts: Date.now() });
  all[toUser] = all[toUser].slice(0, 50);
  saveNotifs(all);
}

function getMyNotifs() {
  const session = getSession();
  if (!session) return [];
  return (getNotifs()[session] || []);
}

function markNotifsRead() {
  const session = getSession();
  if (!session) return;
  const all = getNotifs();
  if (all[session]) all[session].forEach(n => n.read = true);
  saveNotifs(all);
}

function renderNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  const notifs = getMyNotifs();
  const unread = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('notifBadge');
  if (badge) badge.textContent = unread > 0 ? unread : '';
  if (badge) badge.style.display = unread > 0 ? 'flex' : 'none';

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

// ---- Force Owner ----
function fixOwnerId() {
  let users = getUsers();
  let alex = users.find(u => u.username.toLowerCase() === 'alex');
  if (alex && alex.id !== "937937001112555531") {
    alex.id = "937937001112555531";
    alex.canPost = true;
    alex.isBanned = false;
    saveUsers(users);
  }
}

// ---- Auth ----
function register() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm').value;
  const error    = document.getElementById('error');
  if (!username || !password) return (error.textContent = 'Preencha todos os campos.');
  if (password !== confirm)   return (error.textContent = 'Senhas não coincidem.');
  const users = getUsers();
  if (users.find(u => u.username === username)) return (error.textContent = 'Usuário já existe.');
  users.push({ id: Math.floor(Math.random()*1e9).toString(), username, password, badges:[], isBanned:false, canPost:true, warns:0, timeoutUntil:0, following:[] });
  saveUsers(users);
  setSession(username);
  window.location.href = './';
}

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const error    = document.getElementById('error');
  const users = getUsers();
  const user  = users.find(u => u.username === username && u.password === password);
  if (!user) return (error.textContent = 'Usuário ou senha incorretos.');
  setSession(username);
  window.location.href = './';
}

function logout() { clearSession(); window.location.href = './'; }

function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// ---- Follow ----
function toggleFollow(targetUsername) {
  const session = getSession();
  if (!session) return showNotification("Faça login para seguir!", "error");
  if (session === targetUsername) return;
  let users = getUsers();
  let me = users.find(u => u.username === session);
  if (!me.following) me.following = [];
  const idx = me.following.indexOf(targetUsername);
  if (idx > -1) {
    me.following.splice(idx, 1);
    showNotification(`Você deixou de seguir ${targetUsername}`);
  } else {
    me.following.push(targetUsername);
    showNotification(`Seguindo ${targetUsername}!`);
    pushNotif(targetUsername, 'follow', `${session} começou a te seguir!`, `profile?user=${session}`);
  }
  saveUsers(users);
  location.reload();
}

function isMutualFollow(a, b) {
  const users = getUsers();
  const ua = users.find(u => u.username === a);
  const ub = users.find(u => u.username === b);
  return (ua?.following||[]).includes(b) && (ub?.following||[]).includes(a);
}

// ---- Chat ----
function getChatKey(a, b) { return [a,b].sort().join('::'); }
function getChats() { return JSON.parse(localStorage.getItem('chats') || '{}'); }
function saveChats(c) { localStorage.setItem('chats', JSON.stringify(c)); }

function sendMessage(toUser, text) {
  const session = getSession();
  if (!session || !text.trim()) return;
  if (!isMutualFollow(session, toUser)) return showNotification('Vocês precisam se seguir mutuamente para conversar.', 'error');
  const chats = getChats();
  const key = getChatKey(session, toUser);
  if (!chats[key]) chats[key] = [];
  chats[key].push({ from: session, text: text.trim(), ts: Date.now() });
  saveChats(chats);
  pushNotif(toUser, 'msg', `${session}: ${text.trim().slice(0,40)}`, `chat?with=${session}`);
}

function getMessages(withUser) {
  const session = getSession();
  if (!session) return [];
  const key = getChatKey(session, withUser);
  return (getChats()[key] || []);
}

// ---- Comments ----
function addComment(postId) {
  const session = getSession();
  if (!session) return showNotification('Faça login para comentar!', 'error');
  const input = document.getElementById('cInput');
  const text = input?.value.trim();
  if (!text) return;
  const comments = getComments();
  comments.push({ id: Date.now(), postId, author: session, text, ts: Date.now() });
  saveComments(comments);
  input.value = '';
  // notifica dono do post
  const post = getPosts().find(p => p.id === postId);
  if (post && post.author !== session) {
    pushNotif(post.author, 'comment', `${session} comentou no seu script "${post.title}"`, `script?id=${postId}`);
  }
  renderComments(postId);
}

function renderComments(postId) {
  const el = document.getElementById('commentList');
  if (!el) return;
  const comments = getComments().filter(c => c.postId === postId);
  const users = getUsers();
  el.innerHTML = comments.length ? comments.map(c => {
    const u = users.find(u => u.username === c.author) || {};
    const av = u.avatarURL
      ? `<img src='${u.avatarURL}' style='width:100%;height:100%;object-fit:cover;border-radius:50%'>`
      : c.author.charAt(0).toUpperCase();
    return `<div class="comment-item">
      <div class="comment-av" style="background:${u.avatarColor||'#7c6af7'}">${av}</div>
      <div class="comment-body">
        <div class="comment-author"><a href="profile?user=${encodeURIComponent(c.author)}">${escapeHtml(c.author)}</a> <span class="comment-time">${timeAgo(c.ts)}</span></div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </div>
    </div>`;
  }).join('') : '<p style="color:#555;font-size:.85rem;padding:10px 0">Nenhum comentário ainda. Seja o primeiro!</p>';
}

// ---- Moderation ----
function verifyUser(userId) {
  if (getSession() !== 'Alex') return;
  let users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) { users[idx].isVerified = !users[idx].isVerified; saveUsers(users); location.reload(); }
}

function deletePost(postId) {
  const session = getSession();
  let posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  if (post.author !== session && session !== 'Alex') return showNotification("Sem permissão!", "error");
  if (!confirm("Deletar este script para sempre?")) return;
  savePosts(posts.filter(p => p.id !== postId));
  showNotification("Script deletado!");
  location.reload();
}

// ---- Modal ----
function openPostModal() { document.getElementById('postModal')?.classList.add('open'); }
function closePostModal() { document.getElementById('postModal')?.classList.remove('open'); }

// ---- Posts ----
function submitPost() {
  const title = document.getElementById('mTitle')?.value.trim();
  const code  = document.getElementById('mCode')?.value.trim();
  const game  = document.getElementById('mGame')?.value.trim();
  const image = document.getElementById('mImage')?.value.trim();
  const desc  = document.getElementById('mDesc')?.value.trim();
  const tags  = document.getElementById('mTags')?.value.split(',').map(t=>t.trim()).filter(Boolean);
  const session = getSession();
  const user = getUsers().find(u => u.username === session);
  if (!title || !code) return showNotification('Preencha o título e o script.', 'error');
  if (user?.isBanned) return showNotification('Sua conta está banida.', 'error');
  if (!user?.canPost) return showNotification('Seu acesso para publicar foi revogado.', 'error');
  if (user?.timeoutUntil > Date.now()) return showNotification('Você está em timeout.', 'error');
  const posts = getPosts();
  posts.unshift({ id: Date.now(), title, code, game, image, desc, tags, author: session, date: new Date().toLocaleDateString('pt-BR'), ts: Date.now(), isVerifiedPost: user?.isVerified||false, views: 0 });
  savePosts(posts);
  closePostModal();
  ['mTitle','mCode','mGame','mImage','mDesc','mTags'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  renderFeed();
  updateStats();
}

function copyScript(id, e) {
  if (e) e.preventDefault();
  const post = getPosts().find(p => p.id === id);
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
  if (!q || !q.trim()) return;
  window.location.href = `search?q=${encodeURIComponent(q.trim())}`;
}

function liveSearch(q) {
  const box = document.getElementById('globalSearchResults');
  if (!box) return;
  if (!q || q.length < 2) { box.classList.remove('open'); return; }
  const posts = getPosts();
  const users = getUsers();
  const ql = q.toLowerCase();
  const matchPosts = posts.filter(p => (p.title+(p.game||'')).toLowerCase().includes(ql)).slice(0,4);
  const matchUsers = users.filter(u => u.username.toLowerCase().includes(ql)).slice(0,3);
  if (!matchPosts.length && !matchUsers.length) { box.classList.remove('open'); return; }
  let html = '';
  if (matchUsers.length) {
    html += '<div class="gsr-section"><i class="fas fa-users"></i> Usuários</div>';
    html += matchUsers.map(u => {
      const av = u.avatarURL ? `<img src='${u.avatarURL}'>` : u.username.charAt(0).toUpperCase();
      return `<div class="gsr-item" onclick="location.href='profile?user=${encodeURIComponent(u.username)}'">
        <div class="gsr-av" style="background:${u.avatarColor||'#7c6af7'}">${av}</div>
        <div><div class="gsr-name">${escapeHtml(u.username)}</div><div class="gsr-sub">${(u.following||[]).length} seguindo</div></div>
      </div>`;
    }).join('');
  }
  if (matchPosts.length) {
    html += '<div class="gsr-section"><i class="fas fa-code"></i> Scripts</div>';
    html += matchPosts.map(p => `<div class="gsr-item" onclick="location.href='script?id=${p.id}'">
      <div class="gsr-av" style="background:#1a1a1a;border-radius:8px"><i class="fas fa-code" style="color:#7c6af7"></i></div>
      <div><div class="gsr-name">${escapeHtml(p.title)}</div><div class="gsr-sub">${escapeHtml(p.author)} · ${escapeHtml(p.game||'Universal')}</div></div>
    </div>`).join('');
  }
  box.innerHTML = html;
  box.classList.add('open');
  document.addEventListener('click', () => box.classList.remove('open'), { once: true });
}

// ---- Feed ----
function renderFeed() {
  const grid = document.getElementById('scriptGrid');
  if (!grid) return;
  let posts = getPosts();
  const q = document.getElementById('searchInput')?.value.toLowerCase() || '';
  if (q) posts = posts.filter(p => (p.title+(p.game||'')+(p.author||'')).toLowerCase().includes(q));
  if (currentFilter === 'recent') posts = posts.slice(0, 10);
  if (!posts.length) { grid.innerHTML = '<p class="feed-empty">Nenhum script encontrado.</p>'; return; }
  grid.innerHTML = posts.map(p => {
    const img = p.image
      ? `<div class="pc-img"><img src="${escapeHtml(p.image)}" alt="cover" onerror="this.parentElement.classList.add('pc-img-err')"/></div>`
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

function renderRecent(posts) {
  const el = document.getElementById('recentList');
  if (!el) return;
  el.innerHTML = posts.slice(0,5).map(p => `<a class="recent-item" href="script?id=${p.id}"><span class="ri-title">${escapeHtml(p.title)}</span><span class="ri-game">${escapeHtml(p.game||'Universal')}</span></a>`).join('') || '<p style="color:#555;font-size:.8rem">Nenhum script ainda.</p>';
}

function renderTagCloud(posts) {
  const el = document.getElementById('tagCloud');
  if (!el) return;
  const map = {};
  posts.forEach(p => (p.tags||[]).forEach(t => { map[t]=(map[t]||0)+1; }));
  const tags = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,12);
  el.innerHTML = tags.length ? tags.map(([t]) => `<span class="tag-chip" onclick="document.getElementById('searchInput').value='${escapeHtml(t)}';renderFeed()">${escapeHtml(t)}</span>`).join('') : '<p style="color:#555;font-size:.8rem">Sem tags ainda.</p>';
}

function updateStats() {
  const posts = getPosts(), users = getUsers();
  const visits = parseInt(localStorage.getItem('visits')||'0') + 1;
  localStorage.setItem('visits', visits);
  ['statScripts','sideStatScripts'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=posts.length; });
  ['statUsers','sideStatUsers'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=users.length; });
  ['statVisits','sideStatVisits'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=visits; });
}

// ---- RGB Owner name ----
function startRgbName() {
  const el = document.getElementById('navName');
  if (!el) return;
  let h = 0;
  setInterval(() => {
    h = (h + 2) % 360;
    el.style.color = `hsl(${h},100%,65%)`;
  }, 30);
}

// ---- Navbar ----
function initNavbar() {
  const session  = getSession();
  const guest    = document.getElementById('nav-guest');
  const logged   = document.getElementById('nav-logged');
  const navName  = document.getElementById('navName');
  const navAvatar= document.getElementById('navAvatar');
  const navAdmin = document.getElementById('navAdminBtn');
  if (!guest || !logged) return;

  if (session) {
    guest.style.display  = 'none';
    logged.style.display = 'flex';
    if (navName) navName.textContent = session;
    const users = getUsers();
    const user  = users.find(u => u.username === session);
    if (navAdmin && user?.id === "937937001112555531") navAdmin.style.display = 'flex';
    if (navAvatar) {
      if (user?.avatarURL) navAvatar.innerHTML = `<img src="${escapeHtml(user.avatarURL)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      else { navAvatar.textContent = session.charAt(0).toUpperCase(); navAvatar.style.background = user?.avatarColor||'#7c6af7'; }
    }
    // RGB for owner
    if (user?.id === "937937001112555531") startRgbName();
    // notif badge
    renderNotifPanel();
  } else {
    guest.style.display  = 'flex';
    logged.style.display = 'none';
  }

  const wrap = document.getElementById('navAvatarWrap');
  const drop = document.getElementById('navDropdown');
  if (wrap && drop) {
    wrap.addEventListener('click', e => { e.stopPropagation(); drop.classList.toggle('open'); });
    document.addEventListener('click', () => drop.classList.remove('open'));
  }

  // notif toggle
  const notifBtn = document.getElementById('notifBtn');
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
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function spawn() { dots = Array.from({length:60}, () => ({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, r:Math.random()*1.5+.5, a:Math.random()*.5+.1 })); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    dots.forEach(d => { d.x+=d.vx; d.y+=d.vy; if(d.x<0||d.x>W)d.vx*=-1; if(d.y<0||d.y>H)d.vy*=-1; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fillStyle=`rgba(124,106,247,${d.a})`; ctx.fill(); });
    requestAnimationFrame(draw);
  }
  resize(); spawn(); draw();
  window.addEventListener('resize', () => { resize(); spawn(); });
}

// ---- Init ----
(function init() {
  fixOwnerId();
  initNavbar();
  initParticles();
  renderFeed();
  updateStats();
})();
