(function () {
  'use strict';

  window.DT.register('json', {
    render: function (c) {
      c.innerHTML =
        '<header class="tool-header"><h2>{ } JSON Formatter</h2>' +
        '<p>Format, minify and validate JSON instantly.</p></header>' +
        '<div class="card">' +
          '<div class="field"><label>Input JSON</label>' +
          '<textarea id="json-in" placeholder=\'{"hello": "world"}\'></textarea></div>' +
          '<div class="btn-row">' +
            '<button class="btn btn-primary" data-act="format">✨ Format</button>' +
            '<button class="btn btn-secondary" data-act="minify">📦 Minify</button>' +
            '<button class="btn btn-secondary" data-act="clear">🗑️ Clear</button>' +
          '</div>' +
          '<div id="status" style="margin-top:14px;font-size:12px;color:var(--sideFgDim)"></div>' +
        '</div>';

      var input = c.querySelector('#json-in');
      var status = c.querySelector('#status');

      function setStatus(msg, color) {
        status.innerHTML = msg;
        status.style.color = color || 'var(--sideFgDim)';
      }
      function process(action) {
        var raw = input.value.trim();
        if (!raw) return setStatus('Input is empty', 'var(--warn)');
        try {
          var parsed = JSON.parse(raw);
          if (action === 'format') {
            input.value = JSON.stringify(parsed, null, 2);
            setStatus('✓ Valid JSON — formatted', 'var(--success)');
            window.DT.log('JSON formatted successfully', 'success');
          } else {
            input.value = JSON.stringify(parsed);
            setStatus('✓ Valid JSON — minified', 'var(--success)');
            window.DT.log('JSON minified', 'success');
          }
        } catch (err) {
          setStatus('✗ Invalid JSON: ' + err.message, 'var(--danger)');
          window.DT.log('JSON parse error: ' + err.message, 'error');
        }
      }
      c.querySelectorAll('[data-act]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var a = btn.dataset.act;
          if (a === 'clear') { input.value = ''; setStatus(''); }
          else process(a);
        });
      });
    }
  });
})();
