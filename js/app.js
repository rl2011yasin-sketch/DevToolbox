(function () {
  'use strict';

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

  var openTabs = {};    // id → { tabEl, viewEl, tool }
  var activeId = null;

  var $ = function (s) { return document.querySelector(s); };
  var fileTree = $('#fileTree');
  var tabsEl = $('#tabs');
  var editorContent = $('#editorContent');
  var breadcrumbs = $('#breadcrumbs');
  var titleCenter = $('#titleCenter');
  var statusLang = $('#statusLang');
  var panel = $('#panel');

  // ─── EXPLORER ───
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

  // ─── OPEN TOOL ───
  function openTool(id) {
    var tool = TOOLS.filter(function (t) { return t.id === id; })[0];
    if (!tool) return;

    if (openTabs[id]) {
      activateTab(id);
      return;
    }

    var def = window.DT.tools[id];
    if (!def || typeof def.render !== 'function') {
      window.DT.log('Tool "' + id + '" is not registered', 'error');
      window.DT.toast('Tool not loaded: ' + id, 'error');
      return;
    }

    // Tab
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

    // View
    var viewEl = document.createElement('div');
    viewEl.className = 'tool-view hidden';
    editorContent.appendChild(viewEl);

    openTabs[id] = { tabEl: tabEl, viewEl: viewEl, tool: tool };

    // Render
    try {
      def.render(viewEl);
    } catch (err) {
      console.error(err);
      viewEl.innerHTML = '<div class="card" style="color:var(--danger)">Error loading ' + tool.file + ': ' + err.message + '</div>';
      window.DT.log('Error: ' + err.message, 'error');
    }

    window.DT.log('Opened ' + tool.file, 'success');
    activateTab(id);
  }
  window.DT.openTool = openTool;

  function activateTab(id) {
    var entry = openTabs[id];
    if (!entry) return;

    var welcome = document.querySelector('.welcome');
    if (welcome) welcome.remove();

    Object.keys(openTabs).forEach(function (k) {
      openTabs[k].tabEl.classList.remove('active');
      openTabs[k].viewEl.classList.add('hidden');
    });

    entry.tabEl.classList.add('active');
    entry.viewEl.classList.remove('hidden');

    document.querySelectorAll('.file-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.id === id);
    });

    breadcrumbs.innerHTML =
      '<span class="crumb">DevToolbox</span>' +
      '<span class="sep">›</span>' +
      '<span class="crumb">' + entry.tool.file + '</span>' +
      '<span class="sep">›</span>' +
      '<span class="crumb">Preview</span>';

    titleCenter.textContent = entry.tool.file + ' — DevToolbox — Visual Studio Code';
    document.title = entry.tool.file + ' — DevToolbox';
    statusLang.textContent = 'JavaScript';
    activeId = id;
  }

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
      activeId = null;
    } else if (wasActive) {
      var last = Object.keys(openTabs).pop();
      activateTab(last);
    }
  }

  // ─── WELCOME ───
  function showWelcome() {
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
                '<span class="wi">' + t.icon + '</span><span>' + t.label + '</span></button>';
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

  // ─── ACTIVITY BAR ───
  var PANEL_LABELS = {
    explorer: 'EXPLORER', search: 'SEARCH', source: 'SOURCE CONTROL',
    debug: 'RUN AND DEBUG', extensions: 'EXTENSIONS', settings: 'SETTINGS'
  };
  document.querySelectorAll('.activity-icon').forEach(function (icon) {
    icon.addEventListener('click', function () {
      document.querySelectorAll('.activity-icon').forEach(function (i) { i.classList.remove('active'); });
      icon.classList.add('active');
      var panelId = icon.dataset.panel;
      $('#sideBarHeader').textContent = PANEL_LABELS[panelId] || panelId.toUpperCase();
      if (panelId === 'explorer') {
        buildExplorer();
      } else {
        fileTree.innerHTML = '<div style="padding:20px;color:var(--sideFgDim);font-size:12px;text-align:center">This panel is decorative.<br>Click Explorer 📁 to see files.</div>';
      }
    });
  });

  // ─── THEME ───
  var themeBtn = $('#themeBtn');
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? '🌙 Dark+' : '☀️ Light+';
    try { localStorage.setItem('dt-theme', theme); } catch (e) {}
  }
  themeBtn.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    window.DT.log('Theme changed to ' + (next === 'dark' ? 'Dark+' : 'Light+'), 'dim');
  });
  try { applyTheme(localStorage.getItem('dt-theme') || 'dark'); } catch (e) { applyTheme('dark'); }

  // ─── PANEL CONTROLS ───
  $('#panelClose').addEventListener('click', function () { panel.classList.toggle('hidden'); });
  $('#panelKill').addEventListener('click', function () {
    var term = document.getElementById('terminal');
    term.innerHTML = '';
    window.DT.log('Terminal cleared.', 'dim');
  });

  // ─── INTERACTIVE TERMINAL ───
  var termInput = null;
  function buildTerminalInput() {
    var term = document.getElementById('terminal');
    // Remove old input line if any
    var old = document.getElementById('term-input-line');
    if (old) old.remove();

    var line = document.createElement('div');
    line.className = 'term-line';
    line.id = 'term-input-line';
    line.innerHTML =
      '<span class="term-prompt">➜</span> ' +
      '<span class="term-path">~/devtoolbox</span> ' +
      '<input type="text" id="term-input" autocomplete="off" spellcheck="false" style="' +
        'background:transparent;border:none;outline:none;color:var(--edFg);' +
        'font-family:inherit;font-size:12px;width:calc(100% - 180px);caret-color:var(--edFg);' +
      '" />';
    term.appendChild(line);
    termInput = line.querySelector('#term-input');
    termInput.focus();

    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var cmd = termInput.value.trim();
        // Freeze the line — replace input with static text
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
      }
      if (e.key === 'ArrowUp') e.preventDefault();
    });
    // Click anywhere on terminal focuses input
    term.onclick = function (ev) {
      if (ev.target !== termInput) termInput.focus();
    };
  }

  function runCommand(raw) {
    if (!raw) return;
    var parts = raw.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var args = raw.slice(parts[0].length).trim();

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
        break;

      case 'ls':
      case 'files':
        window.DT.termWrite('<span class="term-warn">DevToolbox/</span>');
        TOOLS.forEach(function (t) {
          window.DT.termWrite('  <span class="term-success">' + t.file + '</span>  <span class="term-dim">— ' + t.label + '</span>');
        });
        break;

      case 'open':
        var target = args.replace(/\.js$/i, '').toLowerCase();
        var tool = TOOLS.filter(function (t) { return t.id === target; })[0];
        if (tool) {
          openTool(tool.id);
          window.DT.termWrite('<span class="term-success">Opened ' + tool.file + '</span>');
        } else {
          window.DT.termWrite('<span class="term-error">Tool not found: ' + window.DT.escapeHtml(args) + '</span>');
          window.DT.termWrite('<span class="term-dim">Try: open password, open qr, open json, ...</span>');
        }
        break;

      case 'run':
        if (!args) {
          window.DT.termWrite('<span class="term-error">Usage: run &lt;js-code&gt;</span>');
          break;
        }
        try {
          var result = (0, eval)(args);
          var display = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
          window.DT.termWrite('<span class="term-success">' + window.DT.escapeHtml(display) + '</span>');
        } catch (err) {
          window.DT.termWrite('<span class="term-error">' + window.DT.escapeHtml(err.message) + '</span>');
        }
        break;

      case 'theme':
        themeBtn.click();
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

      case 'clear':
        document.getElementById('terminal').innerHTML = '';
        break;

      default:
        window.DT.termWrite('<span class="term-error">command not found: ' + window.DT.escapeHtml(cmd) + '</span>');
        window.DT.termWrite('<span class="term-dim">Type "help" to see all commands.</span>');
    }
  }

  // ─── KEYBOARD SHORTCUTS ───
  document.addEventListener('keydown', function (e) {
    // Ctrl+Shift+P — Command Palette
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      var list = TOOLS.map(function (t, i) { return (i + 1) + '. ' + t.label + ' (' + t.file + ')'; }).join('\n');
      var choice = prompt('Command Palette\n\n' + list + '\n\n0. Cancel');
      var n = parseInt(choice, 10);
      if (n >= 1 && n <= TOOLS.length) openTool(TOOLS[n - 1].id);
    }
    // Ctrl+P — Quick Open
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      var list2 = TOOLS.map(function (t, i) { return (i + 1) + '. ' + t.file; }).join('\n');
      var c2 = prompt('Quick Open\n\n' + list2 + '\n\n0. Cancel');
      var n2 = parseInt(c2, 10);
      if (n2 >= 1 && n2 <= TOOLS.length) openTool(TOOLS[n2 - 1].id);
    }
    // Ctrl+` — Toggle panel
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      panel.classList.toggle('hidden');
    }
  });

  // ─── BOOT ───
  function boot() {
    buildExplorer();
    showWelcome();
    window.DT.log('DevToolbox Terminal [v1.1.0]', 'success');
    window.DT.log('Type "help" to see all commands.', 'dim');
    buildTerminalInput();
    window.DT.log('', 'dim');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose TOOLS list for terminal ls
  window.DT.TOOLS = TOOLS;
})();
