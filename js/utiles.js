const termEl = document.getElementById('terminal');

export function log(message, type = 'dim') {
  if (!termEl) return;
  const line = document.createElement('div');
  line.className = 'term-line';
  const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const colors = {
    dim: 'var(--sideFgDim)',
    success: 'var(--success)',
    warn: 'var(--warn)',
    error: 'var(--danger)',
  };
  line.innerHTML = `<span class="term-prompt">➜</span> <span class="term-path">~/devtoolbox</span> <span style="color:${colors[type] || colors.dim}">${escapeHtml(message)}</span>`;
  termEl.appendChild(line);
  termEl.scrollTop = termEl.scrollHeight;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ═══════ TOAST ═══════
let toastEl = null;
let toastTimer = null;
export function showToast(message, type = 'success') {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// ═══════ CLIPBOARD ═══════
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
    log(`Copied ${text.length} characters to clipboard`, 'success');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied!', 'success');
  }
}