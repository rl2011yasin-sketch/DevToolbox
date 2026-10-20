import { showToast, log } from '../utils.js';

let QR = null;
async function lib() {
  if (QR) return QR;
  const mod = await import('https://esm.sh/qrcode@1.5.3');
  QR = mod.default || mod;
  return QR;
}

export function render(c) {
  c.innerHTML = `
    <header class="tool-header">
      <h2>📱 QR Code Generator</h2>
      <p>Turn any text or URL into a downloadable QR code.</p>
    </header>

    <div class="card">
      <div class="field">
        <label>Text or URL</label>
        <input type="text" id="qr-text" value="https://github.com" />
      </div>
      <div class="field">
        <label>Size: <strong id="size-val">300</strong>px</label>
        <input type="range" id="qr-size" min="150" max="600" step="50" value="300" style="accent-color:var(--accent)" />
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="qr-gen">✨ Generate</button>
        <button class="btn btn-secondary" id="qr-dl">⬇️ Download PNG</button>
      </div>
      <div class="qr-wrap">
        <canvas id="qr-canvas" class="qr-canvas" width="300" height="300"></canvas>
      </div>
    </div>
  `;

  const $ = (s) => c.querySelector(s);
  const text = $('#qr-text');
  const size = $('#qr-size');
  const canvas = $('#qr-canvas');

  size.addEventListener('input', () => { $('#size-val').textContent = size.value; generate(); });

  async function generate() {
    if (!text.value.trim()) return;
    try {
      const Q = await lib();
      await Q.toCanvas(canvas, text.value, {
        width: parseInt(size.value),
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
    } catch (e) {
      console.error(e);
      showToast('Failed to generate QR', 'error');
    }
  }

  $('#qr-gen').addEventListener('click', () => { generate(); log('QR code generated', 'success'); });
  $('#qr-dl').addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = 'qrcode.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    log('QR code downloaded', 'success');
  });
  text.addEventListener('input', generate);
  generate();
}