/* Toples Bintang: tampilan dan alur cerita.
   Isi kado dibaca dari kado.js. Tanpa server dan tanpa database. */
(function () {
'use strict';

var $ = function (s) { return document.querySelector(s); };
var COLORS = { pink: '#f2a9c1', mint: '#a8dfc4', butter: '#f6dd8a', lav: '#c6b3f0', peach: '#ffbf9c', sky: '#9fd0f2' };
var KEYS = Object.keys(COLORS);
var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- data kado ---------- */
/* Isi kado dibaca dari kado.js (window.KADO). Mode ?edit=1 dipakai pembuat untuk mengisi lewat form. */
var EDIT = new URLSearchParams(location.search).get('edit') === '1';
var TODAY = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
var DRAFT_KEY = 'toples-bintang-draft-v2';
var MAX_PHOTOS = 12;
var DEFAULT_WORDS = {
  buka: 'Dari {dari}, untuk {untuk}. Tujuh bintang menunggu dibuka.',
  judul: 'Untuk {untuk}',
  subjudul: 'dari {dari} \u00b7 {tanggal}',
  penutup: '',
  stikerHati: 'dari hati'
};
function text(v, d) { return typeof v === 'string' && v.trim() ? v.trim() : d; }
/* Membaca format kado.js (kunci bahasa Indonesia) dan format lama (to, from, msgs, photos). */
function normalize(k) {
  k = k || {};
  var o = {
    to: text(k.untuk != null ? k.untuk : k.to, 'Nara'),
    from: text(k.dari != null ? k.dari : k.from, 'Aksa'),
    date: text(k.tanggal != null ? k.tanggal : k.date, TODAY),
    shareUrl: text(k.linkBagikan != null ? k.linkBagikan : k.shareUrl, ''),
    words: Object.assign({}, DEFAULT_WORDS), msgs: [], photos: []
  };
  o.ini = text(k.inisial != null ? k.inisial : k.ini, (o.from.charAt(0) + ' & ' + o.to.charAt(0)).toUpperCase());
  var msgs = k.pesan || k.msgs || [];
  for (var i = 0; i < 7; i++) o.msgs.push(typeof msgs[i] === 'string' ? msgs[i] : '');
  (k.foto || k.photos || []).forEach(function (p) {
    if (!p) return;
    if (typeof p === 'string') o.photos.push({ src: p, cap: '' });
    else if (p.src) o.photos.push({ src: p.src, cap: typeof p.teks === 'string' ? p.teks : (p.cap || '') });
  });
  o.photos = o.photos.slice(0, MAX_PHOTOS);
  var w = k.kata || k.words || {};
  Object.keys(DEFAULT_WORDS).forEach(function (key) { if (typeof w[key] === 'string') o.words[key] = w[key]; });
  return o;
}
/* bentuk yang ditulis ke kado.js */
function kadoObject() {
  return {
    untuk: D.to, dari: D.from, inisial: D.ini, tanggal: D.date, pesan: D.msgs,
    foto: D.photos.map(function (p) { return { src: p.src, teks: p.cap }; }),
    kata: D.words, linkBagikan: D.shareUrl
  };
}
function loadDraft() {
  try { var s = localStorage.getItem(DRAFT_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(kadoObject())); } catch (e) { /* penyimpanan penuh */ } }
var D = normalize(EDIT ? (loadDraft() || window.KADO) : window.KADO);
/* mengisi {untuk}, {dari}, {tanggal}, {inisial} di kalimat */
function fill(t) {
  var v = { untuk: D.to, dari: D.from, tanggal: D.date, inisial: D.ini };
  return String(t).replace(/\{(untuk|dari|tanggal|inisial)\}/g, function (_, k) { return v[k]; });
}
function cssUrl(src) { return "url('" + esc(String(src).replace(/'/g, '%27')) + "')"; }

/* ---------- util ---------- */
function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function short(t, n) { return t.length > n ? t.slice(0, n - 1).trim() + '…' : t; }
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
var toastTimer;
function toast(msg) {
  var t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2200);
}

/* ---------- bintang origami ---------- */
function starPts(cx, cy, ro, ri) {
  var o = [], i = [];
  for (var k = 0; k < 5; k++) {
    var a = (-90 + 72 * k) * Math.PI / 180, b = (-54 + 72 * k) * Math.PI / 180;
    o.push([cx + ro * Math.cos(a), cy + ro * Math.sin(a)]);
    i.push([cx + ri * Math.cos(b), cy + ri * Math.sin(b)]);
  }
  return { o: o, i: i };
}
(function buildSymbols() {
  var p = starPts(50, 53, 46, 24), cx = 50, cy = 53, h = '';
  KEYS.forEach(function (k) {
    var outline = [];
    for (var n = 0; n < 5; n++) { outline.push(p.o[n].join(',')); outline.push(p.i[n].join(',')); }
    var s = '<symbol id="st-' + k + '" viewBox="0 0 100 100"><polygon points="' + outline.join(' ') + '" fill="' + COLORS[k] + '" stroke="' + COLORS[k] + '" stroke-width="5" stroke-linejoin="round"/>';
    for (var m = 0; m < 5; m++) {
      var prev = p.i[(m + 4) % 5], cur = p.i[m], out = p.o[m];
      s += '<polygon points="' + cx + ',' + cy + ' ' + out.join(',') + ' ' + prev.join(',') + '" fill="rgba(255,255,255,.38)"/>';
      s += '<polygon points="' + cx + ',' + cy + ' ' + out.join(',') + ' ' + cur.join(',') + '" fill="rgba(40,20,80,.16)"/>';
    }
    h += s + '</symbol>';
  });
  $('#defs').innerHTML = h;
})();
function starSvg(k) { return '<use href="#st-' + k + '"/>'; }
function starKey(i) { return KEYS[(i * 5 + 2) % KEYS.length]; }

/* ---------- langit berbintang ---------- */
(function sky() {
  var c = $('#sky'), x = c.getContext('2d'), S = [], w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function size() {
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    S = []; var n = Math.round(innerWidth * innerHeight / 5200);
    for (var i = 0; i < n; i++) S.push({ x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.1 + .3) * dpr, p: Math.random() * 6.28, s: Math.random() * .02 + .005 });
    draw(0);
  }
  function draw(t) {
    x.clearRect(0, 0, w, h);
    for (var i = 0; i < S.length; i++) {
      var s = S[i], a = REDUCED ? .6 : .35 + .45 * Math.sin(s.p + t * s.s * .06);
      x.globalAlpha = Math.max(.1, a); x.fillStyle = '#fff'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
    }
    if (!REDUCED) requestAnimationFrame(draw);
  }
  addEventListener('resize', size); size();
})();

/* ---------- suara ---------- */
var ac = null, muted = false;
function chime(i) {
  if (muted) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    var f = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66][i % 7], t = ac.currentTime;
    [1, 2, 3].forEach(function (m, j) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.11 / (j * 1.6 + 1), t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.8);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 1.9);
    });
  } catch (e) { /* suara opsional */ }
}
$('#b-snd').addEventListener('click', function () {
  muted = !muted; this.textContent = 'Suara: ' + (muted ? 'mati' : 'nyala'); this.setAttribute('aria-pressed', String(muted));
});

/* ---------- konfeti ---------- */
function confetti() {
  if (REDUCED) return;
  var c = $('#fx'), x = c.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  var cols = KEYS.map(function (k) { return COLORS[k]; }), P = [];
  for (var i = 0; i < 110; i++) {
    var a = Math.random() * 6.283, v = (Math.random() * 9 + 4) * dpr;
    P.push({ x: c.width / 2, y: c.height * .42, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5 * dpr, w: (Math.random() * 6 + 4) * dpr, h: (Math.random() * 10 + 5) * dpr, r: Math.random() * 6, vr: Math.random() * .4 - .2, c: cols[i % cols.length] });
  }
  var t0 = performance.now();
  (function f(t) {
    var dt = t - t0; x.clearRect(0, 0, c.width, c.height);
    P.forEach(function (p) {
      p.vy += .28 * dpr; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.globalAlpha = Math.max(0, 1 - dt / 2800); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore();
    });
    if (dt < 2800) requestAnimationFrame(f); else x.clearRect(0, 0, c.width, c.height);
  })(t0);
}

/* ---------- adegan ---------- */
var cur = 'intro';
function go(id) {
  cur = id;
  document.querySelectorAll('.scene').forEach(function (s) { s.classList.toggle('on', s.id === 's-' + id); });
  if (id === 'const') startConst();
  if (id === 'sheet') renderSheet();
  if (id === 'gallery') renderGallery();
  var el = $('#s-' + id); if (el) el.scrollTop = 0;
}

/* ---------- toples ---------- */
var SPOTS = [[30, 46], [64, 42], [48, 56], [24, 68], [72, 66], [40, 78], [62, 80]];
var opened = new Set(), finished = false;
function buildJar() {
  var r = rng(7), fill = $('#fill'), h = '', n = 0, guard = 0;
  while (n < 170 && guard++ < 4000) {
    var x = r() * 92 + 4, y = r() * 66 + 30, dx = x - 50, dy = y - 50;
    if (dx * dx + dy * dy > 46 * 46) continue;
    var sz = 10 + r() * 4;
    h += '<svg viewBox="0 0 100 100" style="left:' + (x - sz / 2).toFixed(1) + '%;top:' + (y - sz / 2).toFixed(1) + '%;width:' + sz.toFixed(1) + '%;transform:rotate(' + Math.round(r() * 140 - 70) + 'deg)">' + starSvg(KEYS[n % KEYS.length]) + '</svg>';
    n++;
  }
  for (var i = 0; i < 7; i++) {
    var k = starKey(i);
    h += '<button class="sp" type="button" data-i="' + i + '" aria-label="Buka bintang ' + (i + 1) + '" style="left:' + SPOTS[i][0] + '%;top:' + SPOTS[i][1] + '%;--c:' + COLORS[k] + ';--d:' + (i * .35) + 's;--r:' + ((i % 2 ? 1 : -1) * (8 + i * 3)) + 'deg"><svg viewBox="0 0 100 100">' + starSvg(k) + '</svg></button>';
  }
  fill.innerHTML = h;
  var L = '';
  for (var j = 0; j < 14; j++) { var px = j / 13 * 100, py = Math.sin(j / 13 * Math.PI) * 22; L += '<i style="left:' + px + '%;top:' + (py - 10).toFixed(1) + 'px;animation-delay:' + (j % 5 * .45) + 's"></i>'; }
  $('#lights').innerHTML = L;
  var d = ''; for (var m = 0; m < 7; m++) d += '<b></b>';
  $('#dots').innerHTML = d;
  updateCount();
}
function updateCount() {
  document.querySelectorAll('#dots b').forEach(function (b, i) { b.classList.toggle('on', opened.has(i)); });
  document.querySelectorAll('.sp').forEach(function (s) { s.classList.toggle('done', opened.has(+s.dataset.i)); });
  $('#t-count').textContent = opened.size === 0 ? 'Ketuk bintang yang bersinar' : opened.size + ' dari 7 bintang terbuka';
}
$('#fill').addEventListener('click', function (e) {
  var b = e.target.closest('.sp'); if (!b) return;
  openStar(+b.dataset.i);
});
var curStar = 0;
function openStar(i) {
  curStar = i; chime(i);
  $('#c-star').innerHTML = starSvg(starKey(i));
  $('#c-kick').textContent = 'Bintang ' + (i + 1) + ' dari 7';
  $('#c-msg').textContent = D.msgs[i] || '';
  var last = !opened.has(i) && opened.size === 6;
  $('#c-next').textContent = last ? 'Lihat bintang-bintang' : 'Simpan di toples';
  $('#card').hidden = false; $('#c-next').focus();
}
$('#c-next').addEventListener('click', function () {
  $('#card').hidden = true;
  opened.add(curStar); updateCount();
  if (opened.size === 7 && !finished) { finished = true; setTimeout(function () { go('const'); }, 700); }
});

/* ---------- rasi bintang ---------- */
function buildConst() {
  var pts = [], i;
  for (i = 0; i < 14; i++) {
    var t = Math.PI * 2 * i / 14 + Math.PI / 14;
    pts.push([150 + 8 * 16 * Math.pow(Math.sin(t), 3), 150 - 8 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
  }
  var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z';
  var s = '<path class="ln" pathLength="1" d="' + d + '"/>', r = rng(21);
  for (i = 0; i < 34; i++) s += '<circle class="mini" cx="' + (r() * 300).toFixed(0) + '" cy="' + (r() * 340).toFixed(0) + '" r="' + (r() * 1.1 + .3).toFixed(1) + '"/>';
  for (i = 0; i < 14; i += 2) {
    var p = pts[i], x = p[0].toFixed(1), y = p[1], f = function (v) { return v.toFixed(1); };
    s += '<path class="nd" style="animation-delay:' + (i * .28) + 's,' + (i * .28 + 1) + 's" d="M' + x + ' ' + f(y - 7) + ' Q' + x + ' ' + f(y) + ' ' + f(p[0] + 7) + ' ' + f(y) + ' Q' + x + ' ' + f(y) + ' ' + x + ' ' + f(y + 7) + ' Q' + x + ' ' + f(y) + ' ' + f(p[0] - 7) + ' ' + f(y) + ' Q' + x + ' ' + f(y) + ' ' + x + ' ' + f(y - 7) + 'Z"/>';
  }
  for (i = 1; i < 14; i += 2) { var q = pts[i]; s += '<circle class="nd" style="animation-delay:' + (i * .28) + 's,' + (i * .28 + 1) + 's" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="2.3"/>'; }
  s += '<text x="150" y="168">' + esc(D.ini) + '</text>';
  $('#constel').innerHTML = s;
}
var constTimer = null;
function startConst() {
  buildConst();
  var c = $('#constel'), b = $('#b-const');
  c.classList.remove('go'); b.classList.remove('on');
  void c.getBoundingClientRect();
  c.classList.add('go');
  clearTimeout(constTimer);
  constTimer = setTimeout(function () { b.classList.add('on'); chime(6); }, REDUCED ? 200 : 5200);
}
$('#b-const').addEventListener('click', function () {
  $('#t-to').textContent = fill(D.words.judul);
  $('#t-from').textContent = fill(D.words.subjudul);
  var close = $('#t-close'); close.textContent = fill(D.words.penutup); close.hidden = !D.words.penutup.trim();
  go('title');
});
$('#b-sheet').addEventListener('click', function () { go('sheet'); });

/* ---------- lembar kenangan ---------- */
var STK = [
  { id: 'ini',   k: 'pink',   x: 64, y: 20, r: 6 },
  { id: 'seven', k: 'butter', x: 4,  y: 41, r: -6 },
  { id: 'star',  k: 'lav',    x: 80, y: 42, r: 9 },
  { id: 'heart', k: 'peach',  x: 5,  y: 2,  r: -10 },
  { id: 'date',  k: 'mint',   x: 5,  y: 81, r: -3 },
  { id: 'hati',  k: 'sky',    x: 60, y: 81, r: 5 }
];
function stkLabel(s) { return { ini: D.ini, seven: '7 bintang', star: '★', heart: '♥', date: D.date, hati: D.words.stikerHati }[s.id]; }
var placed = new Set();
var ROT = [-2.6, 2.2, 1.8, -2.2];
function renderSheet() {
  var h = '<h2>' + esc(fill(D.words.judul)) + '</h2><p class="by">' + esc(fill(D.words.subjudul)) + '</p><div class="polas">';
  for (var i = 0; i < 4; i++) {
    var inner = D.photos[i]
      ? '<div class="ph" style="background-image:' + cssUrl(D.photos[i].src) + '"></div>'
      : '<div class="note" style="background:' + COLORS[starKey(i)] + '"><span>' + esc(short(D.msgs[i] || '', 80)) + '</span></div>';
    h += '<figure class="pola" style="--r:' + ROT[i] + 'deg">' + inner + '<figcaption>' + esc((D.photos[i] && D.photos[i].cap) || 'Bintang ' + (i + 1)) + '</figcaption></figure>';
  }
  h += '</div>';
  STK.forEach(function (s) {
    if (placed.has(s.id)) h += '<span class="stk" style="left:' + s.x + '%;top:' + s.y + '%;--r:' + s.r + 'deg;background:' + COLORS[s.k] + '">' + esc(stkLabel(s)) + '</span>';
  });
  $('#paper').innerHTML = h;
  $('#gal-row').hidden = !D.photos.length;
  var t = '';
  STK.forEach(function (s) { t += '<button type="button" class="chip' + (placed.has(s.id) ? ' placed' : '') + '" data-id="' + s.id + '" style="background:' + COLORS[s.k] + '">' + esc(stkLabel(s)) + '</button>'; });
  $('#tray').innerHTML = t;
  var left = STK.length - placed.size;
  $('#t-status').textContent = left ? left + ' stiker lagi · ketuk stiker di bawah' : 'Semua stiker sudah menempel';
}
$('#tray').addEventListener('click', function (e) {
  var b = e.target.closest('.chip'); if (!b) return;
  var id = b.dataset.id; placed.has(id) ? placed.delete(id) : placed.add(id);
  chime(placed.size); renderSheet();
});
$('#b-all').addEventListener('click', function () {
  if (placed.size === STK.length) placed.clear(); else STK.forEach(function (s) { placed.add(s.id); });
  renderSheet();
});
$('#b-again').addEventListener('click', function () { resetProgress(); go('intro'); });

/* ---------- galeri foto kenangan ---------- */
var galIdx = 0;
function galStep() {
  var c = $('#gal').querySelector('.gcard');
  return c ? c.offsetWidth + 16 : 1;
}
function galDots() {
  var n = D.photos.length;
  document.querySelectorAll('#gal-dots b').forEach(function (b, i) { b.classList.toggle('on', i === galIdx); });
  $('#gal-status').textContent = n ? (galIdx + 1) + ' dari ' + n + ' foto' : '';
  var cap = D.photos[galIdx] && D.photos[galIdx].cap;
  $('#gal').setAttribute('aria-label', 'Galeri foto, ' + (galIdx + 1) + ' dari ' + n + (cap ? ': ' + cap : ''));
}
function renderGallery() {
  var g = $('#gal'), h = '', d = '';
  D.photos.forEach(function (p, i) {
    h += '<figure class="gcard" style="--r:' + (i % 2 ? 1.6 : -1.6) + 'deg"><img src="' + esc(p.src) + '" alt="' + esc(p.cap || 'Foto kenangan ' + (i + 1)) + '" draggable="false"' + (i > 1 ? ' loading="lazy"' : '') + '><figcaption>' + esc(p.cap) + '</figcaption></figure>';
    d += '<b></b>';
  });
  g.innerHTML = h; $('#gal-dots').innerHTML = d;
  g.scrollLeft = 0; galIdx = 0; galDots();
}
$('#gal').addEventListener('scroll', function () {
  var i = Math.max(0, Math.min(D.photos.length - 1, Math.round(this.scrollLeft / galStep())));
  if (i !== galIdx) { galIdx = i; galDots(); }
});
$('#gal-prev').addEventListener('click', function () { $('#gal').scrollBy({ left: -galStep(), behavior: REDUCED ? 'auto' : 'smooth' }); });
$('#gal-next').addEventListener('click', function () { $('#gal').scrollBy({ left: galStep(), behavior: REDUCED ? 'auto' : 'smooth' }); });
$('#gal').addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight') { e.preventDefault(); $('#gal-next').click(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); $('#gal-prev').click(); }
});
$('#b-gal').addEventListener('click', function () { go('gallery'); });
$('#gal-back').addEventListener('click', function () { go('sheet'); });

/* ---------- simpan gambar ---------- */
function loadImg(src) { return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src; }); }
function wrap(x, text, maxW, font) {
  x.font = font; var words = text.split(' '), lines = [], line = '';
  words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line); return lines;
}
function rrect(x, px, py, w, h, r) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }
async function exportPng(skipPhotos) {
  try { await Promise.all([document.fonts.load('600 80px "Cormorant Garamond"'), document.fonts.load('italic 600 38px "Cormorant Garamond"'), document.fonts.load('600 44px Caveat'), document.fonts.load('600 30px "Plus Jakarta Sans"')]); } catch (e) { /* pakai font cadangan */ }
  var W = 1080, H = 1500, c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
  x.fillStyle = '#fbf6ec'; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(43,37,64,.09)';
  for (var gx = 14; gx < W; gx += 28) for (var gy = 14; gy < H; gy += 28) { x.beginPath(); x.arc(gx, gy, 1.6, 0, 6.283); x.fill(); }
  x.textAlign = 'center'; x.fillStyle = '#2b2540';
  x.font = '600 92px "Cormorant Garamond",Georgia,serif'; x.fillText(fill(D.words.judul), W / 2, 160);
  x.fillStyle = '#7a7390'; x.font = '500 30px "Plus Jakarta Sans",system-ui,sans-serif'; x.fillText(fill(D.words.subjudul), W / 2, 220);
  var imgs = await Promise.all([0, 1, 2, 3].map(function (i) { return D.photos[i] && skipPhotos !== true ? loadImg(D.photos[i].src) : Promise.resolve(null); }));
  for (var i = 0; i < 4; i++) {
    var cx = 70 + (i % 2) * 500 + 220, cy = 290 + Math.floor(i / 2) * 590 + 270;
    x.save(); x.translate(cx, cy); x.rotate(ROT[i] * Math.PI / 180);
    x.shadowColor = 'rgba(30,20,60,.35)'; x.shadowBlur = 30; x.shadowOffsetY = 14; x.fillStyle = '#fff'; x.fillRect(-220, -270, 440, 540);
    x.shadowColor = 'transparent';
    var ix = -200, iy = -250, is = 400;
    if (imgs[i]) {
      var im = imgs[i], s = Math.max(is / im.width, is / im.height), sw = is / s, sh = is / s;
      x.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, ix, iy, is, is);
    } else {
      x.fillStyle = COLORS[starKey(i)]; x.fillRect(ix, iy, is, is);
      x.fillStyle = '#2b2540'; x.textAlign = 'center';
      var L = wrap(x, short(D.msgs[i] || '', 110), 340, 'italic 600 38px "Cormorant Garamond",Georgia,serif');
      var lh = 46, top = iy + is / 2 - (L.length * lh) / 2 + lh * .75;
      L.slice(0, 7).forEach(function (l, j) { x.fillText(l, 0, top + j * lh); });
    }
    x.fillStyle = '#2b2540'; x.textAlign = 'center'; x.font = '600 50px Caveat,"Segoe Script",cursive'; x.fillText((D.photos[i] && D.photos[i].cap) || 'Bintang ' + (i + 1), 0, 225);
    x.restore();
  }
  STK.forEach(function (s) {
    if (!placed.has(s.id)) return;
    var label = stkLabel(s); x.font = '600 34px "Plus Jakarta Sans",system-ui,sans-serif';
    var w = x.measureText(label).width + 60, h = 70;
    x.save(); x.translate(s.x / 100 * W + w / 2, s.y / 100 * H + h / 2); x.rotate(s.r * Math.PI / 180);
    x.shadowColor = 'rgba(30,20,60,.35)'; x.shadowBlur = 14; x.shadowOffsetY = 6;
    x.fillStyle = COLORS[s.k]; rrect(x, -w / 2, -h / 2, w, h, 35); x.fill();
    x.shadowColor = 'transparent'; x.fillStyle = '#2b2540'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 0, 3);
    x.restore();
  });
  x.textBaseline = 'alphabetic'; x.textAlign = 'center'; x.fillStyle = 'rgba(43,37,64,.4)'; x.font = '600 26px "Plus Jakarta Sans",sans-serif'; x.fillText('Toples Bintang', W / 2, 1475);
  var url;
  try { url = c.toDataURL('image/png'); }
  catch (err) {
    /* foto dari folder tidak boleh dibaca canvas kalau halaman dibuka lewat file:// */
    if (skipPhotos !== true) { toast('Foto tidak ikut tersimpan di mode file. Pakai hosting untuk hasil lengkap.'); return exportPng(true); }
    toast('Gambar gagal dibuat.'); return;
  }
  $('#exp-img').src = url; $('#exp').hidden = false;
  try { var a = document.createElement('a'); a.href = url; a.download = 'lembar-kenangan.png'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { /* tampilan gambar sudah cukup */ }
}
$('#b-save').addEventListener('click', function () { exportPng(); });
$('#exp-close').addEventListener('click', function () { $('#exp').hidden = true; });

/* ---------- kado dibuka ---------- */
function resetGift() { $('#gift').classList.remove('open'); }
function resetProgress() { opened.clear(); finished = false; placed.clear(); updateCount(); resetGift(); }
$('#b-open').addEventListener('click', function () {
  var g = $('#gift'); if (g.classList.contains('open')) return;
  g.classList.add('open'); chime(2); confetti();
  setTimeout(function () { go('jar'); }, 1900);
});
function applyGift() {
  $('#t-intro').textContent = fill(D.words.buka);
  document.title = 'Kado untuk ' + D.to + ' · Toples Bintang';
  resetProgress();
}

/* ---------- bagikan: QR code ---------- */
var prevScene = 'intro';
function shareLink() {
  return D.shareUrl || location.href.split('#')[0].split('?')[0];
}
function copyText(text) {
  function fallback() {
    var t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;top:0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); toast('Tautan disalin'); } catch (e) { toast('Salin manual dari kolom tautan'); }
    t.remove();
  }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast('Tautan disalin'); }, fallback);
  else fallback();
}
function openShare() {
  if (cur !== 'share') prevScene = cur;
  var url = shareLink(), note = $('#sh-note');
  $('#sh-url').value = url;
  $('#qr-cap').textContent = fill(D.words.judul);
  try { $('#qr').innerHTML = QR.svg(url); }
  catch (e) { $('#qr').innerHTML = '<p class="hint">Tautan terlalu panjang untuk dibuat jadi QR code.</p>'; }
  if (/^file:/.test(url)) {
    note.textContent = 'Halaman ini dibuka dari komputer, jadi tautannya hanya berlaku di sini. Unggah foldernya ke hosting supaya QR code bisa dipindai dari HP.';
    note.hidden = false;
  } else { note.hidden = true; }
  go('share');
}
$('#b-share').addEventListener('click', openShare);
$('#sh-back').addEventListener('click', function () { go(prevScene); });
$('#sh-copy').addEventListener('click', function () { copyText($('#sh-url').value); });
$('#sh-url').addEventListener('focus', function () { this.select(); });

/* ---------- editor (mode ?edit=1) ---------- */
var draftPhotos = [];
function openEditor() {
  draftPhotos = D.photos.map(function (p) { return { src: p.src, cap: p.cap }; });
  while (draftPhotos.length < MAX_PHOTOS) draftPhotos.push(null);
  $('#f-to').value = D.to; $('#f-from').value = D.from; $('#f-ini').value = D.ini; $('#f-date').value = D.date;
  $('#f-close').value = D.words.penutup;
  var m = '';
  for (var i = 0; i < 7; i++) m += '<div class="fld"><label for="f-m' + i + '">Pesan bintang ' + (i + 1) + '</label><textarea id="f-m' + i + '" maxlength="180" required>' + esc(D.msgs[i] || '') + '</textarea></div>';
  $('#f-msgs').innerHTML = m;
  drawSlots();
  $('#editor').hidden = false; $('#f-to').focus();
}
function drawSlots() {
  var h = '';
  for (var i = 0; i < MAX_PHOTOS; i++) {
    var p = draftPhotos[i];
    h += '<div class="ph-item"><div class="ph-slot" style="' + (p ? 'background-image:' + cssUrl(p.src) : '') + '">' +
      (p ? '<button type="button" class="x" data-x="' + i + '" aria-label="Hapus foto ' + (i + 1) + '">&times;</button>'
         : '+<input type="file" accept="image/*" data-p="' + i + '" aria-label="Pilih foto ' + (i + 1) + '" id="f-p' + i + '">') + '</div>' +
      (p ? '<input type="text" class="ph-cap" data-c="' + i + '" maxlength="60" placeholder="Keterangan foto (opsional)" aria-label="Keterangan foto ' + (i + 1) + '" value="' + esc(p.cap || '') + '">'
         : '<span class="hint-empty">Foto ' + (i + 1) + ': ketuk kotak untuk memilih</span>') + '</div>';
  }
  $('#f-photos').innerHTML = h;
}
$('#f-photos').addEventListener('click', function (e) {
  var b = e.target.closest('.x'); if (!b) return;
  draftPhotos[+b.dataset.x] = null; drawSlots();
});
$('#f-photos').addEventListener('input', function (e) {
  var c = e.target.closest('.ph-cap'); if (!c) return;
  if (draftPhotos[+c.dataset.c]) draftPhotos[+c.dataset.c].cap = c.value;
});
$('#f-photos').addEventListener('change', function (e) {
  var inp = e.target; if (!inp.files || !inp.files[0] || inp.dataset.p == null) return;
  var idx = +inp.dataset.p, fr = new FileReader();
  fr.onload = function () {
    var im = new Image();
    im.onload = function () {
      var m = 1100, s = Math.min(1, m / Math.max(im.width, im.height)), cv = document.createElement('canvas');
      cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      draftPhotos[idx] = { src: cv.toDataURL('image/jpeg', .8), cap: '' }; drawSlots();
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(inp.files[0]);
});
$('#e-cancel').addEventListener('click', function () { $('#editor').hidden = true; });
$('#b-edit').addEventListener('click', openEditor);
$('#form').addEventListener('submit', function (e) {
  e.preventDefault();
  var to = $('#f-to').value.trim(), from = $('#f-from').value.trim();
  var words = Object.assign({}, D.words, { penutup: $('#f-close').value.trim() });
  D = {
    to: to, from: from,
    ini: $('#f-ini').value.trim() || (from.charAt(0) + ' & ' + to.charAt(0)).toUpperCase(),
    date: $('#f-date').value.trim() || TODAY,
    msgs: [], photos: draftPhotos.filter(Boolean), shareUrl: D.shareUrl || '', words: words
  };
  for (var i = 0; i < 7; i++) D.msgs.push($('#f-m' + i).value.trim());
  saveDraft();
  $('#editor').hidden = true;
  applyGift(); go('intro');
  toast('Tersimpan. Klik "Unduh kado.js" kalau sudah pas.');
});

/* unduh kado.js: file inilah yang menggantikan isi contoh */
$('#b-dl').addEventListener('click', function () {
  var text = '/* Dibuat dengan Toples Bintang pada ' + new Date().toISOString().slice(0, 10) + '. Timpa file kado.js lama dengan file ini. */\n' +
    'window.KADO = ' + JSON.stringify(kadoObject(), null, 2) + ';\n';
  try {
    var url = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
    var a = document.createElement('a'); a.href = url; a.download = 'kado.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast('kado.js diunduh. Timpa file kado.js di folder.');
  } catch (err) { toast('Unduhan gagal. Coba browser lain.'); }
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  ['card', 'editor', 'exp'].forEach(function (id) { $('#' + id).hidden = true; });
});

/* ---------- mulai ---------- */
buildJar();
applyGift();
if (EDIT) {
  $('#b-edit').hidden = false; $('#b-dl').hidden = false;
  if (!loadDraft()) openEditor();
}
})();
