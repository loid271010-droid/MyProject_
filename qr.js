/* Pembuat QR code kecil tanpa library luar.
   Mode byte (UTF-8), koreksi galat level M, versi 1 sampai 10 (cukup untuk tautan sampai 213 byte).
   Pemakaian: QR.matrix('https://contoh.id') -> array 2D boolean, QR.svg(teks) -> string SVG. */
(function (w) {
  'use strict';

  var ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  var NUM_BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
  var MAX_VER = 10;

  function rawModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var n = Math.floor(ver / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (ver >= 7) r -= 36;
    }
    return r;
  }
  function dataCodewords(ver) {
    return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
  }

  function utf8(str) {
    var out = [], enc = unescape(encodeURIComponent(str));
    for (var i = 0; i < enc.length; i++) out.push(enc.charCodeAt(i));
    return out;
  }

  /* aritmetika GF(256) untuk Reed-Solomon */
  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
  function rsDivisor(degree) {
    var res = [], i, j;
    for (i = 0; i < degree - 1; i++) res.push(0);
    res.push(1);
    var root = 1;
    for (i = 0; i < degree; i++) {
      for (j = 0; j < res.length; j++) {
        res[j] = gfMul(res[j], root);
        if (j + 1 < res.length) res[j] ^= res[j + 1];
      }
      root = gfMul(root, 2);
    }
    return res;
  }
  function rsRemainder(data, divisor) {
    var res = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ res.shift();
      res.push(0);
      divisor.forEach(function (coef, i) { res[i] ^= gfMul(coef, factor); });
    });
    return res;
  }

  function bit(x, i) { return ((x >>> i) & 1) !== 0; }

  function alignPositions(ver) {
    if (ver === 1) return [];
    var n = Math.floor(ver / 7) + 2, size = ver * 4 + 17;
    var step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
    var res = [6];
    for (var pos = size - 7; res.length < n; pos -= step) res.splice(1, 0, pos);
    return res;
  }

  function matrix(text) {
    var bytes = utf8(text), ver, cap;
    for (ver = 1; ver <= MAX_VER; ver++) {
      cap = dataCodewords(ver);
      if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= cap * 8) break;
    }
    if (ver > MAX_VER) throw new Error('Teks terlalu panjang untuk QR.');

    /* 1. bit data */
    var bits = [];
    function push(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    push(4, 4);
    push(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { push(b, 8); });
    push(0, Math.min(4, cap * 8 - bits.length));
    push(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < cap * 8; pad ^= 0xEC ^ 0x11) push(pad, 8);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var v = 0;
      for (var k = 0; k < 8; k++) v = (v << 1) | bits[i + k];
      data.push(v);
    }

    /* 2. blok dan koreksi galat */
    var nb = NUM_BLOCKS[ver], eccLen = ECC_PER_BLOCK[ver];
    var raw = Math.floor(rawModules(ver) / 8);
    var shortCount = nb - raw % nb, shortLen = Math.floor(raw / nb);
    var blocks = [], div = rsDivisor(eccLen), off = 0;
    for (i = 0; i < nb; i++) {
      var dl = shortLen - eccLen + (i < shortCount ? 0 : 1);
      var dat = data.slice(off, off + dl); off += dl;
      var ecc = rsRemainder(dat, div);
      if (i < shortCount) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var all = [];
    for (i = 0; i < blocks[0].length; i++) {
      for (var j = 0; j < blocks.length; j++) {
        if (i !== shortLen - eccLen || j >= shortCount) all.push(blocks[j][i]);
      }
    }

    /* 3. susun matriks */
    var size = ver * 4 + 17, m = [], fn = [], y, x;
    for (y = 0; y < size; y++) { m.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    function setFn(px, py, dark) { m[py][px] = dark; fn[py][px] = true; }

    for (i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFn(xx, yy, d !== 2 && d !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var ap = alignPositions(ver), an = ap.length;
    for (i = 0; i < an; i++) for (j = 0; j < an; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === an - 1) || (i === an - 1 && j === 0)) continue;
      for (var ay = -2; ay <= 2; ay++) for (var ax = -2; ax <= 2; ax++) setFn(ap[i] + ax, ap[j] + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
    }
    function formatBits(mask) {
      var d = (0 << 3) | mask, rem = d; /* level M = 0 */
      for (var n = 0; n < 10; n++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var b = ((d << 10) | rem) ^ 0x5412, n2;
      for (n2 = 0; n2 <= 5; n2++) setFn(8, n2, bit(b, n2));
      setFn(8, 7, bit(b, 6)); setFn(8, 8, bit(b, 7)); setFn(7, 8, bit(b, 8));
      for (n2 = 9; n2 < 15; n2++) setFn(14 - n2, 8, bit(b, n2));
      for (n2 = 0; n2 < 8; n2++) setFn(size - 1 - n2, 8, bit(b, n2));
      for (n2 = 8; n2 < 15; n2++) setFn(8, size - 15 + n2, bit(b, n2));
      setFn(8, size - 8, true);
    }
    formatBits(0);
    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vb = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var c = bit(vb, i), a = size - 11 + i % 3, b2 = Math.floor(i / 3);
        setFn(a, b2, c); setFn(b2, a, c);
      }
    }

    /* 4. tempatkan codeword */
    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (j = 0; j < 2; j++) {
          x = right - j;
          var up = ((right + 1) & 2) === 0;
          y = up ? size - 1 - vert : vert;
          if (!fn[y][x] && idx < all.length * 8) { m[y][x] = bit(all[idx >>> 3], 7 - (idx & 7)); idx++; }
        }
      }
    }

    /* 5. pilih mask dengan penalti terendah */
    function applyMask(mask) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) {
        var inv;
        switch (mask) {
          case 0: inv = (xx + yy) % 2 === 0; break;
          case 1: inv = yy % 2 === 0; break;
          case 2: inv = xx % 3 === 0; break;
          case 3: inv = (xx + yy) % 3 === 0; break;
          case 4: inv = (Math.floor(xx / 3) + Math.floor(yy / 2)) % 2 === 0; break;
          case 5: inv = xx * yy % 2 + xx * yy % 3 === 0; break;
          case 6: inv = (xx * yy % 2 + xx * yy % 3) % 2 === 0; break;
          default: inv = ((xx + yy) % 2 + xx * yy % 3) % 2 === 0;
        }
        if (!fn[yy][xx] && inv) m[yy][xx] = !m[yy][xx];
      }
    }
    function penalty() {
      var p = 0, r, c, run, line;
      for (r = 0; r < size; r++) {
        run = 1;
        for (c = 1; c < size; c++) { if (m[r][c] === m[r][c - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; }
      }
      for (c = 0; c < size; c++) {
        run = 1;
        for (r = 1; r < size; r++) { if (m[r][c] === m[r - 1][c]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; }
      }
      for (r = 0; r < size - 1; r++) for (c = 0; c < size - 1; c++) {
        if (m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c] && m[r][c] === m[r + 1][c + 1]) p += 3;
      }
      var pat = '10111010000', pat2 = '00001011101';
      for (r = 0; r < size; r++) {
        line = m[r].map(function (v) { return v ? 1 : 0; }).join('');
        p += 40 * (count(line, pat) + count(line, pat2));
      }
      for (c = 0; c < size; c++) {
        line = ''; for (r = 0; r < size; r++) line += m[r][c] ? 1 : 0;
        p += 40 * (count(line, pat) + count(line, pat2));
      }
      var dark = 0; m.forEach(function (row) { row.forEach(function (v) { if (v) dark++; }); });
      var total = size * size;
      p += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10 ;
      return p;
    }
    function count(s, sub) { var n = 0, k = -1; while ((k = s.indexOf(sub, k + 1)) !== -1) n++; return n; }

    var best = 0, bestPen = Infinity;
    for (var mk = 0; mk < 8; mk++) {
      applyMask(mk); formatBits(mk);
      var pen = penalty();
      if (pen < bestPen) { bestPen = pen; best = mk; }
      applyMask(mk);
    }
    applyMask(best); formatBits(best);
    return m;
  }

  /* SVG: modul kotak saling menempel dengan sudut sedikit membulat. Dibuat tegas supaya mudah dipindai. */
  function svg(text, opts) {
    opts = opts || {};
    var ink = opts.ink || '#1f1b4d', bg = opts.bg || '#fbf6ec', quiet = 4;
    var m = matrix(text), n = m.length, full = n + quiet * 2;
    function inFinder(x, y) { return (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8); }
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + full + ' ' + full + '" shape-rendering="crispEdges" role="img" aria-label="QR code">';
    out += '<rect width="' + full + '" height="' + full + '" fill="' + bg + '"/>';
    var d = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      if (!m[y][x] || inFinder(x, y)) continue;
      d += 'M' + (x + quiet) + ' ' + (y + quiet) + 'h1v1h-1z';
    }
    out += '<path d="' + d + '" fill="' + ink + '"/>';
    /* tiga mata di pojok digambar sebagai kotak membulat bertingkat */
    [[0, 0], [n - 7, 0], [0, n - 7]].forEach(function (p) {
      var fx = p[0] + quiet, fy = p[1] + quiet;
      out += '<rect x="' + fx + '" y="' + fy + '" width="7" height="7" rx="0.4" fill="' + ink + '"/>';
      out += '<rect x="' + (fx + 1) + '" y="' + (fy + 1) + '" width="5" height="5" rx="0.3" fill="' + bg + '"/>';
      out += '<rect x="' + (fx + 2) + '" y="' + (fy + 2) + '" width="3" height="3" rx="0.3" fill="' + ink + '"/>';
    });
    return out + '</svg>';
  }

  w.QR = { matrix: matrix, svg: svg };
})(window);
