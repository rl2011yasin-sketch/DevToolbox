import { copyText, showToast, log } from '../utils.js';

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function rnd(max) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function gen(length, opts) {
  let pool = '', req = [];
  if (opts.lower)   { pool += SETS.lower;   req.push(SETS.lower); }
  if (opts.upper)   { pool += SETS.upper;   req.push(SETS.upper); }
  if (opts.numbers) { pool += SETS.numbers; req.push(SETS.numbers); }
  if (opts.symbols) { pool += SETS.symbols; req.push(SETS.symbols); }
  if (!pool) return '';
  const chars = req.map((s) => s[rnd(s.length)]);
  while (chars.length < length) chars.push(pool[rnd(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function strength(pw, poolSize) {
  if (!pw || !poolSize) return { s: 0, l: '—', c: 'var(--sideFgDim)' };
  const e = pw.length * Math.log2(poolSize);
  if (e < 40) return { s: 25, l: 'Weak', c: 'var(--danger)' };
  if (e < 60) return { s: 50, l: 'Fair', c: 'var(--warn)' };
  if (e < 80) return { s: 75, l: 'Strong', c: 'var(--success)' };
  return { s: 100, l: 'Very strong', c: 'var(--success)' };
}

export function render(c) {
  c.innerHTML = `
    <header class="tool-header">
      <h2>🔐 Password Generator</h2>
      <p>Cryptographically secure passwords generated entirely in your browser.</p>
    </header>

    <div class="card">
      <div class="output-row">
        <input type="text" id="pw-out" class="output-field" readonly placeholder="Click Generate" />
        <button class="btn btn-secondary" id="pw-copy">📋 Copy</button>
      </div>
      <div class="strength-meter"><div id="strength-fill"></div></div>
      <p class="strength-text" id="strength-text">—</p>

      <div class="field" style="margin-top:18px">
        <label>Length: <strong id="len-val">20</strong></label>
        <input type="range" id="len" min="4" max="64" value="20" style="accent-color:var(--accent)" />
      </div>

      <div class="options-grid">
        <label class="option"><input type="checkbox" id="opt-lower" checked /> Lowercase</label>
        <label class="option"><input type="checkbox" id="opt-upper" checked /> Uppercase</label>
        <label class="option"><input type="checkbox" id="opt-numbers" checked /> Numbers</label>
        <label class="option"><input type="checkbox" id="opt-symbols" checked /> Symbols</label>
      </div>

      <button class="btn btn-primary" id="pw-gen" style="width:100%">⚡ Generate Password</button>
    </div>
  `;

  const $ = (s) => c.querySelector(s);
  const out = $('#pw-out');
  const fill = $('#strength-fill');
  const sText = $('#strength-text');
  const len = $('#len');

  const opts = () => ({
    lower: $('#opt-lower').checked,
    upper: $('#opt-upper').checked,
    numbers: $('#opt-numbers').checked,
    symbols: $('#opt-symbols').checked,
  });

  const poolSize = () => {
    const o = opts();
    return (o.lower ? 26 : 0) + (o.upper ? 26 : 0) + (o.numbers ? 10 : 0) + (o.symbols ? SETS.symbols.length : 0);
  };

  function update() {
    const st = strength(out.value, poolSize());
    fill.style.width = st.s + '%';
    fill.style.background = st.c;
    sText.innerHTML = st.l === '—' ? '—' : `Strength: <strong style="color:${st.c}">${st.l}</strong>`;
  }

  function generate() {
    if (!poolSize()) return showToast('Select at least one character set', 'error');
    out.value = gen(parseInt(len.value), opts());
    update();
    log(`Generated password (${len.value} chars, pool: ${poolSize()})`, 'success');
  }

  len.addEventListener('input', () => $('#len-val').textContent = len.value);
  $('#pw-gen').addEventListener('click', generate);
  $('#pw-copy').addEventListener('click', () => {
    if (!out.value) return showToast('Generate a password first', 'error');
    copyText(out.value);
  });

  generate();
}