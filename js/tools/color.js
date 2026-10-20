import { copyText, log } from '../utils.js';

function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function palette() {
  const base = Math.floor(Math.random() * 360);
  return Array.from({ length: 5 }, (_, i) => {
    const h = (base + i * 40 + Math.random() * 20) % 360;
    const s = 55 + Math.floor(Math.random() * 30);
    const l = 40 + Math.floor(Math.random() * 30);
    return hslToHex(h, s, l);
  });
}

export function render(c) {
  c.innerHTML = `
    <header class="tool-header">
      <h2>🎨 Color Palette Generator</h2>
      <p>Click any swatch to copy its HEX value.</p>
    </header>
    <div class="card">
      <div class="btn-row" style="margin-top:0">
        <button class="btn btn-primary" id="pal-gen">🎲 New Palette</button>
        <span style="align-self:center;color:var(--sideFgDim);font-size:12px">Press Space to regenerate</span>
      </div>
      <div class="palette" id="palette"></div>
    </div>
  `;

  const el = c.querySelector('#palette');
  function draw() {
    el.innerHTML = '';
    palette().forEach((color) => {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.background = color;
      const label = document.createElement('span');
      label.textContent = color.toUpperCase();
      sw.appendChild(label);
      sw.addEventListener('click', () => copyText(color));
      el.appendChild(sw);
    });
  }
  c.querySelector('#pal-gen').addEventListener('click', () => { draw(); log('New palette generated', 'success'); });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      draw();
    }
  });
  draw();
}