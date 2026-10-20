import { copyText } from '../utils.js';

const titleCase = (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
const sentence = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const camel = (s) => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toLowerCase());
const snake = (s) => s.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase();
const kebab = (s) => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
const alternating = (s) => [...s].map((ch, i) => (i % 2 ? ch.toUpperCase() : ch.toLowerCase())).join('');

export function render(c) {
  c.innerHTML = `
    <header class="tool-header">
      <h2>✍️ Text Tools</h2>
      <p>Convert case, count words, and clean up text — all offline.</p>
    </header>
    <div class="card">
      <div class="field">
        <label>Your text</label>
        <textarea id="txt" placeholder="Type or paste text here…"></textarea>
      </div>
      <div class="stats-grid">
        <div class="stat"><div class="stat-value" id="s-char">0</div><div class="stat-label">Characters</div></div>
        <div class="stat"><div class="stat-value" id="s-word">0</div><div class="stat-label">Words</div></div>
        <div class="stat"><div class="stat-value" id="s-line">0</div><div class="stat-label">Lines</div></div>
        <div class="stat"><div class="stat-value" id="s-sent">0</div><div class="stat-label">Sentences</div></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-secondary" data-fn="upper">UPPER</button>
        <button class="btn btn-secondary" data-fn="lower">lower</button>
        <button class="btn btn-secondary" data-fn="title">Title</button>
        <button class="btn btn-secondary" data-fn="sentence">Sentence</button>
        <button class="btn btn-secondary" data-fn="camel">camelCase</button>
        <button class="btn btn-secondary" data-fn="snake">snake_case</button>
        <button class="btn btn-secondary" data-fn="kebab">kebab-case</button>
        <button class="btn btn-secondary" data-fn="alternating">aLtErNaTiNg</button>
        <button class="btn btn-secondary" data-fn="copy">📋 Copy</button>
      </div>
    </div>
  `;

  const $ = (s) => c.querySelector(s);
  const input = $('#txt');
  const fns = {
    upper: (t) => t.toUpperCase(),
    lower: (t) => t.toLowerCase(),
    title: titleCase,
    sentence,
    camel,
    snake,
    kebab,
    alternating,
  };

  function stats() {
    const t = input.value;
    $('#s-char').textContent = t.length;
    $('#s-word').textContent = t.trim() ? t.trim().split(/\s+/).length : 0;
    $('#s-line').textContent = t ? t.split('\n').length : 0;
    $('#s-sent').textContent = (t.match(/[.!?]+/g) || []).length;
  }
  input.addEventListener('input', stats);
  c.querySelectorAll('[data-fn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fn = btn.dataset.fn;
      if (fn === 'copy') return copyText(input.value);
      input.value = fns[fn](input.value);
      stats();
    });
  });
  stats();
}