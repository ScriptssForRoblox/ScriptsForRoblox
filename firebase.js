// ---- Firebase Config ----
const firebaseConfig = {
  apiKey: "AIzaSyDsASis-Lu9v-A_QuIEITrFVLAHYu4qaAM",
  authDomain: "scriptsforrbx.firebaseapp.com",
  databaseURL: "https://scriptsforrbx-default-rtdb.firebaseio.com",
  projectId: "scriptsforrbx",
  storageBucket: "scriptsforrbx.firebasestorage.app",
  messagingSenderId: "203494029363",
  appId: "1:203494029363:web:c31393b5cf71ddf67d4b46"
};

// Firebase SDKs via CDN (compat mode — funciona sem bundler)
// Carregado via <script> no HTML antes deste arquivo
const app    = firebase.initializeApp(firebaseConfig);
const db     = firebase.database();
const auth   = firebase.auth();

// ---- DB Helpers ----
const DB = {
  // Lê uma vez
  get: (path) => db.ref(path).get().then(s => s.val()),

  // Escreve
  set: (path, val) => db.ref(path).set(val),

  // Atualiza campos
  update: (path, val) => db.ref(path).update(val),

  // Push (gera ID automático)
  push: (path, val) => db.ref(path).push(val),

  // Remove
  remove: (path) => db.ref(path).remove(),

  // Escuta em tempo real
  on: (path, cb) => db.ref(path).on('value', s => cb(s.val())),

  // Para de escutar
  off: (path) => db.ref(path).off(),

  // Escuta uma vez
  once: (path, cb) => db.ref(path).once('value').then(s => cb(s.val())),
};
