/* global helpers — no modules, no imports */
(function () {
  'use strict';

  window.DT = window.DT || {};

  // ─── TERMINAL LOG ───
  var termEl = null;
  function getTerm() {
    if (!termEl) termEl = document.getElementById('terminal');
    return termEl;
  }

  window.DT.log = function (message, type) {
    var term = getTerm();
    if (!term) return;
    var colors = {
      dim: 'var(--sideFgDim)',
      success: 'var(--success)',
      warn: 'var(--warn)',
      error: 'var(--danger)',
      info: 'var(--variable)'
    };
    var line = document.createElement('div');
    line.className = 'term-line';
    var color = colors[type] || colors.dim;
    line.innerHTML =
      '<span class="term-prompt">➜</span> ' +
      '<span class="term-path">~/devtoolbox</span> ' +
      '<span style="color:' + color + '">' + escapeHtml(message) + '</span>';
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  };

  window.DT.termWrite = function (html) {
    var term = getTerm();
    if (!term) return;
    var line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = html;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  window.DT.escapeHtml = escapeHtml;

  // ─── TOAST ───
  var toastEl = null;
  var toastTimer = null;
  window.DT.toast = function (message, type) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.className = 'toast show ' + (type || 'success');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2000);
  };

  // ─── CLIPBOARD ───
  window.DT.copy = function (text) {
    if (!text) return;
    function done() {
      window.DT.toast('Copied to clipboard!', 'success');
      window.DT.log('Copied ' + text.length + ' characters', 'success');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        legacyCopy(text); done();
      });
    } else {
      legacyCopy(text); done();
    }
  };
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ─── REGISTRY ───
  window.DT.tools = window.DT.tools || {};
  window.DT.register = function (id, def) {
    window.DT.tools[id] = def;
  };
})();
