(function () {
  'use strict';

  function encode(s) {
    var bytes = new TextEncoder().encode(s);
    var bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function decode(s) {
    var bin = atob(s.trim());
    var bytes = Uint8Array.from(bin, function (ch) { return ch.charCodeAt(0); });
    return new TextDecoder().decode(bytes);
  }

  window.DT.register('base64', {
    render: function (c) {
      c.innerHTML =
        '<header class="tool-header"><h2>🔤 Base64 Encoder / Decoder</h2>' +
        '<p>Convert text to Base64 and back. UTF-8 safe.</p></header>' +
        '<div class="card">' +
          '<div class="field"><label>Input</label>' +
          '<textarea id="b-in" placeholder="Enter text or Base64…"></textarea></div>' +
          '<div class="btn-row">' +
            '<button class="btn btn-primary" id="b-enc">Encode →</button>' +
            '<button class="btn btn-secondary" id="b-dec">← Decode</button>' +
            '<button class="btn btn-secondary" id="b-copy">📋 Copy</button>' +
            '<button class="btn btn-secondary" id="b-clear">🗑️ Clear</button>' +
          '</div>' +
          '<div class="field" style="margin-top:14px"><label>Result</label>' +
          '<textarea id="b-out" readonly></textarea></div>' +
          '<p id="b-err" style="color:var(--danger);font-size:12px;margin-top:6px"></p>' +
        '</div>';

      var input = c.querySelector('#b-in');
      var out = c.querySelector('#b-out');
      var err = c.querySelector('#b-err');

      c.querySelector('#b-enc').addEventListener('click', function () {
        err.textContent = '';
        try { out.value = encode(input.value); window.DT.log('Base64 encoded', 'success'); }
        catch (e) { err.textContent = e.message; }
      });
      c.querySelector('#b-dec').addEventListener('click', function () {
        err.textContent = '';
        try { out.value = decode(input.value); window.DT.log('Base64 decoded', 'success'); }
        catch (e) { err.textContent = 'Invalid Base64 input'; window.DT.log('Base64 decode failed', 'error'); }
      });
      c.querySelector('#b-copy').addEventListener('click', function () {
        if (out.value) window.DT.copy(out.value);
      });
      c.querySelector('#b-clear').addEventListener('click', function () {
        input.value = ''; out.value = ''; err.textContent = '';
      });
    }
  });
})();
