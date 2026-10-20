/* ============================================================
   DevToolbox — app.js (v3)
   - No ES modules (works on file:// and GitHub Pages)
   - Guard against missing utils.js
   - Interactive terminal
   - Full keyboard shortcuts
   ============================================================ */

/* ─── GUARD: fail loudly if utils.js didn't load ─── */
if (!window.DT || typeof window.DT.register !== 'function') {
  console.error('[DevToolbox] FATAL: utils.js did not load. Check js/utils.js path.');
  document.body.innerHTML =
    '<div style="padding:40px;font-family:monospace;color:#f48771;background:#1e1e1e;height:100vh;box-sizing:border-box">' +
      '<h2>⚠️ JavaScript loading failed</h2>' +
      '<p><strong>utils.js</strong> did not load. Open F12 → Console for details.</p>' +
      '<p>Common causes:</p>' +
      '<ul>' +
        '<li>File path is wrong (GitHub is case-sensitive: use <code>js/</code> not <code>JS/</code>)</li>' +
        '<li>Files were not uploaded to GitHub</li>' +
        '<li>Check F12 → Network tab: does <code>js/utils.js</code> return 404?</li>' +
      '</ul>' +
    '</div>';
  throw new Error('DevToolbox: utils.js missing');
}

/* ============================================================
   MAIN APP
   ============================================================ */
(function () {
  'use strict';

  /* ─── TOOL REGISTRY ─── */
  var TOOLS = [
    { id: 'password', file: 'password.js', label: 'Password Generator', icon: '🔐' },
    { id: 'qr',       file: 'qr.js',       label: 'QR Code Generator',  icon: '📱' },
    { id: 'color',    file: 'color.js',    label: 'Color Palette',      icon: '🎨' },
    { id: 'text',     file: 'text.js',     label: 'Text Tools',         icon: '✍️' },
    { id: 'json',     file: 'json.js',     label: 'JSON Formatter',     icon: '{ }' },
    { id: 'base64',   file: 'base64.js',   label: 'Base64 Encoder',     icon: '🔤' },
    { id: 'hash',     file: 'hash.js',     label: 'Hash Generator',     icon: '#️⃣' },
    { id: 'units',    file: 'units.js',    label: 'Unit Converter',     icon: '📏' }
  ];

  /* ─── STATE ─── */
  var openTabs = {};   // id → { tabEl, viewEl, tool }
  var activeId = null;

  /* ─── DOM ─── */
  var $ = function (s) { return document.querySelector(s); };
  var fileTree = $('#fileTree');
  var tabsEl = $('#tabs');
  var editorContent = $('#editorContent');
  var breadcrumbs = $('#breadcrumbs');
  var titleCenter = $('#titleCenter');
  var statusLang = $('#statusLang');
  var panel = $('#panel');

  /* ─── EXPLORER ─── */
  function buildExplorer() {
    fileTree.innerHTML = '';
    TOOLS.forEach(function (tool) {
      var item = document.createElement('div');
      item.className = 'file-item';
      item.dataset.id = tool.id;
      item.innerHTML = '<span class="file-icon js">JS</span><span>' + tool.file + '</span>';
      item.addEventListener('click', function () { openTool(tool.id); });
      fileTree.appendChild(item);
    });
  }

  /* ─── OPEN TOOL ─── */
  function openTool(id) {
    var tool = TOOLS.filter(function (t) { return t.id === id; })[0];
    if (!tool) {
      window.DT.log('Tool not found: ' + id, 'error');
      return;
    }

    // Already open → just activate
    if (openTabs[id]) {
      activateTab(id);
      return;
    }

    // Check registered
    var def = window.DT.tools[id];
    if (!def || typeof def.render !== 'function') {
      window.DT.log('Tool "' + id + '" is not registered — file may not have loaded', 'error');
      window.DT.toast('Tool not loaded: ' + tool.file, 'error');
      return;
    }

    /* Create tab */
    var tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.dataset.id = id;
    tabEl.innerHTML =
      '<span class="file-icon js">JS</span>' +
      '<span class="tab-label">' + tool.file + '</span>' +
      '<button class="tab-close" title="Close">✕</button>';
    tabEl.addEventListener('click', function (e) {
      if (e.target.classList.contains('tab-close')) closeTab(id);
      else activateTab(id);
    });
    tabsEl.appendChild(tabEl);

    /* Create view */
    var viewEl = document.createElement('div');
    viewEl.className = 'tool-view hidden';
    editorContent.appendChild(viewEl);

    openTabs[id] = { tabEl: tabEl, viewEl: viewEl, tool: tool };

    /* Render tool */
    try {
      def.render(viewEl);
    } catch (err) {
      console.error('[DevToolbox] render error in ' + id + ':', err);
      viewEl.innerHTML =
        '<div class="card" style="color:var(--danger)">' +
          '<strong>Error loading ' + tool.file + ':</strong><br>' +
          '<code style="font-size:12px">' + (err && err.message ? err.message : String(err)) + '</code>' +
        '</div>';
      window.DT.log('Render error in ' + tool.file + ': ' + (err && err.message), 'error');
    }

    window.DT.log('Opened ' + tool.file, 'success');
    activateTab(id);
  }
  window.DT.openTool = openTool;

  /* ─── ACTIVATE TAB ─── */
  function activateTab(id) {
    var entry = openTabs[id];
    if (!entry) return;

    // Remove welcome if present
    var welcome = document.querySelector('.welcome');
    if (welcome) welcome.remove();

    // Deactivate all
    Object.keys(openTabs).forEach(function (k) {
      openTabs[k].tabEl.classList.remove('active');
      openTabs[k].viewEl.classList.add('hidden');
    });

    // Activate this
    entry.tabEl.classList.add('active');
    entry.viewEl.classList.remove('hidden');

    // Highlight explorer
    document.querySelectorAll('.file-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.id === id);
    });

    // Breadcrumbs
    breadcrumbs.innerHTML =
      '<span class="crumb">DevToolbox</span>' +
      '<span class="sep">›</span>' +
      '<span class="crumb">' + entry.tool.file + '</span>' +
      '<span class="sep">›</span>' +
      '<span class="crumb">Preview</span>';

    // Title
    titleCenter.textContent = entry.tool.file + ' — DevToolbox — Visual Studio Code';
    document.title = entry.tool.file + ' — DevToolbox';
    statusLang.textContent = 'JavaScript';
    activeId = id;
  }

  /* ─── CLOSE TAB ─── */
  function closeTab(id) {
    var entry = openTabs[id];
    if (!entry) return;

    var wasActive = entry.tabEl.classList.contains('active');
    entry.tabEl.remove();
    entry.viewEl.remove();
    delete openTabs[id];

    window.DT.log('Closed ' + entry.tool.file, 'dim');

    if (Object.keys(openTabs).length === 0) {
      showWelcome();
      breadcrumbs.innerHTML = '';
      titleCenter.textContent = 'Welcome — DevToolbox';
      document.title = 'DevToolbox — Visual Studio Code';
      statusLang.textContent = 'JavaScript';
      activeId = null;
    } else if (wasActive) {
      var keys = Object.keys(openTabs);
      activateTab(keys[keys.length - 1]);
    }
  }

  /* ─── WELCOME SCREEN ─── */
  function showWelcome() {
    // Remove existing
    var old = document.querySelector('.welcome');
    if (old) old.remove();

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="welcome">' +
        '<h1>DevToolbox <span>for VS Code</span></h1>' +
        '<p class="welcome-sub">A modular developer toolbox — styled like your favorite editor.</p>' +
        '<div class="welcome-section">' +
          '<h3>Start</h3>' +
          '<div class="welcome-grid">' +
            TOOLS.map(function (t) {
              return '<button class="welcome-link" data-open="' + t.id + '">' +
                '<span class="wi">' + t.icon + '</span><span>' + t.label + '</span>' +
              '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="welcome-hint">💡 Type <kbd>help</kbd> in the terminal below to see all commands.</div>' +
      '</div>';

    var welcomeEl = wrap.firstElementChild;
    welcomeEl.querySelectorAll('[data-open]').forEach(function (btn) {
      btn.addEventListener('click', function () { openTool(btn.dataset.open); });
    });
    editorContent.appendChild(welcomeEl);
  }

  /* ─── ACTIVITY BAR ─── */
  var PANEL_LABELS = {
    explorer: 'EXPLORER',
    search: 'SEARCH',
    source: 'SOURCE CONTROL',
    debug: 'RUN AND DEBUG',
    extensions: 'EXTENSIONS',
    settings: 'SETTINGS'
  };

  function initActivityBar() {
    document.querySelectorAll('.activity-icon').forEach(function (icon) {
      icon.addEventListener('click', function () {
        document.querySelectorAll('.activity-icon').forEach(function (i) {
          i.classList.remove('active');
        });
        icon.classList.add('active');

        var panelId = icon.dataset.panel;
        var header = $('#sideBarHeader');
        if (header) header.textContent = PANEL_LABELS[panelId] || panelId.toUpperCase();

        if (panelId === 'explorer') {
          buildExplorer();
        } else {
          fileTree.innerHTML =
            '<div style="padding:20px;color:var(--sideFgDim);font-size:12px;text-align:center">' +
              'This panel is decorative.<br>Click Explorer 📁 to see files.' +
            '</div>';
        }
      });
    });
  }

  /* ─── THEME ─── */
  var themeBtn = $('#themeBtn');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeBtn) themeBtn.textContent = theme === 'dark' ? '🌙 Dark+' : '☀️ Light+';
    try { localStorage.setItem('dt-theme', theme); } catch (e) {}
  }

  function initTheme() {
    if (!themeBtn) return;
    themeBtn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      window.DT.log('Theme changed to ' + (next === 'dark' ? 'Dark+' : 'Light+'), 'dim');
    });
    var saved = 'dark';
    try { saved = localStorage.getItem('dt-theme') || 'dark'; } catch (e) {}
    applyTheme(saved);
  }

  /* ─── PANEL CONTROLS ─── */
  function initPanelControls() {
    var closeBtn = $('#panelClose');
    var killBtn = $('#panelKill');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        if (panel) panel.classList.toggle('hidden');
      });
    }
    if (killBtn) {
      killBtn.addEventListener('click', function () {
        var term = document.getElementById('terminal');
        if (term) term.innerHTML = '';
        window.DT.log('Terminal cleared.', 'dim');
        buildTerminalInput();
      });
    }
  }

  /* ─── INTERACTIVE TERMINAL ─── */
  var termInput = null;

  function buildTerminalInput() {
    var term = document.getElementById('terminal');
    if (!term) return;

    // Remove old input line
    var old = document.getElementById('term-input-line');
    if (old) old.remove();

    var line = document.createElement('div');
    line.className = 'term-line';
    line.id = 'term-input-line';
    line.innerHTML =
      '<span class="term-prompt">➜</span> ' +
      '<span class="term-path">~/devtoolbox</span> ' +
      '<input type="text" id="term-input" autocomplete="off" spellcheck="false" ' +
        'style="background:transparent;border:none;outline:none;color:var(--edFg);' +
        'font-family:inherit;font-size:12px;width:calc(100% - 200px);caret-color:var(--edFg);' +
        'padding:0;margin:0" />';
    term.appendChild(line);

    termInput = line.querySelector('#term-input');
    if (!termInput) return;
    termInput.focus();

    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var cmd = termInput.value;
        // Freeze line
        var frozen = document.createElement('div');
        frozen.className = 'term-line';
        frozen.innerHTML =
          '<span class="term-prompt">➜</span> ' +
          '<span class="term-path">~/devtoolbox</span> ' +
          '<span class="term-cmd">' + window.DT.escapeHtml(cmd) + '</span>';
        line.replaceWith(frozen);
        runCommand(cmd);
        buildTerminalInput();
        term.scrollTop = term.scrollHeight;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    });

    // Click anywhere → focus input
    term.onclick = function (ev) {
      if (ev.target !== termInput) termInput.focus();
    };
  }

  function runCommand(raw) {
    if (!raw || !raw.trim()) return;
    var trimmed = raw.trim();
    var parts = trimmed.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var args = trimmed.slice(parts[0].length).trim();

    switch (cmd) {
      case 'help':
        window.DT.termWrite('<span class="term-warn">Available commands:</span>');
        window.DT.termWrite('  <span class="term-success">help</span>            Show this help');
        window.DT.termWrite('  <span class="term-success">ls</span>              List available tools');
        window.DT.termWrite('  <span class="term-success">open</span> &lt;name&gt;     Open a tool (e.g. <span class="term-dim">open json</span>)');
        window.DT.termWrite('  <span class="term-success">run</span> &lt;js&gt;       Run JavaScript (e.g. <span class="term-dim">run Math.sqrt(16)</span>)');
        window.DT.termWrite('  <span class="term-success">theme</span>           Toggle dark/light theme');
        window.DT.termWrite('  <span class="term-success">date</span>            Show current date/time');
        window.DT.termWrite('  <span class="term-success">whoami</span>          Print current user');
        window.DT.termWrite('  <span class="term-success">echo</span> &lt;text&gt;    Echo text back');
        window.DT.termWrite('  <span class="term-success">clear</span>           Clear terminal');
        window.DT.termWrite('  <span class="term-success">about</span>           About DevToolbox');
        break;

      case 'ls':
      case 'files':
        window.DT.termWrite('<span class="term-warn">DevToolbox/</span>');
        TOOLS.forEach(function (t) {
          window.DT.termWrite(
            '  <span class="term-success">' + t.file + '</span>' +
            '  <span class="term-dim">— ' + t.label + '</span>'
          );
        });
        break;

      case 'open':
        var target = args.replace(/\.js$/i, '').trim().toLowerCase();
        var tool = TOOLS.filter(function (t) { return t.id === target; })[0];
        if (tool) {
          openTool(tool.id);
          window.DT.termWrite('<span class="term-success">Opened ' + tool.file + '</span>');
        } else {
          window.DT.termWrite('<span class="term-error">Tool not found: ' + window.DT.escapeHtml(args) + '</span>');
          window.DT.termWrite('<span class="term-dim">Try: ' + TOOLS.map(function (t) { return t.id; }).join(', ') + '</span>');
        }
        break;

      case 'run':
        if (!args) {
          window.DT.termWrite('<span class="term-error">Usage: run &lt;js-code&gt;</span>');
          break;
        }
        try {
          /* eslint-disable no-eval */
          var result = (0, eval)(args);
          var display = (result && typeof result === 'object')
            ? JSON.stringify(result, null, 2)
            : String(result);
          window.DT.termWrite('<span class="term-success">' + window.DT.escapeHtml(display) + '</span>');
        } catch (err) {
          window.DT.termWrite('<span class="term-error">' + window.DT.escapeHtml(err.message) + '</span>');
        }
        break;

      case 'theme':
        if (themeBtn) themeBtn.click();
        break;

      case 'date':
        window.DT.termWrite('<span class="term-success">' + new Date().toString() + '</span>');
        break;

      case 'whoami':
        window.DT.termWrite('<span class="term-success">dev</span> <span class="term-dim">(guest@devtoolbox)</span>');
        break;

      case 'echo':
        window.DT.termWrite('<span class="term-success">' + window.DT.escapeHtml(args) + '</span>');
        break;

      case 'about':
        window.DT.termWrite('<span class="term-warn">DevToolbox v1.1.0</span>');
        window.DT.termWrite('<span class="term-dim">A modular developer toolbox — 100% client-side.</span>');
        window.DT.termWrite('<span class="term-dim">8 tools · No tracking · Works offline (except QR CDN)</span>');
        window.DT.termWrite('<span class="term-dim">Source: github.com/YOUR_USER/devtoolbox</span>');
        break;

      case 'clear':
        var term = document.getElementById('terminal');
        if (term) term.innerHTML = '';
        break;

      default:
        window.DT.termWrite('<span class="term-error">command not found: ' + window.DT.escapeHtml(cmd) + '</span>');
        window.DT.termWrite('<span class="term-dim">Type "help" to see all commands.</span>');
    }
  }

  /* ─── KEYBOARD SHORTCUTS ─── */
  function initShortcuts() {
    document.addEventListener('keydown', function (e) {
      // Ctrl+Shift+P — Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        var list = TOOLS.map(function (t, i) {
          return (i + 1) + '. ' + t.label + ' (' + t.file + ')';
        }).join('\n');
        var choice = prompt('Command Palette\n\n' + list + '\n\n0. Cancel');
        var n = parseInt(choice, 10);
        if (n >= 1 && n <= TOOLS.length) openTool(TOOLS[n - 1].id);
        return;
      }

      // Ctrl+P — Quick Open
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        var list2 = TOOLS.map(function (t, i) {
          return (i + 1) + '. ' + t.file;
        }).join('\n');
        var c2 = prompt('Quick Open\n\n' + list2 + '\n\n0. Cancel');
        var n2 = parseInt(c2, 10);
        if (n2 >= 1 && n2 <= TOOLS.length) openTool(TOOLS[n2 - 1].id);
        return;
      }

      // Ctrl+` — Toggle panel
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        if (panel) panel.classList.toggle('hidden');
        return;
      }
    });
  }

  /* ─── BOOT ─── */
  function boot() {
    try {
      buildExplorer();
      showWelcome();
      initActivityBar();
      initTheme();
      initPanelControls();
      initShortcuts();

      // Terminal welcome
      window.DT.log('DevToolbox Terminal [v1.1.0]', 'success');
      window.DT.log('Type "help" to see all commands.', 'dim');
      window.DT.log('Type "open json" to open a tool directly.', 'dim');
      buildTerminalInput();
      window.DT.log('', 'dim');

      // Update JS status badge
      var jsStatus = document.getElementById('jsStatus');
      if (jsStatus) {
        jsStatus.textContent = 'JS: ✓ OK';
        jsStatus.style.background = '#10b981';
      }

      console.log('[DevToolbox] Booted successfully. Tools registered:',
        Object.keys(window.DT.tools).length, '/', TOOLS.length);
    } catch (err) {
      console.error('[DevToolbox] Boot error:', err);
      window.DT.log('Boot error: ' + err.message, 'error');
    }
  }

  /* Wait for DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Expose for debugging */
  window.DT.TOOLS = TOOLS;
})();
