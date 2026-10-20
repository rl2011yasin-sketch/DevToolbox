(function () {
  'use strict';

  window.DT.register('qr', {
    render: function (c) {
      c.innerHTML =
        '<header class="tool-header"><h2>📱 QR Code Generator</h2>' +
        '<p>Turn any text or URL into a downloadable QR code.</p></header>' +
        '<div class="card">' +
          '<div class="field"><label>Text or URL</label>' +
          '<input type="text" id="qr-text" value="https://github.com" /></div>' +
          '<div class="field"><label>Size: <strong id="size-val">300</strong>px</label>' +
          '<input type="range" id="qr-size" min="150" max="600" step="50" value="300" style="accent-color:var(--accent)" /></div>' +
          '<div class="btn-row">' +
            '<button class="btn btn-primary" id="qr-gen">✨ Generate</button>' +
            '<button class="btn btn-secondary" id="qr-dl">⬇️ Download PNG</button>' +
          '</div>' +
          '<div class="qr-wrap"><canvas id="qr-canvas" class="qr-canvas" width="300" height="300"></canvas></div>' +
        '</div>';

      var $ = function (s) { return c.querySelector(s); };
      var text = $('#qr-text'), size = $('#qr-size'), canvas = $('#qr-canvas');

      size.addEventListener('input', function () {
        $('#size-val').textContent = size.value;
        generate();
      });

      function generate() {
        if (!text.value.trim()) return;
        if (typeof window.QRCode === 'undefined' || !window.QRCode.toCanvas) {
          window.DT.log('QR library not loaded — check your internet connection', 'error');
          return;
        }
        try {
          window.QRCode.toCanvas(canvas, text.value, {
            width: parseInt(size.value, 10),
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
          }, function (err) {
            if (err) { console.error(err); window.DT.log('QR error: ' + err.message, 'error'); }
          });
        } catch (e) {
          console.error(e);
          window.DT.log('QR error: ' + e.message, 'error');
        }
      }

      $('#qr-gen').addEventListener('click', function () {
        generate();
        window.DT.log('QR code generated', 'success');
      });
      $('#qr-dl').addEventListener('click', function () {
        var a = document.createElement('a');
        a.download = 'qrcode.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        window.DT.log('QR code downloaded', 'success');
      });
      text.addEventListener('input', generate);

      // Wait a tick to ensure QRCode global is ready
      if (window.QRCode && window.QRCode.toCanvas) generate();
      else setTimeout(generate, 500);
    }
  });
})();
