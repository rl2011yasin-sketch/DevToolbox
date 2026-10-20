import { log, showToast } from './utils.js';

const TOOLS = [
  { id: 'password', file: 'password.js',     label: 'Password Generator', icon: '🔐' },
  { id: 'qr',       file: 'qr.js',           label: 'QR Code Generator',  icon: '📱' },
  { id: 'color',    file: 'color.js',        label: 'Color Palette',      icon: '🎨' },
  { id: 'text',     file: 'text.js',         label: 'Text Tools',         icon: '✍️' },
  { id: 'json',     file: 'json.js',         label: 'JSON Formatter',     icon: '{ }' },
  { id: 'base64',   file: 'base64.js',       label: 'Base64 Encoder',     icon: '🔤' },
  { id: 'hash',     file: 'hash.js',         label: 'Hash Generator',     icon: '#️⃣' },
  { id: 'units',    file: 'units.js',        label: 'Unit Converter',     icon: '📏' },
];

// ═══════ STATE ═══════
const openTabs = new Map(); // id → { tabEl, viewEl }
let activeId = null;

// ═══════ DOM ═══════
const $ = (s) => document.querySelector(s);
const fileTree = $('#fileTree');
const tabsEl = $('#tabs');
const editorContent = $('#editorContent');
const breadcrumbs = $('#breadcrumbs');
const titleCenter = $('#titleCenter');
const statusLang = $('#statusLang');
const terminalEl = $('#terminal');
const panel = $('#panel');

// ═══════ EXPLORER ═══════
TOOLS.forEach((tool) => {
  const item = document.createElement('div');
  item.className = 'file-item';
  item.dataset.id = tool.id;
  item.innerHTML = `
    <span class="file-icon js">JS</span>
    <span>${tool.file}</span>
  `;
  item.addEventListener('click', () => openTool(tool.id));
  fileTree.appendChild(item);
});

// ═══════ EDITOR ═══════
async function openTool(id) {
  if (openTabs.has(id)) return activateTab(id);
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) return;

  // Create tab element
  const tabEl = document.createElement('div');
  tabEl.className = 'tab';
  tabEl.dataset.id = id;
  tabEl.innerHTML = `
    <span class="file-icon js">JS</span>
    <span class="tab-label">${tool.file}</span>
    <button class="tab-close" title="Close">✕</button>
  `;
  tabEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-close')) {
      closeTab(id);
    } else {
      activateTab(id);
    }
  });
  tabsEl.appendChild(tabEl);

  // Create view wrapper
  const viewEl = document.createElement('div');
  viewEl.className = 'tool-view hidden';
  editorContent.appendChild(viewEl);

  openTabs.set(id, { tabEl, viewEl, tool });

  // Load module
  try {
    const mod = await import(`./tools/${tool.id}.js`);
    mod.render(viewEl);
  } catch (err) {
    console.error(err);
    viewEl.innerHTML = `<div class="card" style="color:var(--danger)">Failed to load ${tool.file}</div>`;
  }

  log(`Opened ${tool.file}`, 'success');
  activateTab(id);
}

function activateTab(id) {
  const entry = openTabs.get(id);
  if (!entry) return;

  // Hide welcome
  document.querySelector('.welcome')?.remove();

  // Hide all views
  openTabs.forEach(({ tabEl, viewEl }) => {
    tabEl.classList.remove('active');
    viewEl.classList.add('hidden');
  });

  // Activate this one
  entry.tabEl.classList.add('active');
  entry.viewEl.classList.remove('hidden');

  // Highlight in explorer
  document.querySelectorAll('.file-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.id === id);
  });

  // Update breadcrumbs
  breadcrumbs.innerHTML = `
    <span class="crumb">DevToolbox</span>
    <span class="sep">›</span>
    <span class="crumb">${entry.tool.file}</span>
    <span class="sep">›</span>
    <span class="crumb">Preview</span>
  `;

  // Update title
  titleCenter.textContent = `${entry.tool.file} — DevToolbox — Visual Studio Code`;
  document.title = `${entry.tool.file} — DevToolbox`;
  statusLang.textContent = 'JavaScript';

  activeId = id;
}

function closeTab(id) {
  const entry = openTabs.get(id);
  if (!entry) return;

  const wasActive = entry.tabEl.classList.contains('active');
  entry.tabEl.remove();
  entry.viewEl.remove();
  openTabs.delete(id);

  log(`Closed ${entry.tool.file}`, 'dim');

  if (openTabs.size === 0) {
    showWelcome();
    breadcrumbs.innerHTML = '';
    titleCenter.textContent = 'Welcome — DevToolbox';
    document.title = 'DevToolbox — Visual Studio Code';
    activeId = null;
  } else if (wasActive) {
    const last = Array.from(openTabs.keys()).pop();
    activateTab(last);
  }
}

// ═══════ WELCOME ═══════
function showWelcome() {
  const html = `
    <div class="welcome">
      <h1>DevToolbox <span>for VS Code</span></h1>
      <p class="welcome-sub">A modular developer toolbox — styled like your favorite editor.</p>

      <div class="welcome-section">
        <h3>Start</h3>
        <div class="welcome-grid">
          ${TOOLS.map((t) => `
            <button class="welcome-link" data-open="${t.id}">
              <span class="wi">${t.icon}</span>
              <span>${t.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="welcome-hint">
        💡 <strong>Tip:</strong> Click any file in the Explorer on the left to open a tool. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> to open the command palette.
      </div>
    </div>
  `;
  const div = document.createElement('div');
  div.innerHTML = html;
  const welcomeEl = div.firstElementChild;
  welcomeEl.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openTool(btn.dataset.open));
  });
  editorContent.appendChild(welcomeEl);
}

// ═══════ TERMINAL LOG ═══════
window.__vscodeTerminal = (msg, type = 'dim') => log(msg, type);

// ═══════ ACTIVITY BAR PANELS ═══════
const PANEL_LABELS = {
  explorer: 'EXPLORER',
  search: 'SEARCH',
  source: 'SOURCE CONTROL',
  debug: 'RUN AND DEBUG',
  extensions: 'EXTENSIONS',
  settings: 'SETTINGS',
};
document.querySelectorAll('.activity-icon').forEach((icon) => {
  icon.addEventListener('click', () => {
    document.querySelectorAll('.activity-icon').forEach((i) => i.classList.remove('active'));
    icon.classList.add('active');
    const panelId = icon.dataset.panel;
    $('#sideBarHeader').textContent = PANEL_LABELS[panelId] || panelId.toUpperCase();
    if (panelId !== 'explorer') {
      fileTree.innerHTML = `<div style="padding:20px;color:var(--sideFgDim);font-size:12px;text-align:center">This panel is decorative.<br>Click Explorer 📁 to see files.</div>`;
    } else {
      fileTree.innerHTML = '';
      TOOLS.forEach((tool) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.dataset.id = tool.id;
        item.innerHTML = `<span class="file-icon js">JS</span><span>${tool.file}</span>`;
        item.addEventListener('click', () => openTool(tool.id));
        fileTree.appendChild(item);
      });
    }
  });
});

// ═══════ THEME ═══════
const themeBtn = $('#themeBtn');
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '🌙 Dark+' : '☀️ Light+';
  localStorage.setItem('dt-theme', theme);
}
themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  applyTheme(cur === 'dark' ? 'light' : 'dark');
  log(`Theme changed to ${cur === 'dark' ? 'Light+' : 'Dark+'}`, 'dim');
});
applyTheme(localStorage.getItem('dt-theme') || 'dark');

// ═══════ PANEL CONTROLS ═══════
$('#panelClose').addEventListener('click', () => {
  panel.classList.toggle('hidden');
});
$('#panelKill').addEventListener('click', () => {
  terminalEl.innerHTML = '';
  log('Terminal cleared.', 'dim');
});

// ═══════ COMMAND PALETTE ═══════
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    const choice = prompt(
      'Command Palette — enter a number:\n\n' +
      TOOLS.map((t, i) => `${i + 1}. ${t.label} (${t.file})`).join('\n') +
      '\n\n0. Cancel'
    );
    const n = parseInt(choice);
    if (n >= 1 && n <= TOOLS.length) openTool(TOOLS[n - 1].id);
  }
  // Quick open with Ctrl+P
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'p') {
    e.preventDefault();
    const choice = prompt(
      'Quick Open — enter a number:\n\n' +
      TOOLS.map((t, i) => `${i + 1}. ${t.file}`).join('\n') +
      '\n\n0. Cancel'
    );
    const n = parseInt(choice);
    if (n >= 1 && n <= TOOLS.length) openTool(TOOLS[n - 1].id);
  }
});

// ═══════ BOOT ═══════
showWelcome();
log('DevToolbox Terminal [v1.0.0]', 'success');
log('Type any command or open a file from the Explorer.', 'dim');
log('', 'dim');