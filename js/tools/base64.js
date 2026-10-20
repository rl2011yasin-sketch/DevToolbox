import { copyText, log } from '../utils.js';

function encode(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
function decode(s) {
  const bin = atob(s.trim());
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function render(c) {
  c.innerHTML = `
    <header class="tool-header">
      <h2>🔤 Base64 Encoder / Decoder</h2>
      <p>Convert text to Base64 and back. UTF-8 safe.</p>
    </header>
    <div class="card">
      <div class="field">
        <label>Input</label>
        <textarea id="b-in" placeholder="Enter text or Base64…"></textarea>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="b-enc">Encode →</button>
        <button class="btn btn-secondary" id="b-dec">← Decode</button>
        <button class="btn btn-secondary" id="b-copy">📋 Copy</button>
        <button class="btn btn-secondary" id="b-clear">🗑️ Clear</button>
      </div>
      <div class="field" style="margin-top:14px">
        <label>Result</label>
        <textarea id="b-out" readonly></textarea>
      </div>
      <p id="b-err" style="color:var(--danger);font-size:12px;margin-top:6px"></p>
    </div>
  `;

  const input = c.querySelector('#b-in');
  const out = c.querySelector('#b-out');
  const err = c.querySelector('#b-err');

  c.querySelector('#b-enc').addEventListener('click', () => {
    err.textContent = '';
    try { out.value = encode(input.value); log('Base64 encoded', 'success'); }
    catch (e) { err.textContent = e.message; }
  });
  c.querySelector('#b-dec').addEventListener('click', () => {
    err.textContent = '';
    try { out.value = decode(input.value); log('Base64 decoded', 'success'); }
    catch { err.textContent = 'Invalid Base64 input'; log('Base64 decode failed', 'error'); }
  });
  c.querySelector('#b-copy').addEventListener('click', () => { if (out.value) copyText(out.value); });
  c.querySelector('#b-clear').addEventListener('click', () => { input.value = ''; out.value = ''; err.textContent = ''; });
}