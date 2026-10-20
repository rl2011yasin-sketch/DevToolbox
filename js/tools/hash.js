import { copyText, log } from '../utils.js';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

async function digest(algo, text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function render(c) {
  c.innerHTML = `
    <header class="tool-header">
      <h2>#️⃣ Hash Generator</h2>
      <p>Generate SHA hashes using Web Crypto API.</p>
    </header>
    <div class="card">
      <div class="field">
        <label>Input text</label>
        <textarea id="h-in" placeholder="Enter text to hash…"></textarea>
      </div>
      <div id="h-res" style="margin-top:14px"></div>
    </div>
  `;

  const input = c.querySelector('#h-in');
  const results = c.querySelector('#h-res');

  async function update() {
    results.innerHTML = '';
    const text = input.value;
    if (!text) return;
    for (const algo of ALGOS) {
      const hash = await digest(algo, text);
      const row = document.createElement('div');
      row.className = 'hash-row';
      row.innerHTML = `
        <div class="hash-label">${algo}</div>
        <div class="hash-value">${hash}</div>
        <button class="icon-btn" title="Copy">📋</button>
      `;
      row.querySelector('button').addEventListener('click', () => copyText(hash));
      results.appendChild(row);
    }
  }
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { update(); log('Hashes recalculated', 'dim'); }, 250);
  });
}