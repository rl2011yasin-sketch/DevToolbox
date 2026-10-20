(function () {
  'use strict';

  var SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  function rnd(max) {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  }

  function gen(length, opts) {
    var pool = '', req = [];
    if (opts.lower)   { pool += SETS.lower;   req.push(SETS.lower); }
    if (opts.upper)   { pool += SETS.upper;   req.push(SETS.upper); }
    if (opts.numbers) { pool += SETS.numbers; req.push(SETS.numbers); }
    if (opts.symbols) { pool += SETS.symbols; req.push(SETS.symbols); }
    if (!pool) return '';
    var chars = req.map(function (s) { return s[rnd(s.length)]; });
    while (chars.length < length) chars.push(pool[rnd(pool.length)]);
    for (var i = chars.length - 1; i > 0; i--) {
      var j = rnd(i + 1);
      var tmp = chars[i]; chars[i] = chars[j]; chars[j] = tmp;
    }
    return chars.join('');
  }

  function strength(pw, poolSize) {
    if (!pw || !poolSize) return { s: 0, l: '—', c: 'var(--sideFgDim)' };
    var e = pw.length * Math.log2(poolSize);
    if (e < 40) return { s: 25, l: 'Weak', c: 'var(--danger)' };
    if (e < 60) return { s: 50, l: 'Fair', c: 'var(--warn)' };
    if (e < 80) return { s: 75, l: 'Strong', c: 'var(--success)' };
    return { s: 100, l: 'Very strong', c: 'var(--success)' };
  }

  window.DT.register('password', {
    render: function (c) {
      c.innerHTML =
        '<header class="tool-header"><h2>🔐 Password Generator</h2>' +
        '<p>Cryptographically secure passwords generated entirely in your browser.</p></header>' +
        '<div class="card">' +
          '<div class="output-row">' +
            '<input type="text" id="pw-out" class="output-field" readonly placeholder="Click Generate" />' +
            '<button class="btn btn-secondary" id="pw-copy">📋 Copy</button>' +
          '</div>' +
          '<div class="strength-meter"><div id="strength-fill"></div></div>' +
          '<p class="strength-text" id="strength-text">—</p>' +
          '<div class="field" style="margin-top:18px">' +
            '<label>Length: <strong id="len-val">20</strong></label>' +
            '<input type="range" id="len" min="4" max="64" value="20" style="accent-color:var(--accent)" />' +
          '</div>' +
          '<div class="options-grid">' +
            '<label class="option"><input type="checkbox" id="opt-lower" checked /> Lowercase</label>' +
            '<label class="option"><input type="checkbox" id="opt-upper" checked /> Uppercase</label>' +
            '<label class="option"><input type="checkbox" id="opt-numbers" checked /> Numbers</label>' +
            '<label class="option"><input type="checkbox" id="opt-symbols" checked /> Symbols</label>' +
          '</div>' +
          '<button class="btn btn-primary" id="pw-gen" style="width:100%">⚡ Generate Password</button>' +
        '</div>';

      var $ = function (s) { return c.querySelector(s); };
      var out = $('#pw-out'), fill = $('#strength-fill'), sText = $('#strength-text'), len = $('#len');

      function opts() {
        return {
          lower: $('#opt-lower').checked,
          upper: $('#opt-upper').checked,
          numbers: $('#opt-numbers').checked,
          symbols: $('#opt-symbols').checked
        };
      }
      function poolSize() {
        var o = opts();
        return (o.lower ? 26 : 0) + (o.upper ? 26 : 0) + (o.numbers ? 10 : 0) + (o.symbols ? SETS.symbols.length : 0);
      }
      function update() {
        var st = strength(out.value, poolSize());
        fill.style.width = st.s + '%';
        fill.style.background = st.c;
        sText.innerHTML = st.l === '—' ? '—' :
          'Strength: <strong style="color:' + st.c + '">' + st.l + '</strong>';
      }
      function generate() {
        if (!poolSize()) { window.DT.toast('Select at least one character set', 'error'); return; }
        out.value = gen(parseInt(len.value, 10), opts());
        update();
        window.DT.log('Generated password (' + len.value + ' chars, pool: ' + poolSize() + ')', 'success');
      }

      len.addEventListener('input', function () { $('#len-val').textContent = len.value; });
      $('#pw-gen').addEventListener('click', generate);
      $('#pw-copy').addEventListener('click', function () {
        if (!out.value) return window.DT.toast('Generate a password first', 'error');
        window.DT.copy(out.value);
      });
      generate();
    }
  });
})();
